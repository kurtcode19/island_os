import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Compass,
  User,
  Heart,
  Star,
  NavigationArrow,
  Clock,
  Bell,
  Ticket,
  MapPin,
  Building,
  CheckCircle,
  CreditCard,
  ShieldCheck,
  Sparkle,
  ArrowsClockwise,
  Plus,
  Minus,
  CalendarBlank,
  WifiHigh,
  Wind,
  Coffee,
  ArrowLeft,
  CaretLeft,
  CaretRight,
  Sun,
  Moon
} from '@phosphor-icons/react';
import { QRCodeCanvas } from 'qrcode.react';
import { locations } from '../data/locations';
import { businesses } from '../data/businesses';
import { transportOptions, schedules } from '../data/transport';
import { useAuth } from '../context/AuthContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, serverTimestamp, onSnapshot, query, where, orderBy, doc, updateDoc } from 'firebase/firestore';
import { accommodations } from '../data/accommodations';
import { rentalVehicles, rentalMerchants, getMerchantByVehicle } from '../data/rentals';
import { useNavigate } from 'react-router-dom';
import IslandMap from '../components/IslandMap';
import { OnboardingHero } from '../components/mobile/OnboardingHero';
import { Header } from '../components/mobile/Header';
import { SearchBar } from '../components/mobile/SearchBar';
import { CategoryPills } from '../components/mobile/CategoryPills';
import { CardCarousel } from '../components/mobile/CardCarousel';
import { DestinationDetail } from '../components/mobile/DestinationDetail';
import { BottomNav } from '../components/mobile/BottomNav';

const categories = [
  { name: 'All', image: '/images/explore-bg.jpg' },
  { name: 'Heritage', image: '/images/old-spanish-church-ruins-big-tree.jpg' },
  { name: 'Nature', image: '/images/tuasan.jpg' },
  { name: 'Adventure', image: '/images/explore-bg.jpg' },
  { name: 'Culture', image: '/images/explore-bg.jpg' },
  { name: 'Rentals', image: '/images/explore-bg.jpg' },
];

const spots = [
  {
    id: 1,
    name: 'Coastal Point',
    category: 'Heritage',
    rating: 4.9,
    price: 150,
    image: '/images/hero-sunken.png',
    distance: '0.8 km',
    description: 'Explore this stunning coastal heritage site with breathtaking ocean views and rich cultural history.'
  },
  {
    id: 2,
    name: 'Heritage Ruins',
    category: 'Heritage',
    rating: 4.8,
    price: 100,
    image: '/images/old-spanish-church-ruins-big-tree.jpg',
    distance: '1.2 km',
    description: 'Visit these ancient ruins, a historical landmark that tells the story of the island\'s past.'
  },
  {
    id: 7,
    name: 'Mountain Falls',
    category: 'Nature',
    rating: 4.9,
    price: 300,
    image: '/images/tuasan.jpg',
    distance: '3.5 km',
    description: 'A refreshing waterfall escape into nature with cool, crystal-clear waters surrounded by lush jungle.'
  },
  {
    id: 8,
    name: 'Spring Water Park',
    category: 'Nature',
    rating: 4.7,
    price: 200,
    image: '/images/borasoda.png',
    distance: '2.4 km',
    description: 'Enjoy a unique swimming experience at this natural spring water park with rejuvenating mineral waters.'
  }
];

export default function MobileAppView() {
  const { user, profile, login, logout } = useAuth();
  const navigate = useNavigate();
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [activeTab, setActiveTab] = useState('explore');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSpot, setSelectedSpot] = useState<any>(null);
  const [detailTab, setDetailTab] = useState('Details');
  const [bookings, setBookings] = useState<any[]>([]);
  const [bookingStatus, setBookingStatus] = useState<{[key: string]: 'idle' | 'loading' | 'success'}>({});
  
  // Booking flow state
  const today = new Date();
  const [showBooking, setShowBooking] = useState(false);
  const [checkIn, setCheckIn] = useState<Date>(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1));
  const [checkOut, setCheckOut] = useState<Date>(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3));
  const [guests, setGuests] = useState(2);
  const [addons, setAddons] = useState({ breakfast: false, lateCheckin: false });
  const [selectedImage, setSelectedImage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSpots = spots.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredAccommodations = accommodations.filter(a =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.type.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredVehicles = rentalVehicles.filter(v =>
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isDesktop = window.innerWidth >= 768;

  // Sync activeTab with query param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab && ['explore', 'map', 'rentals', 'services', 'pass', 'profile', 'shops', 'transport', 'planner'].includes(tab)) {
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

  const handleBook = async (item: any, type: string) => {
    if (!user) {
      login();
      return;
    }

    const itemId = item.id;
    setBookingStatus(prev => ({ ...prev, [itemId]: 'loading' }));

    const nights = Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)));
    const baseAmount = type === 'rental' ? (item.rate || item.price || 150) : (item.price || 150);
    const totalAmount = baseAmount * nights + (addons.breakfast ? 250 : 0) + (addons.lateCheckin ? 150 : 0);

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
        checkInDate: checkIn.toISOString(),
        checkOutDate: checkOut.toISOString(),
        guests: guests,
        status: 'pending',
        paymentStatus: 'UNPAID',
        amount: totalAmount,
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

  const onboardingContent = (
    <OnboardingHero
      imageUrl="/images/explore-bg.jpg"
      title="Discover Your&#10;Next Adventure"
      subtitle="Explore hidden gems, plan your trip, and book unforgettable experiences."
      onExplore={() => setShowOnboarding(false)}
      onBack={() => navigate('/')}
    />
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
              <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl px-6 pt-6 pb-4 space-y-5 border-b border-gray-100">
                <Header
                  title="Find your&#10;favorite place"
                  subtitle="Current Location"
                  showNotification
                />
              </div>

              <div className="px-6 pt-6 space-y-8 pb-40">
                {/* Search Bar (replaces old SearchWidget) */}
                <SearchBar onSearch={setSearchQuery} onFilter={() => {}} />

                {/* Category Pills */}
                <CategoryPills
                  categories={categories}
                  selected={selectedCategory}
                  onSelect={setSelectedCategory}
                />

                {/* Featured Carousel */}
                <CardCarousel
                  title="Trending Now"
                  items={spots}
                  onCardClick={(item) => setSelectedSpot({ ...item, type: 'spot' })}
                />

                {/* Popular Destinations Section */}
                <div>
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-black text-tropic-green tracking-tighter">Popular Destination</h3>
                    <button className="text-[10px] font-black text-white uppercase tracking-widest bg-tropic-green px-4 py-1.5 rounded-full hover:bg-tropic-emerald transition-colors">View All</button>
                  </div>
                  
                  <div className="space-y-8">
                    {/* Spot Cards */}
                    {(selectedCategory === 'All' || ['Heritage', 'Nature'].includes(selectedCategory)) && 
                      filteredSpots.filter(s => selectedCategory === 'All' || s.category === selectedCategory).map((spot) => (
                        <motion.div 
                          key={`spot-${spot.id}`}
                          whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedSpot({ ...spot, type: 'spot', serviceType: 'spot' })}
                  className="group relative bg-white rounded-[3rem] border border-tropic-sand/40 overflow-hidden tropic-shadow-lg hover:tropic-shadow-xl transition-shadow p-4 cursor-pointer"
                        >
                          <div className="relative h-64 rounded-[2.5rem] overflow-hidden mb-6">
                            <img src={spot.image} alt={spot.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" referrerPolicy="no-referrer" />
                            <div className="absolute top-5 left-5 bg-white/90 backdrop-blur-xl px-4 py-2 rounded-2xl flex items-center gap-1.5 text-tropic-green tropic-shadow">
                              <Star size={14} fill="#FFD166" className="text-tropic-sunset" />
                              <span className="text-xs font-black">{spot.rating}</span>
                            </div>
                            <button className="absolute top-5 right-5 w-10 h-10 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center text-white border border-white/20 hover:bg-tropic-rose/60 transition-colors">
                              <Heart size={18} />
                            </button>
                            <div className="absolute bottom-5 right-5 w-12 h-12 bg-white/90 backdrop-blur-xl text-tropic-coral rounded-full flex items-center justify-center shadow-2xl group-hover:bg-tropic-coral group-hover:text-white transition-colors">
                              <ArrowLeft className="rotate-[135deg]" size={20} weight='bold' />
                            </div>
                          </div>
                          <div className="px-4 pb-4">
                            <div className="flex items-center gap-1.5 text-[10px] font-black text-tropic-emerald uppercase tracking-widest mb-2">
                              <MapPin size={12} weight='bold' />
                              {spot.category}
                            </div>
                            <h4 className="text-3xl font-black text-tropic-green tracking-tighter">{spot.name}</h4>
                          </div>
                        </motion.div>
                    ))}

                    {/* Stay Cards */}
                    {(selectedCategory === 'All' || selectedCategory === 'Stay') && 
                      filteredAccommodations.map((stay) => (
                        <motion.div 
                          key={`stay-${stay.id}`}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedSpot({ ...stay, type: 'stay', serviceType: 'stay' })}
                          className="bg-white rounded-[3rem] border border-tropic-sand/40 overflow-hidden tropic-shadow-lg hover:tropic-shadow-xl transition-shadow p-4 cursor-pointer"
                        >
                          <div className="relative h-64 rounded-[2.5rem] overflow-hidden mb-6">
                            <img src={stay.image} alt={stay.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            <div className="absolute top-5 left-5 bg-white/90 backdrop-blur-xl px-4 py-2 rounded-2xl flex items-center gap-1.5 text-tropic-green tropic-shadow">
                              <Star size={14} fill="#FFD166" className="text-tropic-sunset" />
                              <span className="text-xs font-black">{stay.rating}</span>
                            </div>
                            <div className="absolute bottom-5 right-5 w-12 h-12 bg-white/90 backdrop-blur-xl text-tropic-coral rounded-full flex items-center justify-center shadow-2xl group-hover:bg-tropic-coral group-hover:text-white transition-colors">
                              <ArrowLeft className="rotate-[135deg]" size={20} weight='bold' />
                            </div>
                          </div>
                          <div className="px-4 pb-4 flex justify-between items-end">
                            <div>
                              <div className="text-[10px] font-black text-tropic-emerald uppercase tracking-widest mb-2">Resort • {stay.type}</div>
                              <h4 className="text-3xl font-black text-tropic-green tracking-tighter">{stay.name}</h4>
                            </div>
                            <div className="text-right">
                              <span className="text-2xl font-black text-tropic-emerald tracking-tighter">₱{stay.price.toLocaleString()}</span>
                              <span className="block text-[10px] font-black text-tropic-green/40 uppercase tracking-widest">/ night</span>
                            </div>
                          </div>
                        </motion.div>
                    ))}
                  </div>
                </div>

                {/* Rental Vehicles Section */}
                <div>
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-black text-tropic-green tracking-tighter">Rental Vehicles</h3>
                    <button className="text-[10px] font-black text-white uppercase tracking-widest bg-tropic-green px-4 py-1.5 rounded-full hover:bg-tropic-emerald transition-colors">View All</button>
                  </div>
                  <div className="space-y-8">
                    {(selectedCategory === 'All' || selectedCategory === 'Rentals') && 
                      filteredVehicles.map((vehicle) => (
                        <motion.div
                          key={vehicle.id}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedSpot({ ...vehicle, type: 'rental', serviceType: 'rental', price: vehicle.rate })}
                          className="bg-white rounded-[3rem] border border-tropic-sand/40 overflow-hidden tropic-shadow-lg hover:tropic-shadow-xl transition-shadow p-4 cursor-pointer"
                        >
                          <div className="relative h-56 rounded-[2.5rem] overflow-hidden mb-5">
                            <img src={vehicle.image} alt={vehicle.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-xl px-3 py-1.5 rounded-2xl flex items-center gap-1.5 text-tropic-green tropic-shadow">
                              <span className="text-[10px] font-black">{vehicle.available} left</span>
                            </div>
                            <div className={`absolute top-4 right-4 w-10 h-10 ${vehicle.color} rounded-full flex items-center justify-center text-white shadow-lg`}>
                              <vehicle.icon size={18} weight='regular' />
                            </div>
                          </div>
                          <div className="px-4 pb-2 flex justify-between items-end">
                            <div>
                              <div className="text-[10px] font-black text-tropic-emerald uppercase tracking-widest mb-1">{vehicle.type} • {vehicle.transmission}</div>
                              <h4 className="text-2xl font-black text-tropic-green tracking-tighter">{vehicle.name}</h4>
                              {(() => { const m = getMerchantByVehicle(vehicle); return m ? <span className="text-[9px] font-bold text-tropic-green/40 tracking-wide">{m.name}</span> : null; })()}
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] text-tropic-green/50 font-medium">{vehicle.capacity} seats</span>
                                <span className="w-1 h-1 rounded-full bg-tropic-green/30" />
                                {vehicle.features.slice(0, 2).map((f, i) => (
                                  <span key={i} className="text-[10px] text-tropic-green/50 font-medium">{f}</span>
                                ))}
                              </div>
                            </div>
                            <div className="text-right shrink-0 ml-4">
                              <span className="text-2xl font-black text-tropic-emerald tracking-tighter">₱{vehicle.rate.toLocaleString()}</span>
                              <span className="block text-[10px] font-black text-tropic-green/40 uppercase tracking-widest">/ {vehicle.rateUnit}</span>
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

          {activeTab === 'rentals' && (
            <motion.div
              key="rentals"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-6 pb-40"
            >
              <div className="pt-6 mb-6">
                <Header
                  title="Rental&#10;Vehicles"
                  subtitle="Island Mobility"
                  showNotification
                />
              </div>
              <div className="mb-6">
                <SearchBar placeholder="Search vehicles..." />
              </div>
              <div className="space-y-5">
                {rentalVehicles.map((vehicle, idx) => (
                  <motion.div
                    key={vehicle.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedSpot({ ...vehicle, type: 'rental', serviceType: 'rental', price: vehicle.rate })}
                    className="bg-white rounded-[24px] border border-gray-100 overflow-hidden shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-lg)] transition-shadow"
                  >
                    <div className="relative h-44 overflow-hidden">
                      <img src={vehicle.image} alt={vehicle.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                      <div className={`absolute top-3 left-3 ${vehicle.color} text-white px-2.5 py-1 rounded-xl text-[10px] font-bold shadow-lg`}>
                        {vehicle.available} left
                      </div>
                      <div className={`absolute top-3 right-3 w-9 h-9 ${vehicle.color} rounded-full flex items-center justify-center text-white shadow-lg`}>
                        <vehicle.icon size={16} weight='regular' />
                      </div>
                      <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                        <h3 className="text-xl font-black text-white tracking-tighter drop-shadow-lg">{vehicle.name}</h3>
                        <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-lg">
                          <span className="text-lg font-black text-[var(--text)]">₱{vehicle.rate.toLocaleString()}</span>
                          <span className="text-[9px] text-[var(--muted)] font-semibold ml-0.5">/{vehicle.rateUnit}</span>
                        </div>
                      </div>
                    </div>
                    <div className="px-5 py-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-[var(--accent-start)] uppercase tracking-widest">{vehicle.type} • {vehicle.transmission}</span>
                        <span className="text-[10px] font-semibold text-[var(--muted)]">{vehicle.capacity} seats</span>
                      </div>
                      {(() => { const m = getMerchantByVehicle(vehicle); return m ? <span className="text-[8px] font-bold text-[var(--muted)] tracking-wide block mb-2">by {m.name} • {m.location}</span> : null; })()}
                      <div className="flex flex-wrap gap-1.5">
                        {vehicle.features.slice(0, 3).map((f, i) => (
                          <span key={i} className="px-2.5 py-1 bg-[#F3F5F7] rounded-full text-[9px] font-semibold text-[var(--muted)]">{f}</span>
                        ))}
                        {vehicle.features.length > 3 && (
                          <span className="px-2.5 py-1 bg-[#F3F5F7] rounded-full text-[9px] font-semibold text-[var(--muted)]">+{vehicle.features.length - 3}</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'shops' && (
            <motion.div
              key="shops"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-6 pb-40"
            >
              <div className="pt-6 mb-6">
                <Header
                  title="Local&#10;Shops"
                  subtitle="Support Local"
                  showNotification
                />
              </div>
              <div className="space-y-5">
                {businesses.filter(b => b.businessType === 'shop').map((shop, idx) => (
                  <motion.div
                    key={shop.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white rounded-[24px] border border-gray-100 overflow-hidden shadow-[var(--shadow-sm)]"
                    onClick={() => navigate('/shops')}
                  >
                    <div className="p-5">
                      <h3 className="text-xl font-black text-tropic-green tracking-tighter mb-2">{shop.name}</h3>
                      <p className="text-xs text-tropic-green/50 font-medium mb-3">{shop.location} • {shop.category}</p>
                      <p className="text-xs text-tropic-green/60 font-medium leading-relaxed">{shop.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'transport' && (
            <motion.div
              key="transport"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-6 pb-40"
            >
              <div className="pt-6 mb-6">
                <Header
                  title="Getting&#10;Around"
                  subtitle="Island Transport"
                  showNotification
                />
              </div>
              <div className="space-y-4">
                {transportOptions.map((option, idx) => (
                  <motion.div
                    key={option.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-white rounded-[24px] border border-gray-100 overflow-hidden shadow-[var(--shadow-sm)]"
                    onClick={() => navigate('/transport')}
                  >
                    <div className="p-5">
                      <h3 className="text-xl font-black text-tropic-green tracking-tighter mb-2">{option.title}</h3>
                      <p className="text-xs text-tropic-green/50 font-medium mb-1">{option.provider} • {option.route}</p>
                      <span className="text-lg font-black text-tropic-emerald">₱{option.price.toLocaleString()}</span>
                      <span className="text-xs text-tropic-green/40 font-medium ml-1">/ {option.duration}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'planner' && (
            <motion.div
              key="planner"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-6 pb-40"
            >
              <div className="pt-6 mb-6">
                <Header
                  title="AI Trip&#10;Planner"
                  subtitle="Powered by Gemini"
                  showNotification={false}
                />
              </div>
              <div className="bg-gradient-to-br from-tropic-green to-tropic-deep rounded-[3rem] p-8 text-white text-center shadow-2xl mb-8">
                <Sparkle size={48} className="mx-auto mb-6 text-tropic-sunset" weight="fill" />
                <h3 className="text-2xl font-black tracking-tighter mb-3">Plan with AI</h3>
                <p className="text-sm text-white/70 font-medium leading-relaxed mb-8">
                  Tell us your preferences and our AI will craft a personalized Catarman itinerary.
                </p>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate('/planner')}
                  className="w-full bg-white text-tropic-green py-5 rounded-2xl font-bold text-sm shadow-xl flex items-center justify-center gap-3"
                >
                  <Sparkle size={20} weight="fill" />
                  Start Planning
                </motion.button>
              </div>
              <div className="bg-white rounded-[2rem] border border-gray-100 p-6 shadow-[var(--shadow-sm)]">
                <h4 className="text-lg font-black text-tropic-green tracking-tighter mb-4">How it works</h4>
                <div className="space-y-4">
                  {[
                    { step: '1', text: 'Tell us your travel dates and group size' },
                    { step: '2', text: 'Choose your interests and travel style' },
                    { step: '3', text: 'AI generates a day-by-day itinerary' },
                    { step: '4', text: 'Book activities directly from the plan' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-tropic-emerald/10 text-tropic-emerald font-black text-xs flex items-center justify-center shrink-0">
                        {item.step}
                      </div>
                      <span className="text-xs font-semibold text-tropic-green/70">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'pass' && (
            <motion.div 
              key="pass"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-6 flex flex-col items-center pb-40"
            >
              <header className="mb-14 text-center pt-8">
                <div className="w-20 h-20 bg-gradient-to-br from-tropic-emerald to-tropic-ocean text-white rounded-[2rem] flex items-center justify-center mx-auto mb-6 tropic-shadow-xl border border-white/20">
                  <Ticket size={40} weight='regular' />
                </div>
                <h2 className="text-4xl font-black text-tropic-green tracking-tighter mb-2">Travel Pass</h2>
                <p className="text-tropic-green/50 text-sm font-medium tracking-tight">Your digital travel pass</p>
              </header>
              
              <div className="w-full aspect-square max-w-[320px] bg-white rounded-[4rem] border-8 border-tropic-sand/30 tropic-shadow-xl flex items-center justify-center relative group p-10 mb-12">
                <div className="absolute top-8 left-8 w-8 h-8 border-t-4 border-l-4 border-tropic-emerald rounded-tl-xl"></div>
                <div className="absolute top-8 right-8 w-8 h-8 border-t-4 border-r-4 border-tropic-emerald rounded-tr-xl"></div>
                <div className="absolute bottom-8 left-8 w-8 h-8 border-b-4 border-l-4 border-tropic-emerald rounded-bl-xl"></div>
                <div className="absolute bottom-8 right-8 w-8 h-8 border-b-4 border-r-4 border-tropic-emerald rounded-br-xl"></div>
                <QRCodeCanvas
                  value={user?.uid ? `islandos://pass/${user.uid}` : 'islandos://pass/guest'}
                  size={200}
                  bgColor="#ffffff"
                  fgColor="#064E3B"
                  level="M"
                  includeMargin
                />
              </div>

              <div className="w-full bg-gradient-to-br from-tropic-green to-tropic-deep p-10 rounded-[3.5rem] text-white shadow-2xl relative border border-white/10 overflow-hidden">
                <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
                  <Sparkle size={200} className="translate-x-12 -translate-y-12 rotate-12" />
                </div>
                <div className="flex justify-between items-start mb-10 relative z-10">
                  <div>
                    <span className="text-[10px] font-semibold text-white/40 tracking-tight mb-2 block">Passenger</span>
                    <p className="text-2xl font-black tracking-tighter">{user?.displayName || 'Traveler'}</p>
                  </div>
                  <div className="w-12 h-12 bg-white/10 backdrop-blur-2xl rounded-xl flex items-center justify-center border border-white/20">
                    <ShieldCheck size={24} weight='bold' className="text-tropic-sunset" />
                  </div>
                </div>
                <div className="flex justify-between items-end relative z-10">
                  <div className="space-y-1">
                    <span className="block text-[10px] font-semibold text-white/40 tracking-tight">Pass ID</span>
                    <span className="font-mono text-xs font-black tracking-widest text-tropic-sunset">TRV-P-{user?.uid?.slice(-6).toUpperCase() || 'GUEST'}</span>
                  </div>
                  <div className="px-5 py-2 bg-gradient-to-r from-tropic-sunset to-tropic-coral text-white rounded-full text-[10px] font-bold tracking-wider">
                    Active
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
                <div className="w-32 h-32 rounded-[3rem] bg-white border-8 border-tropic-sand/30 tropic-shadow-xl flex items-center justify-center relative overflow-hidden mb-6">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || ''} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <User size={60} className="text-tropic-sand/60" />
                  )}
                  <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-gradient-to-br from-tropic-emerald to-tropic-ocean text-white rounded-xl flex items-center justify-center border-4 border-white tropic-shadow-lg">
                    <CheckCircle size={16} weight='fill' />
                  </div>
                </div>
                <h2 className="text-3xl font-black text-tropic-green tracking-tighter">
                  {user?.displayName || 'Digital Agent'}
                </h2>
                <p className="text-tropic-green/40 text-[10px] font-semibold tracking-tight mt-3">
                  {profile?.role || 'TOURIST'}
                </p>
              </header>

              {!user ? (
                <button 
                  onClick={login}
                  className="w-full bg-gradient-to-r from-tropic-emerald to-tropic-ocean text-white font-black py-6 rounded-3xl text-sm shadow-xl shadow-tropic-emerald/20 active:scale-95 transition-all"
                >
                  Sign In
                </button>
              ) : (
                <div className="space-y-10">
                  <div>
                    <div className="flex justify-between items-center mb-6 px-2">
                      <h3 className="text-xl font-black text-tropic-green tracking-tighter">My Bookings</h3>
                      <span className="text-[10px] font-bold text-tropic-emerald tracking-wider bg-tropic-emerald/10 px-3 py-1 rounded-full">
                        {bookings.length} total
                      </span>
                    </div>
                    
                    <div className="space-y-4 max-h-[40vh] overflow-y-auto no-scrollbar pr-2">
                      {bookings.length === 0 ? (
                        <div className="py-16 bg-tropic-sand/30 rounded-[2.5rem] text-center border-2 border-dashed border-tropic-sand/50">
                          <Sparkle className="mx-auto text-tropic-sand/50 mb-4" size={48} />
                          <p className="text-[10px] font-semibold text-tropic-green/30 tracking-tight">No bookings yet</p>
                        </div>
                      ) : (
                        bookings.map((booking) => (
                          <div key={booking.id} className="p-6 bg-white rounded-[2rem] border border-tropic-sand/30 tropic-shadow relative overflow-hidden group">
                            {booking.paymentStatus === 'PAID' && (
                               <div className="absolute top-0 right-0 w-14 h-14 bg-gradient-to-br from-tropic-emerald to-tropic-ocean text-white rounded-bl-[2rem] flex items-center justify-center tropic-shadow-lg">
                                 <CheckCircle size={24} weight='bold' />
                               </div>
                            )}
                            <div className="mb-4">
                              <span className="text-[10px] font-bold text-tropic-emerald tracking-wider mb-1 block">{booking.serviceType}</span>
                              <h4 className="text-xl font-black text-tropic-green tracking-tighter leading-none">{booking.serviceName}</h4>
                            </div>
                            <div className="flex justify-between items-end">
                              <div className="space-y-1">
                                <span className="block text-[10px] font-semibold text-tropic-green/40 tracking-tight">Amount</span>
                                <span className="text-xl font-black text-tropic-green">₱{booking.amount?.toLocaleString()}</span>
                              </div>
                              {booking.paymentStatus === 'UNPAID' && (
                                <button 
                                  onClick={() => handlePay(booking.id)}
                                  className="bg-gradient-to-r from-tropic-green to-tropic-deep text-white px-6 py-3 rounded-xl text-[10px] font-bold tracking-wider shadow-lg shadow-tropic-green/20 active:scale-95 transition-all"
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
                    <ProfileItem icon={Building} label="Claim a Business" onClick={() => navigate('/claim-business')} />
                  </div>

                  <button 
                    onClick={logout}
                    className="w-full mt-10 py-6 bg-tropic-sand/40 text-tropic-rose rounded-3xl text-xs font-semibold tracking-tight border border-tropic-sand/30 active:scale-95 transition-all hover:bg-tropic-rose/10"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Overlays (Spot Details & Booking) */}
      <AnimatePresence>
        {selectedSpot && !showBooking && (
          <DestinationDetail
            spot={selectedSpot}
            images={spotImageGallery(selectedSpot)}
            onBack={() => { setSelectedSpot(null); setShowBooking(false); }}
            onStartTrip={() => setShowBooking(true)}
          />
        )}

        {selectedSpot && showBooking && (
          <motion.div 
            key="booking-flow"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute inset-0 bg-white z-[60] flex flex-col overflow-y-auto no-scrollbar pb-32"
          >
            {/* Booking Header */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-3xl z-10 px-6 pt-6 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <motion.button 
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowBooking(false)}
                  className="w-11 h-11 bg-white/70 rounded-full flex items-center justify-center text-tropic-green border border-tropic-sand/30"
                >
                  <ArrowLeft size={20} />
                </motion.button>
                <div>
                  <h3 className="text-lg font-bold text-tropic-green tracking-tight leading-tight">{selectedSpot.name}</h3>
                  <p className="text-[10px] text-tropic-green/40 font-medium">₱{selectedSpot.price?.toLocaleString()} / night</p>
                </div>
              </div>
            </div>

            <div className="px-6 pt-6 space-y-8 flex-1">
              {/* Calendar */}
              <div>
                <h4 className="text-sm font-bold text-tropic-green mb-4 flex items-center gap-2">
                  <CalendarBlank size={18} className="text-tropic-ocean" /> Select dates
                </h4>
                <MonthCalendar 
                  checkIn={checkIn} checkOut={checkOut}
                  onSelectCheckIn={setCheckIn} onSelectCheckOut={setCheckOut}
                />
              </div>

              {/* Guest Selector */}
              <div>
                <h4 className="text-sm font-bold text-tropic-green mb-4">Guests</h4>
                <div className="bg-white rounded-3xl p-5 border border-tropic-sand/30 tropic-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-semibold text-tropic-green">Adults</span>
                      <p className="text-[10px] text-tropic-green/40 font-medium">Ages 13+</p>
                    </div>
                    <div className="flex items-center gap-5">
                      <button 
                        onClick={() => setGuests(Math.max(1, guests - 1))}
                        className="w-9 h-9 rounded-full bg-tropic-sand/30 flex items-center justify-center text-tropic-green border border-tropic-sand/30 hover:bg-tropic-green hover:text-white transition-all"
                      >
                        <Minus size={16} weight='bold' />
                      </button>
                      <span className="w-8 text-center text-lg font-bold text-tropic-green">{guests}</span>
                      <button 
                        onClick={() => setGuests(Math.min(10, guests + 1))}
                        className="w-9 h-9 rounded-full bg-tropic-sand/30 flex items-center justify-center text-tropic-green border border-tropic-sand/30 hover:bg-tropic-green hover:text-white transition-all"
                      >
                        <Plus size={16} weight='bold' />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Add-ons */}
              <div>
                <h4 className="text-sm font-bold text-tropic-green mb-4">Add-ons</h4>
                <div className="space-y-3">
                  {[
                    { id: 'breakfast', label: 'Breakfast Bundle', price: 250, icon: Coffee },
                    { id: 'lateCheckin', label: 'Late Check-in', price: 150, icon: Moon },
                  ].map(item => (
                    <button
                      key={item.id}
                      onClick={() => setAddons(prev => ({ ...prev, [item.id]: !(prev as any)[item.id] }))}
                      className={`w-full flex items-center justify-between p-5 rounded-3xl border-2 transition-all ${
                        (addons as any)[item.id] 
                          ? 'border-tropic-green bg-tropic-green/5 tropic-shadow' 
                          : 'border-tropic-sand/30 bg-white hover:border-tropic-sage/50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                          (addons as any)[item.id] ? 'bg-gradient-to-br from-tropic-emerald to-tropic-ocean text-white' : 'bg-tropic-sand/30 text-tropic-green/40'
                        }`}>
                          <item.icon size={20} weight='regular' />
                        </div>
                        <div className="text-left">
                          <span className="block text-sm font-bold text-tropic-green">{item.label}</span>
                          <span className="text-[10px] text-tropic-green/40 font-medium">+ ₱{item.price}</span>
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                        (addons as any)[item.id] ? 'bg-tropic-green border-tropic-green text-white' : 'border-tropic-sand'
                      }`}>
                        {(addons as any)[item.id] && <CheckCircle size={14} weight='fill' />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Summary */}
              <div className="bg-white rounded-3xl p-6 space-y-4 border border-tropic-sand/30 tropic-shadow">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-tropic-green/60">₱{selectedSpot.price?.toLocaleString()} x {Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)))} nights</span>
                  <span className="text-sm font-semibold text-tropic-green">₱{(selectedSpot.price || 0) * Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)))}</span>
                </div>
                {addons.breakfast && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-tropic-green/60">Breakfast Bundle</span>
                    <span className="text-tropic-green">+ ₱250</span>
                  </div>
                )}
                {addons.lateCheckin && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-tropic-green/60">Late Check-in</span>
                    <span className="text-tropic-green">+ ₱150</span>
                  </div>
                )}
                <div className="border-t border-tropic-sand/50 pt-4 flex justify-between items-center">
                  <span className="text-base font-bold text-tropic-green">Total</span>
                  <span className="text-xl font-black text-tropic-green">
                    ₱{(
                      (selectedSpot.price || 0) * Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))) +
                      (addons.breakfast ? 250 : 0) +
                      (addons.lateCheckin ? 150 : 0)
                    ).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Confirm Button */}
              <div className="pt-4 pb-8">
                <motion.button 
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleBook(selectedSpot, selectedSpot.serviceType || selectedSpot.type || 'spot')}
                  disabled={bookingStatus[selectedSpot.id] === 'loading' || bookingStatus[selectedSpot.id] === 'success'}
                  className="w-full bg-gradient-to-r from-tropic-green to-tropic-deep text-white py-5 rounded-2xl font-bold text-sm shadow-xl shadow-tropic-green/20 hover:shadow-tropic-green/40 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {bookingStatus[selectedSpot.id] === 'success' ? (
                    <><CheckCircle size={22} /> Booking Confirmed</>
                  ) : bookingStatus[selectedSpot.id] === 'loading' ? (
                    <ArrowsClockwise size={22} className="animate-spin" />
                  ) : (
                    <>Book now — ₱{(
                      (selectedSpot.price || 0) * Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))) +
                      (addons.breakfast ? 250 : 0) +
                      (addons.lateCheckin ? 150 : 0)
                    ).toLocaleString()}</>
                  )}
                </motion.button>
              </div>
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
              className="absolute bottom-28 right-6 bg-gradient-to-r from-[var(--accent-start)] to-[var(--accent-end)] text-white px-6 py-4 rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl flex items-center gap-2 group border border-white/20"
            >
              <Sparkle size={18} className="animate-pulse" />
              <span>Plan with AI</span>
            </motion.button>

            <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className={`flex justify-center items-center ${isDesktop ? 'min-h-[calc(100vh-64px)] bg-[#F4F6F8] p-6 md:p-14' : 'min-h-screen bg-white'}`}>
      {isDesktop ? (
        <div className="relative w-full max-w-[440px] aspect-[9/19.5] bg-tropic-cream rounded-[5rem] shadow-[0_0_0_14px_#1a3a2a,0_60px_100px_-20px_rgba(45,106,79,0.45)] overflow-hidden border-[12px] border-tropic-green ring-[16px] ring-white">
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-10 bg-tropic-green rounded-b-[2.5rem] z-50 flex items-center justify-center">
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

function MonthCalendar({ checkIn, checkOut, onSelectCheckIn, onSelectCheckOut }: { 
  checkIn: Date; checkOut: Date; 
  onSelectCheckIn: (d: Date) => void; onSelectCheckOut: (d: Date) => void 
}) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selecting, setSelecting] = useState<'checkin' | 'checkout'>('checkin');

  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const isInRange = (d: Date) => d > checkIn && d < checkOut;
  const isSameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

  const handleDayClick = (day: number) => {
    const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    if (selecting === 'checkin') {
      onSelectCheckIn(date);
      setSelecting('checkout');
    } else {
      if (date <= checkIn) {
        onSelectCheckIn(date);
        setSelecting('checkout');
      } else {
        onSelectCheckOut(date);
        setSelecting('checkin');
      }
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-tropic-sand/30 tropic-shadow">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1))} className="w-9 h-9 rounded-full bg-tropic-sand/30 flex items-center justify-center text-tropic-green/60 hover:bg-tropic-green hover:text-white transition-all">
          <CaretLeft size={18} weight='bold' />
        </button>
        <div className="text-center">
          <span className="text-base font-bold text-tropic-green tracking-tight">{viewDate.toLocaleString('default', { month: 'long' })}</span>
          <span className="text-base font-bold text-tropic-green/40 ml-2">{viewDate.getFullYear()}</span>
        </div>
        <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1))} className="w-9 h-9 rounded-full bg-tropic-sand/30 flex items-center justify-center text-tropic-green/60 hover:bg-tropic-green hover:text-white transition-all">
          <CaretRight size={18} weight='bold' />
        </button>
      </div>

      <div className="flex items-center justify-center gap-4 mb-6">
        <button onClick={() => setSelecting('checkin')} className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${selecting === 'checkin' ? 'bg-gradient-to-r from-tropic-green to-tropic-deep text-white tropic-shadow' : 'bg-tropic-sand/30 text-tropic-green/60'}`}>
          Check-in
        </button>
        <button onClick={() => setSelecting('checkout')} className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${selecting === 'checkout' ? 'bg-gradient-to-r from-tropic-green to-tropic-deep text-white tropic-shadow' : 'bg-tropic-sand/30 text-tropic-green/60'}`}>
          Check-out
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(d => (
          <div key={d} className="text-center text-[10px] font-semibold text-tropic-green/40 py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {emptyDays.map(i => <div key={`e-${i}`} />)}
        {days.map(d => {
          const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), d);
          const isCI = isSameDay(date, checkIn);
          const isCO = isSameDay(date, checkOut);
          const inRange = isInRange(date);
          const isPast = date <= today;
          return (
            <button
              key={d}
              onClick={() => !isPast && handleDayClick(d)}
              disabled={isPast}
              className={`p-2 text-sm font-semibold rounded-full transition-all relative
                ${isCI || isCO ? 'bg-gradient-to-r from-tropic-green to-tropic-deep text-white shadow-lg scale-105 z-10' : ''}
                ${inRange ? 'bg-tropic-sage/20 text-tropic-green' : ''}
                ${!isCI && !isCO && !inRange && !isPast ? 'text-tropic-green/70 hover:bg-tropic-sand/20' : ''}
                ${isPast ? 'text-tropic-sand/50 cursor-not-allowed' : ''}
              `}
            >
              {d}
            </button>
          );
        })}
      </div>
      <div className="flex justify-between mt-4 pt-4 border-t border-tropic-sand/30 text-xs text-tropic-green/50 font-medium">
        <span>Check-in: <strong className="text-tropic-green">{checkIn.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</strong></span>
        <span>Check-out: <strong className="text-tropic-green">{checkOut.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</strong></span>
      </div>
    </div>
  );
}

const spotImageGallery = (spot: any) => {
  const images = [
    spot.image,
    '/images/tuasan.jpg',
    '/images/borasoda.png',
    '/images/sto.nino.jpg',
  ];
  return images;
};

function ProfileItem({ icon: Icon, label, count, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className="w-full p-8 bg-white rounded-[3rem] border-2 border-tropic-sand/30 flex items-center justify-between group hover:bg-tropic-sand/20 hover:border-tropic-emerald/30 transition-all tropic-shadow active:scale-[0.98]"
    >
      <div className="flex items-center gap-6">
        <div className="w-14 h-14 bg-tropic-sand/30 text-tropic-green rounded-2xl flex items-center justify-center group-hover:tropic-mint-gradient group-hover:text-white transition-all duration-500 border border-tropic-sand/30">
          <Icon size={26} weight='regular' />
        </div>
        <span className="text-lg font-black text-tropic-green tracking-tighter">{label}</span>
      </div>
      {count ? (
        <span className="px-4 py-1.5 bg-gradient-to-r from-tropic-emerald to-tropic-ocean text-white rounded-full text-[10px] font-black shadow-xl">{count}</span>
      ) : (
        <CaretRight size={22} weight="bold" className="text-tropic-sand/50 group-hover:text-tropic-emerald group-hover:translate-x-1 transition-all" />
      )}
    </button>
  );
}
