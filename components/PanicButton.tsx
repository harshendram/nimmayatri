"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, PhoneOff, Shield, X, AlertTriangle } from "lucide-react";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { emergencyContacts } from "@/lib/productData";

export default function PanicButton() {
  const { t, language } = useLanguage();
  const [showFakeCall, setShowFakeCall] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isRinging, setIsRinging] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const playPoliceVoice = () => {
    const messages = [
      "Hello, Commissioner speaking. Give the vehicle number. We will seize the vehicle immediately.",
      "This is Bengaluru Police Control Room. What is your location? We are dispatching a patrol.",
      "Police here. Stay calm. Give me the auto registration number. Our team is on the way.",
      "Bengaluru Traffic Police. We have received your complaint. Share the auto number, we will take action.",
    ];
    
    const message = messages[Math.floor(Math.random() * messages.length)];
    const utterance = new SpeechSynthesisUtterance(message);
    
    const voices = window.speechSynthesis.getVoices();
    const maleVoice = voices.find(v => 
      v.name.toLowerCase().includes('male') || 
      v.lang.includes('en-IN') ||
      v.name.includes('Ravi') ||
      v.name.includes('Google')
    );
    
    if (maleVoice) {
      utterance.voice = maleVoice;
    }
    
    utterance.lang = "en-IN";
    utterance.rate = 0.85;
    utterance.pitch = 0.7;
    utterance.volume = 1;
    
    window.speechSynthesis.speak(utterance);
  };

  const playRingtone = () => {
    try {
      audioContextRef.current = new AudioContext();
      const ctx = audioContextRef.current;
      
      const playTone = (frequency: number, duration: number, startTime: number) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = "sine";
        
        gainNode.gain.setValueAtTime(0.3, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };

      // Indian phone ring pattern
      for (let i = 0; i < 3; i++) {
        playTone(440, 0.4, ctx.currentTime + i * 1);
        playTone(480, 0.4, ctx.currentTime + i * 1 + 0.5);
      }
    } catch (e) {
      console.log("Audio not supported");
    }
  };

  const startFakeCall = () => {
    setShowFakeCall(true);
    setIsRinging(true);
    setCallDuration(0);
    playRingtone();

    setTimeout(() => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    }, 3000);
  };

  const answerCall = () => {
    setIsRinging(false);
    playPoliceVoice();
    
    timerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
  };

  const endFakeCall = () => {
    setShowFakeCall(false);
    setIsRinging(true);
    setCallDuration(0);
    window.speechSynthesis.cancel();
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      window.speechSynthesis.cancel();
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="glass-dark rounded-2xl md:rounded-3xl p-4 md:p-6"
      >
        <div className="flex items-center gap-3 mb-5 md:mb-6">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-signal-red/30 to-signal-red/10 flex items-center justify-center">
            <Shield className="w-5 h-5 md:w-6 md:h-6 text-signal-red" />
          </div>
          <div>
            <h2 className="font-luxury text-xl md:text-2xl gradient-text">{t("panicButton")}</h2>
            <p className="text-xs text-gray-500 font-modern">Safety first</p>
          </div>
        </div>

        {/* Fake Police Call Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={startFakeCall}
          className="w-full relative overflow-hidden bg-gradient-to-r from-signal-red to-red-600 rounded-xl p-4 md:p-5 text-left group mb-4 md:mb-5"
        >
          <motion.div
            className="absolute inset-0 bg-white/10"
            initial={{ x: "-100%" }}
            whileHover={{ x: "100%" }}
            transition={{ duration: 0.5 }}
          />
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/20 flex items-center justify-center overflow-hidden relative">
              <Image
                src="/assets/indian-police-officer-vector-illustration_661323-68.png"
                alt="Police"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold text-white font-modern">{t("fakeCall")}</h3>
              <p className="text-white/70 text-xs md:text-sm font-modern">
                Triggers realistic incoming police call
              </p>
            </div>
          </div>
        </motion.button>

        {/* Emergency Contacts */}
        <div>
          <h3 className="font-bold text-white mb-4 flex items-center gap-2 font-modern text-base">
            <AlertTriangle className="w-5 h-5 text-auto-yellow" />
            {t("emergencyHelp")}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {emergencyContacts.map((contact) => (
              <motion.a
                key={contact.number}
                href={`tel:${contact.number}`}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="glass-card rounded-xl p-3 flex items-center gap-3 hover:bg-white/10 transition-colors group"
              >
                <span className="text-2xl flex-shrink-0">{contact.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-white text-sm font-medium truncate font-modern">
                    {language === "kn" ? contact.nameKn : contact.name}
                  </p>
                  <p className="text-auto-yellow text-xs font-mono group-hover:underline">
                    {contact.number}
                  </p>
                  <p className="text-gray-500 text-[10px] mt-0.5 font-modern">
                    {contact.description}
                  </p>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Fake Call Screen Overlay */}
      <AnimatePresence>
        {showFakeCall && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
            onClick={(e) => e.target === e.currentTarget && endFakeCall()}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm incoming-call-bg rounded-[2.5rem] overflow-hidden shadow-2xl"
            >
              <div className="p-8 text-center">
                {isRinging ? (
                  <motion.p
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="text-gray-400 text-sm mb-6 font-modern"
                  >
                    incoming call...
                  </motion.p>
                ) : (
                  <p className="text-signal-green text-sm mb-6 font-mono">
                    {formatDuration(callDuration)}
                  </p>
                )}

                <motion.div
                  animate={isRinging ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="w-28 h-28 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-xl overflow-hidden relative"
                >
                  <Image
                    src="/assets/indian-police-officer-vector-illustration_661323-68.png"
                    alt="Police Officer"
                    fill
                    className="object-cover"
                    priority
                  />
                </motion.div>

                <h2 className="text-2xl font-semibold text-white mb-1 font-modern">
                  Bengaluru Police
                </h2>
                <p className="text-gray-400 font-modern">Control Room • 100</p>
              </div>

              <div className="p-8 pt-4">
                {isRinging ? (
                  <div className="flex justify-center gap-12">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={endFakeCall}
                      className="w-16 h-16 rounded-full bg-signal-red flex items-center justify-center shadow-lg"
                    >
                      <PhoneOff className="w-7 h-7 text-white" />
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ repeat: Infinity, duration: 0.6 }}
                      onClick={answerCall}
                      className="w-16 h-16 rounded-full bg-signal-green flex items-center justify-center shadow-lg glow-green"
                    >
                      <Phone className="w-7 h-7 text-white" />
                    </motion.button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center gap-2 text-signal-green">
                      <span className="w-2 h-2 bg-signal-green rounded-full animate-pulse" />
                      <span className="text-sm font-modern">Call in progress</span>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={endFakeCall}
                      className="w-16 h-16 rounded-full bg-signal-red flex items-center justify-center shadow-lg"
                    >
                      <PhoneOff className="w-7 h-7 text-white" />
                    </motion.button>
                  </div>
                )}
              </div>

              <button
                onClick={endFakeCall}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
