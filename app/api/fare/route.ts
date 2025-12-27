import { NextRequest, NextResponse } from "next/server";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

interface FareRules {
  baseFare: number;
  baseDistance: number;
  perKmRate: number;
  nightMultiplier: number;
  rainSurgeMultiplier: number;
  wonAndHalfMultiplier: number;
}

const fareRules: FareRules = {
  baseFare: 30,
  baseDistance: 2,
  perKmRate: 15,
  nightMultiplier: 1.5,
  rainSurgeMultiplier: 1.3,
  wonAndHalfMultiplier: 1.5,
};

// Extended area coordinates including more regions
const areaCoordinates: Record<string, { lat: number; lng: number }> = {
  // Bengaluru areas
  majestic: { lat: 12.9767, lng: 77.5713 },
  indiranagar: { lat: 12.9784, lng: 77.6408 },
  koramangala: { lat: 12.9352, lng: 77.6245 },
  whitefield: { lat: 12.9698, lng: 77.75 },
  "electronic city": { lat: 12.8399, lng: 77.677 },
  "mg road": { lat: 12.9756, lng: 77.6066 },
  "silk board": { lat: 12.9177, lng: 77.6238 },
  jayanagar: { lat: 12.9308, lng: 77.5838 },
  "btm layout": { lat: 12.9166, lng: 77.6101 },
  "hsr layout": { lat: 12.9116, lng: 77.6389 },
  marathahalli: { lat: 12.9591, lng: 77.701 },
  hebbal: { lat: 13.0358, lng: 77.597 },
  yelahanka: { lat: 13.1007, lng: 77.5963 },
  "jp nagar": { lat: 12.9063, lng: 77.5857 },
  banashankari: { lat: 12.9255, lng: 77.5468 },
  rajajinagar: { lat: 12.991, lng: 77.5525 },
  malleshwaram: { lat: 13.0035, lng: 77.5647 },
  basavanagudi: { lat: 12.9425, lng: 77.575 },
  "kempegowda bus station": { lat: 12.9767, lng: 77.5713 },
  "bangalore airport": { lat: 13.1986, lng: 77.7066 },
  "kempegowda international airport": { lat: 13.1986, lng: 77.7066 },
  bengaluru: { lat: 12.9716, lng: 77.5946 },
  bangalore: { lat: 12.9716, lng: 77.5946 },
  // Other Karnataka cities
  mysore: { lat: 12.2958, lng: 76.6394 },
  mysuru: { lat: 12.2958, lng: 76.6394 },
  mangalore: { lat: 12.9141, lng: 74.856 },
  hubli: { lat: 15.3647, lng: 75.124 },
  // Major Indian cities
  chennai: { lat: 13.0827, lng: 80.2707 },
  hyderabad: { lat: 17.385, lng: 78.4867 },
  mumbai: { lat: 19.076, lng: 72.8777 },
  delhi: { lat: 28.6139, lng: 77.209 },
  pune: { lat: 18.5204, lng: 73.8567 },
  kolkata: { lat: 22.5726, lng: 88.3639 },
};

function findArea(query: string): { lat: number; lng: number } | null {
  const lowerQuery = query.toLowerCase();
  for (const [area, coords] of Object.entries(areaCoordinates)) {
    if (lowerQuery.includes(area)) {
      return coords;
    }
  }
  return null;
}

function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c * 1.3;
}

function calculateFare(
  distanceKm: number,
  options: { isNight?: boolean; isRain?: boolean; isWonAndHalf?: boolean }
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

async function getDistanceFromGoogleMaps(
  from: string,
  to: string
): Promise<{ distance: number; duration: string } | null> {
  if (!GOOGLE_MAPS_API_KEY) return null;

  try {
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(
      from
    )}&destinations=${encodeURIComponent(
      to
    )}&mode=driving&key=${GOOGLE_MAPS_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (
      data.status === "OK" &&
      data.rows?.[0]?.elements?.[0]?.status === "OK"
    ) {
      const element = data.rows[0].elements[0];
      return {
        distance: element.distance.value / 1000,
        duration: element.duration.text,
      };
    }
    return null;
  } catch (error) {
    console.error("Google Maps API error:", error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { from, to, isNight, isRain, isWonAndHalf } = await request.json();

    if (!from || !to) {
      return NextResponse.json(
        { error: "Both 'from' and 'to' locations are required" },
        { status: 400 }
      );
    }

    // Try Google Maps API first
    const googleResult = await getDistanceFromGoogleMaps(from, to);

    if (googleResult) {
      const fare = calculateFare(googleResult.distance, {
        isNight,
        isRain,
        isWonAndHalf,
      });
      return NextResponse.json({
        distance: googleResult.distance,
        duration: googleResult.duration,
        ...fare,
      });
    }

    // Fallback to local calculation
    const fromCoords = findArea(from);
    const toCoords = findArea(to);

    if (fromCoords && toCoords) {
      const distance = calculateDistance(
        fromCoords.lat,
        fromCoords.lng,
        toCoords.lat,
        toCoords.lng
      );
      const fare = calculateFare(distance, { isNight, isRain, isWonAndHalf });
      const duration = `${Math.round(distance * 3)} mins`;

      return NextResponse.json({
        distance,
        duration,
        ...fare,
      });
    }

    // Last resort: estimate
    const estimatedDistance = 8;
    const fare = calculateFare(estimatedDistance, {
      isNight,
      isRain,
      isWonAndHalf,
    });

    return NextResponse.json({
      distance: estimatedDistance,
      duration: "~25 mins",
      ...fare,
      warning: "Could not find exact locations. Using estimated distance.",
    });
  } catch (error) {
    console.error("Fare calculation error:", error);
    return NextResponse.json(
      { error: "Failed to calculate fare" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    areas: Object.keys(areaCoordinates),
    fareRules,
  });
}
