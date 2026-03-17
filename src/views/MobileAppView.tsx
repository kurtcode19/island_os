import { useState } from 'react';
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
  LayoutDashboard
} from 'lucide-react';

const categories = ['All', 'Beaches', 'Hiking', 'Waterfalls', 'Dining', 'Shops'];

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

  const isDesktop = window.innerWidth >= 768;

  const content = (
    <div className={`h-full flex flex-col pt-10 pb-20 overflow-y-auto no-scrollbar bg-white ${!isDesktop ? 'min-h-screen' : ''}`}>
      <AnimatePresence mode="wait">
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

            {/* Featured Section */}
            <div className="mb-8">
              <div className="flex justify-between items-end mb-6">
                <h3 className="text-xl font-serif font-bold text-island-green">Must Visit</h3>
                <button className="text-xs font-bold text-island-emerald uppercase tracking-widest">See All</button>
              </div>
              <div className="space-y-6">
                {spots.map((spot) => (
                  <motion.div 
                    key={spot.id}
                    whileTap={{ scale: 0.98 }}
                    className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm flex gap-4 p-3"
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
              />
              <ServiceCard 
                icon={ShoppingBag} 
                title="Shops" 
                subtitle="Local Markets & Malls"
                color="bg-island-coral"
              />
              <ServiceCard 
                icon={MapPin} 
                title="Locations" 
                subtitle="Points of Interest"
                color="bg-island-emerald"
              />
              <ServiceCard 
                icon={Store} 
                title="Dining" 
                subtitle="Restaurants & Cafes"
                color="bg-orange-500"
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

function ServiceCard({ icon: Icon, title, subtitle, color }: any) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
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
