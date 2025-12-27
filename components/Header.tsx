"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import LanguageSelector from "./LanguageSelector";

export default function Header() {
  const { t } = useLanguage();

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative z-20 py-4 md:py-6 px-4"
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3 md:gap-4">
          <motion.div
            whileHover={{ rotate: [0, -5, 5, 0], scale: 1.05 }}
            transition={{ duration: 0.4 }}
            className="relative w-12 h-12 md:w-16 md:h-16"
          >
            <Image
              src="/assets/autorickshawsleek.png"
              alt="Nimma Yatri Logo"
              fill
              className="object-contain"
              style={{ 
                filter: 'drop-shadow(0 0 10px rgba(255,215,0,0.5)) brightness(1.1) contrast(1.1)',
                mixBlendMode: 'screen',
                background: 'transparent'
              }}
              priority
            />
          </motion.div>
          <div>
            <h1 className="font-luxury text-2xl md:text-4xl gradient-text tracking-wide">
              {t("appTitle")}
            </h1>
            <p className="text-gray-400 text-xs md:text-sm font-modern">{t("tagline")}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="hidden md:flex items-center gap-2 glass-card px-4 py-2 rounded-full"
          >
            <span className="w-2 h-2 bg-signal-green rounded-full status-pulse" />
            <span className="text-sm text-gray-300 font-modern">Bengaluru</span>
          </motion.div>
          <LanguageSelector />
        </div>
      </div>
    </motion.header>
  );
}
