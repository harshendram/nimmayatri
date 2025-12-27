"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Mic, MicOff, Radio, Send, Sparkles, Loader2, MessageCircle, Wifi, WifiOff } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useGeminiLive } from "@/hooks/useGeminiLive";

export default function LiveNegotiation() {
  const { t } = useLanguage();
  const [textInput, setTextInput] = useState("");
  const {
    isConnected,
    isListening,
    transcript,
    aiResponse,
    error,
    isLoading,
    isLiveMode,
    startSession,
    stopSession,
    sendText,
    startVoice,
    stopVoice,
  } = useGeminiLive();

  // Auto-connect on mount
  useEffect(() => {
    startSession();
  }, [startSession]);

  const handleSendText = async () => {
    if (textInput.trim() && !isLoading) {
      await sendText(textInput);
      setTextInput("");
    }
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      stopVoice();
    } else {
      startVoice();
    }
  };

  const quickPrompts = [
    "Driver asking ₹300 for 5km",
    "No meter, fixed price only",
    "Silk Board traffic excuse",
    "Rain surge pricing",
    "Night rate at 8PM",
    "Indiranagar to Koramangala",
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="glass-dark rounded-2xl md:rounded-3xl p-4 md:p-6 relative overflow-hidden"
    >
      {/* Animated background */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-signal-green/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-auto-yellow/5 rounded-full blur-2xl" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-5 md:mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center ${
              isConnected ? "bg-gradient-to-br from-signal-green/30 to-signal-green/10" : "bg-gradient-to-br from-auto-yellow/30 to-auto-yellow/10"
            }`}>
              <Radio className={`w-5 h-5 md:w-6 md:h-6 ${isConnected ? "text-signal-green" : "text-auto-yellow"}`} />
            </div>
            <div>
              <h2 className="font-luxury text-xl md:text-2xl gradient-text">{t("liveMode")}</h2>
              <p className="text-xs text-gray-500 font-modern flex items-center gap-1">
                {isLiveMode ? (
                  <>
                    <Wifi className="w-3 h-3 text-signal-green" />
                    <span className="text-signal-green">Live API connected</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3" />
                    <span>AI-powered assistant</span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs md:text-sm font-modern ${
            isConnected ? "bg-signal-green/20 text-signal-green" : "bg-gray-500/20 text-gray-400"
          }`}>
            <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-signal-green status-pulse" : "bg-gray-500"}`} />
            {isConnected ? t("connected") : t("disconnected")}
          </div>
        </div>

        {/* Main interaction area */}
        <div className="mb-5 md:mb-6">
          <div className="flex gap-2 md:gap-3">
            <div className="flex-1 relative">
              <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={isListening ? transcript : textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendText()}
                placeholder={isListening ? "Listening..." : "Describe your situation..."}
                disabled={isLoading || isListening}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 md:py-3.5 pl-11 pr-4 text-white placeholder-gray-500 focus:border-auto-yellow/50 transition-all font-modern text-sm md:text-base disabled:opacity-50"
              />
            </div>
            
            {/* Voice button */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleVoiceToggle}
              disabled={isLoading}
              className={`px-4 rounded-xl flex items-center justify-center transition-all ${
                isListening 
                  ? "bg-signal-red text-white animate-pulse" 
                  : "bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white"
              }`}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </motion.button>
            
            {/* Send button */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSendText}
              disabled={!textInput.trim() || isLoading || isListening}
              className="px-4 md:px-5 rounded-xl bg-gradient-to-r from-auto-yellow to-yellow-500 text-asphalt disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Quick prompts */}
        <div className="mb-5 md:mb-6">
          <p className="text-xs text-gray-500 mb-2 font-modern">Quick scenarios:</p>
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((prompt) => (
              <motion.button
                type="button"
                key={prompt}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setTextInput(prompt);
                  if (!isLoading) {
                    sendText(prompt);
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

        {/* Listening indicator */}
        <AnimatePresence>
          {isListening && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4"
            >
              <div className="flex items-center gap-3 p-4 glass-card rounded-xl border border-signal-green/30">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ scaleY: [0.3, 1, 0.3] }}
                      transition={{
                        repeat: Infinity,
                        duration: 0.5,
                        delay: i * 0.1,
                      }}
                      className="w-1 h-6 bg-signal-green rounded-full"
                    />
                  ))}
                </div>
                <span className="text-sm text-signal-green font-modern">Listening... Speak now</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading state */}
        <AnimatePresence>
          {isLoading && !isListening && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4"
            >
              <div className="flex items-center gap-3 p-4 glass-card rounded-xl">
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
                <span className="text-sm text-gray-400 font-modern">Thinking...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Response */}
        <AnimatePresence>
          {aiResponse && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-gradient-to-br from-auto-yellow/10 to-auto-yellow/5 border border-auto-yellow/20 rounded-xl p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-lg bg-auto-yellow/20">
                  <Sparkles className="w-4 h-4 text-auto-yellow" />
                </div>
                <p className="text-sm text-auto-yellow font-medium font-modern">{t("aiAdvice")}</p>
              </div>
              <div className="text-white text-sm md:text-base leading-relaxed font-modern prose prose-invert prose-sm max-w-none
                prose-headings:text-auto-yellow prose-headings:font-luxury prose-headings:mt-2 prose-headings:mb-1
                prose-p:my-1 prose-p:leading-relaxed
                prose-strong:text-auto-yellow prose-strong:font-semibold
                prose-ul:my-1 prose-ul:pl-4 prose-li:my-0.5
                prose-ol:my-1 prose-ol:pl-4
                prose-blockquote:border-auto-yellow/50 prose-blockquote:bg-auto-yellow/5 prose-blockquote:py-1 prose-blockquote:px-3 prose-blockquote:my-2 prose-blockquote:rounded-r-lg
                prose-code:bg-white/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-signal-green prose-code:before:content-none prose-code:after:content-none
                prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/10 prose-pre:rounded-lg">
                <ReactMarkdown>{aiResponse}</ReactMarkdown>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-4 p-3 bg-signal-red/10 border border-signal-red/30 rounded-xl text-signal-red text-sm font-modern"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tips */}
        <div className="mt-5 md:mt-6 p-3 md:p-4 bg-white/5 rounded-xl">
          <p className="text-xs text-gray-400 font-modern">
            💡 <span className="text-gray-300">Pro tip:</span> Describe your exact situation - location, price asked, and any excuses the driver gives. The AI will give you specific counter-tactics!
          </p>
        </div>
      </div>
    </motion.div>
  );
}
