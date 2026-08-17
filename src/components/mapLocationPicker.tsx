import React, { useEffect, useRef, useState } from "react";
import { MapPin, Check, X, Loader2, Navigation } from "lucide-react";

interface PickedLocation {
  lat: number;
  lng: number;
  label: string; // "City, State"
}

interface MapLocationPickerProps {
  onConfirm: (location: PickedLocation) => void;
  onClose: () => void;
  initialLabel?: string;
}

// 🔥 FOOLPROOF ADDRESS PARSER
// Nominatim uses different keys depending on the country and specific mapping.
const getCityState = (addr: any): string => {
  if (!addr) return "Unknown City, Unknown State";

  const city =
    addr.city ||
    addr.town ||
    addr.municipality ||
    addr.city_district ||
    addr.suburb ||
    addr.village ||
    addr.county ||
    addr.state_district ||
    addr.region ||
    "Unknown City";

  const state =
    addr.state ||
    addr.province ||
    addr.state_code ||
    "Unknown State";

  return `${city}, ${state}`;
};

export const MapLocationPicker: React.FC<MapLocationPickerProps> = ({
  onConfirm,
  onClose,
  initialLabel,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const [picked, setPicked] = useState<PickedLocation | null>(null);
  const [geocoding, setGeocoding] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialLabel ?? "");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  // Dynamically load Leaflet CSS + JS
  useEffect(() => {
    const loadLeaflet = async () => {
      if ((window as any).L) {
        setLeafletLoaded(true);
        return;
      }

      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);

      await new Promise<void>((resolve) => {
        const script = document.createElement("script");
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.onload = () => resolve();
        document.head.appendChild(script);
      });

      setLeafletLoaded(true);
    };

    loadLeaflet();
  }, []);

  // Init map after Leaflet is loaded
  useEffect(() => {
    if (!leafletLoaded || !mapRef.current || mapInstanceRef.current) return;

    const L = (window as any).L;

    const map = L.map(mapRef.current, {
      center: [20, 0],
      zoom: 2,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    const icon = L.divIcon({
      html: `<div style="width:32px;height:32px;background:#E04F33;border:3px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 8px rgba(0,0,0,0.4);"></div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      className: "",
    });

    // 1. REVERSE GEOCODING ON MAP CLICK
    map.on("click", async (e: any) => {
      const { lat, lng } = e.latlng;

      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng], { icon }).addTo(map);
      }

      setGeocoding(true);
      setPicked({ lat, lng, label: "Locating..." });

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`
        );
        const data = await res.json();
        const label = getCityState(data.address);
        setPicked({ lat, lng, label });
      } catch {
        setPicked({ lat, lng, label: `${lat.toFixed(4)}, ${lng.toFixed(4)}` });
      } finally {
        setGeocoding(false);
      }
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    };
  }, [leafletLoaded]);

  // 2. FORWARD GEOCODING ON SEARCH
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchResults([]);
    try {
      // Must include addressdetails=1 to get the split city/state object
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&addressdetails=1&limit=5`
      );
      const data = await res.json();
      setSearchResults(data);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const flyToResult = (result: any) => {
    const L = (window as any).L;
    const map = mapInstanceRef.current;
    if (!map) return;

    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);

    map.flyTo([lat, lng], 13, { duration: 1 });

    const icon = L.divIcon({
      html: `<div style="width:32px;height:32px;background:#E04F33;border:3px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 8px rgba(0,0,0,0.4);"></div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      className: "",
    });

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      markerRef.current = L.marker([lat, lng], { icon }).addTo(map);
    }

    const label = getCityState(result.address);
    setPicked({ lat, lng, label });
    setSearchResults([]);
    setSearchQuery(label);
  };

  // 3. REVERSE GEOCODING ON GPS
  const handleGps = () => {
    if (!navigator.geolocation) return;
    setGpsLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        const map = mapInstanceRef.current;
        const L = (window as any).L;

        map?.flyTo([lat, lng], 14, { duration: 1 });

        const icon = L.divIcon({
          html: `<div style="width:32px;height:32px;background:#E04F33;border:3px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 8px rgba(0,0,0,0.4);"></div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          className: "",
        });

        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else if (map) {
          markerRef.current = L.marker([lat, lng], { icon }).addTo(map);
        }

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`
          );
          const data = await res.json();
          const label = getCityState(data.address);
          setPicked({ lat, lng, label });
        } catch {
          setPicked({ lat, lng, label: `${lat.toFixed(4)}, ${lng.toFixed(4)}` });
        } finally {
          setGpsLoading(false);
        }
      },
      () => setGpsLoading(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-[#0F1014] border border-white/15 rounded-3xl overflow-hidden shadow-2xl flex flex-col" style={{ height: "min(640px, 90vh)" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0 bg-[#0F1014]">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#E04F33]" />
            <span className="text-sm font-bold text-white">Pick Location on Map</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-4 py-3 border-b border-white/10 shrink-0 space-y-2 bg-[#0F1014] relative z-10">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search city, address, landmark..."
              className="flex-1 px-3.5 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-[#E04F33] font-mono placeholder:text-slate-500"
            />
            <button onClick={handleSearch} disabled={searching} className="px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/10 text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 font-mono">
              {searching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Search"}
            </button>
            <button onClick={handleGps} disabled={gpsLoading} title="Use my GPS location" className="px-3 py-2 bg-[#E04F33]/20 hover:bg-[#E04F33]/30 border border-[#E04F33]/40 text-[#FF8A73] rounded-xl transition-all flex items-center gap-1.5">
              {gpsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
            </button>
          </div>

          {/* Search results dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute left-4 right-4 top-full mt-2 bg-[#12131A] border border-white/15 rounded-xl overflow-hidden shadow-2xl z-50">
              {searchResults.map((r, i) => (
                <button key={i} onClick={() => flyToResult(r)} className="w-full text-left px-4 py-3 text-xs text-slate-200 hover:bg-[#E04F33]/20 hover:text-white transition-colors border-b border-white/5 last:border-0 font-mono truncate">
                  {r.display_name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Map */}
        <div className="flex-1 relative z-0">
          {!leafletLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#0F1014]">
              <Loader2 className="w-6 h-6 animate-spin text-[#E04F33]" />
            </div>
          )}
          <div ref={mapRef} className="w-full h-full" />

          {/* Hint overlay */}
          {leafletLoaded && !picked && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none">
              <div className="px-3 py-2 bg-black/70 rounded-full text-[10px] text-slate-300 font-mono border border-white/10 whitespace-nowrap shadow-xl">
                Click anywhere on the map to pin a location
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-white/10 shrink-0 flex items-center justify-between gap-3 bg-[#0F1014]">
          <div className="min-w-0 flex-1">
            {picked ? (
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#E04F33] shrink-0" />
                <div className="min-w-0">
                  {geocoding
                    ? <span className="text-[11px] text-slate-400 font-mono">Locating...</span>
                    : <>
                        <p className="text-xs font-bold text-white truncate">{picked.label}</p>
                        <p className="text-[10px] text-slate-500 font-mono">
                          {picked.lat.toFixed(5)}, {picked.lng.toFixed(5)}
                        </p>
                      </>
                  }
                </div>
              </div>
            ) : (
              <span className="text-[11px] text-slate-500 font-mono">No location selected</span>
            )}
          </div>

          <div className="flex gap-2 shrink-0">
            <button onClick={onClose} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-bold border border-white/10 transition-all">
              Cancel
            </button>
            <button
              onClick={() => picked && !geocoding && onConfirm(picked)}
              disabled={!picked || geocoding}
              className="px-5 py-2 bg-[#E04F33] hover:bg-[#ED5B3F] text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 font-mono border border-white/20 disabled:opacity-40 disabled:cursor-not-allowed">
              <Check className="w-3.5 h-3.5" /> Confirm
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
