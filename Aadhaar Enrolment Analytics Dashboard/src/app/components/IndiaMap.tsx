import React, { useEffect, useState } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup, Marker } from "react-simple-maps";

// ✅ Correct Variable Defined
const INDIA_GEO_JSON = "/india.geojson";

// State Centers (Zoom ke liye)
const STATE_CENTERS: { [key: string]: { center: [number, number]; zoom: number } } = {
  "All States": { center: [78.9629, 22.5937], zoom: 1 },
  "Andhra Pradesh": { center: [79.74, 15.91], zoom: 4 },
  "Arunachal Pradesh": { center: [94.72, 28.21], zoom: 5 },
  "Assam": { center: [92.93, 26.20], zoom: 5 },
  "Bihar": { center: [85.31, 25.09], zoom: 5 },
  "Chhattisgarh": { center: [81.86, 21.27], zoom: 5 },
  "Delhi": { center: [77.10, 28.70], zoom: 10 },
  "Goa": { center: [74.12, 15.29], zoom: 8 },
  "Gujarat": { center: [71.19, 22.25], zoom: 5 },
  "Haryana": { center: [76.08, 29.05], zoom: 6 },
  "Himachal Pradesh": { center: [77.17, 31.10], zoom: 6 },
  "Jammu and Kashmir": { center: [76.57, 33.77], zoom: 5 },
  "Jharkhand": { center: [85.32, 23.61], zoom: 5 },
  "Karnataka": { center: [75.71, 15.31], zoom: 5 },
  "Kerala": { center: [76.27, 10.85], zoom: 6 },
  "Madhya Pradesh": { center: [78.65, 22.97], zoom: 5 },
  "Maharashtra": { center: [75.71, 19.75], zoom: 5 },
  "Manipur": { center: [93.90, 24.66], zoom: 6 },
  "Meghalaya": { center: [91.36, 25.46], zoom: 6 },
  "Mizoram": { center: [92.93, 23.16], zoom: 6 },
  "Nagaland": { center: [94.56, 26.15], zoom: 6 },
  "Odisha": { center: [85.09, 20.95], zoom: 5 },
  "Punjab": { center: [75.34, 31.14], zoom: 6 },
  "Rajasthan": { center: [74.21, 27.02], zoom: 5 },
  "Sikkim": { center: [88.51, 27.53], zoom: 7 },
  "Tamil Nadu": { center: [78.65, 11.12], zoom: 5 },
  "Telangana": { center: [79.01, 18.11], zoom: 5 },
  "Tripura": { center: [91.98, 23.94], zoom: 7 },
  "Uttar Pradesh": { center: [80.94, 26.84], zoom: 5 },
  "Uttarakhand": { center: [79.01, 30.06], zoom: 6 },
  "West Bengal": { center: [87.85, 22.98], zoom: 5 },
};

interface MapProps {
  selectedState?: string;
  selectedDistrict?: string;
  selectedPincode?: string;
}

export function IndiaMap({ selectedState = "All States", selectedDistrict = "All Districts", selectedPincode = "All Pincodes" }: MapProps) {
  const [position, setPosition] = useState({ coordinates: [78.9629, 22.5937] as [number, number], zoom: 1 });

  // 1. Filter Logic: Jab State change ho, Zoom karo
  useEffect(() => {
    if (selectedState && selectedState !== "All States" && STATE_CENTERS[selectedState]) {
      const { center, zoom } = STATE_CENTERS[selectedState];
      setPosition({ coordinates: center, zoom: zoom });
    } else {
      setPosition({ coordinates: [78.9629, 22.5937], zoom: 1 });
    }
  }, [selectedState]);

  // 2. Pin Logic: Pincode ke liye coordinates banana (Smart Offset)
  const getSmartCoordinates = () => {
    if (!selectedState || selectedState === "All States" || !STATE_CENTERS[selectedState]) return [0, 0];
    const [baseLng, baseLat] = STATE_CENTERS[selectedState].center;
    const pinNum = parseInt(selectedPincode.replace(/\D/g, '')) || 0;
    
    // Thoda sa shift taaki map par alag jagah dikhe
    const latOffset = (pinNum % 50) * 0.02 - 0.5; 
    const lngOffset = ((pinNum / 50) % 50) * 0.02 - 0.5;
    return [baseLng + lngOffset, baseLat + latOffset];
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 h-full flex flex-col relative overflow-hidden">
      <h3 className="text-lg font-bold text-gray-900 mb-2">🇮🇳 Live India Map (District View)</h3>
      
      <div className="flex-1 w-full h-full border border-gray-100 rounded bg-blue-50/30">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: 1000, center: [78.9629, 22.5937] }} 
          className="w-full h-full"
        >
          <ZoomableGroup 
            zoom={position.zoom} 
            center={position.coordinates}
            onMoveEnd={(pos) => setPosition(pos)}
          >
            {/* ✅ SAHI VARIABLE USE KIYA HAI */}
            <Geographies geography={INDIA_GEO_JSON}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  // ✅ Fix: Aapki file ke hisab se sahi keys
                  const stateName = geo.properties.st_nm;
                  const distName = geo.properties.district;

                  const isStateSelected = selectedState === stateName;
                  const isDistrictSelected = selectedDistrict === distName;
                  
                  // Color Logic
                  let fillColor = "#e5e7eb"; // Grey
                  let strokeColor = "#FFFFFF";
                  
                  if (selectedState !== "All States") {
                      if (isStateSelected) {
                          fillColor = "#93c5fd"; // Selected State (Light Blue)
                          if (isDistrictSelected) {
                              fillColor = "#2563eb"; // Selected District (Dark Blue)
                          }
                      } else {
                          fillColor = "#f3f4f6"; // Unselected (Light Grey)
                      }
                  }

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={fillColor}
                      stroke={strokeColor}
                      strokeWidth={0.5}
                      style={{
                        default: { outline: "none" },
                        hover: { fill: "#60a5fa", outline: "none", cursor: "pointer" },
                        pressed: { outline: "none" },
                      }}
                      title={`${distName}, ${stateName}`}
                    />
                  );
                })
              }
            </Geographies>

            {/* Red Pin Marker */}
            {selectedPincode !== "All Pincodes" && selectedState !== "All States" && (
                <Marker coordinates={getSmartCoordinates() as [number, number]}>
                    <circle r={8 / position.zoom} fill="#ef4444" stroke="#fff" strokeWidth={2} />
                    <text
                        textAnchor="middle"
                        y={-12 / position.zoom}
                        style={{ fontFamily: "sans-serif", fill: "#374151", fontSize: 14 / position.zoom, fontWeight: "bold" }}
                    >
                        📍
                    </text>
                </Marker>
            )}

          </ZoomableGroup>
        </ComposableMap>
      </div>
      
      {/* Label */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-3 py-2 rounded-lg border border-gray-200 text-xs shadow-sm">
        <p className="text-gray-500">Viewing Region:</p>
        <p className="font-bold text-blue-600 text-sm">{selectedState !== "All States" ? selectedState : "Entire India"}</p>
      </div>
    </div>
  );
}