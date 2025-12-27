"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { slangPhrases, SlangPhrase } from "@/lib/productData";

export default function KannadaPhrases() {
  const { t } = useLanguage();
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [selectedPhrase, setSelectedPhrase] = useState<SlangPhrase | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playPhrase = async (phrase: SlangPhrase) => {
    window.speechSynthesis.cancel();
    setPlayingId(phrase.id);

    // Try to use a more natural voice
    const utterance = new SpeechSynthesisUtterance(phrase.audioText);
    
    // Get available voices and try to find an Indian voice
    const voices = window.speechSynthesis.getVoices();
    const indianVoice = voices.find(v => 
      v.lang.includes('kn') || 
      v.lang.includes('hi-IN') || 
      v.lang.includes('en-IN') ||
      v.name.toLowerCase().includes('indian')
    );
    
    if (indianVoice) {
      utterance.voice = indianVoice;
    }
    
    utterance.lang = "kn-IN";
    utterance.rate = 0.75; // Slower for clarity
    utterance.pitch = 1.1;
    utterance.volume = 1;

    utterance.onend = () => {
      setPlayingId(null);
      // Auto-close modal after playing
      setTimeout(() => setSelectedPhrase(null), 500);
    };
    utterance.onerror = () => setPlayingId(null);

    // Small delay for better UX
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 100);
  };

  const handleCardClick = (phrase: SlangPhrase) => {
    setSelectedPhrase(phrase);
    playPhrase(phrase);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-dark rounded-2xl md:rounded-3xl p-5 md:p-8"
      >
        <div className="flex items-center gap-3 mb-6 md:mb-8">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-bengaluru-purple/30 to-bengaluru-purple/10 flex items-center justify-center">
            <Volume2 className="w-6 h-6 md:w-7 md:h-7 text-bengaluru-purple" />
          </div>
          <div>
            <h2 className="font-luxury text-2xl md:text-3xl gradient-text">{t("phrases")}</h2>
            <p className="text-sm text-gray-500 font-modern">Essential survival phrases</p>
          </div>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 gap-4"
        >
          {slangPhrases.map((phrase) => (
            <motion.div
              key={phrase.id}
              variants={itemVariants}
              whileHover={{ y: -4, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="relative group cursor-pointer"
              onClick={() => handleCardClick(phrase)}
            >
              {/* Glow effect on hover */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-bengaluru-purple via-auto-yellow to-bengaluru-purple rounded-2xl opacity-0 group-hover:opacity-20 blur-lg transition-opacity duration-500" />
              
              {/* Main card - vertical layout with button at bottom */}
              <div className="relative bg-gradient-to-br from-[#1a1a2e]/95 to-[#0f0f1a]/95 backdrop-blur-2xl rounded-2xl p-5 border border-white/10 group-hover:border-bengaluru-purple/60 transition-all duration-300 overflow-hidden flex flex-col">
                {/* Animated gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-bengaluru-purple/0 via-bengaluru-purple/5 to-auto-yellow/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Content - Text content */}
                <div className="relative z-10 flex-1">
                  {/* English title */}
                  <h3 className="font-bold text-white text-lg font-modern mb-2 group-hover:text-auto-yellow transition-colors duration-300">
                    {phrase.phrase}
                  </h3>

                  {/* Kannada text - large */}
                  <p className="text-3xl md:text-4xl font-bold text-auto-yellow mb-2 leading-tight">
                    {phrase.kannada}
                  </p>

                  {/* English translation */}
                  <p className="text-gray-300 text-sm font-modern mb-3">
                    <span className="text-gray-500 text-xs">→ </span>
                    <span className="italic">"{phrase.meaning}"</span>
                  </p>

                  {/* Usage tip */}
                  <div className="flex items-start gap-2 pt-3 border-t border-white/5">
                    <span className="text-xs mt-0.5 flex-shrink-0">💡</span>
                    <p className="text-gray-400 text-xs font-modern leading-relaxed">
                      {phrase.usage}
                    </p>
                  </div>
                </div>

                {/* Play button at bottom - smaller */}
                <div className="relative z-10 mt-4 flex justify-center">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-12 h-12 rounded-lg bg-gradient-to-br from-bengaluru-purple/30 to-bengaluru-purple/10 flex items-center justify-center group-hover:from-bengaluru-purple group-hover:to-bengaluru-purple/90 transition-all duration-300 border border-bengaluru-purple/30 group-hover:border-bengaluru-purple shadow-lg group-hover:shadow-bengaluru-purple/50"
                  >
                    <Volume2 className="w-6 h-6 text-bengaluru-purple group-hover:text-white transition-colors duration-300" />
                  </motion.div>
                </div>

                {/* Decorative corner accent */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-bengaluru-purple/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </motion.div>
          ))}
        </motion.div>

        <p className="text-center text-gray-500 text-sm mt-6 font-modern">
          {t("clickToPlay")} 🔊
        </p>
      </motion.div>

      {/* Modal for playing phrase */}
      <AnimatePresence>
        {selectedPhrase && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => {
              setSelectedPhrase(null);
              window.speechSynthesis.cancel();
              setPlayingId(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 25 }}
              className="relative w-full max-w-md glass-dark rounded-3xl p-8 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  setSelectedPhrase(null);
                  window.speechSynthesis.cancel();
                  setPlayingId(null);
                }}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="text-center">
                <motion.div
                  animate={playingId === selectedPhrase.id ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 0.8 }}
                  className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-bengaluru-purple to-auto-yellow flex items-center justify-center"
                >
                  <Volume2 className="w-10 h-10 text-white" />
                </motion.div>

                <h3 className="text-2xl font-bold text-white mb-2 font-modern">
                  {selectedPhrase.phrase}
                </h3>
                <p className="text-4xl text-auto-yellow font-medium mb-4">
                  {selectedPhrase.kannada}
                </p>
                
                <div className="bg-white/5 rounded-xl p-4 mb-4">
                  <p className="text-gray-300 text-lg mb-2">
                    <span className="text-gray-500">English:</span> "{selectedPhrase.meaning}"
                  </p>
                  <p className="text-gray-400 text-sm font-mono">
                    <span className="text-gray-500">Pronunciation:</span> {selectedPhrase.pronunciation}
                  </p>
                </div>

                <p className="text-gray-400 text-sm italic mb-6">
                  💡 {selectedPhrase.usage}
                </p>

                {/* Waveform animation when playing */}
                {playingId === selectedPhrase.id && (
                  <div className="flex items-end justify-center gap-1 h-12 mb-4">
                    {[...Array(9)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-2 bg-gradient-to-t from-bengaluru-purple to-auto-yellow rounded-full waveform-bar"
                        style={{ animationDelay: `${i * 0.08}s` } as React.CSSProperties}
                      />
                    ))}
                  </div>
                )}

                <p className="text-gray-500 text-xs">
                  {playingId === selectedPhrase.id ? "Playing..." : "Played"}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
