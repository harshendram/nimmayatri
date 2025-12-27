"use client";

import { useState, useCallback, useRef, useEffect } from "react";

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  model?: "gemini-2.5-flash" | "gemini-2.0-flash";
  metadata?: {
    latency?: number;
    tokens?: number;
    error?: boolean;
  };
}

interface UseChatbotReturn {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  currentModel: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  retryLastMessage: () => Promise<void>;
}

const MAX_MESSAGES = 10;
const DEBOUNCE_DELAY = 500;

export function useChatbot(): UseChatbotReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentModel, setCurrentModel] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastMessageRef = useRef<string | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    // Cancel any pending debounce
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Debounce the actual API call
    return new Promise<void>((resolve) => {
      debounceTimerRef.current = setTimeout(async () => {
        // Cancel any pending request
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();
        lastMessageRef.current = content;

        // Add user message immediately
        const userMessage: Message = {
          id: `user-${Date.now()}`,
          role: "user",
          content,
          timestamp: Date.now(),
        };

        setMessages((prev) => {
          const updated = [...prev, userMessage];
          // Limit to last MAX_MESSAGES
          return updated.slice(-MAX_MESSAGES);
        });

        setIsLoading(true);
        setError(null);

        const startTime = Date.now();

        try {
          const response = await fetch("/api/chatbot", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ message: content }),
            signal: abortControllerRef.current.signal,
          });

          const data = await response.json();

          if (!response.ok) {
            throw {
              message: data.error || "Failed to get response",
              code: data.code,
              retryable: data.retryable,
            };
          }

          const latency = Date.now() - startTime;

          // Add AI response
          const aiMessage: Message = {
            id: `ai-${Date.now()}`,
            role: "assistant",
            content: data.response,
            timestamp: Date.now(),
            model: data.model,
            metadata: {
              latency,
            },
          };

          setMessages((prev) => {
            const updated = [...prev, aiMessage];
            return updated.slice(-MAX_MESSAGES);
          });

          setCurrentModel(data.model);
          setError(null); // Clear any previous errors
        } catch (err: any) {
          if (err.name === "AbortError") {
            // Request was cancelled, don't show error
            return;
          }

          console.error("Chatbot error:", err);

          const errorMessage =
            err.message || "Failed to get AI response. Please try again.";
          setError(errorMessage);

          // Add error message to chat
          const errorMsg: Message = {
            id: `error-${Date.now()}`,
            role: "system",
            content: errorMessage,
            timestamp: Date.now(),
            metadata: {
              error: true,
            },
          };

          setMessages((prev) => {
            const updated = [...prev, errorMsg];
            return updated.slice(-MAX_MESSAGES);
          });
        } finally {
          setIsLoading(false);
          resolve();
        }
      }, DEBOUNCE_DELAY);
    });
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
    setCurrentModel(null);
  }, []);

  const retryLastMessage = useCallback(async () => {
    if (lastMessageRef.current) {
      await sendMessage(lastMessageRef.current);
    }
  }, [sendMessage]);

  return {
    messages,
    isLoading,
    error,
    currentModel,
    sendMessage,
    clearMessages,
    retryLastMessage,
  };
}
