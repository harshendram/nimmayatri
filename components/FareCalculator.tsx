"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, MapPin, Navigation, Zap, CloudRain, Moon, AlertTriangle, CheckCircle, Locate, Loader2, Clock, Route, IndianRupee, Gauge, ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface PlaceResult {
  description: string;
  place_id: string;
}

// Fare calculation logic
const fareRules = {
  baseFare: 30,
  baseDistance: 2,
  perKmRate: 15,
  nightMultiplier: 1.5,
  rainSurgeMultiplier: 1.3,
  wonAndHalfMultiplier: 1.5,
  nightStartHour: 22,
  nightEndHour: 5,
};

function calculateFareFromDistance(
  distanceKm: number,
  options: { isNight?: boolean; isRain?: boolean; isWonAndHalf?: boolean }
): { baseFare: number; finalFare: number; breakdown: string[] } {
  const { isNight = false, isRain = false, isWonAndHalf = false } = options;
  const breakdown: string[] = [];

  let fare: number;
  if (distanceKm <= fareRules.baseDistance) {
    fare = fareRules.baseFare;
    breakdown.push(`Base fare (0-${fareRules.baseDistance}km): ₹${fareRules.baseFare}`);
  } else {
    const extraKm = distanceKm - fareRules.baseDistance;
    const extraFare = extraKm * fareRules.perKmRate;
    fare = fareRules.baseFare + extraFare;
    breakdown.push(`Base fare: ₹${fareRules.baseFare}`);
    breakdown.push(`Extra ${extraKm.toFixed(1)}km × ₹${fareRules.perKmRate} = ₹${extraFare.toFixed(0)}`);
  }

  const baseFare = fare;

  if (isNight) {
    fare *= fareRules.nightMultiplier;
    breakdown.push(`Night rate (×${fareRules.nightMultiplier}): ₹${fare.toFixed(0)}`);
  }

  if (isWonAndHalf) {
    fare *= fareRules.wonAndHalfMultiplier;
    breakdown.push(`Won-and-half (×${fareRules.wonAndHalfMultiplier}): ₹${fare.toFixed(0)}`);
  }

  if (isRain) {
    fare *= fareRules.rainSurgeMultiplier;
    breakdown.push(`Rain surge (×${fareRules.rainSurgeMultiplier}): ₹${fare.toFixed(0)}`);
  }

  return {
    baseFare: Math.round(baseFare),
    finalFare: Math.round(fare),
    breakdown,
  };
}

function isNightTime(): boolean {
  const hour = new Date().getHours();
  return hour >= fareRules.nightStartHour || hour < fareRules.nightEndHour;
}

// Auto rickshaw SVG component
function AutoRickshaw({ className = "", style = {} }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M52 40H12c-2 0-4-2-4-4v-8c0-2 2-4 4-4h8l4-8h16l4 8h8c2 0 4 2 4 4v8c0 2-2 4-4 4z" fill="#FFD700"/>
      <path d="M16 44a4 4 0 100-8 4 4 0 000 8zM48 44a4 4 0 100-8 4 4 0 000 8z" fill="#333"/>
      <path d="M16 42a2 2 0 100-4 2 2 0 000 4zM48 42a2 2 0 100-4 2 2 0 000 4z" fill="#666"/>
      <path d="M20 28h24v8H20z" fill="#333" opacity="0.3"/>
      <path d="M24 20h16l2 4H22z" fill="#FFD700"/>
      <circle cx="32" cy="32" r="2" fill="#FFD700"/>
    </svg>
  );
}

export default function FareCalculator() {
  const { t } = useLanguage();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [fromSuggestions, setFromSuggestions] = useState<PlaceResult[]>([]);
  const [toSuggestions, setToSuggestions] = useState<PlaceResult[]>([]);
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);
  const [duration, setDuration] = useState<string | null>(null);
  const [isWonAndHalf, setIsWonAndHalf] = useState(false);
  const [isRain, setIsRain] = useState(false);
  const [isNight, setIsNight] = useState(isNightTime());
  const [isCalculating, setIsCalculating] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [fareResult, setFareResult] = useState<{
    baseFare: number;
    finalFare: number;
    breakdown: string[];
  } | null>(null);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [mapsError, setMapsError] = useState<string | null>(null);
  const [showRouteView, setShowRouteView] = useState(false);
  const [driverQuote, setDriverQuote] = useState<string>("");

  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const distanceService = useRef<google.maps.DistanceMatrixService | null>(null);
  const geocoder = useRef<google.maps.Geocoder | null>(null);

  // Initialize Google Maps services
  useEffect(() => {
    const initMaps = () => {
      if (typeof window !== "undefined" && window.google?.maps?.places) {
        try {
          autocompleteService.current = new google.maps.places.AutocompleteService();
          distanceService.current = new google.maps.DistanceMatrixService();
          geocoder.current = new google.maps.Geocoder();
          setMapsLoaded(true);
          setMapsError(null);
        } catch (error) {
          console.error("Failed to initialize Google Maps:", error);
          setMapsError("Failed to load Google Maps");
        }
      }
    };
    
    initMaps();
    const interval = setInterval(() => {
      if (!mapsLoaded) initMaps();
    }, 1000);
    
    const timeout = setTimeout(() => {
      if (!mapsLoaded) {
        setMapsError("Google Maps took too long to load. Using manual entry.");
      }
    }, 10000);
    
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [mapsLoaded]);

  const searchPlaces = useCallback((input: string, setSuggestions: (s: PlaceResult[]) => void) => {
    if (!autocompleteService.current || input.length < 2) {
      setSuggestions([]);
      return;
    }

    autocompleteService.current.getPlacePredictions(
      {
        input,
        componentRestrictions: { country: "in" },
        locationBias: {
          center: { lat: 12.9716, lng: 77.5946 },
          radius: 100000,
        },
      },
      (predictions, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
          setSuggestions(predictions.map((p) => ({
            description: p.description,
            place_id: p.place_id,
          })));
        } else {
          setSuggestions([]);
        }
      }
    );
  }, []);

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        if (geocoder.current) {
          geocoder.current.geocode(
            { location: { lat: latitude, lng: longitude } },
            (results, status) => {
              if (status === "OK" && results && results.length > 0) {
                let bestAddress = "";
                
                for (const result of results) {
                  const locality = result.address_components?.find(
                    c => c.types.includes("sublocality_level_1") || 
                         c.types.includes("locality") ||
                         c.types.includes("neighborhood")
                  );
                  
                  if (locality) {
                    const city = result.address_components?.find(
                      c => c.types.includes("locality") || c.types.includes("administrative_area_level_2")
                    );
                    bestAddress = city && city.long_name !== locality.long_name
                      ? `${locality.long_name}, ${city.long_name}`
                      : locality.long_name;
                    break;
                  }
                }
                
                if (!bestAddress && results[0]) {
                  const formatted = results[0].formatted_address;
                  bestAddress = formatted
                    .replace(/,?\s*\d{6}/, '')
                    .replace(/,?\s*India$/, '')
                    .trim();
                }
                
                setFrom(bestAddress || "Current Location");
              } else {
                const nearestArea = findNearestArea(latitude, longitude);
                setFrom(nearestArea);
              }
              setIsGettingLocation(false);
            }
          );
        } else {
          const nearestArea = findNearestArea(latitude, longitude);
          setFrom(nearestArea);
          setIsGettingLocation(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Unable to get your location. Please enter manually.");
        setIsGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const findNearestArea = (lat: number, lng: number): string => {
    const areas: Record<string, [number, number]> = {
      "Majestic, Bengaluru": [12.9767, 77.5713],
      "Indiranagar, Bengaluru": [12.9784, 77.6408],
      "Koramangala, Bengaluru": [12.9352, 77.6245],
      "Whitefield, Bengaluru": [12.9698, 77.7500],
      "Electronic City, Bengaluru": [12.8399, 77.6770],
      "MG Road, Bengaluru": [12.9756, 77.6066],
      "Silk Board, Bengaluru": [12.9177, 77.6238],
      "Jayanagar, Bengaluru": [12.9308, 77.5838],
      "BTM Layout, Bengaluru": [12.9166, 77.6101],
      "HSR Layout, Bengaluru": [12.9116, 77.6389],
      "Marathahalli, Bengaluru": [12.9591, 77.7010],
      "Hebbal, Bengaluru": [13.0358, 77.5970],
      "Yelahanka, Bengaluru": [13.1007, 77.5963],
      "JP Nagar, Bengaluru": [12.9063, 77.5857],
      "Banashankari, Bengaluru": [12.9255, 77.5468],
      "Rajajinagar, Bengaluru": [12.9910, 77.5525],
      "Malleshwaram, Bengaluru": [13.0035, 77.5647],
    };

    let nearestArea = "Bengaluru";
    let minDistance = Infinity;

    for (const [area, [areaLat, areaLng]] of Object.entries(areas)) {
      const dist = Math.sqrt(Math.pow(lat - areaLat, 2) + Math.pow(lng - areaLng, 2));
      if (dist < minDistance) {
        minDistance = dist;
        nearestArea = area;
      }
    }

    return `Near ${nearestArea}`;
  };

  const handleCalculate = useCallback(async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!from || !to) {
      alert("Please enter both pickup and drop locations");
      return;
    }

    setIsCalculating(true);
    setFareResult(null);
    setShowRouteView(false);

    if (distanceService.current && mapsLoaded) {
      distanceService.current.getDistanceMatrix(
        {
          origins: [from],
          destinations: [to],
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (response, status) => {
          if (status === "OK" && response) {
            const element = response.rows[0]?.elements[0];
            if (element?.status === "OK" && element.distance) {
              const distanceKm = element.distance.value / 1000;
              setDistance(distanceKm);
              setDuration(element.duration?.text || null);
              const fare = calculateFareFromDistance(distanceKm, { isNight, isRain, isWonAndHalf });
              setFareResult(fare);
              setShowRouteView(true);
              setIsCalculating(false);
            } else if (element?.status === "ZERO_RESULTS" || element?.status === "NOT_FOUND") {
              fallbackToBackend();
            } else {
              alert("Could not calculate distance. Please check the addresses and try again.");
              setIsCalculating(false);
            }
          } else {
            fallbackToBackend();
          }
        }
      );
    } else {
      fallbackToBackend();
    }

    async function fallbackToBackend() {
      try {
        const response = await fetch("/api/fare", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ from, to, isNight, isRain, isWonAndHalf }),
        });
        
        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        setDistance(data.distance);
        setDuration(data.duration);
        setFareResult({
          baseFare: data.baseFare,
          finalFare: data.finalFare,
          breakdown: data.breakdown,
        });
        setShowRouteView(true);
      } catch (error) {
        console.error("Fare calculation error:", error);
        alert("Could not calculate distance for these locations. Please try different addresses or check spelling.");
      } finally {
        setIsCalculating(false);
      }
    }
  }, [from, to, isNight, isRain, isWonAndHalf, mapsLoaded]);

  // Recalculate fare when options change (if we already have a distance)
  useEffect(() => {
    if (distance !== null) {
      const fare = calculateFareFromDistance(distance, { isNight, isRain, isWonAndHalf });
      setFareResult(fare);
    }
  }, [distance, isNight, isRain, isWonAndHalf]);

  const getFareStatus = () => {
    if (!fareResult || !distance) return null;
    const pricePerKm = fareResult.finalFare / distance;
    if (pricePerKm <= 20) return "fair";
    if (pricePerKm <= 30) return "moderate";
    return "scam";
  };

  const status = getFareStatus();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass-dark rounded-2xl md:rounded-3xl p-4 md:p-6 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-auto-yellow/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-signal-green/5 rounded-full blur-2xl" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-5 md:mb-6">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-auto-yellow/30 to-auto-yellow/10 flex items-center justify-center">
            <Calculator className="w-5 h-5 md:w-6 md:h-6 text-auto-yellow" />
          </div>
          <div>
            <h2 className="font-luxury text-xl md:text-2xl gradient-text">{t("calculator")}</h2>
            <p className="text-xs text-gray-500 font-modern">
              {mapsLoaded ? "Google Maps connected ✓" : mapsError || "Connecting to Maps..."}
            </p>
          </div>
        </div>

        {/* Route Visualization - Shows after calculation */}
        <AnimatePresence>
          {showRouteView && fareResult && distance && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-5 md:mb-6"
            >
              {/* Map-like visualization */}
              <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl p-4 md:p-5 border border-white/10 overflow-hidden">
                {/* Grid pattern background */}
                <div className="absolute inset-0 opacity-10">
                  <div className="w-full h-full" style={{
                    backgroundImage: `
                      linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                    `,
                    backgroundSize: '20px 20px'
                  }} />
                </div>

                {/* Animated autos around the map */}
                <div className="absolute inset-0 pointer-events-none">
                  <motion.div
                    animate={{ x: [0, 30, 10, 40, 0], y: [0, -10, 20, 5, 0] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="absolute top-4 left-8"
                  >
                    <AutoRickshaw className="w-8 h-8 opacity-40" style={{ transform: 'rotate(45deg)' }} />
                  </motion.div>
                  <motion.div
                    animate={{ x: [0, -20, 10, -30, 0], y: [0, 15, -5, 10, 0] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute top-12 right-12"
                  >
                    <AutoRickshaw className="w-7 h-7 opacity-30" style={{ transform: 'rotate(-30deg)' }} />
                  </motion.div>
                  <motion.div
                    animate={{ x: [0, 15, -15, 25, 0], y: [0, -20, 10, -15, 0] }}
                    transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-16 left-16"
                  >
                    <AutoRickshaw className="w-6 h-6 opacity-35" style={{ transform: 'rotate(15deg)' }} />
                  </motion.div>
                  <motion.div
                    animate={{ x: [0, -25, 5, -10, 0], y: [0, 10, -10, 20, 0] }}
                    transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-8 right-8"
                  >
                    <AutoRickshaw className="w-7 h-7 opacity-25" style={{ transform: 'rotate(60deg)' }} />
                  </motion.div>
                </div>

                {/* Route visualization */}
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 py-4">
                  {/* Pickup point */}
                  <div className="flex flex-col items-center text-center flex-1">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring" }}
                      className="relative"
                    >
                      <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-signal-green/20 flex items-center justify-center border-2 border-signal-green shadow-lg shadow-signal-green/20">
                        <MapPin className="w-7 h-7 md:w-8 md:h-8 text-signal-green" />
                      </div>
                      <motion.div
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 rounded-full border-2 border-signal-green/50"
                      />
                    </motion.div>
                    <p className="mt-2 text-xs md:text-sm text-signal-green font-medium font-modern">PICKUP</p>
                    <p className="text-xs text-gray-400 font-modern max-w-[120px] truncate">{from}</p>
                  </div>

                  {/* Route line with auto */}
                  <div className="flex-1 relative py-4 md:py-0">
                    <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-signal-green via-auto-yellow to-signal-red rounded-full opacity-50" />
                    <div className="md:hidden absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-signal-green via-auto-yellow to-signal-red rounded-full opacity-50" />
                    
                    {/* Animated dotted line */}
                    <motion.div
                      className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2"
                      style={{
                        backgroundImage: 'repeating-linear-gradient(90deg, #FFD700, #FFD700 8px, transparent 8px, transparent 16px)',
                      }}
                      animate={{ backgroundPosition: ['0px', '32px'] }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    
                    {/* Moving auto on route */}
                    <motion.div
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
                      animate={{ 
                        x: [-30, 30, -30],
                      }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <div className="bg-asphalt p-2 rounded-full border-2 border-auto-yellow shadow-lg shadow-auto-yellow/30">
                        <AutoRickshaw className="w-8 h-8 md:w-10 md:h-10" />
                      </div>
                    </motion.div>

                    {/* Distance badge */}
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-asphalt/90 px-3 py-1.5 rounded-full border border-white/20">
                      <Route className="w-3 h-3 text-auto-yellow" />
                      <span className="text-xs font-bold text-white font-modern">{distance.toFixed(1)} km</span>
                    </div>
                  </div>

                  {/* Drop point */}
                  <div className="flex flex-col items-center text-center flex-1">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4, type: "spring" }}
                      className="relative"
                    >
                      <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-signal-red/20 flex items-center justify-center border-2 border-signal-red shadow-lg shadow-signal-red/20">
                        <Navigation className="w-7 h-7 md:w-8 md:h-8 text-signal-red" />
                      </div>
                      <motion.div
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                        className="absolute inset-0 rounded-full border-2 border-signal-red/50"
                      />
                    </motion.div>
                    <p className="mt-2 text-xs md:text-sm text-signal-red font-medium font-modern">DROP</p>
                    <p className="text-xs text-gray-400 font-modern max-w-[120px] truncate">{to}</p>
                  </div>
                </div>

                {/* Trip stats */}
                <div className="relative z-10 mt-8 grid grid-cols-3 gap-3">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white/5 rounded-xl p-3 text-center border border-white/10"
                  >
                    <Route className="w-5 h-5 text-auto-yellow mx-auto mb-1" />
                    <p className="text-lg font-bold text-white font-modern">{distance.toFixed(1)}</p>
                    <p className="text-xs text-gray-500">km</p>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white/5 rounded-xl p-3 text-center border border-white/10"
                  >
                    <Clock className="w-5 h-5 text-signal-green mx-auto mb-1" />
                    <p className="text-lg font-bold text-white font-modern">{duration || "~" + Math.ceil(distance * 3)}</p>
                    <p className="text-xs text-gray-500">{duration ? "" : "mins"}</p>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className={`rounded-xl p-3 text-center border ${
                      status === "fair" ? "bg-signal-green/10 border-signal-green/30" :
                      status === "moderate" ? "bg-auto-yellow/10 border-auto-yellow/30" :
                      "bg-signal-red/10 border-signal-red/30"
                    }`}
                  >
                    <IndianRupee className={`w-5 h-5 mx-auto mb-1 ${
                      status === "fair" ? "text-signal-green" :
                      status === "moderate" ? "text-auto-yellow" :
                      "text-signal-red"
                    }`} />
                    <p className="text-lg font-bold text-white font-modern">₹{fareResult.finalFare}</p>
                    <p className="text-xs text-gray-500">Fair Fare</p>
                  </motion.div>
                </div>
              </div>

              {/* Scam Meter - Professional Speedometer Style */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-4 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 md:p-8 border border-white/10"
              >
                <div className="flex items-center justify-center gap-2 mb-6">
                  <Gauge className="w-5 h-5 text-auto-yellow" />
                  <h3 className="text-white font-semibold text-lg font-modern">Scam-O-Meter™</h3>
                </div>

                {/* Speedometer Gauge */}
                <div className="relative flex justify-center mb-8">
                  <div className="relative w-full max-w-sm mx-auto" style={{ height: '200px' }}>
                    {/* Outer glow effect */}
                    <div className="absolute inset-0 rounded-t-full bg-gradient-to-b from-white/5 to-transparent blur-xl" />
                    
                    {/* Main gauge SVG */}
                    <svg viewBox="0 0 240 140" className="w-full h-full" style={{ overflow: 'visible' }}>
                      <defs>
                        {/* Gradient definitions */}
                        <linearGradient id="greenGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.8" />
                          <stop offset="100%" stopColor="#22c55e" stopOpacity="1" />
                        </linearGradient>
                        <linearGradient id="yellowGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#FFD700" stopOpacity="0.8" />
                          <stop offset="100%" stopColor="#FFD700" stopOpacity="1" />
                        </linearGradient>
                        <linearGradient id="redGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                          <stop offset="100%" stopColor="#ef4444" stopOpacity="1" />
                        </linearGradient>
                        
                        {/* Shadow filter */}
                        <filter id="glow">
                          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                          <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                          </feMerge>
                        </filter>
                      </defs>
                      
                      {/* Background arc track */}
                      <path
                        d="M 30 120 A 90 90 0 0 1 210 120"
                        fill="none"
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth="20"
                        strokeLinecap="round"
                      />
                      
                      {/* Colored segments with proper spacing */}
                      {/* Green segment (0-60 degrees = Fair) */}
                      <path
                        d="M 30 120 A 90 90 0 0 1 90 40"
                        fill="none"
                        stroke="url(#greenGlow)"
                        strokeWidth="18"
                        strokeLinecap="round"
                        filter="url(#glow)"
                      />
                      
                      {/* Yellow segment (60-120 degrees = Negotiate) */}
                      <path
                        d="M 90 40 A 90 90 0 0 1 150 40"
                        fill="none"
                        stroke="url(#yellowGlow)"
                        strokeWidth="18"
                        strokeLinecap="round"
                        filter="url(#glow)"
                      />
                      
                      {/* Red segment (120-180 degrees = Scam) */}
                      <path
                        d="M 150 40 A 90 90 0 0 1 210 120"
                        fill="none"
                        stroke="url(#redGlow)"
                        strokeWidth="18"
                        strokeLinecap="round"
                        filter="url(#glow)"
                      />
                      
                      {/* Major tick marks with labels */}
                      {[
                        { angle: 0, label: '0', isMajor: true },
                        { angle: 30, label: '', isMajor: false },
                        { angle: 60, label: '₹20/km', isMajor: true },
                        { angle: 90, label: '', isMajor: false },
                        { angle: 120, label: '₹30/km', isMajor: true },
                        { angle: 150, label: '', isMajor: false },
                        { angle: 180, label: '₹40+/km', isMajor: true }
                      ].map(({ angle, label, isMajor }, i) => {
                        const rad = (angle * Math.PI) / 180;
                        const innerRadius = isMajor ? 72 : 78;
                        const outerRadius = isMajor ? 88 : 85;
                        const x1 = 120 + innerRadius * Math.cos(Math.PI - rad);
                        const y1 = 120 - innerRadius * Math.sin(Math.PI - rad);
                        const x2 = 120 + outerRadius * Math.cos(Math.PI - rad);
                        const y2 = 120 - outerRadius * Math.sin(Math.PI - rad);
                        
                        // Label position
                        const labelRadius = 105;
                        const labelX = 120 + labelRadius * Math.cos(Math.PI - rad);
                        const labelY = 120 - labelRadius * Math.sin(Math.PI - rad);
                        
                        return (
                          <g key={i}>
                            <line
                              x1={x1}
                              y1={y1}
                              x2={x2}
                              y2={y2}
                              stroke="white"
                              strokeWidth={isMajor ? "3" : "2"}
                              strokeLinecap="round"
                              opacity={isMajor ? "0.9" : "0.4"}
                            />
                            {label && (
                              <text
                                x={labelX}
                                y={labelY}
                                fill="white"
                                fontSize="9"
                                fontWeight="600"
                                textAnchor="middle"
                                dominantBaseline="middle"
                                opacity="0.8"
                                fontFamily="system-ui"
                              >
                                {label}
                              </text>
                            )}
                          </g>
                        );
                      })}
                      
                      {/* Center hub with depth */}
                      <circle cx="120" cy="120" r="16" fill="#0f172a" opacity="0.8" />
                      <circle cx="120" cy="120" r="14" fill="#1e293b" stroke="#FFD700" strokeWidth="2.5" />
                      <circle cx="120" cy="120" r="8" fill="#FFD700" opacity="0.9" />
                      <circle cx="120" cy="120" r="4" fill="#fbbf24" />
                    </svg>
                    
                    {/* Animated Needle - positioned absolutely */}
                    <motion.div
                      className="absolute left-1/2 origin-bottom pointer-events-none"
                      initial={{ rotate: -90 }}
                      animate={{ 
                        rotate: status === "fair" ? -70 : status === "moderate" ? 0 : 70
                      }}
                      transition={{ type: "spring", damping: 15, stiffness: 80, delay: 0.6 }}
                      style={{ 
                        width: '5px',
                        height: '85px',
                        bottom: '20px',
                        marginLeft: '-2.5px',
                        transformOrigin: 'bottom center'
                      }}
                    >
                      {/* Needle with gradient */}
                      <div className="relative w-full h-full">
                        <div className="absolute inset-0 bg-gradient-to-t from-white via-gray-200 to-red-500 rounded-full shadow-lg" 
                             style={{ 
                               boxShadow: '0 0 10px rgba(255,255,255,0.5), 0 0 20px rgba(255,255,255,0.3)' 
                             }} 
                        />
                        {/* Needle tip */}
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-red-500 rounded-full shadow-lg" />
                        {/* Needle base */}
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rounded-full shadow-lg border-2 border-gray-300" />
                      </div>
                    </motion.div>
                    
                    {/* Center value display - positioned below gauge */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center" style={{ bottom: '-10px' }}>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.8, type: "spring" }}
                        className="flex flex-col items-center"
                      >
                        <div className={`text-3xl md:text-4xl font-bold font-modern ${
                          status === "fair" ? "text-signal-green" :
                          status === "moderate" ? "text-auto-yellow" :
                          "text-signal-red"
                        }`}>
                          ₹{fareResult.finalFare}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {distance && `₹${(fareResult.finalFare / distance).toFixed(1)}/km`}
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>

                {/* Status labels below gauge with better spacing */}
                <div className="flex justify-between items-start px-4 md:px-8 mt-4">
                  <div className="flex flex-col items-center text-signal-green flex-1">
                    <ShieldCheck className="w-6 h-6 mb-1" />
                    <span className="text-xs font-bold">FAIR</span>
                    <span className="text-[10px] text-gray-500 mt-0.5">≤₹20/km</span>
                  </div>
                  <div className="flex flex-col items-center text-auto-yellow flex-1">
                    <ShieldAlert className="w-6 h-6 mb-1" />
                    <span className="text-xs font-bold">NEGOTIATE</span>
                    <span className="text-[10px] text-gray-500 mt-0.5">₹20-30/km</span>
                  </div>
                  <div className="flex flex-col items-center text-signal-red flex-1">
                    <ShieldX className="w-6 h-6 mb-1" />
                    <span className="text-xs font-bold">SCAM!</span>
                    <span className="text-[10px] text-gray-500 mt-0.5">&gt;₹30/km</span>
                  </div>
                </div>

                {/* Status badge */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="mt-4 text-center"
                >
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                    status === "fair" ? "bg-signal-green/20 text-signal-green border border-signal-green/30" :
                    status === "moderate" ? "bg-auto-yellow/20 text-auto-yellow border border-auto-yellow/30" :
                    "bg-signal-red/20 text-signal-red border border-signal-red/30 animate-pulse"
                  }`}>
                    {status === "fair" && <ShieldCheck className="w-5 h-5" />}
                    {status === "moderate" && <ShieldAlert className="w-5 h-5" />}
                    {status === "scam" && <ShieldX className="w-5 h-5" />}
                    <span className="font-bold text-sm md:text-base font-modern">
                      {status === "fair" && "✅ LEGIT FARE"}
                      {status === "moderate" && "⚠️ NEGOTIATE DOWN"}
                      {status === "scam" && "🚨 SCAM ALERT!"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 font-modern">
                    {status === "fair" && "This price is fair for the distance. Accept it!"}
                    {status === "moderate" && `Try negotiating down to ₹${fareResult.baseFare}-${fareResult.finalFare - 20}`}
                    {status === "scam" && `Walk away! Fair price is around ₹${fareResult.baseFare}`}
                  </p>
                </motion.div>

                {/* Driver Quote Comparison */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10"
                >
                  <p className="text-xs text-gray-400 mb-2 font-modern">Driver asking more? Enter their quote:</p>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                      <input
                        type="number"
                        value={driverQuote}
                        onChange={(e) => setDriverQuote(e.target.value)}
                        placeholder="e.g., 250"
                        className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-8 pr-3 text-white placeholder-gray-500 focus:border-auto-yellow/50 transition-all font-modern text-sm"
                      />
                    </div>
                    {driverQuote && parseInt(driverQuote) > fareResult.finalFare && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex items-center gap-1 px-3 py-2 bg-signal-red/20 border border-signal-red/30 rounded-lg"
                      >
                        <span className="text-signal-red font-bold text-sm font-modern">
                          🚨 +₹{parseInt(driverQuote) - fareResult.finalFare} overcharge!
                        </span>
                      </motion.div>
                    )}
                    {driverQuote && parseInt(driverQuote) <= fareResult.finalFare && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex items-center gap-1 px-3 py-2 bg-signal-green/20 border border-signal-green/30 rounded-lg"
                      >
                        <span className="text-signal-green font-bold text-sm font-modern">
                          ✅ Good deal!
                        </span>
                      </motion.div>
                    )}
                  </div>
                  {driverQuote && parseInt(driverQuote) > fareResult.finalFare && (
                    <p className="text-xs text-signal-red mt-2 font-modern">
                      💡 Say: "Meter mele hogli, ₹{fareResult.finalFare} kodteeni" (I'll pay meter rate, ₹{fareResult.finalFare})
                    </p>
                  )}
                </motion.div>
              </motion.div>

              {/* Fare status alert */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className={`mt-4 flex items-center gap-3 p-4 rounded-xl ${
                  status === "fair" ? "bg-signal-green/10 border border-signal-green/30" :
                  status === "moderate" ? "bg-auto-yellow/10 border border-auto-yellow/30" :
                  "bg-signal-red/10 border border-signal-red/30"
                }`}
              >
                {status === "scam" ? (
                  <AlertTriangle className="w-6 h-6 text-signal-red flex-shrink-0" />
                ) : (
                  <CheckCircle className={`w-6 h-6 flex-shrink-0 ${status === "fair" ? "text-signal-green" : "text-auto-yellow"}`} />
                )}
                <div>
                  <span className={`font-bold text-sm md:text-base font-modern ${
                    status === "fair" ? "text-signal-green" :
                    status === "moderate" ? "text-auto-yellow" :
                    "text-signal-red"
                  }`}>
                    {status === "fair" && "✅ Fair Price! Go for it!"}
                    {status === "moderate" && "⚠️ Slightly high. Try negotiating!"}
                    {status === "scam" && "🚨 SCAM ALERT! Don't pay more than ₹" + fareResult.finalFare}
                  </span>
                  <p className="text-xs text-gray-400 mt-1 font-modern">
                    {fareResult.breakdown[fareResult.breakdown.length - 1]}
                  </p>
                </div>
              </motion.div>

              {/* Nearby autos indicator */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mt-4 flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10"
              >
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    <AutoRickshaw className="w-8 h-8" />
                    <AutoRickshaw className="w-8 h-8 opacity-70" />
                    <AutoRickshaw className="w-8 h-8 opacity-40" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white font-modern">Autos nearby</p>
                    <p className="text-xs text-gray-500">3-5 autos within 2 min</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-signal-green">
                  <span className="w-2 h-2 bg-signal-green rounded-full animate-pulse" />
                  <span className="text-xs font-medium">Available</span>
                </div>
              </motion.div>

              {/* Fare breakdown accordion */}
              <motion.details
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-4 bg-white/5 rounded-xl border border-white/10 overflow-hidden"
              >
                <summary className="p-3 text-sm text-gray-400 cursor-pointer hover:bg-white/5 transition-colors font-modern">
                  📊 View fare breakdown
                </summary>
                <div className="p-3 pt-0 space-y-1 border-t border-white/10">
                  {fareResult.breakdown.map((line, i) => (
                    <p key={i} className="text-xs text-gray-400 font-modern">{line}</p>
                  ))}
                </div>
              </motion.details>

              {/* Reset button */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                onClick={() => {
                  setShowRouteView(false);
                  setFareResult(null);
                  setDistance(null);
                  setDuration(null);
                  setDriverQuote("");
                }}
                className="mt-4 w-full py-2 text-sm text-gray-400 hover:text-white transition-colors font-modern"
              >
                ← Calculate new route
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input form - Hidden when route view is shown */}
        <AnimatePresence>
          {!showRouteView && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="space-y-3 md:space-y-4 mb-5 md:mb-6">
                {/* From input */}
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-signal-green z-10">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={from}
                    onChange={(e) => {
                      setFrom(e.target.value);
                      if (mapsLoaded) {
                        searchPlaces(e.target.value, setFromSuggestions);
                      }
                      setShowFromSuggestions(true);
                    }}
                    onFocus={() => setShowFromSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowFromSuggestions(false), 200)}
                    placeholder={t("from")}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 md:py-3.5 pl-11 pr-12 text-white placeholder-gray-500 focus:border-auto-yellow/50 transition-all font-modern text-sm md:text-base"
                  />
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={getCurrentLocation}
                    disabled={isGettingLocation}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-auto-yellow/20 text-auto-yellow hover:bg-auto-yellow/30 transition-colors disabled:opacity-50"
                    title={t("useCurrentLocation")}
                  >
                    {isGettingLocation ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Locate className="w-4 h-4" />
                    )}
                  </motion.button>
                  
                  <AnimatePresence>
                    {showFromSuggestions && fromSuggestions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 mt-2 glass-dark border border-white/10 rounded-xl overflow-hidden z-30 max-h-48 overflow-y-auto"
                      >
                        {fromSuggestions.map((s) => (
                          <button
                            type="button"
                            key={s.place_id}
                            onClick={() => {
                              setFrom(s.description);
                              setShowFromSuggestions(false);
                            }}
                            className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                          >
                            {s.description}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Route connector */}
                <div className="flex items-center justify-center">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-0.5 h-4 bg-gradient-to-b from-signal-green to-transparent rounded-full" />
                    <div className="w-2 h-2 rounded-full bg-white/30" />
                    <div className="w-0.5 h-4 bg-gradient-to-t from-signal-red to-transparent rounded-full" />
                  </div>
                </div>

                {/* To input */}
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-signal-red z-10">
                    <Navigation className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={to}
                    onChange={(e) => {
                      setTo(e.target.value);
                      if (mapsLoaded) {
                        searchPlaces(e.target.value, setToSuggestions);
                      }
                      setShowToSuggestions(true);
                    }}
                    onFocus={() => setShowToSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowToSuggestions(false), 200)}
                    placeholder={t("to")}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 md:py-3.5 pl-11 pr-4 text-white placeholder-gray-500 focus:border-auto-yellow/50 transition-all font-modern text-sm md:text-base"
                  />
                  
                  <AnimatePresence>
                    {showToSuggestions && toSuggestions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 mt-2 glass-dark border border-white/10 rounded-xl overflow-hidden z-30 max-h-48 overflow-y-auto"
                      >
                        {toSuggestions.map((s) => (
                          <button
                            type="button"
                            key={s.place_id}
                            onClick={() => {
                              setTo(s.description);
                              setShowToSuggestions(false);
                            }}
                            className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                          >
                            {s.description}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Toggle options */}
              <div className="flex flex-wrap gap-2 md:gap-3 mb-5 md:mb-6">
                <ToggleButton
                  active={isWonAndHalf}
                  onClick={() => setIsWonAndHalf(!isWonAndHalf)}
                  icon={<Zap className="w-3.5 h-3.5 md:w-4 md:h-4" />}
                  label={t("wonAndHalf")}
                />
                <ToggleButton
                  active={isRain}
                  onClick={() => setIsRain(!isRain)}
                  icon={<CloudRain className="w-3.5 h-3.5 md:w-4 md:h-4" />}
                  label={t("rainSurge")}
                />
                <ToggleButton
                  active={isNight}
                  onClick={() => setIsNight(!isNight)}
                  icon={<Moon className="w-3.5 h-3.5 md:w-4 md:h-4" />}
                  label={t("nightRate")}
                />
              </div>

              {/* Calculate button */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCalculate}
                disabled={!from || !to || isCalculating}
                className="w-full py-3.5 md:py-4 rounded-xl bg-gradient-to-r from-auto-yellow to-yellow-500 text-asphalt font-bold text-base md:text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all glow-yellow btn-hover font-modern flex items-center justify-center gap-2"
              >
                {isCalculating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t("loading")}
                  </>
                ) : (
                  <>
                    <AutoRickshaw className="w-6 h-6" />
                    {t("calculateFare")}
                  </>
                )}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function ToggleButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-medium transition-all font-modern ${
        active
          ? "bg-auto-yellow text-asphalt shadow-lg"
          : "bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10"
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
      <span className="sm:hidden">{label.split(" ")[0]}</span>
    </motion.button>
  );
}
