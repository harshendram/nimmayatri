"use client";

import { useState, useCallback } from "react";
import { GoogleMap, Marker, DirectionsRenderer } from "@react-google-maps/api";
import { motion } from "framer-motion";
import { Map, Navigation2 } from "lucide-react";

// Dark cyberpunk map style
const mapStyles = [
  { elementType: "geometry", stylers: [{ color: "#1a1a2e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1a1a2e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#FFD700" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#FFD700" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#263c3f" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b9a76" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca5b3" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#FFD700" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1f2835" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#f3d19c" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#2f3948" }],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#FFD700" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#515c6d" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#17263c" }],
  },
];

const containerStyle = {
  width: "100%",
  height: "300px",
  borderRadius: "16px",
};

const defaultCenter = {
  lat: 12.9716,
  lng: 77.5946,
};

interface MapViewProps {
  origin?: google.maps.LatLngLiteral;
  destination?: google.maps.LatLngLiteral;
  showDirections?: boolean;
}

export default function MapView({ origin, destination, showDirections = false }: MapViewProps) {
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Calculate directions when origin and destination are set
  const calculateRoute = useCallback(() => {
    if (!origin || !destination || !window.google) return;

    const directionsService = new google.maps.DirectionsService();
    directionsService.route(
      {
        origin,
        destination,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === "OK" && result) {
          setDirections(result);
        }
      }
    );
  }, [origin, destination]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-dark rounded-2xl p-4 overflow-hidden"
    >
      <div className="flex items-center gap-2 mb-4">
        <Map className="w-5 h-5 text-auto-yellow" />
        <span className="text-white font-medium">Route Map</span>
        {showDirections && origin && destination && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={calculateRoute}
            className="ml-auto flex items-center gap-1 px-3 py-1 bg-auto-yellow/20 text-auto-yellow text-sm rounded-full"
          >
            <Navigation2 className="w-4 h-4" />
            Show Route
          </motion.button>
        )}
      </div>

      <div className="rounded-xl overflow-hidden">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={origin || defaultCenter}
          zoom={13}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={{
            styles: mapStyles,
            disableDefaultUI: true,
            zoomControl: true,
          }}
        >
          {origin && (
            <Marker
              position={origin}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: "#00FF88",
                fillOpacity: 1,
                strokeColor: "#ffffff",
                strokeWeight: 2,
              }}
            />
          )}
          {destination && (
            <Marker
              position={destination}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: "#FF4444",
                fillOpacity: 1,
                strokeColor: "#ffffff",
                strokeWeight: 2,
              }}
            />
          )}
          {directions && (
            <DirectionsRenderer
              directions={directions}
              options={{
                polylineOptions: {
                  strokeColor: "#FFD700",
                  strokeWeight: 4,
                },
                suppressMarkers: true,
              }}
            />
          )}
        </GoogleMap>
      </div>
    </motion.div>
  );
}
