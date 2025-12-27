"use client";

import { motion } from "framer-motion";
import { MapPin, AlertCircle, Lightbulb } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { areaTips } from "@/lib/productData";

export default function AreaTips() {
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-dark rounded-2xl md:rounded-3xl p-4 md:p-6"
    >
      <div className="flex items-center gap-3 mb-5 md:mb-6">
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-signal-green/30 to-signal-green/10 flex items-center justify-center">
          <MapPin className="w-5 h-5 md:w-6 md:h-6 text-signal-green" />
        </div>
        <div>
          <h2 className="font-luxury text-xl md:text-2xl gradient-text">{t("areaIntel")}</h2>
          <p className="text-xs text-gray-500 font-modern">Know before you go</p>
        </div>
      </div>

      <div className="space-y-2 md:space-y-3">
        {areaTips.map((tip, index) => (
          <motion.div
            key={tip.area}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 * index }}
            whileHover={{ x: 4 }}
            className="glass-card rounded-xl p-3 md:p-4 hover:bg-white/5 transition-all cursor-default"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-auto-yellow/10 flex items-center justify-center flex-shrink-0">
                <span className="text-xl md:text-2xl">{tip.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-white text-sm md:text-base mb-1.5 font-modern">{tip.area}</h3>
                <div className="flex items-start gap-2 mb-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-signal-red flex-shrink-0 mt-0.5" />
                  <p className="text-xs md:text-sm text-gray-400 font-modern">{tip.driverBehavior}</p>
                </div>
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-3.5 h-3.5 text-signal-green flex-shrink-0 mt-0.5" />
                  <p className="text-xs md:text-sm text-signal-green font-modern">{tip.strategy}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
