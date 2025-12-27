"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LoadScript } from "@react-google-maps/api";
import Header from "@/components/Header";
import FareCalculator from "@/components/FareCalculator";
import KannadaPhrases from "@/components/KannadaPhrases";
import RedditPosts from "@/components/RedditPosts";
import Chatbot from "@/components/Chatbot";
import PanicButton from "@/components/PanicButton";
import AreaTips from "@/components/AreaTips";
import { useLanguage } from "@/context/LanguageContext";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
const libraries: ("places")[] = ["places"];

export default function Home() {
  const { t } = useLanguage();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <LoadScript
      googleMapsApiKey={GOOGLE_MAPS_API_KEY}
      libraries={libraries}
      loadingElement={<LoadingScreen />}
    >
      <main className="min-h-screen relative">
        {/* Background with Vidhana Soudha hero image */}
        <div className="fixed inset-0 z-0">
          {/* Hero background image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('/assets/herobg.jpg')`,
            }}
          />
          
          {/* Dark overlay with gradient for readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a15]/90 via-[#0f0f1a]/85 to-[#1a1a2e]/95" />
          
          {/* Glassmorphism overlay effect */}
          <div className="absolute inset-0 backdrop-blur-[2px]" />
          
          {/* Subtle dot pattern overlay */}
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,215,0,0.3) 1px, transparent 0)`,
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        {/* Ambient glow effects */}
        <div className="fixed top-0 left-1/4 w-96 h-96 bg-auto-yellow/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-bengaluru-purple/5 rounded-full blur-[100px] pointer-events-none" />

        {/* Noise overlay */}
        <div className="noise-overlay" />

        {/* Content */}
        <div className="relative z-10">
          <Header />

          <div className="max-w-6xl mx-auto px-4 pb-20 md:pb-24">
            {/* Hero section */}
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 30 }}
              transition={{ duration: 0.6 }}
              className="text-center py-6 md:py-10"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="inline-block mb-4"
              >
                <span className="px-4 py-2 rounded-full bg-auto-yellow/10 border border-auto-yellow/20 text-auto-yellow text-xs md:text-sm font-medium font-modern">
                  🛺 Bengaluru Auto Survival Kit
                </span>
              </motion.div>
              
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-luxury text-white mb-3 md:mb-4 px-4">
                {t("neverScammed")} <span className="gradient-text">✨</span>
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto text-sm md:text-lg px-4 font-modern">
                AI-powered fare calculator, local Kannada phrases, and real-time negotiation 
                assistance. Your ultimate weapon against overcharging auto drivers.
              </p>
            </motion.section>

            {/* Main grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              {/* Left column */}
              <div className="space-y-4 md:space-y-6">
                <FareCalculator />
                <Chatbot />
                <PanicButton />
              </div>

              {/* Right column */}
              <div className="space-y-4 md:space-y-6">
                <KannadaPhrases />
              </div>
            </div>

            {/* Reddit Posts - Full width before Area Tips */}
            <div className="mt-4 md:mt-6">
              <RedditPosts />
            </div>

            {/* Area Tips - Full width */}
            <div className="mt-4 md:mt-6">
              <AreaTips />
            </div>

            {/* Tips section */}
            <motion.section
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mt-6 md:mt-10"
            >
              <div className="glass-dark rounded-2xl md:rounded-3xl p-4 md:p-6">
                <h3 className="font-luxury text-xl md:text-2xl gradient-text mb-4">
                  {t("proTips")}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                  <TipCard
                    emoji="🚶"
                    title="Walk Away Power"
                    description="The moment you start walking away, prices drop. Works 90% of the time."
                  />
                  <TipCard
                    emoji="📱"
                    title="Show Google Maps"
                    description="Open Maps and show the route. Drivers can't claim 'long route' anymore."
                  />
                  <TipCard
                    emoji="💬"
                    title="Speak Kannada"
                    description="Even basic phrases signal you're not a tourist. Instant respect."
                  />
                </div>
              </div>
            </motion.section>

            {/* Footer */}
            <footer className="mt-10 md:mt-12 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-2xl">🛺</span>
                <span className="font-luxury text-lg gradient-text">Nimma Yatri</span>
              </div>
              <p className="text-gray-500 text-xs md:text-sm font-modern">
                Built with ❤️ for Bengaluru commuters
              </p>
              <p className="text-gray-600 text-xs mt-1 font-modern">
                Powered by Gemini AI • Made for Kiro Week 5 Challenge
              </p>
            </footer>
          </div>
        </div>
      </main>
    </LoadScript>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a15] gap-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
        className="w-12 h-12 md:w-16 md:h-16 border-3 md:border-4 border-auto-yellow/20 border-t-auto-yellow rounded-full"
      />
      <motion.p
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="text-gray-400 text-sm font-modern"
      >
        Loading Nimma Yatri...
      </motion.p>
    </div>
  );
}

function TipCard({
  emoji,
  title,
  description,
}: {
  emoji: string;
  title: string;
  description: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      className="glass-card rounded-xl p-4"
    >
      <span className="text-2xl md:text-3xl mb-3 block">{emoji}</span>
      <h4 className="font-bold text-white mb-1 text-sm md:text-base font-modern">{title}</h4>
      <p className="text-gray-400 text-xs md:text-sm font-modern">{description}</p>
    </motion.div>
  );
}
