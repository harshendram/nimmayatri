/**
 * Audio Worklet Registry
 * Manages worklet registration and provides utilities for creating worklets
 */

export const registeredWorklets = new Map<
  AudioContext,
  Record<string, { handlers: ((ev: MessageEvent) => void)[]; node?: AudioWorkletNode }>
>();

export const createWorkletFromSrc = (workletName: string, workletSrc: string): string => {
  const script = new Blob([`registerProcessor("${workletName}", ${workletSrc})`], {
    type: 'application/javascript',
  });
  return URL.createObjectURL(script);
};
