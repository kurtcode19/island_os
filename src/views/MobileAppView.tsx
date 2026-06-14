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

const categories = [
  { name: 'All', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=100' },
  { name: 'Heritage', image: 'https://files01.pna.gov.ph/source/2024/05/06/camiguin-old-church-ruins-05032024jb.jpg' },
  { name: 'Nature', image: 'https://thefroggyadventures.com/wp-content/uploads/2024/10/tuasan-falls-camiguin.jpg' },
  { name: 'Stay', image: 'https://images.unsplash.com/photo-1540541338287-41700207def5?auto=format&fit=crop&q=80&w=100' },
  { name: 'Transport', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=100' },
  { name: 'Dining', image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=100' },
  { name: 'Shops', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=100' },
];

const spots = [
  {
    id: 1,
    name: 'Sunken Cemetery',
    category: 'Heritage',
    rating: 4.9,
    price: 150,
    image: 'https://img.atlasobscura.com/CmlPBCqrdngS4DE4q_DDyDdVYBjhcSTHrsI9PUEbvkQ/rs:fill:780:520:1/g:ce/q:81/sm:1/scp:1/ar:1/aHR0cHM6Ly9hdGxh/cy1kZXYuczMuYW1h/em9uYXdzLmNvbS91/cGxvYWRzL3BsYWNl/X2ltYWdlcy85OTA0/ZjhlMDJiMGM0ODM5/NWJfU3Vua2VuX0Nl/bWV0ZXJ5LF9DYXRh/cm1hbixfQ2FtaWd1/aW4uanBn.jpg',
    distance: '0.8 km',
    description: 'Explore the profound heritage of Sunken Cemetery. A cornerstone of the Catarman pilot experience.'
  },
  {
    id: 2,
    name: 'Old Church Ruins',
    category: 'Heritage',
    rating: 4.8,
    price: 100,
    image: 'https://files01.pna.gov.ph/source/2024/05/06/camiguin-old-church-ruins-05032024jb.jpg',
    distance: '1.2 km',
    description: 'Visit the Gui-ob Church Ruins, a historical landmark that tells the story of Camiguin\'s past.'
  },
  {
    id: 7,
    name: 'Tuasan Falls',
    category: 'Nature',
    rating: 4.9,
    price: 300,
    image: 'https://thefroggyadventures.com/wp-content/uploads/2024/10/tuasan-falls-camiguin.jpg',
    distance: '3.5 km',
    description: 'Tuasan Falls offers a refreshing escape into nature with its cool, crystal-clear waters.'
  },
  {
    id: 8,
    name: 'Soda Water Park',
    category: 'Nature',
    rating: 4.7,
    price: 200,
    image: 'https://www.lanzonescabana.com/custom/domain_4/image_files/sitemgr_photo_21.png',
    distance: '2.4 km',
    description: 'Enjoy a unique swimming experience at the Bura Soda Water Park, known for its carbonated spring water.'
  }
];

export default function MobileAppView() {
  const { user, profile, login, logout } = useAuth();
  const navigate = useNavigate();
  const [showOnboarding, setShowOnboarding] = useState(true);
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
      setShowOnboarding(false);
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

  const handleBook = async (item: any, type: 'stay' | 'transport' | 'spot') => {
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
        businessId: item.businessId || 'catarman_lgu',
        date: new Date().toLocaleDateString(),
        status: 'pending',
        paymentStatus: 'UNPAID',
        amount: item.price || 150,
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

  const onboardingContent = (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative h-full flex flex-col justify-end p-10 overflow-hidden"
    >
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=1000" 
          alt="Onboarding" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-island-volcanic via-island-volcanic/20 to-transparent"></div>
      </div>
      
      <div className="relative z-10 space-y-6 mb-12">
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-5xl font-black text-white tracking-tighter leading-[0.9]"
        >
          Discover Your Next Adventure
        </motion.h1>
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-white/70 text-lg font-medium"
        >
          Plan trips, explore destinations, and book unforgettable experiences.
        </motion.p>
      </div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="relative z-10 flex items-center justify-between gap-4"
      >
        <button 
          onClick={() => navigate('/')}
          className="w-14 h-14 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white"
        >
          <ArrowLeft size={24} />
        </button>
        <button 
          onClick={() => setShowOnboarding(false)}
          className="flex-1 bg-island-emerald text-island-volcanic font-black py-6 rounded-3xl text-sm shadow-2xl"
        >
          Get Started
        </button>
      </motion.div>
    </motion.div>
  );

  const content = (
    <div className={`h-full flex flex-col pt-6 pb-6 overflow-y-auto no-scrollbar bg-[#FDFDFB] ${!isDesktop ? 'min-h-screen' : ''}`}>
      <AnimatePresence mode="wait">
        {showOnboarding ? onboardingContent : (
        <>
        {selectedSpot ? (
          <motion.div 
            key="spot-detail"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute inset-0 bg-white z-[60] flex flex-col"
          >
            <div className="relative h-[45vh] p-6">
              <div className="relative h-full w-full rounded-[3rem] overflow-hidden shadow-2xl">
                <img src={selectedSpot.image} alt={selectedSpot.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                
                <div className="absolute top-6 left-6 right-6 flex justify-between items-center">
                  <motion.button 
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedSpot(null)}
                    className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center text-white border border-white/20"
                  >
                    <ArrowLeft size={24} />
                  </motion.button>
                  <h2 className="text-white font-black uppercase tracking-[0.2em] text-xs">Details</h2>
                  <motion.button 
                    whileTap={{ scale: 0.9 }}
                    className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center text-white border border-white/20"
                  >
                    <X size={24} />
                  </motion.button>
                </div>

                <div className="absolute bottom-8 left-8 flex items-center gap-2">
                  <div className="flex -space-x-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-white overflow-hidden shadow-lg">
                        <img src={`https://i.pravatar.cc/100?u=${i+10}`} alt="" />
                      </div>
                    ))}
                    <div className="w-8 h-8 rounded-full bg-island-emerald border-2 border-white flex items-center justify-center text-[10px] font-black text-white shadow-lg">2K</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-8 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-2 text-island-emerald font-black uppercase tracking-widest text-[10px] mb-2">
                    <MapPin size={12} />
                    {selectedSpot.category || 'Catarman, Camiguin'}
                  </div>
                  <h3 className="text-4xl font-black text-island-volcanic tracking-tighter leading-none">{selectedSpot.name}</h3>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-island-emerald tracking-tighter">₱{selectedSpot.price?.toLocaleString()}</div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">/ experience</div>
                </div>
              </div>

              <div className="flex items-center justify-between mb-8 pb-8 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden">
                    <img src="https://i.pravatar.cc/100?u=janeeth" alt="Creator" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-island-volcanic">By Catarman Guide</div>
                    <div className="text-[10px] font-bold text-slate-400">Verified Professional</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
                  <Star size={16} fill="#10B981" className="text-island-emerald" />
                  <span className="text-xs font-black text-island-emerald">{selectedSpot.rating || '4.9'}</span>
                </div>
              </div>

              <div className="flex gap-3 mb-8">
                {['Ticket', 'Hotel', 'Meal'].map(tag => (
                  <div key={tag} className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100 text-slate-600 font-black text-[10px] uppercase tracking-widest">
                    {tag === 'Ticket' && <Ticket size={14} />}
                    {tag === 'Hotel' && <Building2 size={14} />}
                    {tag === 'Meal' && <Utensils size={14} />}
                    {tag}
                  </div>
                ))}
              </div>

              <div className="mb-8">
                <h4 className="text-lg font-black text-island-volcanic tracking-tight mb-3">Schedule Overview</h4>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">
                  {selectedSpot.description || 'Experience the profound heritage of Catarman. This landmark represents the emerald soul of our municipality, offering a unique blend of nature and history.'}
                </p>
              </div>
              
              <div className="mt-auto pb-10 flex gap-4">
                <button className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-island-emerald border border-emerald-100 active:scale-95 transition-all">
                  <Sparkles size={24} />
                </button>
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleBook(selectedSpot, selectedSpot.type || 'spot')}
                  disabled={bookingStatus[selectedSpot.id] === 'loading' || bookingStatus[selectedSpot.id] === 'success'}
                  className="flex-1 btn-primary py-6 rounded-2xl text-sm shadow-2xl shadow-emerald-900/20"
                >
                  {bookingStatus[selectedSpot.id] === 'success' ? 'Booking Active' : 
                   bookingStatus[selectedSpot.id] === 'loading' ? <RefreshCw className="animate-spin" /> : 
                   'Book Now'}
                </motion.button>
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
            <header className="mb-8 pt-6 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-1 block">Current Location</span>
                <button className="flex items-center gap-2 text-island-volcanic font-black tracking-tight group">
                  Catarman, Camiguin
                  <ChevronRight size={16} className="rotate-90 text-island-emerald" />
                </button>
              </div>
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-600 shadow-sm active:scale-90 transition-transform">
                  <Bell size={20} />
                </div>
                <span className="absolute top-2 right-2 w-2 h-2 bg-island-coral rounded-full border-2 border-white"></span>
              </div>
            </header>

            {/* Modern Search */}
            <div className="relative mb-8">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300">
                <Search size={20} strokeWidth={3} />
              </div>
              <input 
                type="text" 
                placeholder="Search destination..." 
                className="w-full pl-14 pr-14 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] text-sm font-bold shadow-sm focus:ring-4 focus:ring-island-emerald/5 focus:border-island-emerald/20 transition-all outline-none placeholder:text-slate-300"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-island-volcanic text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-90">
                <Filter size={18} strokeWidth={3} />
              </button>
            </div>

            {/* Horizontal Categories with Images */}
            <div className="flex gap-4 overflow-x-auto no-scrollbar mb-10 -mx-8 px-8">
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`flex items-center gap-3 pl-2 pr-6 py-2 rounded-full transition-all border shrink-0 ${
                    selectedCategory === cat.name 
                      ? 'bg-island-emerald border-island-emerald text-island-volcanic font-black' 
                      : 'bg-white border-slate-100 text-slate-500 font-bold'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20">
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-xs">{cat.name}</span>
                </button>
              ))}
            </div>

            {/* Popular Destinations */}
            <div className="mb-12">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black text-island-volcanic tracking-tighter">Popular Destination</h3>
                <button className="text-[10px] font-black text-island-emerald uppercase tracking-widest">View All</button>
              </div>
              
              <div className="space-y-8 pb-12">
                {/* Spot Cards */}
                {(selectedCategory === 'All' || ['Heritage', 'Nature'].includes(selectedCategory)) && 
                  spots.filter(s => selectedCategory === 'All' || s.category === selectedCategory).map((spot) => (
                    <motion.div 
                      key={`spot-${spot.id}`}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedSpot({ ...spot, type: 'spot' })}
                      className="group relative bg-white rounded-[3rem] border border-slate-100 overflow-hidden shadow-xl p-4 cursor-pointer"
                    >
                      <div className="relative h-64 rounded-[2.5rem] overflow-hidden mb-6">
                        <img src={spot.image} alt={spot.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" referrerPolicy="no-referrer" />
                        <div className="absolute top-5 left-5 bg-white/90 backdrop-blur-xl px-4 py-2 rounded-2xl flex items-center gap-1.5 text-island-volcanic shadow-lg">
                          <Star size={14} fill="#10B981" className="text-island-emerald" />
                          <span className="text-xs font-black">{spot.rating}</span>
                        </div>
                        <button className="absolute top-5 right-5 w-10 h-10 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center text-white border border-white/20">
                          <Heart size={18} />
                        </button>
                        <div className="absolute bottom-5 right-5 w-12 h-12 bg-island-emerald text-island-volcanic rounded-full flex items-center justify-center shadow-2xl">
                          <ArrowLeft className="rotate-[135deg]" size={20} strokeWidth={3} />
                        </div>
                      </div>
                      <div className="px-4 pb-4">
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-island-emerald uppercase tracking-widest mb-2">
                          <MapPin size={12} strokeWidth={3} />
                          {spot.category}
                        </div>
                        <h4 className="text-3xl font-black text-island-volcanic tracking-tighter">{spot.name}</h4>
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
                      className="bg-white rounded-[3rem] border border-slate-100 overflow-hidden shadow-xl p-4 cursor-pointer"
                    >
                      <div className="relative h-64 rounded-[2.5rem] overflow-hidden mb-6">
                        <img src={stay.image} alt={stay.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <div className="absolute top-5 left-5 bg-white/90 backdrop-blur-xl px-4 py-2 rounded-2xl flex items-center gap-1.5 text-island-volcanic shadow-lg">
                          <Star size={14} fill="#10B981" className="text-island-emerald" />
                          <span className="text-xs font-black">{stay.rating}</span>
                        </div>
                        <div className="absolute bottom-5 right-5 w-12 h-12 bg-island-emerald text-island-volcanic rounded-full flex items-center justify-center shadow-2xl">
                          <ArrowLeft className="rotate-[135deg]" size={20} strokeWidth={3} />
                        </div>
                      </div>
                      <div className="px-4 pb-4 flex justify-between items-end">
                        <div>
                          <div className="text-[10px] font-black text-island-emerald uppercase tracking-widest mb-2">Resort • {stay.type}</div>
                          <h4 className="text-3xl font-black text-island-volcanic tracking-tighter">{stay.name}</h4>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-black text-island-emerald tracking-tighter">₱{stay.price.toLocaleString()}</span>
                          <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">/ night</span>
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
              <div className="w-20 h-20 bg-island-emerald text-island-volcanic rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl border border-white/10">
                <Ticket size={40} strokeWidth={2.5} />
              </div>
              <h2 className="text-4xl font-black text-island-volcanic tracking-tighter mb-2">Municipal Pass</h2>
              <p className="text-slate-400 text-sm font-medium tracking-tight">Catarman Pilot Identity Manifest</p>
            </header>
            
            <div className="w-full aspect-square max-w-[320px] bg-white rounded-[4rem] border-8 border-slate-50 shadow-xl flex items-center justify-center relative group p-10 mb-12">
              <div className="absolute top-8 left-8 w-8 h-8 border-t-4 border-l-4 border-island-emerald rounded-tl-xl"></div>
              <div className="absolute top-8 right-8 w-8 h-8 border-t-4 border-r-4 border-island-emerald rounded-tr-xl"></div>
              <div className="absolute bottom-8 left-8 w-8 h-8 border-b-4 border-l-4 border-island-emerald rounded-bl-xl"></div>
              <div className="absolute bottom-8 right-8 w-8 h-8 border-b-4 border-r-4 border-island-emerald rounded-br-xl"></div>
              <QrCode size={200} strokeWidth={1} className="text-island-volcanic" />
            </div>

            <div className="w-full bg-island-volcanic p-10 rounded-[3.5rem] text-white shadow-2xl relative border border-white/5 overflow-hidden">
              <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
                <Sparkles size={200} className="translate-x-12 -translate-y-12 rotate-12" />
              </div>
              <div className="flex justify-between items-start mb-10 relative z-10">
                <div>
                  <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mb-2 block">Tourist Clearane</span>
                  <p className="text-2xl font-black tracking-tighter">{user?.displayName || 'Catarman Guest'}</p>
                </div>
                <div className="w-12 h-12 bg-white/10 backdrop-blur-2xl rounded-xl flex items-center justify-center border border-white/20">
                  <ShieldCheck size={24} strokeWidth={3} className="text-island-emerald" />
                </div>
              </div>
              <div className="flex justify-between items-end relative z-10">
                <div className="space-y-1">
                  <span className="block text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">Node ID</span>
                  <span className="font-mono text-xs font-black tracking-widest text-island-emerald">CTRM-P-2026-9X</span>
                </div>
                <div className="px-5 py-2 bg-island-emerald text-island-volcanic rounded-full text-[10px] font-black uppercase tracking-widest">
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
            <header className="mb-12 flex flex-col items-center text-center pt-8">
              <div className="w-32 h-32 rounded-[3rem] bg-white border-8 border-slate-50 shadow-xl flex items-center justify-center relative overflow-hidden mb-6">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || ''} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <User size={60} className="text-slate-100" />
                )}
                <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-island-emerald text-island-volcanic rounded-xl flex items-center justify-center border-4 border-white shadow-lg">
                  <CheckCircle2 size={16} strokeWidth={4} />
                </div>
              </div>
              <h2 className="text-3xl font-black text-island-volcanic tracking-tighter">
                {user?.displayName || 'Digital Agent'}
              </h2>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] mt-3">
                {profile?.role || 'TOURIST'} • VERIFIED
              </p>
            </header>

            {!user ? (
              <button 
                onClick={login}
                className="btn-primary w-full py-6 rounded-3xl text-sm"
              >
                Initialize Manifest
              </button>
            ) : (
              <div className="space-y-10">
                <div>
                  <div className="flex justify-between items-center mb-6 px-2">
                    <h3 className="text-xl font-black text-island-volcanic tracking-tighter">Active Nodes</h3>
                    <span className="text-[10px] font-black text-island-emerald uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full">
                      {bookings.length} Verified
                    </span>
                  </div>
                  
                  <div className="space-y-4 max-h-[40vh] overflow-y-auto no-scrollbar pr-2">
                    {bookings.length === 0 ? (
                      <div className="py-16 bg-slate-50 rounded-[2.5rem] text-center border-2 border-dashed border-slate-200">
                        <Sparkles className="mx-auto text-slate-200 mb-4" size={48} />
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">No Active Nodes</p>
                      </div>
                    ) : (
                      bookings.map((booking) => (
                        <div key={booking.id} className="p-6 bg-white rounded-[2rem] border border-slate-100 shadow-lg relative overflow-hidden group">
                          {booking.paymentStatus === 'PAID' && (
                             <div className="absolute top-0 right-0 w-14 h-14 bg-island-emerald text-island-volcanic rounded-bl-[2rem] flex items-center justify-center shadow-lg">
                               <CheckCircle2 size={24} strokeWidth={3} />
                             </div>
                          )}
                          <div className="mb-4">
                            <span className="text-[10px] font-black text-island-emerald uppercase tracking-widest mb-1 block">{booking.serviceType}</span>
                            <h4 className="text-xl font-black text-island-volcanic tracking-tighter leading-none">{booking.serviceName}</h4>
                          </div>
                          <div className="flex justify-between items-end">
                            <div className="space-y-1">
                              <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount Paid</span>
                              <span className="text-xl font-black text-island-volcanic">₱{booking.amount?.toLocaleString()}</span>
                            </div>
                            {booking.paymentStatus === 'UNPAID' && (
                              <button 
                                onClick={() => handlePay(booking.id)}
                                className="bg-island-volcanic text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest"
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
                  <ProfileItem icon={Building2} label="Claim Business Node" onClick={() => navigate('/claim-business')} />
                </div>

                <button 
                  onClick={logout}
                  className="w-full mt-10 py-6 bg-slate-50 text-island-coral rounded-3xl text-[10px] font-black uppercase tracking-[0.3em] border border-slate-100 active:scale-95 transition-all"
                >
                  Terminate Session
                </button>
              </div>
            )}
          </motion.div>
        )}
        </>
        )}
      </AnimatePresence>

      {/* Internal Bottom Nav */}
      {!showOnboarding && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-t border-slate-100/50 px-8 pb-safe-offset-4 pt-4 flex items-center justify-between md:hidden">
          {[
            { id: 'explore', icon: Compass },
            { id: 'map', icon: MapIcon },
            { id: 'pass', icon: CreditCard },
            { id: 'profile', icon: User }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative p-3 rounded-2xl transition-all ${
                activeTab === item.id ? 'bg-island-emerald text-island-volcanic shadow-lg shadow-emerald-500/20' : 'text-slate-300'
              }`}
            >
              <item.icon size={24} strokeWidth={activeTab === item.id ? 3 : 2} />
              {activeTab === item.id && (
                <motion.div 
                  layoutId="activeIndicator"
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-island-volcanic rounded-full"
                />
              )}
            </button>
          ))}
        </nav>
      )}
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
