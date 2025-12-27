/**
 * Audio Recording Worklet Processor
 * Converts audio to Int16 PCM format for transmission
 */

const AudioRecordingWorklet = `
class AudioRecorderWorklet extends AudioWorkletProcessor {
  constructor() {
    super();
    this.bufferSize = 4096;
    this.buffer = new Float32Array(this.bufferSize);
    this.bufferIndex = 0;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (input.length > 0) {
      const inputChannel = input[0];
      
      for (let i = 0; i < inputChannel.length; i++) {
        this.buffer[this.bufferIndex] = inputChannel[i];
        this.bufferIndex++;
        
        if (this.bufferIndex >= this.bufferSize) {
          // Convert to Int16Array
          const int16Array = new Int16Array(this.bufferSize);
          for (let j = 0; j < this.bufferSize; j++) {
            int16Array[j] = Math.max(-32768, Math.min(32767, this.buffer[j] * 32768));
          }
          
          this.port.postMessage({
            data: {
              int16arrayBuffer: int16Array.buffer
            }
          });
          
          this.bufferIndex = 0;
        }
      }
    }
    
    return true;
  }
}
`;

export default AudioRecordingWorklet;
