// Product data imported from product.md
// This allows easy editing of the "brain" of the AI

export interface FareRules {
  baseFare: number;
  baseDistance: number;
  perKmRate: number;
  nightMultiplier: number;
  rainSurgeMultiplier: number;
  wonAndHalfMultiplier: number;
  nightStartHour: number;
  nightEndHour: number;
}

export const fareRules: FareRules = {
  baseFare: 30,
  baseDistance: 2,
  perKmRate: 15,
  nightMultiplier: 1.5,
  rainSurgeMultiplier: 1.3,
  wonAndHalfMultiplier: 1.5,
  nightStartHour: 22,
  nightEndHour: 5,
};

export interface SlangPhrase {
  id: string;
  phrase: string;
  kannada: string;
  meaning: string;
  usage: string;
  audioText: string;
  pronunciation: string;
}

export const slangPhrases: SlangPhrase[] = [
  {
    id: "meter-haaki",
    phrase: "Meter Haaki",
    kannada: "ಮೀಟರ್ ಹಾಕಿ",
    meaning: "Put the meter",
    usage: "First thing to say when getting in",
    audioText: "Meter Haaki",
    pronunciation: "mee-ter haa-ki",
  },
  {
    id: "swalpa-adjust",
    phrase: "Swalpa Adjust Maadi",
    kannada: "ಸ್ವಲ್ಪ ಅಡ್ಜಸ್ಟ್ ಮಾಡಿ",
    meaning: "Adjust a little",
    usage: "When driver asks for extra money",
    audioText: "Swalpa Adjust Maadi",
    pronunciation: "swal-pa ad-just maa-di",
  },
  {
    id: "hogalla-bidi",
    phrase: "Hogalla Bidi",
    kannada: "ಹೋಗಲ್ಲ ಬಿಡಿ",
    meaning: "Won't go, leave it",
    usage: "The walk away technique",
    audioText: "Hogalla Bidi",
    pronunciation: "ho-gal-la bi-di",
  },
  {
    id: "change-illa",
    phrase: "Change Illa",
    kannada: "ಚೇಂಜ್ ಇಲ್ಲ",
    meaning: "No change",
    usage: "Common driver excuse - counter with UPI",
    audioText: "Change Illa",
    pronunciation: "change il-la",
  },
  {
    id: "yeshtu-aagutte",
    phrase: "Yeshtu Aagutte?",
    kannada: "ಎಷ್ಟು ಆಗುತ್ತೆ?",
    meaning: "How much will it be?",
    usage: "Ask before getting in",
    audioText: "Yeshtu Aagutte",
    pronunciation: "yesh-tu aa-gut-te",
  },
  {
    id: "meter-mele-20",
    phrase: "Meter Mele 20 Kodtini",
    kannada: "ಮೀಟರ್ ಮೇಲೆ 20 ಕೊಡ್ತೀನಿ",
    meaning: "I'll give 20 over meter",
    usage: "Counter offer technique",
    audioText: "Meter Mele Eepatu Kodtini",
    pronunciation: "mee-ter me-le ee-pa-tu kod-tee-ni",
  },
  {
    id: "police-karana",
    phrase: "Police Karana?",
    kannada: "ಪೋಲೀಸ್ ಕರಾನಾ?",
    meaning: "Should I call police?",
    usage: "Nuclear option - use sparingly",
    audioText: "Police Karana",
    pronunciation: "po-lees ka-ra-na",
  },
  {
    id: "bere-auto",
    phrase: "Bere Auto Nodtini",
    kannada: "ಬೇರೆ ಆಟೋ ನೋಡ್ತೀನಿ",
    meaning: "I'll find another auto",
    usage: "Negotiation tactic",
    audioText: "Bere Auto Nodtini",
    pronunciation: "be-re au-to nod-tee-ni",
  },
  {
    id: "sari-banni",
    phrase: "Sari Banni",
    kannada: "ಸರಿ ಬನ್ನಿ",
    meaning: "Okay, come",
    usage: "When deal is done",
    audioText: "Sari Banni",
    pronunciation: "sa-ri ban-ni",
  },
  {
    id: "bekagilla",
    phrase: "Bekagilla",
    kannada: "ಬೇಕಾಗಿಲ್ಲ",
    meaning: "Don't want it",
    usage: "Firm rejection when price is too high",
    audioText: "Bekagilla",
    pronunciation: "be-kaa-gil-la",
  },
];

export interface AreaTip {
  area: string;
  driverBehavior: string;
  strategy: string;
  icon: string;
}

export const areaTips: AreaTip[] = [
  {
    area: "Majestic",
    driverBehavior: "Refuse meter, quote 2x",
    strategy: "Walk to next stand",
    icon: "🚉",
  },
  {
    area: "Indiranagar",
    driverBehavior: "'Rich area' premium",
    strategy: "Insist on meter",
    icon: "🏙️",
  },
  {
    area: "Koramangala",
    driverBehavior: "Startup tax",
    strategy: "Show you know rates",
    icon: "💼",
  },
  {
    area: "Electronic City",
    driverBehavior: "Long distance excuse",
    strategy: "Negotiate fixed fare",
    icon: "🏢",
  },
  {
    area: "Whitefield",
    driverBehavior: "Traffic excuse",
    strategy: "Check Google Maps time",
    icon: "🚗",
  },
  {
    area: "MG Road",
    driverBehavior: "Tourist pricing",
    strategy: "Speak Kannada phrases",
    icon: "🛍️",
  },
  {
    area: "Silk Board",
    driverBehavior: "Genuine traffic",
    strategy: "Accept slight premium",
    icon: "🚦",
  },
];

export interface EmergencyContact {
  name: string;
  nameKn: string;
  number: string;
  icon: string;
  description: string;
}

export const emergencyContacts: EmergencyContact[] = [
  {
    name: "Police Emergency",
    nameKn: "ಪೋಲೀಸ್ ತುರ್ತು",
    number: "100",
    icon: "🚔",
    description: "For immediate police assistance",
  },
  {
    name: "Bengaluru Traffic Police",
    nameKn: "ಬೆಂಗಳೂರು ಟ್ರಾಫಿಕ್ ಪೋಲೀಸ್",
    number: "103",
    icon: "🚦",
    description: "Traffic violations & complaints",
  },
  {
    name: "Auto Complaint Helpline",
    nameKn: "ಆಟೋ ದೂರು ಸಹಾಯವಾಣಿ",
    number: "080-22868550",
    icon: "🛺",
    description: "Report auto driver misconduct",
  },
  {
    name: "Women Helpline",
    nameKn: "ಮಹಿಳಾ ಸಹಾಯವಾಣಿ",
    number: "1091",
    icon: "👩",
    description: "24/7 women safety helpline",
  },
  {
    name: "General Emergency",
    nameKn: "ಸಾಮಾನ್ಯ ತುರ್ತು",
    number: "112",
    icon: "🆘",
    description: "All emergency services",
  },
  {
    name: "Ambulance",
    nameKn: "ಆಂಬುಲೆನ್ಸ್",
    number: "108",
    icon: "🚑",
    description: "Medical emergency",
  },
  {
    name: "Fire Brigade",
    nameKn: "ಅಗ್ನಿಶಾಮಕ ದಳ",
    number: "101",
    icon: "🚒",
    description: "Fire emergency",
  },
  {
    name: "BMTC Helpline",
    nameKn: "BMTC ಸಹಾಯವಾಣಿ",
    number: "1800-425-1663",
    icon: "🚌",
    description: "Bus service complaints",
  },
  {
    name: "Namma Metro Helpline",
    nameKn: "ನಮ್ಮ ಮೆಟ್ರೋ ಸಹಾಯವಾಣಿ",
    number: "080-22305800",
    icon: "🚇",
    description: "Metro service & complaints",
  },
  {
    name: "BBMP Control Room",
    nameKn: "BBMP ನಿಯಂತ್ರಣ ಕೊಠಡಿ",
    number: "080-22660000",
    icon: "🏛️",
    description: "Civic issues & complaints",
  },
  {
    name: "BBMP Helpline",
    nameKn: "BBMP ಸಹಾಯವಾಣಿ",
    number: "1533",
    icon: "📞",
    description: "Municipal services",
  },
  {
    name: "BESCOM Helpline",
    nameKn: "BESCOM ಸಹಾಯವಾಣಿ",
    number: "1912",
    icon: "⚡",
    description: "Electricity complaints",
  },
  {
    name: "BESCOM Emergency",
    nameKn: "BESCOM ತುರ್ತು",
    number: "080-22260550",
    icon: "🔌",
    description: "Power outage emergency",
  },
  {
    name: "BWSSB Water Supply",
    nameKn: "BWSSB ನೀರು ಪೂರೈಕೆ",
    number: "1916",
    icon: "💧",
    description: "Water supply issues",
  },
  {
    name: "Gas Leak Emergency",
    nameKn: "ಗ್ಯಾಸ್ ಸೋರಿಕೆ ತುರ್ತು",
    number: "1906",
    icon: "🔥",
    description: "Gas leak emergency",
  },
  {
    name: "Child Helpline",
    nameKn: "ಮಕ್ಕಳ ಸಹಾಯವಾಣಿ",
    number: "1098",
    icon: "👶",
    description: "Child safety & welfare",
  },
];

// Calculate fare based on rules
export function calculateFare(
  distanceKm: number,
  options: {
    isNight?: boolean;
    isRain?: boolean;
    isWonAndHalf?: boolean;
  } = {}
): { baseFare: number; finalFare: number; breakdown: string[] } {
  const { isNight = false, isRain = false, isWonAndHalf = false } = options;
  const breakdown: string[] = [];

  let fare: number;
  if (distanceKm <= fareRules.baseDistance) {
    fare = fareRules.baseFare;
    breakdown.push(
      `Base fare (0-${fareRules.baseDistance}km): ₹${fareRules.baseFare}`
    );
  } else {
    const extraKm = distanceKm - fareRules.baseDistance;
    const extraFare = extraKm * fareRules.perKmRate;
    fare = fareRules.baseFare + extraFare;
    breakdown.push(`Base fare: ₹${fareRules.baseFare}`);
    breakdown.push(
      `Extra ${extraKm.toFixed(1)}km × ₹${
        fareRules.perKmRate
      } = ₹${extraFare.toFixed(0)}`
    );
  }

  const baseFare = fare;

  if (isNight) {
    fare *= fareRules.nightMultiplier;
    breakdown.push(
      `Night rate (×${fareRules.nightMultiplier}): ₹${fare.toFixed(0)}`
    );
  }

  if (isWonAndHalf) {
    fare *= fareRules.wonAndHalfMultiplier;
    breakdown.push(
      `Won-and-half (×${fareRules.wonAndHalfMultiplier}): ₹${fare.toFixed(0)}`
    );
  }

  if (isRain) {
    fare *= fareRules.rainSurgeMultiplier;
    breakdown.push(
      `Rain surge (×${fareRules.rainSurgeMultiplier}): ₹${fare.toFixed(0)}`
    );
  }

  return {
    baseFare: Math.round(baseFare),
    finalFare: Math.round(fare),
    breakdown,
  };
}

export function isNightTime(): boolean {
  const hour = new Date().getHours();
  return hour >= fareRules.nightStartHour || hour < fareRules.nightEndHour;
}

export function getFareAssessment(
  actualPrice: number,
  distanceKm: number
): "fair" | "moderate" | "scam" {
  const { finalFare } = calculateFare(distanceKm);
  const ratio = actualPrice / finalFare;

  if (ratio <= 1.2) return "fair";
  if (ratio <= 1.5) return "moderate";
  return "scam";
}
