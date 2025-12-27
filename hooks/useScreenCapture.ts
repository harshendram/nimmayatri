/**
 * Screen Capture Hook
 * Captures screen/window sharing for Gemini Live API video input
 */

"use client";

import { useState, useEffect, useCallback } from 'react';

export interface UseScreenCaptureReturn {
  type: 'screen';
  start: () => Promise<MediaStream>;
  stop: () => void;
  isStreaming: boolean;
  stream: MediaStream | null;
}

export function useScreenCapture(): UseScreenCaptureReturn {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    const handleStreamEnded = () => {
      setIsStreaming(false);
      setStream(null);
    };

    if (stream) {
      stream.getTracks().forEach((track) => 
        track.addEventListener('ended', handleStreamEnded)
      );
      
      return () => {
        stream.getTracks().forEach((track) => 
          track.removeEventListener('ended', handleStreamEnded)
        );
      };
    }
  }, [stream]);

  const start = useCallback(async (): Promise<MediaStream> => {
    try {
      const mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false, // Screen audio separate from mic
      } as DisplayMediaStreamOptions);
      
      setStream(mediaStream);
      setIsStreaming(true);
      return mediaStream;
    } catch (error) {
      console.error('Screen capture error:', error);
      throw error;
    }
  }, []);

  const stop = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      setIsStreaming(false);
    }
  }, [stream]);

  return {
    type: 'screen',
    start,
    stop,
    isStreaming,
    stream,
  };
}
