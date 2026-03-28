import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Map as MapIcon, 
  Compass, 
  User, 
  QrCode, 
  Heart, 
  Star, 
  Navigation,
  Clock,
  ChevronRight,
  Filter,
  Bell,
  Ticket,
  MapPin,
  Bus,
  ShoppingBag,
  Store,
  LayoutDashboard,
  Ship,
  Users,
  Activity,
  ArrowLeft,
  X,
  Building2,
  Utensils,
  Camera
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import { locations } from '../data/locations';

// Fix for default marker icon issue in Leaflet with React
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const categories = ['All', 'Beaches', 'Hiking', 'Waterfalls', 'Dining', 'Shops', 'Transport'];

const spots = [
  {
    id: 1,
    name: 'White Island',
    category: 'Beaches',
    rating: 4.9,
    image: 'https://picsum.photos/seed/tropical-island-sand/800/800',
    distance: '2.4 km'
  },
  {
    id: 2,
    name: 'Katibawasan Falls',
    category: 'Waterfalls',
    rating: 4.8,
    image: 'https://picsum.photos/seed/jungle-waterfall/800/800',
    distance: '5.1 km'
  },
  {
    id: 3,
    name: 'Hibok-Hibok Volcano',
    category: 'Hiking',
    rating: 4.7,
    image: 'https://picsum.photos/seed/volcano-mountain-peak/800/800',
    distance: '8.2 km'
  }
];

export default function MobileAppView() {
  const [activeTab, setActiveTab] = useState('explore');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSpot, setSelectedSpot] = useState<any>(null);
  const [mapLocations, setMapLocations] = useState(locations);

  const isDesktop = window.innerWidth >= 768;

  // Simulate real-time visitor updates for map
  useEffect(() => {
    const interval = setInterval(() => {
      setMapLocations(prev => prev.map(loc => ({
        ...loc,
        visitors: Math.max(0, (loc.visitors || 0) + (Math.random() > 0.5 ? 1 : -1))
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const center: [number, number] = [9.22, 124.68];

  const content = (
    <div className={`h-full flex flex-col pt-10 pb-20 overflow-y-auto no-scrollbar bg-white ${!isDesktop ? 'min-h-screen' : ''}`}>
      <AnimatePresence mode="wait">
        {selectedSpot ? (
          <motion.div 
            key="spot-detail"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="absolute inset-0 bg-white z-[60] flex flex-col"
          >
            <div className="relative h-80">
              <img src={selectedSpot.image} alt={selectedSpot.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              <button 
                onClick={() => setSelectedSpot(null)}
                className="absolute top-6 left-6 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white"
              >
                <ArrowLeft size={20} />
              </button>
            </div>
            <div className="p-8 flex-1">
              <div className="flex justify-between items-start mb-4">
                <span className="px-3 py-1 bg-island-emerald/10 text-island-emerald rounded-full text-[10px] font-bold uppercase tracking-widest">
                  {selectedSpot.category}
                </span>
                <div className="flex items-center gap-1 text-island-sunset">
                  <Star size={14} fill="currentColor" />
                  <span className="text-xs font-bold">{selectedSpot.rating}</span>
                </div>
              </div>
              <h2 className="text-3xl font-serif font-bold text-island-green mb-4 italic">{selectedSpot.name}</h2>
              <p className="text-slate-500 text-sm font-light leading-relaxed mb-8">
                Experience the breathtaking beauty of {selectedSpot.name}. This destination offers unique insights into Camiguin's rich natural and historical heritage.
              </p>
              <button className="w-full py-4 island-gradient text-white rounded-2xl font-bold shadow-lg shadow-island-emerald/20 flex items-center justify-center gap-2">
                <Navigation size={18} />
                Get Directions
              </button>
            </div>
          </motion.div>
        ) : null}

        {activeTab === 'explore' && (
          <motion.div 
            key="explore"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="px-6"
          >
            <header className="flex justify-between items-center mb-8">
              <div>
                <p className="text-[10px] font-bold text-island-emerald uppercase tracking-[0.2em] mb-1">Welcome to</p>
                <h2 className="text-3xl font-serif font-bold text-island-green italic">Camiguin</h2>
              </div>
              <button className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-island-green shadow-sm relative">
                <Bell size={20} />
                <span className="absolute top-3 right-3 w-2 h-2 bg-island-coral rounded-full border-2 border-white"></span>
              </button>
            </header>

            {/* Search */}
            <div className="relative mb-8">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search experiences..." 
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-island-emerald/20 transition-all"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-island-green text-white rounded-xl flex items-center justify-center">
                <Filter size={16} />
              </button>
            </div>

            {/* Categories */}
            <div className="flex gap-3 overflow-x-auto no-scrollbar mb-8 -mx-6 px-6">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-6 py-3 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCategory === cat 
                      ? 'bg-island-green text-white shadow-lg shadow-island-green/20' 
                      : 'bg-white border border-slate-100 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-4 gap-4 mb-10">
              <button onClick={() => { setActiveTab('services'); setSelectedCategory('Transport'); }} className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 bg-island-emerald/10 text-island-emerald rounded-2xl flex items-center justify-center">
                  <Ship size={24} />
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Book</span>
              </button>
              <button onClick={() => setActiveTab('map')} className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 bg-island-coral/10 text-island-coral rounded-2xl flex items-center justify-center">
                  <MapPin size={24} />
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Spots</span>
              </button>
              <button onClick={() => { setActiveTab('services'); setSelectedCategory('Shops'); }} className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 bg-island-sunset/10 text-island-sunset rounded-2xl flex items-center justify-center">
                  <ShoppingBag size={24} />
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Shop</span>
              </button>
              <button onClick={() => setActiveTab('map')} className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 bg-island-ocean/10 text-island-ocean rounded-2xl flex items-center justify-center">
                  <MapIcon size={24} />
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Map</span>
              </button>
            </div>

            {/* Featured Section */}
            <div className="mb-8">
              <div className="flex justify-between items-end mb-6">
                <h3 className="text-xl font-serif font-bold text-island-green">Must Visit</h3>
                <button className="text-xs font-bold text-island-emerald uppercase tracking-widest">See All</button>
              </div>
              <div className="space-y-6">
                {spots.filter(s => selectedCategory === 'All' || s.category === selectedCategory).map((spot) => (
                  <motion.div 
                    key={spot.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedSpot(spot)}
                    className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm flex gap-4 p-3 cursor-pointer"
                  >
                    <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0">
                      <img src={spot.image} alt={spot.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex flex-col justify-center flex-grow py-1">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-island-green">{spot.name}</h4>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-island-emerald">
                          <Star size={12} fill="currentColor" />
                          {spot.rating}
                        </div>
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">{spot.category}</p>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                        <Navigation size={10} />
                        {spot.distance} away
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'services' && (
          <motion.div 
            key="services"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="px-6"
          >
            <header className="mb-8">
              <p className="text-[10px] font-bold text-island-emerald uppercase tracking-[0.2em] mb-1">Island Services</p>
              <h2 className="text-3xl font-serif font-bold text-island-green italic">Directory</h2>
            </header>

            <div className="grid grid-cols-2 gap-4">
              <ServiceCard 
                icon={Bus} 
                title="Transport" 
                subtitle="Buses, Vans, Boats"
                color="bg-blue-500"
                onClick={() => {
                  setActiveTab('explore');
                  setSelectedCategory('Transport');
                }}
              />
              <ServiceCard 
                icon={ShoppingBag} 
                title="Shops" 
                subtitle="Local Markets & Malls"
                color="bg-island-coral"
                onClick={() => {
                  setActiveTab('explore');
                  setSelectedCategory('Shops');
                }}
              />
              <ServiceCard 
                icon={MapPin} 
                title="Locations" 
                subtitle="Points of Interest"
                color="bg-island-emerald"
                onClick={() => setActiveTab('map')}
              />
              <ServiceCard 
                icon={Store} 
                title="Dining" 
                subtitle="Restaurants & Cafes"
                color="bg-orange-500"
                onClick={() => {
                  setActiveTab('explore');
                  setSelectedCategory('Dining');
                }}
              />
            </div>

            <div className="mt-8 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
              <h4 className="font-bold text-island-green mb-2">Emergency Contacts</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Island Police</span>
                  <span className="font-bold text-island-green">911</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Tourist Assistance</span>
                  <span className="font-bold text-island-green">+63 999 000 0000</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'pass' && (
          <motion.div 
            key="pass"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="px-8 py-4 flex flex-col items-center text-center"
          >
            <div className="w-16 h-16 bg-island-emerald/10 text-island-emerald rounded-2xl flex items-center justify-center mb-6">
              <Ticket size={32} />
            </div>
            <h2 className="text-2xl font-serif font-bold text-island-green mb-2 italic">Island <span className="not-italic">Digital Pass</span></h2>
            <p className="text-slate-500 text-sm font-light mb-10">Scan this code at checkpoints and partner establishments.</p>
            
            <div className="p-10 bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-island-green/5 mb-10 relative">
              <div className="absolute -top-3 -left-3 w-10 h-10 border-t-4 border-l-4 border-island-emerald rounded-tl-xl"></div>
              <div className="absolute -top-3 -right-3 w-10 h-10 border-t-4 border-r-4 border-island-emerald rounded-tr-xl"></div>
              <div className="absolute -bottom-3 -left-3 w-10 h-10 border-b-4 border-l-4 border-island-emerald rounded-bl-xl"></div>
              <div className="absolute -bottom-3 -right-3 w-10 h-10 border-b-4 border-r-4 border-island-emerald rounded-br-xl"></div>
              <QrCode size={180} className="text-island-green" />
            </div>

            <div className="w-full bg-island-green p-6 rounded-[2.5rem] text-white text-left shadow-lg shadow-island-green/20">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest mb-1">Tourist Name</p>
                  <p className="font-bold">Kurt Mier</p>
                </div>
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Compass size={20} />
                </div>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest mb-1">Valid Until</p>
                  <p className="font-bold">Mar 25, 2026</p>
                </div>
                <div className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-bold uppercase tracking-widest">Active</div>
              </div>
            </div>
          </motion.div>
        )}
        {activeTab === 'map' && (
          <motion.div 
            key="map"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full flex flex-col px-6"
          >
            <header className="mb-6">
              <p className="text-[10px] font-bold text-island-emerald uppercase tracking-[0.2em] mb-1">Interactive Guide</p>
              <h2 className="text-3xl font-serif font-bold text-island-green italic">Island <span className="not-italic">Map</span></h2>
            </header>
            
            <div className="flex-1 min-h-[400px] rounded-[2.5rem] overflow-hidden border-4 border-white shadow-xl relative z-0 mb-6">
              <MapContainer 
                center={center} 
                zoom={12} 
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
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
                  {mapLocations.map((loc) => (
                    <Marker 
                      key={loc.id} 
                      position={[loc.lat, loc.lng]} 
                      icon={customIcon}
                    >
                      <Popup>
                        <div className="p-1 min-w-[150px]">
                          <h4 className="font-bold text-island-green m-0 text-sm">{loc.name}</h4>
                          <div className="flex items-center gap-1 text-[10px] font-bold text-island-emerald mt-1">
                            <Users size={10} />
                            {loc.visitors} visitors
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MarkerClusterGroup>
              </MapContainer>
              
              {/* Map Controls Overlay */}
              <div className="absolute bottom-6 right-6 flex flex-col gap-3 z-[1000]">
                <button className="w-12 h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center text-island-green">
                  <Navigation size={20} />
                </button>
                <button className="w-12 h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center text-island-green">
                  <Compass size={20} />
                </button>
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-[2rem] mb-6">
              <div className="flex items-center gap-3 mb-2">
                <Activity size={16} className="text-island-coral animate-pulse" />
                <span className="text-xs font-bold text-island-green">Live Activity Monitoring</span>
              </div>
              <p className="text-[10px] text-slate-500">Real-time visitor density tracking is active for all major island attractions.</p>
            </div>
          </motion.div>
        )}

        {activeTab === 'profile' && (
          <motion.div 
            key="profile"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="px-6"
          >
            <header className="mb-10 flex flex-col items-center text-center pt-8">
              <div className="w-24 h-24 rounded-[2rem] bg-island-emerald/10 border-4 border-white shadow-xl flex items-center justify-center text-island-emerald mb-6 relative">
                <User size={48} />
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-island-green text-white rounded-xl flex items-center justify-center border-4 border-white">
                  <Star size={14} fill="currentColor" />
                </div>
              </div>
              <h2 className="text-2xl font-serif font-bold text-island-green italic">Kurt <span className="not-italic">Mier</span></h2>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Premium Explorer</p>
            </header>

            <div className="space-y-4">
              <ProfileItem icon={Heart} label="My Favorites" count="12" />
              <ProfileItem icon={Ticket} label="My Bookings" count="3" />
              <ProfileItem icon={Clock} label="Travel History" />
              <ProfileItem icon={User} label="Account Settings" />
            </div>

            <button className="w-full mt-12 py-5 bg-slate-50 text-island-coral rounded-[2rem] text-xs font-bold uppercase tracking-widest border border-slate-100 hover:bg-island-coral hover:text-white transition-all">
              Log Out
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Nav */}
      <div className={`absolute bottom-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-xl border-t border-slate-100 px-6 flex items-center justify-between z-50 ${!isDesktop ? 'fixed' : ''}`}>
        <NavButton active={activeTab === 'explore'} onClick={() => setActiveTab('explore')} icon={Compass} label="Explore" />
        <NavButton active={activeTab === 'map'} onClick={() => setActiveTab('map')} icon={MapIcon} label="Map" />
        <div className="relative -top-6">
          <button 
            onClick={() => setActiveTab('pass')}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all ${
              activeTab === 'pass' ? 'bg-island-green text-white scale-110 shadow-island-green/30' : 'bg-island-emerald text-white hover:scale-105'
            }`}
          >
            <QrCode size={24} />
          </button>
        </div>
        <NavButton active={activeTab === 'services'} onClick={() => setActiveTab('services')} icon={LayoutDashboard} label="Services" />
        <NavButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={User} label="Profile" />
      </div>
    </div>
  );

  return (
    <div className={`flex justify-center items-center ${isDesktop ? 'min-h-[calc(100vh-64px)] bg-island-cream p-4 md:p-10' : 'min-h-screen bg-white'}`}>
      {isDesktop ? (
        <div className="relative w-full max-w-[380px] aspect-[9/19.5] bg-white rounded-[3.5rem] shadow-[0_0_0_12px_#1e293b,0_32px_64px_-16px_rgba(0,0,0,0.3)] overflow-hidden border-[8px] border-slate-800">
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-slate-800 rounded-b-3xl z-50 flex items-center justify-center">
            <div className="w-10 h-1 bg-slate-700 rounded-full"></div>
          </div>
          {content}
        </div>
      ) : (
        <div className="w-full h-full">
          {content}
        </div>
      )}
    </div>
  );
}

function ProfileItem({ icon: Icon, label, count }: any) {
  return (
    <button className="w-full p-6 bg-white rounded-[2rem] border border-slate-100 flex items-center justify-between group hover:bg-slate-50 transition-all">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center group-hover:bg-island-emerald/10 group-hover:text-island-emerald transition-all">
          <Icon size={20} />
        </div>
        <span className="text-sm font-bold text-island-green">{label}</span>
      </div>
      {count ? (
        <span className="px-3 py-1 bg-island-emerald/10 text-island-emerald rounded-full text-[10px] font-bold">{count}</span>
      ) : (
        <ChevronRight size={16} className="text-slate-300" />
      )}
    </button>
  );
}

function ServiceCard({ icon: Icon, title, subtitle, color, onClick }: any) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm text-left flex flex-col gap-3"
    >
      <div className={`w-10 h-10 ${color} text-white rounded-xl flex items-center justify-center`}>
        <Icon size={20} />
      </div>
      <div>
        <h4 className="font-bold text-island-green text-sm">{title}</h4>
        <p className="text-[10px] text-slate-400 font-medium">{subtitle}</p>
      </div>
    </motion.button>
  );
}

function NavButton({ active, onClick, icon: Icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-island-green' : 'text-slate-400 hover:text-slate-600'}`}
    >
      <Icon size={20} />
      <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
    </button>
  );
}
