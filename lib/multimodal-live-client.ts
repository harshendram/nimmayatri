/**
 * Multimodal Live Client for Gemini Live API
 * Exact port from the reference implementation using eventemitter3
 */

import EventEmitter from 'eventemitter3';

// Type guards
const isSetupCompleteMessage = (a: any): boolean => typeof a === 'object' && typeof a.setupComplete === 'object';
const isServerContentMessage = (a: any): boolean => typeof a === 'object' && typeof a.serverContent === 'object';
const isToolCallMessage = (a: any): boolean => typeof a === 'object' && typeof a.toolCall === 'object';
const isToolCallCancellationMessage = (a: any): boolean => typeof a === 'object' && typeof a.toolCallCancellation === 'object';
const isModelTurn = (a: any): boolean => a && typeof a.modelTurn === 'object';
const isTurnComplete = (a: any): boolean => typeof a?.turnComplete === 'boolean';
const isInterrupted = (a: any): boolean => a?.interrupted === true;

// Utility functions
function blobToJSON(blob: Blob): Promise<any> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        const json = JSON.parse(reader.result as string);
        resolve(json);
      } else {
        reject('Failed to read blob');
      }
    };
    reader.readAsText(blob);
  });
}

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

export interface MediaChunk {
  mimeType: string;
  data: string;
}

export interface LiveConfig {
  model?: string;
  generationConfig?: {
    responseModalities?: string;
    speechConfig?: {
      voiceConfig?: {
        prebuiltVoiceConfig?: {
          voiceName?: string;
        };
      };
    };
  };
  systemInstruction?: {
    parts: { text: string }[];
  };
  tools?: any[];
}

/**
 * MultimodalLiveClient - Direct WebSocket connection to Gemini Live API
 */
export class MultimodalLiveClient extends EventEmitter {
  public ws: WebSocket | null = null;
  private config: LiveConfig | null = null;
  private url: string;

  constructor({ apiKey }: { apiKey: string }) {
    super();
    this.url = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${apiKey}`;
    this.send = this.send.bind(this);
  }

  private log(type: string, message: any): void {
    const log = {
      date: new Date(),
      type,
      message,
    };
    this.emit('log', log);
    console.log(`[${type}]`, message);
  }

  getConfig(): LiveConfig | null {
    return this.config ? { ...this.config } : null;
  }

  connect(config: LiveConfig): Promise<boolean> {
    this.config = config;
    const ws = new WebSocket(this.url);

    ws.addEventListener('message', async (evt) => {
      if (evt.data instanceof Blob) {
        this.receive(evt.data);
      } else {
        console.log('non blob message', evt);
      }
    });

    return new Promise((resolve, reject) => {
      const onError = (ev: Event) => {
        this.disconnect(ws);
        const message = `Could not connect to Gemini Live API`;
        this.log(`server.${ev.type}`, message);
        reject(new Error(message));
      };

      ws.addEventListener('error', onError);

      ws.addEventListener('open', (ev) => {
        if (!this.config) {
          reject('Invalid config sent to connect()');
          return;
        }
        this.log(`client.${ev.type}`, 'connected to socket');
        this.emit('open');

        this.ws = ws;

        // Send setup message
        const setupMessage = {
          setup: this.config,
        };
        this._sendDirect(setupMessage);
        this.log('client.send', 'setup');

        ws.removeEventListener('error', onError);

        ws.addEventListener('close', (ev) => {
          console.log('WebSocket closed:', ev);
          this.disconnect(ws);
          let reason = ev.reason || '';
          if (reason.toLowerCase().includes('error')) {
            const prelude = 'ERROR]';
            const preludeIndex = reason.indexOf(prelude);
            if (preludeIndex > 0) {
              reason = reason.slice(preludeIndex + prelude.length + 1);
            }
          }
          this.log(`server.${ev.type}`, `disconnected ${reason ? `with reason: ${reason}` : ''}`);
          this.emit('close', ev);
        });

        resolve(true);
      });
    });
  }

  disconnect(ws?: WebSocket): boolean {
    if ((!ws || this.ws === ws) && this.ws) {
      this.ws.close();
      this.ws = null;
      this.log('client.close', 'Disconnected');
      return true;
    }
    return false;
  }

  private async receive(blob: Blob): Promise<void> {
    const response = await blobToJSON(blob);

    if (isToolCallMessage(response)) {
      this.log('server.toolCall', response);
      this.emit('toolcall', response.toolCall);
      return;
    }

    if (isToolCallCancellationMessage(response)) {
      this.log('receive.toolCallCancellation', response);
      this.emit('toolcallcancellation', response.toolCallCancellation);
      return;
    }

    if (isSetupCompleteMessage(response)) {
      this.log('server.send', 'setupComplete');
      this.emit('setupcomplete');
      return;
    }

    if (isServerContentMessage(response)) {
      const { serverContent } = response;

      if (isInterrupted(serverContent)) {
        this.log('receive.serverContent', 'interrupted');
        this.emit('interrupted');
        return;
      }

      if (isTurnComplete(serverContent)) {
        this.log('server.send', 'turnComplete');
        this.emit('turncomplete');
      }

      if (isModelTurn(serverContent)) {
        const parts = serverContent.modelTurn.parts;

        // Extract audio parts
        const audioParts = parts.filter(
          (p: any) => p.inlineData && p.inlineData.mimeType.startsWith('audio/pcm')
        );
        const base64s = audioParts.map((p: any) => p.inlineData?.data);

        // Get non-audio parts
        const otherParts = parts.filter(
          (p: any) => !p.inlineData || !p.inlineData.mimeType.startsWith('audio/pcm')
        );

        // Emit audio
        base64s.forEach((b64: string) => {
          if (b64) {
            const data = base64ToArrayBuffer(b64);
            this.emit('audio', data);
            this.log('server.audio', `buffer (${data.byteLength})`);
          }
        });

        if (!otherParts.length) {
          return;
        }

        // Emit text content
        const content = { modelTurn: { parts: otherParts } };
        this.emit('content', content);
        this.log('server.content', response);
      }
    } else {
      console.log('received unmatched message', response);
    }
  }

  /**
   * Send realtime audio/video input
   */
  sendRealtimeInput(chunks: MediaChunk[]): void {
    let hasAudio = false;
    let hasVideo = false;

    for (let i = 0; i < chunks.length; i++) {
      const ch = chunks[i];
      if (ch.mimeType.includes('audio')) hasAudio = true;
      if (ch.mimeType.includes('image')) hasVideo = true;
      if (hasAudio && hasVideo) break;
    }

    const message = hasAudio && hasVideo ? 'audio + video' : hasAudio ? 'audio' : hasVideo ? 'video' : 'unknown';

    const data = {
      realtimeInput: {
        mediaChunks: chunks,
      },
    };

    this._sendDirect(data);
    this.log('client.realtimeInput', message);
  }

  /**
   * Send text content
   */
  sendTextContent(text: string): void {
    const data = {
      clientContent: {
        turns: [
          {
            role: 'user',
            parts: [{ text }],
          },
        ],
        turnComplete: true,
      },
    };

    this._sendDirect(data);
    this.log('client.textContent', `text: ${text.substring(0, 50)}...`);
  }

  /**
   * Send tool response
   */
  sendToolResponse(toolResponse: any): void {
    const message = {
      toolResponse,
    };
    this._sendDirect(message);
    this.log('client.toolResponse', message);
  }

  /**
   * Send content parts
   */
  send(parts: any | any[], turnComplete: boolean = true): void {
    parts = Array.isArray(parts) ? parts : [parts];
    const content = {
      role: 'user',
      parts,
    };

    const clientContentRequest = {
      clientContent: {
        turns: [content],
        turnComplete,
      },
    };

    this._sendDirect(clientContentRequest);
    this.log('client.send', clientContentRequest);
  }

  /**
   * Internal send method
   */
  private _sendDirect(request: any): void {
    if (!this.ws) {
      throw new Error('WebSocket is not connected');
    }
    const str = JSON.stringify(request);
    this.ws.send(str);
  }
}
