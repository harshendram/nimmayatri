"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import {
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Bot,
  Loader2,
  Volume2,
  VolumeX,
  Waves,
  Monitor,
  MonitorOff,
  Video,
  VideoOff,
  X,
  Minus,
  Maximize2,
  Send,
  MessageCircle,
  Brain,
  Sparkles,
} from "lucide-react";
import { useLiveAssistant } from "@/context/LiveAssistantContext";
import { useScreenCapture } from "@/hooks/useScreenCapture";
import { useWebcam } from "@/hooks/useWebcam";
import Image from "next/image";

// Modern AI Voice Assistant icon
const AIVoiceIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Outer glow circle */}
    <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="2" opacity="0.3" />
    <circle cx="32" cy="32" r="24" stroke="currentColor" strokeWidth="2" opacity="0.5" />
    {/* Voice waves */}
    <path d="M20 32C20 32 22 26 22 32C22 38 20 32 20 32" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    <path d="M26 32C26 32 29 22 29 32C29 42 26 32 26 32" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    <path d="M32 32C32 32 36 18 36 32C36 46 32 32 32 32" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    <path d="M38 32C38 32 41 22 41 32C41 42 38 32 38 32" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    <path d="M44 32C44 32 46 26 46 32C46 38 44 32 44 32" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

// Keep AutoRickshawIcon for header
const AutoRickshawIcon = () => (
  <svg viewBox="0 0 64 64" className="w-6 h-6">
    <g fill="currentColor">
      <path d="M52 36H44V28C44 26.9 43.1 26 42 26H32L28 20H20C17.8 20 16 21.8 16 24V36H12C10.9 36 10 36.9 10 38V42C10 43.1 10.9 44 12 44H14C14 47.3 16.7 50 20 50C23.3 50 26 47.3 26 44H38C38 47.3 40.7 50 44 50C47.3 50 50 47.3 50 44H52C53.1 44 54 43.1 54 42V38C54 36.9 53.1 36 52 36ZM20 46C18.9 46 18 45.1 18 44C18 42.9 18.9 42 20 42C21.1 42 22 42.9 22 44C22 45.1 21.1 46 20 46ZM28 32H20V24H26L28 28V32ZM32 32V28H40V32H32ZM44 46C42.9 46 42 45.1 42 44C42 42.9 42.9 42 44 42C45.1 42 46 42.9 46 44C46 45.1 45.1 46 44 46Z"/>
    </g>
  </svg>
);

// Component to render message with thinking animation
const MessageContent: React.FC<{ content: string; role: string }> = ({ content, role }) => {
  // Check if content contains thinking markers
  const thinkingRegex = /\*\*([^*]+)\*\*/g;
  const parts: { type: 'text' | 'thinking'; content: string }[] = [];
  let lastIndex = 0;
  let match;

  while ((match = thinkingRegex.exec(content)) !== null) {
    // Add text before the thinking
    if (match.index > lastIndex) {
      parts.push({
        type: "text",
        content: content.slice(lastIndex, match.index),
      });
    }
    // Add thinking part
    parts.push({ type: "thinking", content: match[1] });
    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < content.length) {
    parts.push({ type: "text", content: content.slice(lastIndex) });
  }

  // If no thinking markers found, just return the content with markdown
  if (parts.length === 0 || (parts.length === 1 && parts[0].type === 'text')) {
    return (
      <div className="prose prose-sm prose-invert max-w-none">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {parts.map((part, i) => {
        if (part.type === "thinking") {
          return (
            <div
              key={i}
              className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-auto-yellow/20 to-yellow-500/10 border border-auto-yellow/30 rounded-lg"
            >
              <div className="relative">
                <Brain className="w-4 h-4 text-auto-yellow" />
                <Sparkles className="w-2 h-2 text-yellow-400 absolute -top-1 -right-1 animate-ping" />
              </div>
              <span className="text-sm text-auto-yellow italic font-medium animate-pulse">
                {part.content}
              </span>
              <div className="flex gap-1 ml-auto">
                <span
                  className="w-1.5 h-1.5 bg-auto-yellow rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <span
                  className="w-1.5 h-1.5 bg-auto-yellow rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className="w-1.5 h-1.5 bg-auto-yellow rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
          );
        }
        // Render text parts with proper whitespace and newline handling
        return (
          <div key={i} className="prose prose-sm prose-invert max-w-none">
            <ReactMarkdown>{part.content}</ReactMarkdown>
          </div>
        );
      })}
    </div>
  );
};

const FloatingLiveAssistant: React.FC = () => {
  const {
    isOpen,
    setIsOpen,
    isMinimized,
    setIsMinimized,
    isConnected,
    isConnecting,
    connectionStatus,
    connect,
    disconnect,
    isMicOn,
    toggleMic,
    isSpeakerOn,
    setIsSpeakerOn,
    videoSource,
    setVideoSource,
    sendVideoFrame,
    messages,
    isModelSpeaking,
    sendText,
    hasApiKey,
  } = useLiveAssistant();

  const [textInput, setTextInput] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEnlarged, setIsEnlarged] = useState(false); // New state for enlarging
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [supportsScreenShare, setSupportsScreenShare] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Video hooks
  const screenCapture = useScreenCapture();
  const webcam = useWebcam();

  // Detect mobile device and screen share support
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      // Set initial position at bottom right for mobile on first load
      if (mobile && position.x === 0 && position.y === 0) {
        const initialX = window.innerWidth - 300 - 16;
        const initialY = window.innerHeight - 450 - 16;
        setPosition({
          x: Math.max(0, initialX),
          y: Math.max(0, initialY),
        });
      }
    };
    checkMobile();

    // Check if getDisplayMedia is supported (not available on mobile browsers)
    const checkScreenShareSupport = () => {
      const hasGetDisplayMedia =
        navigator.mediaDevices &&
        typeof navigator.mediaDevices.getDisplayMedia === "function";
      const isMobileDevice =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );
      setSupportsScreenShare(hasGetDisplayMedia && !isMobileDevice);
    };
    checkScreenShareSupport();

    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [position.x, position.y]);

  // Drag handlers for mobile
  const handleDragStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!isMobile || isExpanded) return;

      e.preventDefault();

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      setIsDragging(true);
      setDragStart({
        x: clientX - position.x,
        y: clientY - position.y,
      });
    },
    [isMobile, isExpanded, position.x, position.y]
  );

  const handleDragMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;

      e.preventDefault();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const newX = clientX - dragStart.x;
      const newY = clientY - dragStart.y;

      const maxX = window.innerWidth - (containerRef.current?.offsetWidth || 0);
      const maxY = window.innerHeight - (containerRef.current?.offsetHeight || 0);

      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    },
    [isDragging, dragStart.x, dragStart.y]
  );

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      const handleMouseMove = (e: MouseEvent) => handleDragMove(e);
      const handleMouseUp = () => handleDragEnd();
      const handleTouchMove = (e: TouchEvent) => handleDragMove(e);
      const handleTouchEnd = () => handleDragEnd();

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove, { passive: false });
      window.addEventListener("touchend", handleTouchEnd);

      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
        window.removeEventListener("touchmove", handleTouchMove);
        window.removeEventListener("touchend", handleTouchEnd);
      };
    }
  }, [isDragging, handleDragMove, handleDragEnd]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Attach stream to video
  useEffect(() => {
    const stream = webcam.stream || screenCapture.stream;
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch((e) => console.error("Video play error:", e));
    }
  }, [webcam.stream, screenCapture.stream, videoSource]);

  // Capture and send frames
  const captureFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video.readyState < 2 || video.videoWidth === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const reader = new FileReader();
          reader.onloadend = () => {
            const result = reader.result as string;
            const base64 = result.split(",")[1];
            sendVideoFrame(base64);
          };
          reader.readAsDataURL(blob);
        }
      },
      "image/jpeg",
      0.7
    );
  }, [sendVideoFrame]);

  // Toggle screen share
  const toggleScreen = useCallback(async () => {
    if (!isConnected) return;

    if (!supportsScreenShare) {
      alert("Screen sharing is not supported on mobile devices.");
      return;
    }

    if (videoSource === "screen") {
      screenCapture.stop();
      if (videoIntervalRef.current) clearInterval(videoIntervalRef.current);
      setVideoSource("none");
    } else {
      try {
        if (videoSource === "webcam") webcam.stop();
        if (videoIntervalRef.current) clearInterval(videoIntervalRef.current);

        await screenCapture.start();
        setVideoSource("screen");

        setTimeout(() => {
          videoIntervalRef.current = setInterval(captureFrame, 1000);
        }, 500);
      } catch (e) {
        console.error("Screen share error:", e);
        alert("Failed to start screen sharing.");
      }
    }
  }, [isConnected, videoSource, screenCapture, webcam, captureFrame, setVideoSource, supportsScreenShare]);

  // Toggle webcam
  const toggleWebcam = useCallback(async () => {
    if (!isConnected) return;

    if (videoSource === "webcam") {
      webcam.stop();
      if (videoIntervalRef.current) clearInterval(videoIntervalRef.current);
      setVideoSource("none");
    } else {
      try {
        if (videoSource === "screen") screenCapture.stop();
        if (videoIntervalRef.current) clearInterval(videoIntervalRef.current);

        await webcam.start();
        setVideoSource("webcam");

        setTimeout(() => {
          videoIntervalRef.current = setInterval(captureFrame, 1000);
        }, 500);
      } catch (e) {
        console.error("Webcam error:", e);
        alert("Failed to access webcam. Please check permissions.");
      }
    }
  }, [isConnected, videoSource, webcam, screenCapture, captureFrame, setVideoSource]);

  // Cleanup on disconnect
  useEffect(() => {
    if (!isConnected) {
      webcam.stop();
      screenCapture.stop();
      if (videoIntervalRef.current) clearInterval(videoIntervalRef.current);
    }
  }, [isConnected, webcam, screenCapture]);

  // Handle send
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim()) {
      sendText(textInput);
      setTextInput("");
    }
  };

  // Quick prompts for Nimma Yatri
  const quickPrompts = [
    "Driver asking ₹300 for 5km",
    "No meter, fixed price only",
    "Rain surge pricing",
    "MG Road to Indiranagar",
  ];

  // Floating button when closed
  if (!isOpen) {
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-lg shadow-auto-yellow/50 flex items-center justify-center z-50 overflow-hidden border-[3px] border-auto-yellow bg-gradient-to-br from-asphalt via-gray-800 to-asphalt group"
        style={isMobile ? { bottom: "1rem", right: "1rem" } : {}}
      >
        <div className="text-auto-yellow group-hover:scale-110 transition-transform">
          <AIVoiceIcon className="w-10 h-10" />
        </div>
        {/* Animated pulse ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-auto-yellow/50"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        {isConnected && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-signal-green rounded-full border-2 border-asphalt animate-pulse" />
        )}
      </motion.button>
    );
  }

  // Minimized state
  if (isMinimized) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-6 right-6 bg-asphalt text-white rounded-full shadow-lg px-4 py-2 flex items-center gap-3 z-50 border border-white/10"
        style={
          isMobile
            ? {
                left: `${position.x}px`,
                top: `${position.y}px`,
                bottom: "auto",
                right: "auto",
              }
            : {}
        }
      >
        <AutoRickshawIcon />
        <span className="text-sm font-modern">{isConnected ? "Live" : "Offline"}</span>
        {isModelSpeaking && (
          <Waves className="w-4 h-4 text-auto-yellow animate-pulse" />
        )}
        <button
          onClick={() => setIsMinimized(false)}
          className="p-1 hover:bg-white/10 rounded"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1 hover:bg-white/10 rounded"
        >
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    );
  }

  // Full widget
  const mobileCompactStyle =
    isMobile && !isExpanded
      ? {
          width: "300px",
          height: "450px",
          left: `${position.x}px`,
          top: `${position.y}px`,
          bottom: "auto",
          right: "auto",
        }
      : {};

  const mobileExpandedStyle =
    isMobile && isExpanded
      ? {
          width: "100vw",
          height: "100vh",
          left: 0,
          top: 0,
          bottom: 0,
          right: 0,
          borderRadius: 0,
        }
      : {};

  // Desktop enlarged style
  const desktopEnlargedStyle = !isMobile && isEnlarged
    ? {
        width: "600px",
        height: "80vh",
        maxHeight: "800px",
      }
    : {};

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      transition={{ type: "spring", damping: 20 }}
      className={`fixed glass-dark rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden border border-white/10 ${
        isDragging ? "cursor-grabbing" : ""
      } ${isMobile ? "touch-none" : `bottom-6 right-6 ${isEnlarged ? "" : "w-96 h-[600px]"}`}`}
      style={{
        ...(isMobile
          ? isExpanded
            ? mobileExpandedStyle
            : mobileCompactStyle
          : desktopEnlargedStyle),
      }}
    >
      {/* Header */}
      <div
        className={`bg-gradient-to-r from-asphalt to-gray-800 text-white p-4 flex items-center justify-between ${
          isMobile && !isExpanded ? "cursor-grab active:cursor-grabbing" : ""
        }`}
        onMouseDown={isMobile && !isExpanded ? handleDragStart : undefined}
        onTouchStart={isMobile && !isExpanded ? handleDragStart : undefined}
      >
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-auto-yellow to-yellow-500 flex items-center justify-center text-asphalt">
            <AutoRickshawIcon />
          </div>
          <div>
            <span className="font-luxury text-lg gradient-text">Nimma Yatri Live</span>
            <div className="flex items-center gap-1">
              <span
                className={`w-2 h-2 rounded-full ${
                  connectionStatus === "ready"
                    ? "bg-signal-green animate-pulse"
                    : connectionStatus === "connected"
                    ? "bg-blue-500"
                    : connectionStatus === "connecting"
                    ? "bg-auto-yellow animate-pulse"
                    : "bg-gray-500"
                }`}
              />
              <span className="text-xs text-gray-400 font-modern">
                {connectionStatus === "ready" ? "Ready" : connectionStatus}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {/* Enlarge button for desktop */}
          {!isMobile && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEnlarged(!isEnlarged);
              }}
              className="p-1.5 hover:bg-white/10 rounded transition-colors"
              title={isEnlarged ? "Shrink" : "Enlarge"}
            >
              <Maximize2 className={`w-4 h-4 transition-transform ${isEnlarged ? "rotate-45" : ""}`} />
            </button>
          )}
          {isMobile && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="p-1.5 hover:bg-white/10 rounded"
            >
              <Maximize2 className={`w-4 h-4 ${isExpanded ? "rotate-45" : ""}`} />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMinimized(true);
            }}
            className="p-1.5 hover:bg-white/10 rounded"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
            className="p-1.5 hover:bg-white/10 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages area */}
      <div
        className={`flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-asphalt/50 to-asphalt/80 ${
          isMobile && !isExpanded ? "p-3 space-y-2" : ""
        }`}
      >
        {!isConnected ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-auto-yellow/20 to-yellow-500/10 flex items-center justify-center mb-4">
              <div className="text-auto-yellow">
                <AIVoiceIcon className="w-12 h-12" />
              </div>
            </div>
            <h3 className="font-luxury text-xl gradient-text mb-2">
              Nimma Yatri Live
            </h3>
            <p className="text-gray-400 text-sm mb-4 font-modern">
              Real-time voice assistant for auto negotiation
            </p>
            {hasApiKey ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={connect}
                disabled={isConnecting}
                className="px-5 py-2.5 bg-gradient-to-r from-auto-yellow to-yellow-500 text-asphalt rounded-xl font-modern font-medium flex items-center gap-2 disabled:opacity-50"
              >
                {isConnecting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Phone className="w-4 h-4" />
                )}
                {isConnecting ? "Connecting..." : "Start Session"}
              </motion.button>
            ) : (
              <p className="text-signal-red text-sm font-modern">
                API key not configured
              </p>
            )}
            {/* Show previous messages below start button */}
            {messages.length > 0 && (
              <div className="mt-6 w-full">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  <span className="text-xs text-gray-500 font-modern">Previous Session</span>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto px-2">
                  {messages.slice(-3).map((msg, i) => (
                    <div 
                      key={i} 
                      className={`text-xs p-2 rounded-lg ${
                        msg.role === "user" 
                          ? "bg-auto-yellow/10 text-auto-yellow border border-auto-yellow/20" 
                          : msg.role === "assistant"
                          ? "bg-white/5 text-gray-300 border border-white/10"
                          : "bg-gray-700/30 text-gray-500 italic"
                      }`}
                    >
                      <span className="font-medium capitalize">{msg.role}:</span>{" "}
                      <span className="opacity-80">{msg.content.substring(0, 60)}...</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => {
                    // Clear messages functionality could be added here
                  }}
                  className="mt-2 text-xs text-gray-500 hover:text-gray-400 transition-colors"
                >
                  
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-xl ${
                    isMobile && !isExpanded ? "text-xs px-2 py-1.5" : "text-sm"
                  } ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-auto-yellow to-yellow-500 text-asphalt rounded-br-sm font-modern"
                      : msg.role === "assistant"
                      ? "bg-white/10 border border-white/10 text-white rounded-bl-sm shadow-sm"
                      : "bg-gray-700/50 text-gray-300 text-xs italic font-modern"
                  }`}
                >
                  <MessageContent content={msg.content} role={msg.role} />
                </div>
              </motion.div>
            ))}
            {isModelSpeaking && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-white/10 border border-auto-yellow/30 rounded-xl px-3 py-2 flex items-center gap-2">
                  <Waves className="w-4 h-4 text-auto-yellow animate-pulse" />
                  <span className="text-auto-yellow text-sm font-modern">
                    Speaking...
                  </span>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Video preview */}
      <div className={`${videoSource === "none" ? "hidden" : "block"} border-t border-white/10`}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full object-cover bg-asphalt ${
            isMobile && !isExpanded ? "h-16" : "h-24"
          }`}
        />
      </div>
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {/* Quick prompts - Only show when connected and not speaking */}
      {isConnected && !isModelSpeaking && (!isMobile || isExpanded) && (
        <div className="px-4 py-2 border-t border-white/10 bg-asphalt/50">
          <div className="flex flex-wrap gap-1">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => sendText(prompt)}
                className="px-2 py-1 text-xs bg-white/5 hover:bg-white/10 rounded-full text-gray-300 transition-colors border border-white/5 font-modern"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Controls */}
      {isConnected && (
        <div className={`border-t border-white/10 bg-asphalt/80 ${isMobile && !isExpanded ? "p-2" : "p-3"}`}>
          {/* Text input */}
          <form onSubmit={handleSend} className={`flex gap-2 ${isMobile && !isExpanded ? "mb-2" : "mb-3"}`}>
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Type your situation..."
              className={`flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-auto-yellow/50 outline-none text-white placeholder-gray-500 font-modern ${
                isMobile && !isExpanded ? "text-xs px-2 py-1.5" : "text-sm"
              }`}
            />
            <motion.button
              type="submit"
              disabled={!textInput.trim()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`bg-gradient-to-r from-auto-yellow to-yellow-500 text-asphalt rounded-xl disabled:opacity-50 ${
                isMobile && !isExpanded ? "p-1.5" : "p-2"
              }`}
            >
              <Send className={isMobile && !isExpanded ? "w-3.5 h-3.5" : "w-4 h-4"} />
            </motion.button>
          </form>

          {/* Media controls */}
          <div className={`flex items-center justify-center ${isMobile && !isExpanded ? "gap-1" : "gap-2"}`}>
            <motion.button
              onClick={toggleMic}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`rounded-full ${
                isMicOn
                  ? "bg-signal-green text-white"
                  : "bg-white/10 text-gray-400 hover:text-white"
              } ${isMobile && !isExpanded ? "p-1.5" : "p-2.5"}`}
              title="Microphone"
            >
              {isMicOn ? (
                <Mic className={isMobile && !isExpanded ? "w-4 h-4" : "w-5 h-5"} />
              ) : (
                <MicOff className={isMobile && !isExpanded ? "w-4 h-4" : "w-5 h-5"} />
              )}
            </motion.button>

            {(!isMobile || isExpanded) && (
              <>
                <motion.button
                  onClick={toggleWebcam}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`p-2.5 rounded-full ${
                    videoSource === "webcam"
                      ? "bg-auto-yellow text-asphalt"
                      : "bg-white/10 text-gray-400 hover:text-white"
                  }`}
                  title="Webcam"
                >
                  {videoSource === "webcam" ? (
                    <Video className="w-5 h-5" />
                  ) : (
                    <VideoOff className="w-5 h-5" />
                  )}
                </motion.button>

                {supportsScreenShare && (
                  <motion.button
                    onClick={toggleScreen}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={`p-2.5 rounded-full ${
                      videoSource === "screen"
                        ? "bg-auto-yellow text-asphalt"
                        : "bg-white/10 text-gray-400 hover:text-white"
                    }`}
                    title="Screen Share"
                  >
                    {videoSource === "screen" ? (
                      <Monitor className="w-5 h-5" />
                    ) : (
                      <MonitorOff className="w-5 h-5" />
                    )}
                  </motion.button>
                )}
              </>
            )}

            <motion.button
              onClick={disconnect}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`bg-signal-red text-white rounded-full hover:bg-red-600 ${
                isMobile && !isExpanded ? "p-1.5" : "p-2.5"
              }`}
              title="End Session"
            >
              <PhoneOff className={isMobile && !isExpanded ? "w-4 h-4" : "w-5 h-5"} />
            </motion.button>

            <motion.button
              onClick={() => setIsSpeakerOn(!isSpeakerOn)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`rounded-full ${
                isSpeakerOn
                  ? "bg-auto-yellow text-asphalt"
                  : "bg-white/10 text-gray-400 hover:text-white"
              } ${isMobile && !isExpanded ? "p-1.5" : "p-2.5"}`}
              title="Speaker"
            >
              {isSpeakerOn ? (
                <Volume2 className={isMobile && !isExpanded ? "w-4 h-4" : "w-5 h-5"} />
              ) : (
                <VolumeX className={isMobile && !isExpanded ? "w-4 h-4" : "w-5 h-5"} />
              )}
            </motion.button>
          </div>

          {/* Status indicators */}
          {(!isMobile || isExpanded) && (
            <div className="flex items-center justify-center gap-3 mt-2 text-xs text-gray-500 font-modern">
              {isMicOn && (
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-signal-red rounded-full animate-pulse" />
                  Listening
                </span>
              )}
              {videoSource !== "none" && (
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                  {videoSource === "screen" ? "Screen" : "Camera"}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default FloatingLiveAssistant;
