/**
 * Webcam Hook
 * Captures webcam video for Gemini Live API video input
 */

"use client";

import { useState, useEffect, useCallback } from 'react';

export interface UseWebcamReturn {
  type: 'webcam';
  start: () => Promise<MediaStream>;
  stop: () => void;
  isStreaming: boolean;
  stream: MediaStream | null;
}

export function useWebcam(): UseWebcamReturn {
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
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false, // Audio handled by AudioRecorder
      });
      
      setStream(mediaStream);
      setIsStreaming(true);
      return mediaStream;
    } catch (error) {
      console.error('Webcam error:', error);
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
    type: 'webcam',
    start,
    stop,
    isStreaming,
    stream,
  };
}
