import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db, handleFirestoreError, OperationType, Timestamp } from '../firebase';
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, limit, where } from 'firebase/firestore';
import { toast } from 'sonner';
import { UilArrowRight, UilCompass, UilBuilding, UilTennisBall, UilMapMarker, UilPhone, UilEnvelopeAlt, UilFacebook, UilCheckCircle, UilArrowLeft, UilCalendarAlt, UilPlus, UilMinus, UilUsersAlt, UilSync, UilBedDouble, UilExclamationCircle } from '@/icons';
import { DININGGASAN_IMAGES, DININGGASAN_ROOM_COUNT } from '../data/dininggasanData';

const amenities = [
  'Free Wi-Fi', 'Air Conditioning', 'Hot & Cold Shower', 'Parking', 'CCTV', 'Event-ready Space',
];

const ROOM_PRICE = 3800;
const MAX_ADULTS = 8;

const tourPackages = [
  {
    id: 'tour-heritage',
    name: 'Heritage Trail',
    duration: 'Half Day',
    price: 500,
    persons: 5,
    description: 'Explore Catarman\'s rich history — Sunken Cemetery, Old Church Ruins, and the historic Catarman Church.',
    inclusions: ['Guide', 'Entrance Fees', 'Round-trip Transport'],
  },
  {
    id: 'tour-nature',
    name: 'Island Nature Escape',
    duration: 'Full Day',
    price: 1200,
    persons: 5,
    description: 'Tuasan Falls, Katibawasan Falls, and Ardent Hot Springs — the best of Camiguin\'s natural wonders.',
    inclusions: ['Guide', 'Entrance Fees', 'Lunch', 'Round-trip Transport'],
  },
  {
    id: 'tour-circumferential',
    name: 'Camiguin Circumferential',
    duration: 'Full Day',
    price: 1500,
    persons: 5,
    description: 'A complete island tour covering all major landmarks, beaches, and viewpoints around Camiguin.',
    inclusions: ['Guide', 'Entrance Fees', 'Lunch', 'Snacks', 'Round-trip Transport'],
  },
  {
    id: 'tour-food',
    name: 'Camiguin Food Trip',
    duration: 'Half Day',
    price: 800,
    persons: 5,
    description: 'Taste your way through Camiguin — local delicacies, fresh seafood, and the famous lanzones.',
    inclusions: ['Food Tasting', 'Local Guide', 'Round-trip Transport'],
  },
];

export default function DininggasanHome() {
  const navigate = useNavigate();
  const { user, login } = useAuth();

  const bgImages = [
    '/images/dininggasan/736019840_879569734737182_4910857333828317433_n.jpg',
    '/images/dininggasan/736931370_2792978721062810_1238064698030272327_n.jpg',
    '/images/dininggasan/737383602_26625630437112405_7161482258112319983_n.jpg',
    '/images/dininggasan/737827220_1339672174254548_923328153894047872_n.jpg',
  ];
  const [index, setIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    v.currentTime = 0;
    v.play().catch(() => {});
  }, [index === 0]);
  useEffect(() => {
    if (index === 0) return;
    const t = setInterval(() => setIndex(i => (i + 1) % (bgImages.length + 1)), 5000);
    return () => clearInterval(t);
  }, [index === 0]);

  const [showRoomBooking, setShowRoomBooking] = useState(false);
  const [showTourBooking, setShowTourBooking] = useState(false);
  const [selectedTour, setSelectedTour] = useState<typeof tourPackages[0] | null>(null);
  const [latestBroadcast, setLatestBroadcast] = useState<any>(null);
  const [roomBookings, setRoomBookings] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'bookings'), where('businessId', '==', 'dininggasan-catarman')), snap => {
      setRoomBookings(snap.docs.map(d => ({ id: d.id, ...d.data() } as any)));
    }, () => {});
    return () => unsub();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'broadcasts'), orderBy('createdAt', 'desc'), limit(1));
    const unsub = onSnapshot(q, snap => {
      if (!snap.empty) {
        const d = snap.docs[0];
        const data = { id: d.id, ...d.data() } as any;
        const ageMs = Date.now() - (data.createdAt?.toMillis?.() || 0);
        // ponytail: only show alerts from the last 48h
        if (ageMs < 48 * 60 * 60 * 1000) setLatestBroadcast(data);
        else setLatestBroadcast(null);
      } else {
        setLatestBroadcast(null);
      }
    }, () => {});
    return () => unsub();
  }, []);
  
  const [checkIn, setCheckIn] = useState(new Date(2026, 6, 15));
  const [checkOut, setCheckOut] = useState(new Date(2026, 6, 18));
  const [adults, setAdults] = useState(2);
  const [purposeOfVisit, setPurposeOfVisit] = useState<'leisure' | 'business' | 'family' | 'transit' | 'other'>('leisure');
  const [roomStatus, setRoomStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const roomSubmitting = useRef(false);

  const nights = Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)));
  const roomTotal = ROOM_PRICE * nights;

  const getRoomTile = (roomNum: string, rangeStart: Date, rangeEnd: Date) => {
    const start = rangeStart.toISOString().split('T')[0];
    const end = rangeEnd.toISOString().split('T')[0];
    const b = roomBookings.find(bk => {
      if (bk.roomNumber !== roomNum) return false;
      if (bk.status === 'cancelled') return false;
      const r = bk.date?.split(' - ') || [];
      if (r.length !== 2) return false;
      const ci = new Date(r[0]).toISOString().split('T')[0];
      const co = new Date(r[1]).toISOString().split('T')[0];
      return start < co && end > ci;
    });
    if (!b) return { status: 'available', color: 'bg-gray-100 text-gray-600 border-gray-200', label: 'Free' };
    if (b.status === 'confirmed' || b.status === 'checked_in') return { status: 'booked', color: 'bg-red-100 text-red-700 border-red-200', label: 'Booked' };
    return { status: 'pending', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', label: 'Pending' };
  };

  const pickFreeRoom = async (rangeStart: Date, rangeEnd: Date): Promise<string | null> => {
    const start = rangeStart.toISOString().split('T')[0];
    const end = rangeEnd.toISOString().split('T')[0];
    const taken = new Set(
      roomBookings
        .filter(bk => {
          if (bk.status === 'cancelled') return false;
          const r = bk.date?.split(' - ') || [];
          if (r.length !== 2) return false;
          const ci = new Date(r[0]).toISOString().split('T')[0];
          const co = new Date(r[1]).toISOString().split('T')[0];
          return start < co && end > ci;
        })
        .map(bk => bk.roomNumber)
        .filter(Boolean)
    );
    for (let i = 1; i <= DININGGASAN_ROOM_COUNT; i++) {
      const num = String(i).padStart(2, '0');
      if (!taken.has(num)) return num;
    }
    return null;
  };

  const handleRoomBook = async () => {
    if (!user) { login(); return; }
    if (roomSubmitting.current) return;
    roomSubmitting.current = true;
    setRoomStatus('loading');
    try {
      const roomNumber = await pickFreeRoom(checkIn, checkOut);
      if (!roomNumber) {
        setRoomStatus('idle'); roomSubmitting.current = false;
        toast.error('No rooms available for those dates');
        return;
      }
      await addDoc(collection(db, 'bookings'), {
        touristUid: user.uid, touristName: user.displayName || 'Anonymous',
        serviceId: 'stay-dininggasan', serviceName: 'Dininggasan Room',
        serviceType: 'stay', businessId: 'dininggasan-catarman',
        roomNumber,
        date: `${checkIn.toLocaleDateString()} - ${checkOut.toLocaleDateString()}`,
        checkInTimestamp: Timestamp.fromDate(checkIn), checkOutTimestamp: Timestamp.fromDate(checkOut),
        adults, purposeOfVisit, amount: roomTotal, totalPrice: roomTotal,
        status: 'pending', paymentStatus: 'UNPAID', createdAt: serverTimestamp()
      });
      setRoomStatus('success');
      toast.success(`Room ${roomNumber} booked!`);
      setTimeout(() => { setRoomStatus('idle'); setShowRoomBooking(false); roomSubmitting.current = false; }, 2000);
    } catch (error) {
      setRoomStatus('idle'); roomSubmitting.current = false;
      handleFirestoreError(error, OperationType.CREATE, 'bookings');
    }
  };

  const handleTourBook = async () => {
    if (!user) { login(); return; }
    if (!selectedTour) return;
    if (roomSubmitting.current) return;
    
    roomSubmitting.current = true;
    setRoomStatus('loading');
    try {
      await addDoc(collection(db, 'bookings'), {
        touristUid: user.uid, 
        touristName: user.displayName || 'Anonymous',
        serviceId: selectedTour.id, 
        serviceName: selectedTour.name,
        serviceType: 'tour', 
        businessId: 'dininggasan-catarman',
        date: checkIn.toLocaleDateString(), // Assuming checkIn date for tour
        amount: selectedTour.price, 
        totalPrice: selectedTour.price,
        status: 'pending', 
        paymentStatus: 'UNPAID', 
        createdAt: serverTimestamp()
      });
      setRoomStatus('success');
      toast.success('Tour booked successfully!');
      setTimeout(() => { 
        setRoomStatus('idle'); 
        setShowTourBooking(false); 
        setSelectedTour(null);
        roomSubmitting.current = false; 
      }, 2000);
    } catch (error) {
      setRoomStatus('idle'); roomSubmitting.current = false;
      handleFirestoreError(error, OperationType.CREATE, 'bookings');
    }
  };

  return (
    <div>
      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <AnimatePresence initial={false}>
          {index > 0 && (
          <motion.div
            key={index}
            initial={{ clipPath: 'inset(0 100% 0 0)' }}
            animate={{ clipPath: 'inset(0 0 0 0)' }}
            exit={{ clipPath: 'inset(0 0 0 100%)' }}
            transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${bgImages[index - 1]})` }}
          />
          )}
        </AnimatePresence>
        <video
          ref={videoRef}
          src="/dininggasanlogo.mp4"
          autoPlay
          muted
          playsInline
          preload="auto"
          onEnded={() => setIndex(1)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${index > 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 text-center px-6">
          <motion.span initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="inline-block text-[11px] font-semibold text-[#8b7355] uppercase tracking-[0.15em] mb-8">
            Catarman, Camiguin
          </motion.span>
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-center font-delmon text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-light text-white tracking-[-0.03em] mb-4 sm:mb-6 leading-[0.9] uppercase">
            Dininggasan
            <span className="block font-sans text-lg sm:text-xl md:text-2xl lg:text-3xl font-light tracking-[0.05em] mt-2">Riverside Inn</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl text-white/70 font-normal leading-relaxed mb-8 sm:mb-12 max-w-xl mx-auto">
            Tour packages, rooms, function room, and pickleball — your Camiguin experience starts here.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-3 px-4">
            <button onClick={() => setShowRoomBooking(true)}
              className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl bg-gradient-to-r from-[#8b7355] to-[#a0865f] text-white text-sm font-bold shadow-lg shadow-[#8b7355]/30 hover:shadow-xl hover:shadow-[#8b7355]/40 hover:scale-[1.02] active:scale-[0.97] transition-all">
              Book a Room
            </button>
            <button onClick={() => navigate('/function-room')}
              className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl border-2 border-[#8b7355]/60 text-white text-sm font-bold hover:bg-[#8b7355]/10 hover:border-[#8b7355] shadow-lg shadow-black/20 hover:shadow-[#8b7355]/20 hover:scale-[1.02] active:scale-[0.97] transition-all">
              Reserve Function Room
            </button>
          </motion.div>
        </div>
      </section>

      {latestBroadcast && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 flex items-start gap-3">
          <UilExclamationCircle size="18" className="text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-widest">Island Alert</span>
            <p className="text-sm text-amber-900 font-medium">{latestBroadcast.message}</p>
          </div>
          <button onClick={() => setLatestBroadcast(null)} className="text-amber-500 hover:text-amber-700 text-xs font-bold">Dismiss</button>
        </div>
      )}

      <section id="about" className="max-w-5xl mx-auto px-6 py-32">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-24">
          <span className="text-[11px] font-semibold text-[#8b7355] uppercase tracking-[0.15em]">About</span>
          <h2 className="text-4xl md:text-5xl font-light text-[#1d1d1f] tracking-[-0.02em] mt-3 mb-5">
            Welcome to Dininggasan
          </h2>
          <p className="text-[#6e6e73] text-lg leading-relaxed max-w-2xl mx-auto">
            Situated in the heart of Catarman, Camiguin, Dininggasan offers tour packages, comfortable rooms,
            a versatile function room for events, and a pickleball court for some friendly fun.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { title: 'Tour Packages', description: 'Heritage walks, island tours, nature escapes, and food trips — all guided and hassle-free.', action: 'Book Tour', onClick: () => { setSelectedTour(tourPackages[0]); setShowTourBooking(true); } },
            { title: 'Rooms', description: `${DININGGASAN_ROOM_COUNT} rooms · up to ${MAX_ADULTS} guests at ₱${ROOM_PRICE.toLocaleString()}/night. Perfect for families and groups.`, action: 'Book Now', onClick: () => setShowRoomBooking(true) },
            { title: 'Function Room', description: 'Morning until 5:00 PM (₱2,000 first 3 hrs, +₱200/hr) or night until 12:00 AM (₱3,000 first 3 hrs, +₱300/hr). Tables & chairs included.', action: 'Reserve Now', onClick: () => navigate('/function-room') },
            { title: 'Pickleball Court', description: 'Enjoy a game on our pickleball court. ₱150/hr for non-guests, free for guests.', action: 'Inquire', onClick: () => navigate('/function-room') },
          ].map((item, i) => (
            <motion.div key={item.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="bg-white rounded-2xl border border-[#e8e8ed] p-8 hover:shadow-lg hover:shadow-black/[0.02] transition-all group">
              <h3 className="text-xl font-semibold text-[#1d1d1f] tracking-[-0.01em] mb-3">{item.title}</h3>
              <p className="text-[#6e6e73] text-sm leading-relaxed mb-8">{item.description}</p>
              <button onClick={item.onClick}
                className="flex items-center gap-1.5 text-sm font-semibold text-[#8b7355] hover:text-[#6b5a40] transition-all group/btn">
                {item.action}
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="bg-[#fafafa] py-32">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-16">
            <span className="text-[11px] font-semibold text-[#8b7355] uppercase tracking-[0.15em]">Tours</span>
            <h2 className="text-4xl md:text-5xl font-light text-[#1d1d1f] tracking-[-0.02em] mt-3">
              Explore Camiguin With Us
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {tourPackages.map((tour, i) => (
              <motion.div key={tour.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="bg-white rounded-2xl border border-[#e8e8ed] overflow-hidden hover:shadow-lg transition-all group">
                <div className="relative h-44 bg-[#f5f5f7] overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center text-[#8b7355]">
                    <UilCompass size="48" className="opacity-30" />
                  </div>
                  <div className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-[10px] font-semibold text-[#8b7355]">
                    {tour.duration}
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-[#1d1d1f]">{tour.name}</h3>
                    <span className="text-lg font-semibold text-[#1d1d1f]">₱{tour.price.toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-[#6e6e73] leading-relaxed mb-3">{tour.description}</p>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {tour.inclusions.map((inc, j) => (
                      <span key={j} className="px-2 py-0.5 bg-[#f5f5f7] rounded-md text-[10px] font-medium text-[#6e6e73]">{inc}</span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-[#8b7355]">
                      {tour.duration} · Up to {tour.persons} pax
                    </div>
                    <button 
                      onClick={() => { setSelectedTour(tour); setShowTourBooking(true); }}
                      className="px-4 py-2 bg-[#8b7355] text-white text-xs font-bold rounded-lg hover:bg-[#6b5a40] transition-colors"
                    >
                      Book Tour
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="rooms" className="max-w-5xl mx-auto px-6 py-32">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-16">
          <span className="text-[11px] font-semibold text-[#8b7355] uppercase tracking-[0.15em]">Rooms</span>
          <h2 className="text-4xl md:text-5xl font-light text-[#1d1d1f] tracking-[-0.02em] mt-3">
            Comfortable Stay in Catarman
          </h2>
          <p className="text-[#6e6e73] text-lg max-w-xl mx-auto mt-4">
            {DININGGASAN_ROOM_COUNT} rooms, each good for up to {MAX_ADULTS} guests at ₱{ROOM_PRICE.toLocaleString()}/night. Ideal for families, groups, and travelers.
          </p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl border border-[#e8e8ed] overflow-hidden text-center">
            <img src={DININGGASAN_IMAGES.roomInterior} alt="Dininggasan Room"
              className="w-full h-48 object-cover" />
            <div className="p-8">
              <h3 className="text-2xl font-semibold text-[#1d1d1f] mb-2">Dininggasan Room</h3>
              <p className="text-[#6e6e73] text-sm mb-1">Up to {MAX_ADULTS} guests · Free Wi-Fi · Air Conditioning</p>
              <p className="text-3xl font-semibold text-[#1d1d1f] mb-6">₱{ROOM_PRICE.toLocaleString()}<span className="text-base font-normal text-[#6e6e73]">/night</span></p>
              <button onClick={() => setShowRoomBooking(true)}
                className="w-full px-7 py-3.5 rounded-xl bg-[#1d1d1f] text-white text-sm font-semibold hover:bg-[#2d2d2f] transition-all active:scale-[0.98]">
                Book This Room
              </button>
            </div>
          </div>
        </motion.div>

        {/* Tourist room availability strip */}
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mt-10 max-w-md mx-auto">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-[#6e6e73] uppercase tracking-wider">
              Availability · {checkIn.toLocaleDateString()} – {checkOut.toLocaleDateString()}
            </p>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {Array.from({ length: DININGGASAN_ROOM_COUNT }, (_, i) => {
              const num = String(i + 1).padStart(2, '0');
              const s = getRoomTile(num, checkIn, checkOut);
              return (
                <div key={num} className={`border rounded-lg py-2 text-center text-xs font-bold ${s.color}`}>
                  <div>{num}</div>
                  <div className="text-[9px] font-semibold">{s.label}</div>
                </div>
              );
            })}
          </div>
          <div className="flex gap-3 mt-3 text-[10px] text-[#6e6e73] font-medium">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-gray-100 border border-gray-200 inline-block" /> Free</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-yellow-100 border border-yellow-200 inline-block" /> Pending</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-red-100 border border-red-200 inline-block" /> Booked</span>
          </div>
        </motion.div>
      </section>

      <section id="facilities" className="bg-[#fafafa] py-32">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-16">
            <span className="text-[11px] font-semibold text-[#8b7355] uppercase tracking-[0.15em]">Amenities</span>
            <h2 className="text-4xl md:text-5xl font-light text-[#1d1d1f] tracking-[-0.02em] mt-3">
              Everything You Need
            </h2>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl mx-auto">
            {amenities.map((amenity, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3.5 rounded-xl bg-white border border-[#e8e8ed]">
                <UilCheckCircle size="16" className="text-emerald-500 shrink-0" />
                <span className="text-sm font-medium text-[#1d1d1f]">{amenity}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <section id="gallery" className="max-w-5xl mx-auto px-6 py-32">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-16">
          <span className="text-[11px] font-semibold text-[#8b7355] uppercase tracking-[0.15em]">Gallery</span>
          <h2 className="text-4xl md:text-5xl font-light text-[#1d1d1f] tracking-[-0.02em] mt-3">Our Place</h2>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="overflow-hidden">
          <div className="flex gap-3 gallery-marquee">
            {[...bgImages, ...bgImages].map((img, i) => (
              <div key={i} className="w-72 aspect-[4/3] shrink-0 rounded-2xl bg-cover bg-center overflow-hidden"
                style={{ backgroundImage: `url(${img})` }} />
            ))}
          </div>
        </motion.div>
      </section>

      <section id="contact" className="max-w-5xl mx-auto px-6 py-32">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="max-w-xl mx-auto text-center">
          <div className="w-12 h-12 rounded-xl bg-[#f5f5f7] flex items-center justify-center mx-auto mb-5">
            <UilMapMarker className="text-[#8b7355]" size="22" />
          </div>
          <h2 className="text-3xl font-semibold text-[#1d1d1f] tracking-[-0.01em] mb-2">Visit Us</h2>
          <p className="text-[#6e6e73] mb-1">Dinggasan Tourism Complex, Catarman, Philippines, 9104</p>
          <div className="flex flex-col items-center gap-2 mb-8">
            <div className="flex items-center gap-1.5 text-sm font-medium text-[#8b7355]">
              <UilPhone size="14" />
              <span>0997 577 8185</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm font-medium text-[#8b7355]">
              <UilEnvelopeAlt size="14" />
              <a href="mailto:lgucatarman50@gmail.com" className="hover:underline">lgucatarman50@gmail.com</a>
            </div>
            <a href="https://www.facebook.com/profile.php?id=61591491051099" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm font-medium text-[#8b7355] hover:underline">
              <UilFacebook size="14" />
              <span>LGU Catarman on Facebook</span>
            </a>
          </div>
          <div className="w-full h-64 rounded-2xl bg-[#f5f5f7] overflow-hidden border border-[#e8e8ed]">
            <iframe
              src="https://www.openstreetmap.org/export/embed.html?bbox=124.7,9.12,124.73,9.15&layer=mapnik&marker=9.1333,124.7167"
              width="100%" height="100%" style={{ border: 0 }}
              title="Dininggasan Location"
            />
          </div>
        </motion.div>
      </section>

      <section className="relative bg-[#1d1d1f] py-28">
        <div className="absolute inset-x-0 -top-16 md:-top-24 h-16 md:h-24 overflow-hidden" aria-hidden>
          <svg className="wave-slide block w-[200%] h-full fill-[#1d1d1f]" preserveAspectRatio="none" viewBox="0 0 1200 120">
            <path d="M0 60 C100 0 200 0 300 60 C400 120 500 120 600 60 C700 0 800 0 900 60 C1000 120 1100 120 1200 60 L1200 120 L0 120 Z" />
          </svg>
        </div>
        <div className="max-w-5xl mx-auto px-6 text-center">
          <motion.h2 initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-4xl md:text-5xl font-light text-white tracking-[-0.02em] mb-4">
            Ready to Explore?
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.05 }}
            className="text-[#86868b] mb-10 max-w-md mx-auto">
            Book a tour, reserve a room, or just drop by.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="flex flex-wrap justify-center gap-3 px-4">
            <button onClick={() => setShowRoomBooking(true)}
              className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl bg-gradient-to-r from-[#8b7355] to-[#a0865f] text-white text-sm font-bold shadow-lg shadow-[#8b7355]/30 hover:shadow-xl hover:shadow-[#8b7355]/40 hover:scale-[1.02] active:scale-[0.97] transition-all">
              Book a Room
            </button>
            <button onClick={() => navigate('/function-room')}
              className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl border-2 border-[#8b7355]/60 text-[#8b7355] text-sm font-bold hover:bg-[#8b7355] hover:text-white shadow-lg shadow-black/20 hover:shadow-[#8b7355]/30 hover:scale-[1.02] active:scale-[0.97] transition-all">
              Reserve Function Room
            </button>
          </motion.div>
        </div>
        <div className="max-w-5xl mx-auto px-6 mt-24 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-[#a1a1a6] text-sm font-medium">Dininggasan · Catarman, Camiguin</p>
          <p className="text-[#86868b] text-xs">Powered by Dininggasan</p>
        </div>
      </section>

      {/* Room Booking Modal */}
      <AnimatePresence>
        {showRoomBooking && (
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-0 bg-white z-[60] flex flex-col overflow-y-auto no-scrollbar">
            <div className="sticky top-0 bg-white/95 backdrop-blur-3xl z-10 px-5 md:px-6 pt-5 md:pt-6 pb-4 border-b border-[#e8e8ed]">
              <div className="flex items-center gap-4">
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => { setShowRoomBooking(false); setRoomStatus('idle'); }}
                  className="w-10 h-10 md:w-11 md:h-11 bg-[#f5f5f7] rounded-full flex items-center justify-center text-[#6e6e73] hover:bg-[#e8e8ed] transition-colors shrink-0">
                  <UilArrowLeft size="20" />
                </motion.button>
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-[#1d1d1f] tracking-tight">Book a Room</h3>
                  <p className="text-[11px] text-[#6e6e73]">Dininggasan · Catarman, Camiguin</p>
                </div>
              </div>
            </div>
            <div className="px-5 md:px-6 pt-5 md:pt-6 space-y-5 md:space-y-6 pb-8 max-w-lg mx-auto w-full">
              <div className="bg-[#fafafa] rounded-2xl p-5 border border-[#e8e8ed]">
                <div className="flex items-center gap-4">
                  <img src={DININGGASAN_IMAGES.roomInterior} alt="Dininggasan Room"
                    className="w-16 h-16 rounded-xl object-cover shrink-0" />
                  <div>
                    <p className="text-base font-semibold text-[#1d1d1f]">Dininggasan Room</p>
                    <p className="text-sm text-[#6e6e73]">₱{ROOM_PRICE.toLocaleString()}/night · Up to {MAX_ADULTS} guests</p>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[#1d1d1f] mb-3 flex items-center gap-2"><UilCalendarAlt size="16" className="text-[#8b7355]" /> Check-in / Check-out</h4>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-[9px] font-semibold text-[#6e6e73] mb-1 block uppercase tracking-wider">Check-in</label>
                    <input type="date" value={checkIn.toISOString().split('T')[0]}
                      onChange={e => { const d = new Date(e.target.value + 'T14:00:00'); setCheckIn(d); }}
                      className="w-full px-4 py-3 bg-[#f5f5f7] border-2 border-[#e8e8ed] rounded-xl outline-none text-sm font-medium text-[#1d1d1f] focus:border-[#8b7355] transition-colors" />
                  </div>
                  <div className="flex-1">
                    <label className="text-[9px] font-semibold text-[#6e6e73] mb-1 block uppercase tracking-wider">Check-out</label>
                    <input type="date" value={checkOut.toISOString().split('T')[0]}
                      onChange={e => { const d = new Date(e.target.value + 'T12:00:00'); setCheckOut(d); }}
                      className="w-full px-4 py-3 bg-[#f5f5f7] border-2 border-[#e8e8ed] rounded-xl outline-none text-sm font-medium text-[#1d1d1f] focus:border-[#8b7355] transition-colors" />
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[#1d1d1f] mb-3 flex items-center gap-2"><UilUsersAlt size="16" className="text-[#8b7355]" /> Guests</h4>
                <div className="bg-[#fafafa] rounded-2xl p-4 border border-[#e8e8ed]">
                  <div className="flex items-center justify-between">
                    <div><span className="text-sm font-medium text-[#1d1d1f]">Adults</span><span className="text-[9px] text-[#6e6e73] block font-medium">Max {MAX_ADULTS}</span></div>
                    <div className="flex items-center gap-4">
                      <button onClick={() => setAdults(Math.max(1, adults - 1))} className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-[#6e6e73] border border-[#d2d2d7] hover:bg-[#1d1d1f] hover:text-white transition-all"><UilMinus size="12" /></button>
                      <span className="w-6 text-center text-base font-semibold text-[#1d1d1f]">{adults}</span>
                      <button onClick={() => setAdults(Math.min(MAX_ADULTS, adults + 1))} className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-[#6e6e73] border border-[#d2d2d7] hover:bg-[#1d1d1f] hover:text-white transition-all"><UilPlus size="12" /></button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-[#fafafa] rounded-2xl p-4 border border-[#e8e8ed]">
                <div className="flex justify-between text-sm text-[#6e6e73]">
                  <span>₱{ROOM_PRICE.toLocaleString()} × {nights} night{nights > 1 ? 's' : ''}</span>
                  <span className="font-semibold">₱{roomTotal.toLocaleString()}</span>
                </div>
                <div className="border-t border-[#e8e8ed] pt-3 mt-3 flex justify-between items-center">
                  <span className="text-base font-semibold text-[#1d1d1f]">Total</span>
                  <span className="text-xl font-semibold text-[#1d1d1f]">₱{roomTotal.toLocaleString()}</span>
                </div>
              </div>
              {roomStatus === 'success' ? (
                <div className="text-center py-6">
                  <div className="w-14 h-14 bg-[#f5f5f7] rounded-full flex items-center justify-center mx-auto mb-3">
                    <UilCheckCircle size="28" className="text-emerald-600" />
                  </div>
                  <p className="text-lg font-semibold text-[#1d1d1f] tracking-tight mb-1">Room Booked!</p>
                  <p className="text-xs text-[#6e6e73] font-medium">Check your email for confirmation details.</p>
                </div>
              ) : (
                <motion.button whileTap={{ scale: 0.97 }} onClick={handleRoomBook}
                  disabled={roomStatus === 'loading'}
                  className="w-full bg-[#1d1d1f] text-white py-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2d2d2f]">
                  {roomStatus === 'loading' ? <UilSync size="22" className="animate-spin" /> : <><UilBedDouble size="18" /> Book — ₱{roomTotal.toLocaleString()}</>}
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tour Booking Modal */}
      <AnimatePresence>
        {showTourBooking && selectedTour && (
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-0 bg-white z-[60] flex flex-col overflow-y-auto no-scrollbar">
            <div className="sticky top-0 bg-white/95 backdrop-blur-3xl z-10 px-5 md:px-6 pt-5 md:pt-6 pb-4 border-b border-[#e8e8ed]">
              <div className="flex items-center gap-4">
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => { setShowTourBooking(false); setSelectedTour(null); setRoomStatus('idle'); }}
                  className="w-10 h-10 md:w-11 md:h-11 bg-[#f5f5f7] rounded-full flex items-center justify-center text-[#6e6e73] hover:bg-[#e8e8ed] transition-colors shrink-0">
                  <UilArrowLeft size="20" />
                </motion.button>
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-[#1d1d1f] tracking-tight">Book a Tour</h3>
                  <p className="text-[11px] text-[#6e6e73]">Dininggasan · Catarman, Camiguin</p>
                </div>
              </div>
            </div>
            <div className="px-5 md:px-6 pt-5 md:pt-6 space-y-5 md:space-y-6 pb-8 max-w-lg mx-auto w-full">
              <div className="bg-[#fafafa] rounded-2xl p-5 border border-[#e8e8ed]">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-[#f5f5f7] flex items-center justify-center text-[#8b7355]">
                    <UilCompass size="24" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-[#1d1d1f]">{selectedTour.name}</p>
                    <p className="text-sm text-[#6e6e73]">₱{selectedTour.price.toLocaleString()} · Up to {selectedTour.persons} guests</p>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[#1d1d1f] mb-3 flex items-center gap-2"><UilCalendarAlt size="16" className="text-[#8b7355]" /> Tour Date</h4>
                <div>
                    <input type="date" value={checkIn.toISOString().split('T')[0]}
                      onChange={e => { const d = new Date(e.target.value + 'T08:00:00'); setCheckIn(d); }}
                      className="w-full px-4 py-3 bg-[#f5f5f7] border-2 border-[#e8e8ed] rounded-xl outline-none text-sm font-medium text-[#1d1d1f] focus:border-[#8b7355] transition-colors" />
                </div>
              </div>
              <div className="bg-[#fafafa] rounded-2xl p-4 border border-[#e8e8ed]">
                <div className="flex justify-between items-center">
                  <span className="text-base font-semibold text-[#1d1d1f]">Total</span>
                  <span className="text-xl font-semibold text-[#1d1d1f]">₱{selectedTour.price.toLocaleString()}</span>
                </div>
              </div>
              {roomStatus === 'success' ? (
                <div className="text-center py-6">
                  <div className="w-14 h-14 bg-[#f5f5f7] rounded-full flex items-center justify-center mx-auto mb-3">
                    <UilCheckCircle size="28" className="text-emerald-600" />
                  </div>
                  <p className="text-lg font-semibold text-[#1d1d1f] tracking-tight mb-1">Tour Booked!</p>
                  <p className="text-xs text-[#6e6e73] font-medium">Check your ticket details in 'My Bookings'.</p>
                </div>
              ) : (
                <motion.button whileTap={{ scale: 0.97 }} onClick={handleTourBook}
                  disabled={roomStatus === 'loading'}
                  className="w-full bg-[#1d1d1f] text-white py-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2d2d2f]">
                  {roomStatus === 'loading' ? <UilSync size="22" className="animate-spin" /> : <><UilCompass size="18" /> Book — ₱{selectedTour.price.toLocaleString()}</>}
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
