import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Overriding default Leaflet marker assets using unpkg CDN urls to ensure reliable load in Vite builds
const markerIconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const markerIconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
const markerShadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

const customIcon = L.icon({
  iconUrl: markerIconUrl,
  iconRetinaUrl: markerIconRetinaUrl,
  shadowUrl: markerShadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function MapWidget() {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    // Center coordinates for Plot-1, Sector-5, Ulwe Node, Wahal, Navi Mumbai (approx 18.9669 N, 73.0203 E)
    const position = [18.9669, 73.0203];

    if (mapContainerRef.current && !mapRef.current) {
      // Initialize map instance
      mapRef.current = L.map(mapContainerRef.current, {
        scrollWheelZoom: false // Prevent accidental scrolling zoom
      }).setView(position, 16);

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
      }).addTo(mapRef.current);

      // Add marker with details popup
      L.marker(position, { icon: customIcon })
        .addTo(mapRef.current)
        .bindPopup(`
          <div class="text-xs p-1 font-sans">
            <h5 class="font-bold text-slate-800 text-sm">Suyash Pride Housing Society</h5>
            <p class="text-slate-500 mt-1">Plot-1, Sector-5, Ulwe Node, Wahal, Navi Mumbai</p>
            <a href="https://www.openstreetmap.org/?mlat=18.9669&mlon=73.0203#map=16/18.9669/73.0203" 
               target="_blank" class="text-society-primary font-bold hover:underline block mt-2">Get Directions</a>
          </div>
        `)
        .openPopup();
    }

    // Cleanup on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm flex flex-col h-[380px] transition-theme">
      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
        <div>
          <h4 className="font-bold text-society-primary dark:text-[#D4AF37] text-xs uppercase tracking-wide">Plot-1, Sector-5, Ulwe Node</h4>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">Wahal, Navi Mumbai, Maharashtra</span>
        </div>
        <span className="text-[10px] bg-[#D4AF37]/20 text-society-primary dark:text-[#D4AF37] px-2.5 py-0.5 rounded-full font-bold">Leaflet OSM</span>
      </div>
      
      {/* Map Target Div */}
      <div ref={mapContainerRef} className="flex-grow z-10 bg-slate-100 dark:bg-slate-950" />
      
      <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 text-center text-[10px] text-slate-500">
        <a 
          href="https://www.openstreetmap.org/?mlat=18.9669&mlon=73.0203#map=16/18.9669/73.0203" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-society-primary dark:text-slate-300 hover:text-yellow-600 dark:hover:text-[#D4AF37] font-semibold transition"
        >
          View Larger Map Route ↗
        </a>
      </div>
    </div>
  );
}

export default MapWidget;
