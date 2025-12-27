"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import {
  Send,
  Loader2,
  MessageCircle,
  Sparkles,
  AlertCircle,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useChatbot, Message } from "@/hooks/useChatbot";

export default function Chatbot() {
  const { t } = useLanguage();
  const [textInput, setTextInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    isLoading,
    error,
    currentModel,
    sendMessage,
    clearMessages,
    retryLastMessage,
  } = useChatbot();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (textInput.trim() && !isLoading) {
      await sendMessage(textInput);
      setTextInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickPrompts = [
    "Driver asking ₹300 for 5km",
    "No meter, wants fixed price",
    "Silk Board traffic excuse",
    "Rain surge pricing",
    "Night rate at 8PM",
    "Won-and-half demand",
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass-dark rounded-2xl md:rounded-3xl p-4 md:p-6 relative overflow-hidden"
    >
      {/* Animated background */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-auto-yellow/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-bengaluru-purple/5 rounded-full blur-2xl" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-5 md:mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-auto-yellow/30 to-auto-yellow/10 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 md:w-6 md:h-6 text-auto-yellow" />
            </div>
            <div>
              <h2 className="font-luxury text-xl md:text-2xl gradient-text">
                AI Negotiation Assistant
              </h2>
              {currentModel && (
                <p className="text-xs text-gray-500 font-modern">
                  Powered by {currentModel}
                </p>
              )}
            </div>
          </div>

          {messages.length > 0 && (
            <button
              onClick={clearMessages}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              title="Clear chat"
            >
              <Trash2 className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="mb-5 md:mb-6 max-h-96 overflow-y-auto space-y-3 scrollbar-thin">
          {messages.length === 0 && (
            <div className="text-center py-8 text-gray-500 font-modern">
              <Sparkles className="w-12 h-12 mx-auto mb-3 text-auto-yellow/50" />
              <p className="text-sm">
                Ask me anything about auto-rickshaw negotiations!
              </p>
            </div>
          )}

          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] rounded-xl p-3 md:p-4 ${
                  message.role === "user"
                    ? "bg-gradient-to-br from-auto-yellow/20 to-auto-yellow/10 border border-auto-yellow/30"
                    : message.metadata?.error
                    ? "bg-signal-red/10 border border-signal-red/30"
                    : "bg-white/5 border border-white/10"
                }`}
              >
                {message.role === "user" ? (
                  <p className="text-sm md:text-base text-white whitespace-pre-wrap font-modern">
                    {message.content}
                  </p>
                ) : (
                  <div className="text-sm md:text-base text-white font-modern prose prose-invert prose-sm max-w-none
                    prose-headings:text-auto-yellow prose-headings:font-luxury prose-headings:mt-2 prose-headings:mb-1
                    prose-p:my-1 prose-p:leading-relaxed
                    prose-strong:text-auto-yellow prose-strong:font-semibold
                    prose-ul:my-1 prose-ul:pl-4 prose-li:my-0.5
                    prose-ol:my-1 prose-ol:pl-4
                    prose-blockquote:border-auto-yellow/50 prose-blockquote:bg-auto-yellow/5 prose-blockquote:py-1 prose-blockquote:px-3 prose-blockquote:my-2 prose-blockquote:rounded-r-lg
                    prose-code:bg-white/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-signal-green prose-code:before:content-none prose-code:after:content-none
                    prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/10 prose-pre:rounded-lg">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                )}
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                  <span>
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                  {message.model && (
                    <span className="px-2 py-0.5 rounded-full bg-white/5">
                      {message.model.includes("2.5") ? "2.5" : "2.0"}
                    </span>
                  )}
                  {message.metadata?.latency && (
                    <span>{message.metadata.latency}ms</span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {/* Loading indicator */}
          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex justify-start"
              >
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-end gap-1 h-6">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{ height: ["30%", "100%", "30%"] }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.8,
                          delay: i * 0.1,
                          ease: "easeInOut",
                        }}
                        className="w-1 h-2 bg-auto-yellow rounded-full"
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>

        {/* Error display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-3 bg-signal-red/10 border border-signal-red/30 rounded-xl flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-signal-red flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-signal-red font-modern">{error}</p>
              </div>
              <button
                onClick={retryLastMessage}
                className="p-1 rounded-lg bg-signal-red/20 hover:bg-signal-red/30 transition-colors"
                title="Retry"
              >
                <RotateCcw className="w-4 h-4 text-signal-red" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick prompts */}
        {messages.length === 0 && (
          <div className="mb-5 md:mb-6">
            <p className="text-xs text-gray-500 mb-2 font-modern">
              Quick scenarios:
            </p>
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((prompt) => (
                <motion.button
                  key={prompt}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setTextInput(prompt);
                    if (!isLoading) {
                      sendMessage(prompt);
                    }
                  }}
                  disabled={isLoading}
                  className="px-3 py-1.5 text-xs md:text-sm bg-white/5 hover:bg-white/10 rounded-full text-gray-300 transition-colors border border-white/5 font-modern disabled:opacity-50"
                >
                  {prompt}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Input area */}
        <div className="flex gap-2 md:gap-3">
          <div className="flex-1 relative">
            <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe your situation..."
              disabled={isLoading}
              autoFocus
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 md:py-3.5 pl-11 pr-4 text-white placeholder-gray-500 focus:border-auto-yellow/50 focus:ring-2 focus:ring-auto-yellow/20 transition-all font-modern text-sm md:text-base disabled:opacity-50 outline-none"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSendMessage}
            disabled={!textInput.trim() || isLoading}
            className="px-4 md:px-5 rounded-xl bg-gradient-to-r from-auto-yellow to-yellow-500 text-asphalt font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </motion.button>
        </div>

        {/* Tips */}
        <div className="mt-5 md:mt-6 p-3 md:p-4 bg-white/5 rounded-xl">
          <p className="text-xs text-gray-400 font-modern">
            💡 <span className="text-gray-300">Pro tip:</span> Be specific about
            location, price asked, and driver's excuses for best advice!
          </p>
        </div>
      </div>
    </motion.div>
  );
}
