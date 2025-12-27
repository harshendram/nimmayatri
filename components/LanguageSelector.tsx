"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, ChevronDown, Check } from "lucide-react";
import { useLanguage, supportedLanguages, Language } from "@/context/LanguageContext";

export default function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const currentLang = supportedLanguages.find((l) => l.code === language);

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 glass-card rounded-xl text-white hover:bg-white/10 transition-all"
      >
        <Globe className="w-4 h-4 md:w-5 md:h-5 text-auto-yellow" />
        <span className="text-sm md:text-base font-medium hidden sm:inline">
          {currentLang?.nativeName}
        </span>
        <span className="text-sm md:text-base font-medium sm:hidden">
          {currentLang?.code.toUpperCase()}
        </span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-56 glass-dark rounded-xl overflow-hidden z-50 shadow-2xl"
            >
              <div className="p-2 border-b border-white/10">
                <p className="text-xs text-gray-400 px-2">{t("selectLanguage")}</p>
              </div>
              <div className="max-h-80 overflow-y-auto p-2">
                {supportedLanguages.map((lang) => (
                  <motion.button
                    key={lang.code}
                    whileHover={{ x: 4 }}
                    onClick={() => {
                      setLanguage(lang.code as Language);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-colors ${
                      language === lang.code
                        ? "bg-auto-yellow/20 text-auto-yellow"
                        : "text-white hover:bg-white/5"
                    }`}
                  >
                    <div>
                      <p className="font-medium">{lang.nativeName}</p>
                      <p className="text-xs text-gray-400">{lang.name}</p>
                    </div>
                    {language === lang.code && (
                      <Check className="w-4 h-4 text-auto-yellow" />
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
