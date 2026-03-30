import { useState, useEffect, useMemo } from 'react';
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
  Camera,
  CheckCircle2,
  CreditCard,
  LogOut,
  LogIn,
  ShieldCheck,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import { locations } from '../data/locations';
import { useAuth } from '../App';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, serverTimestamp, onSnapshot, query, where, orderBy, doc, updateDoc } from 'firebase/firestore';
import { accommodations } from '../data/accommodations';
import { transportOptions } from '../data/transport';
import { Link, useNavigate } from 'react-router-dom';
import IslandMap from '../components/IslandMap';

// Fix for default marker icon issue in Leaflet with React
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const categories = ['All', 'Beaches', 'Hiking', 'Waterfalls', 'Stay', 'Transport', 'Dining', 'Shops', 'Planner'];

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
  const { user, profile, login, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('explore');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSpot, setSelectedSpot] = useState<any>(null);
  const [mapLocations, setMapLocations] = useState(locations);
  const [bookings, setBookings] = useState<any[]>([]);
  const [bookingStatus, setBookingStatus] = useState<{[key: string]: 'idle' | 'loading' | 'success'}>({});

  const isDesktop = window.innerWidth >= 768;

  // Sync activeTab with query param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab && ['explore', 'map', 'services', 'pass', 'profile'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [window.location.search]);

  // Real-time bookings listener
  useEffect(() => {
    if (!user) {
      setBookings([]);
      return;
    }

    const q = query(
      collection(db, 'bookings'),
      where('touristUid', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bookingsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBookings(bookingsData);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'bookings');
    });

    return () => unsubscribe();
  }, [user]);

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

  const handleBook = async (item: any, type: 'stay' | 'transport') => {
    if (!user) {
      login();
      return;
    }

    const itemId = item.id;
    setBookingStatus(prev => ({ ...prev, [itemId]: 'loading' }));

    try {
      await addDoc(collection(db, 'bookings'), {
        touristUid: user.uid,
        touristName: user.displayName || 'Anonymous',
        touristEmail: user.email || '',
        serviceId: item.id,
        serviceName: item.name || item.title,
        serviceType: type,
        businessId: item.businessId,
        date: new Date().toLocaleDateString(),
        status: 'pending',
        paymentStatus: 'UNPAID',
        amount: item.price,
        createdAt: serverTimestamp()
      });
      
      setBookingStatus(prev => ({ ...prev, [itemId]: 'success' }));
      setTimeout(() => {
        setBookingStatus(prev => ({ ...prev, [itemId]: 'idle' }));
        setSelectedSpot(null);
        setActiveTab('profile'); // Go to profile to see bookings
      }, 2000);
    } catch (error) {
      setBookingStatus(prev => ({ ...prev, [itemId]: 'idle' }));
      handleFirestoreError(error, OperationType.CREATE, 'bookings');
    }
  };

  const handlePay = async (bookingId: string) => {
    try {
      await updateDoc(doc(db, 'bookings', bookingId), {
        paymentStatus: 'PAID',
        status: 'confirmed'
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `bookings/${bookingId}`);
    }
  };

  const filteredStays = useMemo(() => {
    return accommodations.filter(s => selectedCategory === 'All' || selectedCategory === 'Stay');
  }, [selectedCategory]);

  const filteredTransport = useMemo(() => {
    return transportOptions.filter(t => selectedCategory === 'All' || selectedCategory === 'Transport');
  }, [selectedCategory]);

  const content = (
    <div className={`h-full flex flex-col pt-4 pb-4 overflow-y-auto no-scrollbar bg-island-cream ${!isDesktop ? 'min-h-screen' : ''}`}>
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
              <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={() => setSelectedSpot(null)}
                className="absolute top-6 left-6 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white"
              >
                <ArrowLeft size={20} />
              </motion.button>
            </div>
            <div className="p-8 flex-1">
              <div className="flex justify-between items-start mb-4">
                <span className="px-3 py-1 bg-island-emerald/10 text-island-emerald rounded-full text-[10px] font-bold uppercase tracking-widest">
                  {selectedSpot.category || selectedSpot.type}
                </span>
                <div className="flex items-center gap-1 text-island-sunset">
                  <Star size={14} fill="currentColor" />
                  <span className="text-xs font-bold">{selectedSpot.rating || '4.5'}</span>
                </div>
              </div>
              <h2 className="text-3xl font-serif font-bold text-island-green mb-4 italic">{selectedSpot.name}</h2>
              <p className="text-slate-500 text-sm font-light leading-relaxed mb-8">
                {selectedSpot.type === 'stay' ? `Book your stay at ${selectedSpot.name} for a comfortable island experience.` : 
                 selectedSpot.type === 'transport' ? `Reliable transport provided by ${selectedSpot.provider}. Route: ${selectedSpot.route}` :
                 `Experience the breathtaking beauty of ${selectedSpot.name}. This destination offers unique insights into Camiguin's rich natural and historical heritage.`}
              </p>
              
              {selectedSpot.type === 'spot' ? (
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  className="w-full py-4 island-gradient text-white rounded-2xl font-bold shadow-lg shadow-island-emerald/20 flex items-center justify-center gap-2"
                >
                  <Navigation size={18} />
                  Get Directions
                </motion.button>
              ) : (
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleBook(selectedSpot, selectedSpot.type)}
                  disabled={bookingStatus[selectedSpot.id] === 'loading' || bookingStatus[selectedSpot.id] === 'success'}
                  className={`w-full py-4 rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2 transition-all ${
                    bookingStatus[selectedSpot.id] === 'success' ? 'bg-green-500 text-white' :
                    bookingStatus[selectedSpot.id] === 'loading' ? 'bg-slate-100 text-slate-400' :
                    'island-gradient text-white shadow-island-emerald/20'
                  }`}
                >
                  {bookingStatus[selectedSpot.id] === 'success' ? (
                    <><CheckCircle2 size={18} /> Confirmed</>
                  ) : bookingStatus[selectedSpot.id] === 'loading' ? (
                    <RefreshCw size={18} className="animate-spin" />
                  ) : (
                    <>Book Now - ₱{selectedSpot.price.toLocaleString()}</>
                  )}
                </motion.button>
              )}
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
            <header className="mb-8">
              <p className="text-[10px] font-bold text-island-emerald uppercase tracking-[0.2em] mb-1">Welcome to</p>
              <h2 className="text-3xl font-serif font-bold text-island-green italic">Camiguin</h2>
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
              <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={() => { setActiveTab('services'); setSelectedCategory('Transport'); }} 
                className="flex flex-col items-center gap-2"
              >
                <div className="w-14 h-14 bg-island-emerald/10 text-island-emerald rounded-2xl flex items-center justify-center">
                  <Ship size={24} />
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Book</span>
              </motion.button>
              <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={() => setActiveTab('map')} 
                className="flex flex-col items-center gap-2"
              >
                <div className="w-14 h-14 bg-island-coral/10 text-island-coral rounded-2xl flex items-center justify-center">
                  <MapPin size={24} />
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Spots</span>
              </motion.button>
              <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={() => { setActiveTab('services'); setSelectedCategory('Shops'); }} 
                className="flex flex-col items-center gap-2"
              >
                <div className="w-14 h-14 bg-island-sunset/10 text-island-sunset rounded-2xl flex items-center justify-center">
                  <ShoppingBag size={24} />
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Shop</span>
              </motion.button>
              <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={() => setActiveTab('map')} 
                className="flex flex-col items-center gap-2"
              >
                <div className="w-14 h-14 bg-island-ocean/10 text-island-ocean rounded-2xl flex items-center justify-center">
                  <MapIcon size={24} />
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Map</span>
              </motion.button>
            </div>

            {/* Featured Section */}
            <div className="mb-8">
              <div className="flex justify-between items-end mb-6">
                <h3 className="text-xl font-serif font-bold text-island-green">
                  {selectedCategory === 'All' ? 'Must Visit' : selectedCategory}
                </h3>
                <button className="text-xs font-bold text-island-emerald uppercase tracking-widest">See All</button>
              </div>
              <div className="space-y-6">
                {/* Hardcoded spots */}
                {(selectedCategory === 'All' || ['Beaches', 'Hiking', 'Waterfalls'].includes(selectedCategory)) && 
                  spots.filter(s => selectedCategory === 'All' || s.category === selectedCategory).map((spot) => (
                    <motion.div 
                      key={`spot-${spot.id}`}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedSpot({ ...spot, type: 'spot' })}
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

                {/* Real Stays */}
                {(selectedCategory === 'All' || selectedCategory === 'Stay') && 
                  accommodations.map((stay) => (
                    <motion.div 
                      key={`stay-${stay.id}`}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedSpot({ ...stay, type: 'stay' })}
                      className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm flex gap-4 p-3 cursor-pointer"
                    >
                      <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0">
                        <img src={stay.image} alt={stay.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="flex flex-col justify-center flex-grow py-1">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-bold text-island-green">{stay.name}</h4>
                          <div className="flex items-center gap-1 text-[10px] font-bold text-island-emerald">
                            <Star size={12} fill="currentColor" />
                            {stay.rating}
                          </div>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">{stay.type}</p>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-island-emerald">
                          ₱{stay.price.toLocaleString()} / night
                        </div>
                      </div>
                    </motion.div>
                ))}

                {/* Real Transport */}
                {(selectedCategory === 'All' || selectedCategory === 'Transport') && 
                  transportOptions.map((trans) => (
                    <motion.div 
                      key={`trans-${trans.id}`}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedSpot({ ...trans, type: 'transport', name: trans.title })}
                      className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm flex gap-4 p-3 cursor-pointer"
                    >
                      <div className={`w-24 h-24 rounded-2xl ${trans.color}/10 flex items-center justify-center text-island-green flex-shrink-0`}>
                        <trans.icon size={32} className={trans.color.replace('bg-', 'text-')} />
                      </div>
                      <div className="flex flex-col justify-center flex-grow py-1">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-bold text-island-green">{trans.title}</h4>
                          <div className="flex items-center gap-1 text-[10px] font-bold text-island-emerald">
                            ₱{trans.price.toLocaleString()}
                          </div>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">{trans.provider}</p>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                          <Clock size={10} />
                          {trans.duration}
                        </div>
                      </div>
                    </motion.div>
                ))}

                {/* AI Planner Teaser */}
                {(selectedCategory === 'All' || selectedCategory === 'Planner') && (
                  <motion.div 
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/planner')}
                    className="bg-island-green rounded-[2rem] border border-slate-100 overflow-hidden shadow-lg flex gap-4 p-4 cursor-pointer text-white relative"
                  >
                    <div className="absolute top-0 right-0 opacity-10">
                      <Sparkles size={100} className="rotate-12" />
                    </div>
                    <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
                      <Sparkles size={32} />
                    </div>
                    <div className="flex flex-col justify-center flex-grow py-1 relative z-10">
                      <h4 className="font-bold text-white">Smart Trip Planner</h4>
                      <p className="text-[10px] font-bold text-emerald-100/70 uppercase tracking-widest mb-2">AI-Powered Itinerary</p>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-island-emerald">
                        Try it now <ChevronRight size={12} />
                      </div>
                    </div>
                  </motion.div>
                )}
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
                  <p className="font-bold">{user?.displayName || 'Guest'}</p>
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
                <div className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-bold uppercase tracking-widest">
                  {user ? 'Active' : 'Inactive'}
                </div>
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
            className="h-full w-full"
          >
            <IslandMap />
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
              <div className="w-24 h-24 rounded-[2rem] bg-island-emerald/10 border-4 border-white shadow-xl flex items-center justify-center text-island-emerald mb-6 relative overflow-hidden">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || ''} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <User size={48} />
                )}
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-island-green text-white rounded-xl flex items-center justify-center border-4 border-white">
                  <Star size={14} fill="currentColor" />
                </div>
              </div>
              <h2 className="text-2xl font-serif font-bold text-island-green italic">
                {user?.displayName?.split(' ')[0] || 'Guest'} <span className="not-italic">{user?.displayName?.split(' ')[1] || ''}</span>
              </h2>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
                {profile?.role || 'TOURIST'}
              </p>
            </header>

            {!user ? (
              <button 
                onClick={login}
                className="w-full py-5 island-gradient text-white rounded-[2rem] text-xs font-bold uppercase tracking-widest shadow-lg shadow-island-emerald/20"
              >
                Sign In to IsleGO
              </button>
            ) : (
              <div className="space-y-6">
                {/* My Bookings Section */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-serif font-bold text-island-green italic">My Bookings</h3>
                    <span className="px-3 py-1 bg-island-emerald/10 text-island-emerald rounded-full text-[10px] font-bold">
                      {bookings.length} Total
                    </span>
                  </div>
                  
                  <div className="space-y-4 max-h-80 overflow-y-auto no-scrollbar pr-2">
                    {bookings.length === 0 ? (
                      <div className="p-8 bg-slate-50 rounded-3xl text-center border border-dashed border-slate-200">
                        <Ticket className="mx-auto text-slate-300 mb-2" size={32} />
                        <p className="text-xs text-slate-400 font-medium">No bookings yet. Start exploring!</p>
                      </div>
                    ) : (
                      bookings.map((booking) => (
                        <div key={booking.id} className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="text-sm font-bold text-island-green">{booking.serviceName}</h4>
                              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{booking.serviceType}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest ${
                              booking.paymentStatus === 'PAID' ? 'bg-green-100 text-green-600' : 'bg-island-coral/10 text-island-coral'
                            }`}>
                              {booking.paymentStatus}
                            </span>
                          </div>
                          <div className="flex justify-between items-end">
                            <p className="text-xs font-bold text-island-emerald">₱{booking.amount.toLocaleString()}</p>
                            {booking.paymentStatus === 'UNPAID' && (
                              <button 
                                onClick={() => handlePay(booking.id)}
                                className="px-4 py-2 bg-island-green text-white rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-md"
                              >
                                Pay Now
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <ProfileItem icon={Building2} label="Claim Business" onClick={() => navigate('/claim-business')} />
                  <ProfileItem icon={LayoutDashboard} label="Business Dashboard" onClick={() => navigate('/business')} />
                  <ProfileItem icon={ShieldCheck} label="LGU Dashboard" onClick={() => navigate('/government')} />
                  <ProfileItem icon={Heart} label="My Favorites" count="12" />
                </div>

                <button 
                  onClick={logout}
                  className="w-full mt-8 py-5 bg-slate-50 text-island-coral rounded-[2rem] text-xs font-bold uppercase tracking-widest border border-slate-100 hover:bg-island-coral hover:text-white transition-all"
                >
                  Log Out
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
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

function ProfileItem({ icon: Icon, label, count, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className="w-full p-6 bg-white rounded-[2rem] border border-slate-100 flex items-center justify-between group hover:bg-slate-50 transition-all"
    >
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
