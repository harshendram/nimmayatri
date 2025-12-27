/**
 * Audio Recorder - Captures microphone audio and emits base64 PCM chunks
 * Exact port from the reference implementation using eventemitter3
 */

import EventEmitter from 'eventemitter3';
import { createWorkletFromSrc } from './audioworklet-registry';
import AudioRecordingWorklet from './worklets/audio-processing';
import VolMeterWorklet from './worklets/vol-meter';

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Shared AudioContext cache
const audioContextMap = new Map<string, AudioContext>();

async function getAudioContext(options: AudioContextOptions & { id?: string } = {}): Promise<AudioContext> {
  const id = options.id || 'default';
  
  if (audioContextMap.has(id)) {
    const ctx = audioContextMap.get(id)!;
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    return ctx;
  }

  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)(options);
  audioContextMap.set(id, ctx);
  return ctx;
}

export class AudioRecorder extends EventEmitter {
  private sampleRate: number;
  private stream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private recording: boolean = false;
  private recordingWorklet: AudioWorkletNode | null = null;
  private vuWorklet: AudioWorkletNode | null = null;
  private starting: Promise<void> | null = null;

  constructor(sampleRate: number = 16000) {
    super();
    this.sampleRate = sampleRate;
  }

  async start(): Promise<void> {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Could not request user media');
    }

    this.starting = new Promise<void>(async (resolve, reject) => {
      try {
        // Create AudioContext
        this.audioContext = await getAudioContext({
          sampleRate: this.sampleRate,
          latencyHint: 'interactive',
          id: 'audio-input',
        });

        const contextSampleRate = this.audioContext.sampleRate;

        // Request media with matching sample rate
        this.stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            sampleRate: contextSampleRate,
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true,
          },
        });

        // Create source
        this.source = this.audioContext.createMediaStreamSource(this.stream);

        // Add recording worklet
        const workletName = 'audio-recorder-worklet';
        const src = createWorkletFromSrc(workletName, AudioRecordingWorklet);
        await this.audioContext.audioWorklet.addModule(src);
        this.recordingWorklet = new AudioWorkletNode(this.audioContext, workletName);

        this.recordingWorklet.port.onmessage = async (ev: MessageEvent) => {
          const arrayBuffer = ev.data.data.int16arrayBuffer;
          if (arrayBuffer) {
            const arrayBufferString = arrayBufferToBase64(arrayBuffer);
            this.emit('data', arrayBufferString);
          }
        };

        this.source.connect(this.recordingWorklet);

        // Add VU meter worklet
        const vuWorkletName = 'vu-meter';
        await this.audioContext.audioWorklet.addModule(
          createWorkletFromSrc(vuWorkletName, VolMeterWorklet)
        );
        this.vuWorklet = new AudioWorkletNode(this.audioContext, vuWorkletName);
        this.vuWorklet.port.onmessage = (ev: MessageEvent) => {
          this.emit('volume', ev.data.volume);
        };

        this.source.connect(this.vuWorklet);
        this.recording = true;
        resolve();
      } catch (error) {
        reject(error);
      } finally {
        this.starting = null;
      }
    });

    return this.starting;
  }

  stop(): void {
    const handleStop = () => {
      this.source?.disconnect();
      this.stream?.getTracks().forEach((track) => track.stop());
      this.stream = null;
      this.recordingWorklet = null;
      this.recording = false;
    };

    if (this.starting) {
      this.starting.then(handleStop).catch(handleStop);
      return;
    }

    handleStop();
  }

  isRecording(): boolean {
    return this.recording;
  }
}
