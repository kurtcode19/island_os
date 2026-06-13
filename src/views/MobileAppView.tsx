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
  RefreshCw,
  Zap
} from 'lucide-react';
import { locations } from '../data/locations';
import { useAuth } from '../context/AuthContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, serverTimestamp, onSnapshot, query, where, orderBy, doc, updateDoc } from 'firebase/firestore';
import { accommodations } from '../data/accommodations';
import { transportOptions } from '../data/transport';
import { useNavigate } from 'react-router-dom';
import IslandMap from '../components/IslandMap';

const categories = ['All', 'Heritage', 'Nature', 'Stay', 'Transport', 'Dining', 'Shops', 'Planner'];

const spots = [
  {
    id: 1,
    name: 'Sunken Cemetery',
    category: 'Heritage',
    rating: 4.9,
    image: 'https://img.atlasobscura.com/CmlPBCqrdngS4DE4q_DDyDdVYBjhcSTHrsI9PUEbvkQ/rs:fill:780:520:1/g:ce/q:81/sm:1/scp:1/ar:1/aHR0cHM6Ly9hdGxh/cy1kZXYuczMuYW1h/em9uYXdzLmNvbS91/cGxvYWRzL3BsYWNl/X2ltYWdlcy85OTA0/ZjhlMDJiMGM0ODM5/NWJfU3Vua2VuX0Nl/bWV0ZXJ5LF9DYXRh/cm1hbixfQ2FtaWd1/aW4uanBn.jpg',
    distance: '0.8 km'
  },
  {
    id: 2,
    name: 'Old Church Ruins',
    category: 'Heritage',
    rating: 4.8,
    image: 'https://files01.pna.gov.ph/source/2024/05/06/camiguin-old-church-ruins-05032024jb.jpg',
    distance: '1.2 km'
  },
  {
    id: 7,
    name: 'Tuasan Falls',
    category: 'Nature',
    rating: 4.9,
    image: 'https://thefroggyadventures.com/wp-content/uploads/2024/10/tuasan-falls-camiguin.jpg',
    distance: '3.5 km'
  },
  {
    id: 8,
    name: 'Soda Water Park',
    category: 'Nature',
    rating: 4.7,
    image: 'https://www.lanzonescabana.com/custom/domain_4/image_files/sitemgr_photo_21.png',
    distance: '2.4 km'
  }
];

export default function MobileAppView() {
  const { user, profile, login, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('explore');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSpot, setSelectedSpot] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [bookingStatus, setBookingStatus] = useState<{[key: string]: 'idle' | 'loading' | 'success'}>({});

  const isDesktop = window.innerWidth >= 768;

  // Sync activeTab with query param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab && ['explore', 'map', 'services', 'pass', 'profile'].includes(tab)) {
      setActiveTab(tab);
    } else if (!tab) {
      setActiveTab('explore');
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
      console.error("Booking Listener Error:", error);
    });

    return () => unsubscribe();
  }, [user]);

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
        navigate('/mobile?tab=profile');
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

  const content = (
    <div className={`h-full flex flex-col pt-6 pb-6 overflow-y-auto no-scrollbar bg-[#F0FDF4] ${!isDesktop ? 'min-h-screen' : ''}`}>
      <AnimatePresence mode="wait">
        {selectedSpot ? (
          <motion.div 
            key="spot-detail"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute inset-0 bg-white z-[60] flex flex-col"
          >
            <div className="relative h-[48vh]">
              <img src={selectedSpot.image} alt={selectedSpot.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/30"></div>
              <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={() => setSelectedSpot(null)}
                className="absolute top-8 left-8 w-14 h-14 bg-black/40 backdrop-blur-2xl rounded-full flex items-center justify-center text-white border border-white/20 shadow-2xl active:scale-90"
              >
                <ArrowLeft size={28} strokeWidth={3} />
              </motion.button>
              
              <div className="absolute bottom-10 left-10 right-10 flex justify-between items-end">
                <div>
                  <span className="text-[11px] font-black uppercase tracking-[0.4em] text-white mb-3 block bg-island-emerald px-4 py-1.5 rounded-full shadow-2xl w-fit">
                    {selectedSpot.category || selectedSpot.type}
                  </span>
                  <h2 className="text-5xl font-black tracking-tighter drop-shadow-2xl text-island-volcanic">{selectedSpot.name}</h2>
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-[1.5rem] shadow-2xl border border-emerald-50">
                  <Star size={20} fill="#D97706" className="text-island-sunset" />
                  <span className="text-base font-black tracking-tight text-island-volcanic">{selectedSpot.rating || '4.5'}</span>
                </div>
              </div>
            </div>

            <div className="p-12 flex-1 flex flex-col bg-[#FDFDFB]">
              <div className="flex gap-10 mb-12 overflow-x-auto no-scrollbar pb-4 border-b-2 border-emerald-50">
                <div className="flex flex-col gap-1.5 shrink-0">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Estimated Entry</span>
                  <span className="text-2xl font-black text-island-green">₱{selectedSpot.price?.toLocaleString() || '150'}</span>
                </div>
                <div className="flex flex-col gap-1.5 shrink-0">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Island Node</span>
                  <span className="text-2xl font-black text-island-green">Active</span>
                </div>
                <div className="flex flex-col gap-1.5 shrink-0">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Pilot Type</span>
                  <span className="text-2xl font-black text-island-emerald">Verified</span>
                </div>
              </div>

              <p className="text-island-green/70 text-lg font-medium leading-relaxed mb-12">
                {selectedSpot.type === 'stay' ? `Secure your premium accommodation at ${selectedSpot.name}. Experience Catarman's hospitality at its finest.` : 
                 selectedSpot.type === 'transport' ? `Efficient transit via ${selectedSpot.provider}. Direct access to municipal hubs.` :
                 `Explore the profound heritage of ${selectedSpot.name}. A cornerstone of the Catarman pilot experience.`}
              </p>
              
              <div className="mt-auto">
                {selectedSpot.type === 'spot' ? (
                  <motion.button 
                    whileTap={{ scale: 0.95 }}
                    className="btn-volcanic w-full py-7 text-sm shadow-emerald-900/20"
                  >
                    <Navigation size={24} strokeWidth={3} />
                    Route Instructions
                  </motion.button>
                ) : (
                  <motion.button 
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleBook(selectedSpot, selectedSpot.type)}
                    disabled={bookingStatus[selectedSpot.id] === 'loading' || bookingStatus[selectedSpot.id] === 'success'}
                    className={`btn-primary w-full py-7 text-sm ${
                      bookingStatus[selectedSpot.id] === 'success' ? 'bg-green-700 shadow-none' : ''
                    }`}
                  >
                    {bookingStatus[selectedSpot.id] === 'success' ? (
                      <><CheckCircle2 size={24} strokeWidth={3} /> Booking Active</>
                    ) : bookingStatus[selectedSpot.id] === 'loading' ? (
                      <RefreshCw size={24} className="animate-spin" />
                    ) : (
                      <>Reserve Experience Now</>
                    )}
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        ) : null}

        {activeTab === 'explore' && (
          <motion.div 
            key="explore"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="px-8"
          >
            <header className="mb-12 pt-6 flex justify-between items-start">
              <div>
                <span className="text-[10px] font-black text-island-emerald uppercase tracking-[0.5em] mb-3 block">Catarman Pilot</span>
                <h2 className="text-6xl font-bold text-island-green tracking-tighter leading-none">Discover.</h2>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-white shadow-xl shadow-emerald-900/5 flex items-center justify-center text-island-green border border-emerald-50 active:scale-90 transition-transform">
                <Bell size={24} strokeWidth={3} />
              </div>
            </header>

            {/* Premium Search */}
            <div className="relative mb-12">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-300">
                <Search size={24} strokeWidth={3} />
              </div>
              <input 
                type="text" 
                placeholder="Search the municipality..." 
                className="w-full pl-16 pr-16 py-7 bg-white border-2 border-emerald-50 rounded-[2.5rem] text-base font-bold shadow-2xl focus:ring-8 focus:ring-island-emerald/5 focus:border-island-emerald/30 transition-all outline-none"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 w-14 h-14 forest-gradient text-white rounded-[1.75rem] flex items-center justify-center shadow-xl active:scale-90">
                <Filter size={24} strokeWidth={3} />
              </button>
            </div>

            {/* Horizontal Categories */}
            <div className="flex gap-4 overflow-x-auto no-scrollbar mb-12 -mx-6 px-6">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-8 py-4 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
                    selectedCategory === cat 
                      ? 'forest-gradient text-white shadow-xl' 
                      : 'bg-white border-2 border-emerald-50 text-island-green/60 hover:border-emerald-200 hover:bg-emerald-50/30'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Quick Pulse Actions */}
            <div className="grid grid-cols-4 gap-6 mb-16">
              {[
                { icon: Ship, label: 'Transport', gradient: 'lush-gradient', tab: 'services', cat: 'Transport' },
                { icon: MapPin, label: 'Spots', gradient: 'emerald-gradient', tab: 'map' },
                { icon: ShoppingBag, label: 'Market', gradient: 'lush-gradient', tab: 'services', cat: 'Shops' },
                { icon: Zap, label: 'AI Trip', gradient: 'forest-gradient', link: '/planner' }
              ].map((action, i) => (
                <motion.button 
                  key={i}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    if (action.link) navigate(action.link);
                    else if (action.tab) {
                      navigate(`/mobile?tab=${action.tab}`);
                      if (action.cat) setSelectedCategory(action.cat);
                    }
                  }} 
                  className="flex flex-col items-center gap-4"
                >
                  <div className={`w-16 h-16 ${action.gradient} text-white rounded-[1.75rem] flex items-center justify-center shadow-2xl border border-white/10`}>
                    <action.icon size={28} strokeWidth={3} />
                  </div>
                  <span className="text-[10px] font-black text-island-green/40 uppercase tracking-widest">{action.label}</span>
                </motion.button>
              ))}
            </div>

            {/* High-Impact Discovery Grid */}
            <div className="mb-12">
              <div className="flex justify-between items-end mb-8">
                <h3 className="text-3xl font-black text-island-green tracking-tighter">
                  {selectedCategory === 'All' ? 'Local Favorites' : selectedCategory}
                </h3>
                <button className="text-[10px] font-black text-island-emerald uppercase tracking-widest bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">Explore All</button>
              </div>
              
              <div className="space-y-10 pb-12">
                {/* Spot Cards */}
                {(selectedCategory === 'All' || ['Heritage', 'Nature'].includes(selectedCategory)) && 
                  spots.filter(s => selectedCategory === 'All' || s.category === selectedCategory).map((spot) => (
                    <motion.div 
                      key={`spot-${spot.id}`}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedSpot({ ...spot, type: 'spot', price: 150 })}
                      className="group relative bg-white rounded-[3.5rem] border-2 border-emerald-50 overflow-hidden shadow-2xl p-5 cursor-pointer"
                    >
                      <div className="relative h-72 rounded-[2.75rem] overflow-hidden mb-8">
                        <img src={spot.image} alt={spot.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" referrerPolicy="no-referrer" />
                        <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-xl px-5 py-2.5 rounded-2xl flex items-center gap-2 text-island-green shadow-2xl border border-white">
                          <Star size={18} fill="#D97706" className="text-island-sunset" />
                          <span className="text-sm font-black">{spot.rating}</span>
                        </div>
                      </div>
                      <div className="px-5 pb-5">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="text-3xl font-black text-island-green tracking-tighter">{spot.name}</h4>
                          <div className="flex items-center gap-2 text-[10px] font-black text-island-emerald uppercase tracking-widest">
                            <MapPin size={14} strokeWidth={4} />
                            {spot.distance}
                          </div>
                        </div>
                        <p className="text-xs font-black text-emerald-900/30 uppercase tracking-[0.3em]">{spot.category}</p>
                      </div>
                    </motion.div>
                ))}

                {/* Stay Cards */}
                {(selectedCategory === 'All' || selectedCategory === 'Stay') && 
                  accommodations.map((stay) => (
                    <motion.div 
                      key={`stay-${stay.id}`}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedSpot({ ...stay, type: 'stay' })}
                      className="bg-white rounded-[3.5rem] border-2 border-emerald-50 overflow-hidden shadow-2xl p-5 cursor-pointer"
                    >
                      <div className="relative h-72 rounded-[2.75rem] overflow-hidden mb-8">
                        <img src={stay.image} alt={stay.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-xl px-5 py-2.5 rounded-2xl flex items-center gap-2 text-island-green shadow-2xl border border-white">
                          <Star size={18} fill="#D97706" className="text-island-sunset" />
                          <span className="text-sm font-black">{stay.rating}</span>
                        </div>
                      </div>
                      <div className="px-5 pb-5">
                        <div className="flex justify-between items-end">
                          <div>
                            <h4 className="text-3xl font-black text-island-green tracking-tighter mb-2">{stay.name}</h4>
                            <p className="text-[10px] font-black text-emerald-900/30 uppercase tracking-[0.3em]">{stay.type}</p>
                          </div>
                          <div className="text-right">
                            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">From</span>
                            <span className="text-2xl font-black text-island-emerald">₱{stay.price.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                ))}
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

        {activeTab === 'pass' && (
          <motion.div 
            key="pass"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="px-8 flex flex-col items-center pb-12"
          >
            <header className="mb-14 text-center pt-8">
              <div className="w-24 h-24 forest-gradient text-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl border border-white/10">
                <Ticket size={48} strokeWidth={2.5} />
              </div>
              <h2 className="text-5xl font-black text-island-green tracking-tighter mb-3">Municipal Pass</h2>
              <p className="text-island-green/60 text-base font-medium tracking-tight">Catarman Pilot Identity Manifest</p>
            </header>
            
            <div className="w-full aspect-square max-w-[340px] bg-white rounded-[4.5rem] border-[16px] border-emerald-50 shadow-2xl flex items-center justify-center relative group p-12 mb-16">
              <div className="absolute top-10 left-10 w-10 h-10 border-t-4 border-l-4 border-island-emerald rounded-tl-xl group-hover:scale-110 transition-transform"></div>
              <div className="absolute top-10 right-10 w-10 h-10 border-t-4 border-r-4 border-island-emerald rounded-tr-xl group-hover:scale-110 transition-transform"></div>
              <div className="absolute bottom-10 left-10 w-10 h-10 border-b-4 border-l-4 border-island-emerald rounded-bl-xl group-hover:scale-110 transition-transform"></div>
              <div className="absolute bottom-10 right-10 w-10 h-10 border-b-4 border-r-4 border-island-emerald rounded-br-xl group-hover:scale-110 transition-transform"></div>
              <QrCode size={220} strokeWidth={1} className="text-island-volcanic" />
            </div>

            <div className="w-full forest-gradient p-12 rounded-[4rem] text-white shadow-2xl overflow-hidden relative border border-white/10">
              <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
                <Sparkles size={250} className="translate-x-12 -translate-y-12 rotate-12" />
              </div>
              <div className="flex justify-between items-start mb-12 relative z-10">
                <div>
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] mb-3 block">Operational Clearance</span>
                  <p className="text-3xl font-black tracking-tighter">{user?.displayName || 'Catarman Guest'}</p>
                </div>
                <div className="w-16 h-16 bg-white/10 backdrop-blur-2xl rounded-2xl flex items-center justify-center border border-white/20">
                  <ShieldCheck size={32} strokeWidth={3} className="text-island-emerald" />
                </div>
              </div>
              <div className="flex justify-between items-end relative z-10">
                <div className="space-y-2">
                  <span className="block text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">Node Assignment</span>
                  <span className="font-mono text-xs font-black tracking-[0.5em] text-island-emerald">CTRM-P-2026-9X</span>
                </div>
                <div className="px-6 py-3 bg-emerald-500 text-white rounded-full text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl border border-white/20">
                  SECURE
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'profile' && (
          <motion.div 
            key="profile"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="px-8 pb-12"
          >
            <header className="mb-16 flex flex-col items-center text-center pt-8">
              <div className="w-40 h-40 rounded-[3.5rem] bg-white border-[10px] border-emerald-50 shadow-2xl flex items-center justify-center relative overflow-hidden mb-8">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || ''} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <User size={80} className="text-emerald-100" />
                )}
                <div className="absolute -bottom-2 -right-2 w-12 h-12 emerald-gradient text-white rounded-2xl flex items-center justify-center border-4 border-white shadow-2xl">
                  <CheckCircle2 size={20} strokeWidth={4} />
                </div>
              </div>
              <h2 className="text-4xl font-black text-island-green tracking-tighter">
                {user?.displayName || 'Digital Agent'}
              </h2>
              <p className="text-island-emerald text-[11px] font-black uppercase tracking-[0.4em] mt-4 bg-emerald-50 px-6 py-2 rounded-full border border-emerald-100">
                {profile?.role || 'TOURIST'} • PILOT MODE
              </p>
            </header>

            {!user ? (
              <button 
                onClick={login}
                className="btn-primary w-full py-7 rounded-[2.5rem] text-sm"
              >
                Initialize Manifest
              </button>
            ) : (
              <div className="space-y-12">
                {/* Real-time Journey Logs */}
                <div>
                  <div className="flex justify-between items-center mb-8 px-4">
                    <h3 className="text-2xl font-black text-island-green tracking-tighter">Active Nodes</h3>
                    <span className="text-[11px] font-black text-island-green uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full">
                      {bookings.length} Verified
                    </span>
                  </div>
                  
                  <div className="space-y-6 max-h-[45vh] overflow-y-auto no-scrollbar pr-2 pb-6">
                    {bookings.length === 0 ? (
                      <div className="py-20 bg-white rounded-[3.5rem] text-center border-2 border-dashed border-emerald-50 shadow-sm">
                        <Sparkles className="mx-auto text-emerald-100 mb-6" size={64} />
                        <p className="text-xs font-black text-island-green/30 uppercase tracking-[0.3em]">No Active Nodes</p>
                      </div>
                    ) : (
                      bookings.map((booking) => (
                        <div key={booking.id} className="p-8 bg-white rounded-[2.5rem] border-2 border-emerald-50 shadow-2xl relative overflow-hidden group">
                          {booking.paymentStatus === 'PAID' && (
                             <div className="absolute top-0 right-0 w-20 h-20 emerald-gradient text-white rounded-bl-[3rem] flex items-center justify-center shadow-lg">
                               <CheckCircle2 size={32} strokeWidth={3} />
                             </div>
                          )}
                          <div className="mb-6">
                            <span className="text-[10px] font-black text-island-emerald uppercase tracking-[0.3em] mb-2 block">{booking.serviceType}</span>
                            <h4 className="text-2xl font-black text-island-green tracking-tighter leading-none">{booking.serviceName}</h4>
                          </div>
                          <div className="flex justify-between items-end">
                            <div className="space-y-1">
                              <span className="block text-[10px] font-black text-island-green/40 uppercase tracking-widest">Confirmed Manifest</span>
                              <span className="text-2xl font-black text-island-green">₱{booking.amount?.toLocaleString()}</span>
                            </div>
                            {booking.paymentStatus === 'UNPAID' && (
                              <button 
                                onClick={() => handlePay(booking.id)}
                                className="btn-volcanic px-8 py-4 rounded-2xl text-[10px]"
                              >
                                Verify & Pay
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <ProfileItem icon={Building2} label="Claim Business Node" onClick={() => navigate('/claim-business')} />
                  <ProfileItem icon={LayoutDashboard} label="Operational Metrics" onClick={() => navigate('/government')} />
                </div>

                <button 
                  onClick={logout}
                  className="w-full mt-16 py-7 bg-emerald-50 text-island-coral rounded-[2.5rem] text-xs font-black uppercase tracking-[0.3em] border-2 border-emerald-100 active:scale-95 transition-all"
                >
                  Terminate Interface Session
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div className={`flex justify-center items-center ${isDesktop ? 'min-h-[calc(100vh-64px)] bg-[#F0FDF4] p-6 md:p-14' : 'min-h-screen bg-white'}`}>
      {isDesktop ? (
        <div className="relative w-full max-w-[440px] aspect-[9/19.5] bg-[#FDFDFB] rounded-[5rem] shadow-[0_0_0_14px_#022C22,0_60px_100px_-20px_rgba(2,44,34,0.45)] overflow-hidden border-[12px] border-island-volcanic ring-[16px] ring-white">
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-10 bg-island-volcanic rounded-b-[2.5rem] z-50 flex items-center justify-center">
            <div className="w-14 h-1.5 bg-white/20 rounded-full"></div>
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
      className="w-full p-8 bg-white rounded-[3rem] border-2 border-emerald-50 flex items-center justify-between group hover:bg-emerald-50/30 hover:border-island-emerald/20 transition-all shadow-sm active:scale-[0.98]"
    >
      <div className="flex items-center gap-6">
        <div className="w-14 h-14 bg-emerald-50/50 text-island-green rounded-2xl flex items-center justify-center group-hover:emerald-gradient group-hover:text-white transition-all duration-500 border border-emerald-100">
          <Icon size={26} strokeWidth={2.5} />
        </div>
        <span className="text-lg font-black text-island-green tracking-tighter">{label}</span>
      </div>
      {count ? (
        <span className="px-4 py-1.5 bg-island-emerald text-white rounded-full text-[10px] font-black shadow-xl">{count}</span>
      ) : (
        <ChevronRight size={22} strokeWidth={3} className="text-emerald-100 group-hover:text-island-emerald group-hover:translate-x-1 transition-all" />
      )}
    </button>
  );
}
