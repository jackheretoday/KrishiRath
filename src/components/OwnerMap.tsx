import { useEffect, useState, useRef } from "react";
import { MapPin, Navigation, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import "leaflet/dist/leaflet.css";

// We dynamically import Leaflet to avoid SSR issues
let L: any = null;

interface OwnerLocation {
  id: string;
  name: string;
  equipment: string;
  village: string;
  lat: number;
  lng: number;
  rating: number;
  available: boolean;
}

// Simulated owner locations across Maharashtra
const OWNER_LOCATIONS: OwnerLocation[] = [
  { id: "1", name: "Rajesh Patil", equipment: "Escorts FT 45 Tractor", village: "Sangli", lat: 16.8524, lng: 74.5815, rating: 4.5, available: true },
  { id: "2", name: "Suresh Jadhav", equipment: "John Deere 5310", village: "Thane", lat: 19.2183, lng: 72.9781, rating: 4.8, available: true },
  { id: "3", name: "Vikram Deshmukh", equipment: "Combine Harvester X1", village: "Kolhapur", lat: 16.7050, lng: 74.2433, rating: 4.7, available: true },
  { id: "4", name: "Anil Shinde", equipment: "Rotavator X-Series", village: "Sangli", lat: 16.8644, lng: 74.5635, rating: 4.2, available: true },
  { id: "5", name: "Pravin More", equipment: "Mahindra 575 DI", village: "Pune", lat: 18.5204, lng: 73.8567, rating: 4.6, available: true },
  { id: "6", name: "Ganesh Kulkarni", equipment: "Power Tiller PT-200", village: "Nashik", lat: 19.9975, lng: 73.7898, rating: 4.3, available: true },
  { id: "7", name: "Deepak Wagh", equipment: "Seed Drill SD-400", village: "Aurangabad", lat: 19.8762, lng: 75.3433, rating: 4.4, available: false },
  { id: "8", name: "Manoj Gaikwad", equipment: "Sprayer Pro-X", village: "Solapur", lat: 17.6599, lng: 75.9064, rating: 4.1, available: true },
];

const OwnerMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locatingUser, setLocatingUser] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState<OwnerLocation | null>(null);

  // Load Leaflet dynamically
  useEffect(() => {
    import("leaflet").then((leaflet) => {
      L = leaflet.default;
      
      // Fix default marker icon issue with bundlers
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });
      
      setMapReady(true);
    });
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapReady || !mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView([18.5, 74.5], 7);
    mapInstanceRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(map);

    // Add owner markers
    OWNER_LOCATIONS.forEach((owner) => {
      const markerColor = owner.available ? "#16a34a" : "#dc2626";
      const icon = L.divIcon({
        className: "custom-marker",
        html: `<div style="
          background:${markerColor};
          width:32px;height:32px;
          border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);
          border:3px solid white;
          box-shadow:0 2px 8px rgba(0,0,0,0.3);
          display:flex;align-items:center;justify-content:center;
        "><div style="transform:rotate(45deg);color:white;font-size:14px;font-weight:bold;">🚜</div></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      const marker = L.marker([owner.lat, owner.lng], { icon }).addTo(map);
      marker.bindPopup(`
        <div style="min-width:200px;font-family:system-ui;">
          <h3 style="margin:0 0 4px;font-size:14px;font-weight:800;">${owner.name}</h3>
          <p style="margin:0 0 2px;font-size:12px;color:#666;">🚜 ${owner.equipment}</p>
          <p style="margin:0 0 2px;font-size:12px;color:#666;">📍 ${owner.village}</p>
          <p style="margin:0 0 4px;font-size:12px;color:#eab308;">★ ${owner.rating}</p>
          <span style="
            display:inline-block;
            padding:2px 8px;
            border-radius:999px;
            font-size:10px;
            font-weight:700;
            background:${owner.available ? '#dcfce7' : '#fecaca'};
            color:${owner.available ? '#166534' : '#991b1b'};
          ">${owner.available ? 'Available' : 'Booked'}</span>
        </div>
      `);
    });

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mapReady]);

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setLocatingUser(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setLocatingUser(false);

        if (mapInstanceRef.current && L) {
          // Add user marker
          const userIcon = L.divIcon({
            className: "user-marker",
            html: `<div style="
              background:#3b82f6;
              width:20px;height:20px;
              border-radius:50%;
              border:4px solid white;
              box-shadow:0 0 0 3px rgba(59,130,246,0.4), 0 2px 8px rgba(0,0,0,0.3);
              animation: pulse 2s infinite;
            "></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          });

          L.marker([latitude, longitude], { icon: userIcon })
            .addTo(mapInstanceRef.current)
            .bindPopup('<div style="font-weight:700;font-size:13px;">📍 Your Location</div>')
            .openPopup();

          // Add accuracy circle
          L.circle([latitude, longitude], {
            radius: 500,
            color: "#3b82f6",
            fillColor: "#3b82f6",
            fillOpacity: 0.1,
            weight: 1,
          }).addTo(mapInstanceRef.current);

          mapInstanceRef.current.setView([latitude, longitude], 10);
        }
      },
      (error) => {
        setLocatingUser(false);
        alert("Unable to retrieve your location: " + error.message);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <Card className="border-2 border-blue-500/20 shadow-xl overflow-hidden bg-gradient-to-br from-white to-blue-50/20">
      <CardHeader className="bg-blue-500/10 border-b-2 border-blue-500/10 py-5">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-2xl font-black text-blue-700">
            <MapPin className="h-6 w-6 text-blue-600" />
            Equipment Owners Near You
          </CardTitle>
          <Button
            size="sm"
            onClick={getUserLocation}
            disabled={locatingUser}
            className="gap-2 font-bold bg-blue-600 hover:bg-blue-700"
          >
            {locatingUser ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Locating...</>
            ) : (
              <><Navigation className="h-4 w-4" /> Use My Location</>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative">
          <div
            ref={mapRef}
            style={{ height: "400px", width: "100%" }}
            className="z-0"
          />
          {!mapReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          )}
          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-lg border z-[1000]">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Legend</p>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold">
                <span className="w-3 h-3 rounded-full bg-green-500 inline-block" /> Available
              </div>
              <div className="flex items-center gap-2 text-xs font-bold">
                <span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> Booked
              </div>
              {userLocation && (
                <div className="flex items-center gap-2 text-xs font-bold">
                  <span className="w-3 h-3 rounded-full bg-blue-500 inline-block border-2 border-white shadow" /> You
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Owner list below map */}
        <div className="p-4 border-t-2">
          <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">{OWNER_LOCATIONS.filter(o => o.available).length} owners available nearby</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {OWNER_LOCATIONS.filter(o => o.available).slice(0, 4).map(owner => (
              <div
                key={owner.id}
                className="p-3 rounded-xl border-2 bg-slate-50 hover:border-blue-300 transition-all cursor-pointer"
                onClick={() => {
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.setView([owner.lat, owner.lng], 12);
                  }
                }}
              >
                <p className="font-black text-sm truncate">{owner.name}</p>
                <p className="text-xs text-slate-500 font-bold truncate">🚜 {owner.equipment}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-slate-400 font-bold">📍 {owner.village}</span>
                  <span className="text-xs text-yellow-600 font-black">★ {owner.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OwnerMap;
