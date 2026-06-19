import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Map as MapIcon, 
  Compass, 
  User, 
  Info,
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
import { toast } from 'sonner';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, serverTimestamp, onSnapshot, query, where, orderBy, doc, updateDoc } from 'firebase/firestore';
import { accommodations } from '../data/accommodations';
import { transportOptions } from '../data/transport';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { subscribeToPass } from '../lib/passService';
import { checkAvailability } from '../lib/capacityService';
import type { TouristPass } from '../types';
import DateGuestPicker from '../components/shared/DateGuestPicker';
import IslandMap from '../components/IslandMap';
import { SearchWidget } from '../components/SearchWidget';

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
    image: '/images/hero-sunken.png',
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
  const [pass, setPass] = useState<TouristPass | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedGuests, setSelectedGuests] = useState(1);
  const [showBooking, setShowBooking] = useState(false);
  const [addBreakfast, setAddBreakfast] = useState(false);
  const [addLateCheckin, setAddLateCheckin] = useState(false);

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

  // Real-time pass subscription
  useEffect(() => {
    if (!user) {
      setPass(null);
      return;
    }

    const unsubscribe = subscribeToPass(user.uid, (passData) => {
      setPass(passData);
    });

    return () => unsubscribe();
  }, [user]);

  const handleBook = async (item: any, type: 'stay' | 'transport' | 'spot') => {
    if (!user) {
      login();
      return;
    }

    if (!selectedDate) {
      toast.error('Please select a date');
      return;
    }

    const itemId = item.id;
    setBookingStatus(prev => ({ ...prev, [itemId]: 'loading' }));

    // Check capacity
    const availability = await checkAvailability(item.id, selectedDate, selectedGuests);
    if (!availability.available) {
      toast.error(`Only ${availability.remaining} spots remaining on this date`);
      setBookingStatus(prev => ({ ...prev, [itemId]: 'idle' }));
      return;
    }

    try {
      const baseAmount = (item.price || 150) * selectedGuests;
      const addonAmount = (addBreakfast ? 350 * selectedGuests : 0) + (addLateCheckin ? 200 : 0);

      await addDoc(collection(db, 'bookings'), {
        touristUid: user.uid,
        touristName: user.displayName || 'Anonymous',
        touristEmail: user.email || '',
        serviceId: item.id,
        serviceName: item.name || item.title,
        serviceType: type,
        businessId: item.businessId || 'catarman_lgu',
        date: selectedDate,
        guests: selectedGuests,
        addons: { breakfast: addBreakfast, lateCheckin: addLateCheckin },
        status: 'pending',
        paymentStatus: 'UNPAID',
        amount: baseAmount + addonAmount,
        createdAt: serverTimestamp()
      });
      
      setBookingStatus(prev => ({ ...prev, [itemId]: 'success' }));
      toast.success('Booking request submitted!');
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

  const onboardingContent = (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex flex-col justify-end p-10 overflow-hidden"
    >
      <div className="absolute inset-0 z-0">
        <img 
          src="/images/explore-bg.jpg" 
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
          className="flex-1 bg-island-accent text-island-volcanic font-black py-6 rounded-3xl text-sm shadow-2xl"
        >
          Get Started
        </button>
      </motion.div>
    </motion.div>
  );

  const content = (
    <div className="relative h-full w-full flex flex-col bg-white overflow-hidden">
      <AnimatePresence mode="wait">
        {showOnboarding && onboardingContent}
      </AnimatePresence>

      {/* Main Scrollable Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">
        <div className="flex flex-col min-h-full">
          {/* Active Tab Content */}
          {activeTab === 'explore' && (
            <motion.div 
              key="explore"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col"
            >
              {/* Sticky Header Section */}
              <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl px-8 pt-8 pb-4 space-y-6 border-b border-slate-50">
                <header className="flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-1 block">Current Location</span>
                    <button className="flex items-center gap-2 text-island-volcanic font-black tracking-tight group">
                      Catarman, Camiguin
                      <ChevronRight size={16} className="rotate-90 text-island-accent" />
                    </button>
                  </div>
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-600 shadow-sm active:scale-90 transition-transform">
                      <Bell size={20} />
                    </div>
                    <span className="absolute top-2 right-2 w-2 h-2 bg-island-coral rounded-full border-2 border-white"></span>
                  </div>
                </header>
              </div>

              <div className="px-8 pt-8 space-y-10 pb-40">
                {/* Functional Search Widget */}
                <SearchWidget variant="mobile" />

                {/* Horizontal Categories with Images */}
                <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-8 px-8">
                  {categories.map((cat) => (
                    <button
                      key={cat.name}
                      onClick={() => setSelectedCategory(cat.name)}
                      className={`flex items-center gap-3 pl-2 pr-6 py-2 rounded-full transition-all border shrink-0 ${
                        selectedCategory === cat.name 
                          ? 'bg-island-accent border-island-accent text-island-volcanic font-black' 
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

                {/* Popular Destinations Section */}
                <div>
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-black text-island-volcanic tracking-tighter">Popular Destination</h3>
                    <button className="text-[10px] font-black text-island-accent uppercase tracking-widest bg-island-volcanic px-4 py-1.5 rounded-full">View All</button>
                  </div>
                  
                  <div className="space-y-8">
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
                              <Star size={14} fill="#eaff00" className="text-island-accent" />
                              <span className="text-xs font-black">{spot.rating}</span>
                            </div>
                            <button className="absolute top-5 right-5 w-10 h-10 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center text-white border border-white/20">
                              <Heart size={18} />
                            </button>
                            <div className="absolute bottom-5 right-5 w-12 h-12 bg-island-accent text-island-volcanic rounded-full flex items-center justify-center shadow-2xl">
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
                              <Star size={14} fill="#eaff00" className="text-island-accent" />
                              <span className="text-xs font-black">{stay.rating}</span>
                            </div>
                            <div className="absolute bottom-5 right-5 w-12 h-12 bg-island-accent text-island-volcanic rounded-full flex items-center justify-center shadow-2xl">
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
              </div>
            </motion.div>
          )}

          {activeTab === 'map' && (
            <motion.div 
              key="map"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-[80vh] w-full"
            >
              <IslandMap />
            </motion.div>
          )}

          {activeTab === 'pass' && (
            <motion.div 
              key="pass"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-8 flex flex-col items-center pb-40"
            >
              <header className="mb-14 text-center pt-8">
                <div className="w-20 h-20 bg-island-emerald text-island-volcanic rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl border border-white/10">
                  <Ticket size={40} strokeWidth={2.5} />
                </div>
                <h2 className="text-4xl font-black text-island-volcanic tracking-tighter mb-2">Municipal Pass</h2>
                <p className="text-slate-400 text-sm font-medium tracking-tight">Your digital pass for Catarman</p>
              </header>
              
              <div className="w-full aspect-square max-w-[320px] bg-white rounded-[4rem] border-8 border-slate-50 shadow-xl flex items-center justify-center relative group p-10 mb-12">
                <div className="absolute top-8 left-8 w-8 h-8 border-t-4 border-l-4 border-island-emerald rounded-tl-xl"></div>
                <div className="absolute top-8 right-8 w-8 h-8 border-t-4 border-r-4 border-island-emerald rounded-tr-xl"></div>
                <div className="absolute bottom-8 left-8 w-8 h-8 border-b-4 border-l-4 border-island-emerald rounded-bl-xl"></div>
                <div className="absolute bottom-8 right-8 w-8 h-8 border-b-4 border-r-4 border-island-emerald rounded-br-xl"></div>
                {user && pass ? (
                  <QRCodeSVG value={`${window.location.origin}/verify-pass/${pass.passId}`} size={200} level="H" includeMargin />
                ) : (
                  <div className="w-[200px] h-[200px] flex items-center justify-center text-slate-300">
                    <Info size={64} strokeWidth={1} />
                  </div>
                )}
              </div>

              <div className="w-full bg-island-volcanic p-10 rounded-[3.5rem] text-white shadow-2xl relative border border-white/5 overflow-hidden">
                <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
                  <Sparkles size={200} className="translate-x-12 -translate-y-12 rotate-12" />
                </div>
                <div className="flex justify-between items-start mb-10 relative z-10">
                  <div>
                    <span className="text-[10px] font-semibold text-white/40 tracking-tight mb-2 block">Passenger</span>
                    <p className="text-2xl font-black tracking-tighter">{pass?.displayName || user?.displayName || 'Catarman Guest'}</p>
                  </div>
                  <div className="w-12 h-12 bg-white/10 backdrop-blur-2xl rounded-xl flex items-center justify-center border border-white/20">
                    <ShieldCheck size={24} strokeWidth={3} className="text-island-emerald" />
                  </div>
                </div>
                <div className="flex justify-between items-end relative z-10">
                  <div className="space-y-1">
                    <span className="block text-[10px] font-semibold text-white/40 tracking-tight">Pass ID</span>
                    <span className="font-mono text-xs font-black tracking-widest text-island-emerald">{pass?.passId || '—'}</span>
                  </div>
                  <div className={`px-5 py-2 rounded-full text-[10px] font-bold tracking-wider ${
                    pass?.status === 'active' 
                      ? 'bg-island-emerald text-island-volcanic' 
                      : 'bg-white/10 text-white/60'
                  }`}>
                    {pass?.status === 'active' ? 'Active' : pass?.status || '—'}
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
              className="px-8 pb-40"
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
                <p className="text-slate-400 text-[10px] font-semibold tracking-tight mt-3">
                  {profile?.role || 'TOURIST'}
                </p>
              </header>

              {!user ? (
                <button 
                  onClick={login}
                  className="btn-primary w-full py-6 rounded-3xl text-sm"
                >
                  Sign In
                </button>
              ) : (
                <div className="space-y-10">
                  <div>
                    <div className="flex justify-between items-center mb-6 px-2">
                      <h3 className="text-xl font-black text-island-volcanic tracking-tighter">My Bookings</h3>
                      <span className="text-[10px] font-bold text-island-emerald tracking-wider bg-emerald-50 px-3 py-1 rounded-full">
                        {bookings.length} total
                      </span>
                    </div>
                    
                    <div className="space-y-4 max-h-[40vh] overflow-y-auto no-scrollbar pr-2">
                      {bookings.length === 0 ? (
                        <div className="py-16 bg-slate-50 rounded-[2.5rem] text-center border-2 border-dashed border-slate-200">
                          <Sparkles className="mx-auto text-slate-200 mb-4" size={48} />
                          <p className="text-[10px] font-semibold text-slate-300 tracking-tight">No bookings yet</p>
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
                              <span className="text-[10px] font-bold text-island-emerald tracking-wider mb-1 block">{booking.serviceType}</span>
                              <h4 className="text-xl font-black text-island-volcanic tracking-tighter leading-none">{booking.serviceName}</h4>
                            </div>
                            <div className="flex justify-between items-end">
                              <div className="space-y-1">
                                <span className="block text-[10px] font-semibold text-slate-400 tracking-tight">Amount</span>
                                <span className="text-xl font-black text-island-volcanic">₱{booking.amount?.toLocaleString()}</span>
                              </div>
                              {booking.paymentStatus === 'UNPAID' && (
                                <button 
                                  onClick={() => handlePay(booking.id)}
                                  className="bg-island-volcanic text-white px-6 py-3 rounded-xl text-[10px] font-bold tracking-wider"
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
                    <ProfileItem icon={Building2} label="Claim a Business" onClick={() => navigate('/claim-business')} />
                  </div>

                  <button 
                    onClick={logout}
                    className="w-full mt-10 py-6 bg-slate-50 text-island-coral rounded-3xl text-xs font-semibold tracking-tight border border-slate-100 active:scale-95 transition-all"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Overlays (Spot Details) — Luxury Redesign */}
      <AnimatePresence>
        {selectedSpot && !showBooking && (
          <motion.div 
            key="spot-detail"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute inset-0 bg-white z-[60] flex flex-col overflow-y-auto no-scrollbar"
          >
            {/* Hero Image */}
            <div className="relative h-[50vh] shrink-0">
              <div className="relative h-full w-full overflow-hidden">
                <img src={selectedSpot.image} alt={selectedSpot.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></div>
                
                {/* Top Bar */}
                <div className="absolute top-12 left-6 right-6 flex justify-between items-center z-10">
                  <motion.button 
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedSpot(null)}
                    className="w-11 h-11 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center text-white border border-white/20 shadow-lg"
                  >
                    <ArrowLeft size={22} />
                  </motion.button>
                  <motion.button 
                    whileTap={{ scale: 0.9 }}
                    className="w-11 h-11 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center text-white border border-white/20 shadow-lg"
                  >
                    <Heart size={20} />
                  </motion.button>
                </div>

                {/* Price Overlay */}
                <div className="absolute bottom-6 left-6 z-10">
                  <div className="bg-white/20 backdrop-blur-xl rounded-2xl px-5 py-3 border border-white/20 shadow-xl">
                    <span className="text-3xl font-black text-white tracking-tighter">₱{selectedSpot.price?.toLocaleString() || '150'}</span>
                    <span className="text-white/70 text-sm font-medium ml-1">/ night</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 px-6 pt-6 pb-40 space-y-6 bg-white">
              {/* Title & Rating */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin size={14} className="text-island-emerald" />
                    <span className="text-sm font-semibold text-slate-500">Catarman, Camiguin Island</span>
                  </div>
                  <h2 className="text-3xl font-black text-island-volcanic tracking-tighter leading-tight">{selectedSpot.name}</h2>
                </div>
                <div className="flex items-center gap-1.5 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-100 shrink-0 ml-4">
                  <Star size={16} fill="#10b981" className="text-island-emerald" />
                  <span className="text-sm font-black text-island-emerald">{selectedSpot.rating || '4.9'}</span>
                </div>
              </div>

              {/* Amenities */}
              <div className="flex gap-4">
                {[
                  { icon: 'wifi', label: 'Free Wi-Fi' },
                  { icon: 'snowflake', label: 'Air Conditioning' },
                ].map((amenity, i) => (
                  <div key={i} className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <svg className="w-4 h-4 text-island-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      {amenity.icon === 'wifi' ? (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.858 15.355-5.858 21.213 0" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      )}
                    </svg>
                    <span className="text-xs font-bold text-slate-600">{amenity.label}</span>
                  </div>
                ))}
              </div>

              {/* Description */}
              <div className="pt-2">
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  {selectedSpot.description || 'Experience the profound heritage of Catarman. This landmark represents the emerald soul of our municipality, offering a unique blend of nature and history.'}
                </p>
              </div>

              {/* Image Thumbnails */}
              <div>
                <h4 className="text-sm font-black text-island-volcanic tracking-tight mb-3">Photos</h4>
                <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-6 px-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 border border-slate-100 shadow-sm">
                      <img 
                        src={`https://images.unsplash.com/photo-${i === 1 ? '1544551763-46a013bb70d5' : i === 2 ? '1590073242678-70ee3fc28f8e' : i === 3 ? '1564013799919-ab600027ffc6' : '1571896349842-33c89424de2d'}?w=200&q=80`} 
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sticky Book Button */}
            <div className="fixed bottom-0 left-0 right-0 z-20 p-6 bg-white/80 backdrop-blur-2xl border-t border-slate-100">
              <div className="flex items-center justify-between mb-4 px-1">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total</span>
                  <p className="text-2xl font-black text-island-volcanic tracking-tighter">
                    ₱{selectedSpot.price?.toLocaleString() || '150'}
                    <span className="text-sm font-bold text-slate-400 ml-1">/ night</span>
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Star size={14} fill="#10b981" className="text-island-emerald" />
                  <span className="text-sm font-bold text-slate-600">{selectedSpot.rating || '4.9'}</span>
                  <span className="text-xs text-slate-400 ml-1">(128 reviews)</span>
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setSelectedDate('');
                  setSelectedGuests(1);
                  setAddBreakfast(false);
                  setAddLateCheckin(false);
                  setShowBooking(true);
                }}
                className="w-full py-5 bg-island-green text-white rounded-2xl font-black text-sm tracking-wider shadow-2xl shadow-island-green/30 hover:bg-island-green/90 transition-all"
              >
                Book Now
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Booking Bottom Sheet */}
      <AnimatePresence>
        {showBooking && selectedSpot && (
          <motion.div 
            key="booking-sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute inset-0 bg-white z-[70] flex flex-col overflow-y-auto no-scrollbar"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-xl px-6 pt-12 pb-4 border-b border-slate-50">
              <div className="flex items-center justify-between mb-2">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowBooking(false)}
                  className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-500"
                >
                  <ArrowLeft size={20} />
                </motion.button>
                <h2 className="text-lg font-black text-island-volcanic tracking-tighter">Complete Booking</h2>
                <div className="w-10" />
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-100">
                  <img src={selectedSpot.image} alt="" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-sm font-black text-island-volcanic tracking-tight">{selectedSpot.name}</p>
                  <p className="text-[10px] font-bold text-slate-400">Catarman, Camiguin</p>
                </div>
              </div>
            </div>

            <div className="flex-1 px-6 pt-6 pb-48 space-y-8">
              {/* Calendar */}
              <div>
                <h4 className="text-sm font-black text-island-volcanic tracking-tight mb-4">Select Date</h4>
                <div className="bg-slate-50 rounded-3xl p-4 border border-slate-100">
                  <DateGuestPicker
                    onDateChange={setSelectedDate}
                    onGuestsChange={setSelectedGuests}
                  />
                </div>
              </div>

              {/* Add-ons */}
              <div>
                <h4 className="text-sm font-black text-island-volcanic tracking-tight mb-4">Add-ons</h4>
                <div className="space-y-3">
                  <button
                    onClick={() => setAddBreakfast(!addBreakfast)}
                    className={`w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${
                      addBreakfast ? 'bg-island-green/5 border-island-green/30' : 'bg-white border-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                        addBreakfast ? 'bg-island-green border-island-green' : 'border-slate-300'
                      }`}>
                        {addBreakfast && (
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold text-island-volcanic">Breakfast</p>
                        <p className="text-[10px] font-semibold text-slate-400">Daily breakfast buffet</p>
                      </div>
                    </div>
                    <span className="text-sm font-black text-island-emerald">+₱350</span>
                  </button>

                  <button
                    onClick={() => setAddLateCheckin(!addLateCheckin)}
                    className={`w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${
                      addLateCheckin ? 'bg-island-green/5 border-island-green/30' : 'bg-white border-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                        addLateCheckin ? 'bg-island-green border-island-green' : 'border-slate-300'
                      }`}>
                        {addLateCheckin && (
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold text-island-volcanic">Late Check-in</p>
                        <p className="text-[10px] font-semibold text-slate-400">After 8:00 PM</p>
                      </div>
                    </div>
                    <span className="text-sm font-black text-island-emerald">+₱200</span>
                  </button>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 space-y-4">
                <h4 className="text-sm font-black text-island-volcanic tracking-tight">Price Breakdown</h4>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 font-medium">₱{selectedSpot.price?.toLocaleString() || '150'} x {selectedGuests} guest(s)</span>
                    <span className="font-bold text-island-volcanic">₱{((selectedSpot.price || 150) * selectedGuests).toLocaleString()}</span>
                  </div>
                  {addBreakfast && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 font-medium">Breakfast x {selectedGuests}</span>
                      <span className="font-bold text-island-volcanic">₱{(350 * selectedGuests).toLocaleString()}</span>
                    </div>
                  )}
                  {addLateCheckin && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 font-medium">Late Check-in</span>
                      <span className="font-bold text-island-volcanic">₱200</span>
                    </div>
                  )}
                  <div className="border-t border-slate-200 pt-3 flex justify-between">
                    <span className="text-sm font-black text-island-volcanic">Total</span>
                    <span className="text-xl font-black text-island-emerald tracking-tighter">
                      ₱{(
                        (selectedSpot.price || 150) * selectedGuests +
                        (addBreakfast ? 350 * selectedGuests : 0) +
                        (addLateCheckin ? 200 : 0)
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky Book Now Button */}
            <div className="fixed bottom-0 left-0 right-0 z-20 p-6 bg-white/80 backdrop-blur-2xl border-t border-slate-100">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  handleBook(selectedSpot, selectedSpot.type || 'spot');
                  setShowBooking(false);
                }}
                disabled={bookingStatus[selectedSpot.id] === 'loading' || bookingStatus[selectedSpot.id] === 'success' || !selectedDate}
                className="w-full py-5 bg-island-green text-white rounded-2xl font-black text-sm tracking-wider shadow-2xl shadow-island-green/30 hover:bg-island-green/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {bookingStatus[selectedSpot.id] === 'loading' ? (
                  <RefreshCw className="animate-spin mx-auto" size={22} />
                ) : bookingStatus[selectedSpot.id] === 'success' ? (
                  'Booking Confirmed ✓'
                ) : (
                  `Book now — ₱${(
                    (selectedSpot.price || 150) * selectedGuests +
                    (addBreakfast ? 350 * selectedGuests : 0) +
                    (addLateCheckin ? 200 : 0)
                  ).toLocaleString()}`
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation & FAB */}
      {!showOnboarding && (
        <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
          <div className="relative w-full h-40 pointer-events-auto">
             {/* Plan with AI Floating Button */}
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/planner')}
              className="absolute bottom-28 right-6 bg-island-accent text-island-volcanic px-6 py-4 rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl flex items-center gap-2 group border border-island-accent/20"
            >
              <Sparkles size={18} className="animate-pulse" />
              <span>Plan with AI</span>
            </motion.button>

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-md">
              <nav className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] p-2 flex items-center justify-around shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-slate-100">
                {[
                  { id: 'explore', icon: Compass },
                  { id: 'map', icon: MapIcon },
                  { id: 'pass', icon: CreditCard },
                  { id: 'profile', icon: User }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className="relative p-4 group"
                  >
                    {activeTab === item.id && (
                      <motion.div
                        layoutId="activeTabBackground"
                        className="absolute inset-0 bg-island-accent rounded-full"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <motion.div
                      whileTap={{ scale: 0.9 }}
                      className={`relative z-10 transition-colors ${
                        activeTab === item.id ? 'text-island-volcanic' : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                    >
                      <item.icon size={24} strokeWidth={activeTab === item.id ? 3 : 2} />
                    </motion.div>
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>
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
        <div className="fixed inset-0 overflow-hidden">
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
