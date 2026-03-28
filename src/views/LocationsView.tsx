import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MapPin, Compass, Navigation, Info, Star, Users, Activity } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import { locations as initialLocations } from '../data/locations';

// Fix for default marker icon issue in Leaflet with React
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

export default function LocationsView() {
  const [locations, setLocations] = useState(initialLocations);
  const center: [number, number] = [9.22, 124.68]; // Center of Camiguin

  // Simulate real-time visitor updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLocations(prev => prev.map(loc => ({
        ...loc,
        visitors: Math.max(0, loc.visitors + (Math.random() > 0.5 ? 1 : -1))
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-island-cream pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-island-emerald/10 text-island-emerald text-[10px] font-bold rounded-full uppercase tracking-[0.2em]">Real-time Insights</span>
              <div className="flex items-center gap-1 text-[10px] font-bold text-island-coral animate-pulse">
                <Activity size={12} /> Live Updates
              </div>
            </div>
            <h1 className="text-5xl font-serif font-bold text-island-green italic">Island <span className="not-italic">Locations</span></h1>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-100 shadow-sm text-xs font-bold text-island-green">
            <Compass size={14} className="text-island-emerald animate-spin-slow" />
            Interactive Discovery Map
          </div>
        </header>

        {/* Map Component */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full h-[600px] rounded-[3rem] overflow-hidden border-8 border-white shadow-2xl mb-16 z-0 relative"
        >
          <MapContainer 
            center={center} 
            zoom={12} 
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MarkerClusterGroup
              chunkedLoading
              spiderfyOnMaxZoom={true}
              showCoverageOnHover={false}
            >
              {locations.map((loc) => (
                <Marker 
                  key={loc.id} 
                  position={[loc.lat, loc.lng]} 
                  icon={customIcon}
                >
                  <Popup>
                    <div className="p-2 min-w-[200px]">
                      <img 
                        src={loc.image} 
                        alt={loc.name} 
                        className="w-full h-24 object-cover rounded-xl mb-3" 
                        referrerPolicy="no-referrer"
                      />
                      <h4 className="font-bold text-island-green m-0 text-lg">{loc.name}</h4>
                      <p className="text-[10px] text-island-emerald uppercase font-bold m-0 mb-2">{loc.type}</p>
                      
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-2 text-slate-500 text-xs">
                          <Users size={14} className="text-island-emerald" />
                          <span className="font-bold">{loc.visitors} visitors</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-island-coral">
                          <div className="w-1.5 h-1.5 rounded-full bg-island-coral animate-pulse"></div>
                          Live
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MarkerClusterGroup>
          </MapContainer>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {locations.map((loc) => (
            <motion.div
              key={loc.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-white rounded-[3rem] overflow-hidden border border-slate-100 shadow-sm flex flex-col md:flex-row group hover:shadow-xl transition-all duration-500"
            >
              <div className="md:w-1/2 aspect-video md:aspect-auto relative overflow-hidden">
                <img 
                  src={loc.image} 
                  alt={loc.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-bold text-island-green shadow-sm">
                  <Users size={12} className="text-island-emerald" />
                  {loc.visitors} Active Visitors
                </div>
              </div>
              <div className="p-10 md:w-1/2 flex flex-col justify-center">
                <div className="flex justify-between items-start mb-4">
                  <div className="px-3 py-1 bg-island-emerald/10 text-island-emerald rounded-full text-[10px] font-bold uppercase tracking-widest w-fit">
                    {loc.type}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-island-coral">
                    <div className="w-1.5 h-1.5 rounded-full bg-island-coral animate-pulse"></div>
                    Live
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-island-green mb-2">{loc.name}</h3>
                <div className="flex items-center gap-2 text-slate-400 text-xs font-mono mb-8">
                  <MapPin size={14} />
                  {loc.coords}
                </div>
                <div className="flex gap-3">
                  <button className="flex-1 py-4 bg-island-green text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-island-emerald transition-all flex items-center justify-center gap-2">
                    <Navigation size={14} />
                    Directions
                  </button>
                  <button className="w-14 h-14 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:text-island-green transition-all">
                    <Info size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
