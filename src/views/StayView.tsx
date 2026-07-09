import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UilBuilding, UilStar, UilMapMarker, UilWifi, UilCoffee, UilWind, UilWater, UilArrowRight, UilSearch, UilFilter, UilCheckCircle, UilRefresh, UilCalendarAlt, UilPlus, UilMinus, UilSun, UilMoon, UilTimes, UilAngleLeftB, UilAngleRightB, UilUsersAlt, UilGift, UilUser, UilUtensils, UilAngleDown, UilGlobe, UilTimesCircle } from '@/icons';
import { useAuth } from '../context/AuthContext';
import { db, handleFirestoreError, OperationType, Timestamp } from '../firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc, query, where, getDocs } from 'firebase/firestore';

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';

import { accommodations, type PromoPackage } from '../data/accommodations';
import { getPilotConfig, type PilotConfig } from '../lib/pilotService';
import PriceCalculator from '../components/shared/PriceCalculator';
import { checkAvailability, checkRoomAvailability } from '../lib/capacityService';

export default function StayView() {
  const { user, login } = useAuth();
  const [bookingStatus, setBookingStatus] = useState<{[key: string]: 'idle' | 'loading' | 'success'}>({});
  const [testError, setTestError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHotel, setSelectedHotel] = useState<typeof accommodations[0] | null>(null);
  const [rooms, setRooms] = useState<any[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<any | null>(null);
  const [checkIn, setCheckIn] = useState(new Date(2026, 5, 15));
  const [checkOut, setCheckOut] = useState(new Date(2026, 5, 18));
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [tweens, setTweens] = useState(0);
  const [addons, setAddons] = useState({ breakfast: false, lateCheckin: false });
  const [breakfastPeople, setBreakfastPeople] = useState(2);
  const [selectedPromo, setSelectedPromo] = useState<PromoPackage | null>(null);
  const [expandedPromo, setExpandedPromo] = useState<string | null>(null);
  const [pilotConfig, setPilotConfig] = useState<PilotConfig | null>(null);
  const [purposeOfVisit, setPurposeOfVisit] = useState<'leisure' | 'business' | 'family' | 'transit' | 'other'>('leisure');
  const [businessServices, setBusinessServices] = useState<{ id: string; name: string; price: number }[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [showTime, setShowTime] = useState(false);
  const [checkInTime, setCheckInTime] = useState<Date | null>(null);
  const [checkOutTime, setCheckOutTime] = useState<Date | null>(null);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [bookingMode, setBookingMode] = useState<'stays' | 'events'>('stays');
  const [eventVenues, setEventVenues] = useState<{ id: string; name: string; capacitySeated: number; halfDayPrice: number; fullDayPrice: number; overtimeRate: number }[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<typeof eventVenues[0] | null>(null);
  const [eventType, setEventType] = useState('');
  const [expectedPax, setExpectedPax] = useState(50);
  const [eventStart, setEventStart] = useState<Date | null>(null);
  const [eventEnd, setEventEnd] = useState<Date | null>(null);

  useEffect(() => {
    getPilotConfig().then(setPilotConfig);
  }, []);

  const visibleAccommodations = pilotConfig?.enabled && pilotConfig.businessId
    ? accommodations.filter(a => a.businessId === pilotConfig.businessId)
    : accommodations;

  const types = ['All', ...new Set(visibleAccommodations.map(a => a.type))];
  const filtered = visibleAccommodations.filter(a =>
    (selectedTab === 'All' || a.type === selectedTab) &&
    (a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     a.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  useEffect(() => {
    if (!selectedHotel) return;
    setRooms([]);
    setSelectedRoom(null);
    setRoomsLoading(true);
    const fetchRooms = async () => {
      try {
        const q = query(
          collection(db, 'inventory_items'),
          where('businessId', '==', selectedHotel.businessId),
          where('category', '==', 'Accommodation')
        );
        const snapshot = await getDocs(q);
        const roomData = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setRooms(roomData);
        if (roomData.length > 0) setSelectedRoom(roomData[0]);
      } catch {}
      setRoomsLoading(false);
    };
    fetchRooms();
    const fetchServices = async () => {
      try {
        const bizDoc = await getDoc(doc(db, 'businesses', selectedHotel.businessId));
        if (bizDoc.exists()) {
          const data = bizDoc.data();
          if (data.services) {
            setBusinessServices(data.services);
          }
        }
      } catch {}
    };
    fetchServices();
  }, [selectedHotel?.businessId]);

  useEffect(() => {
    if (bookingMode !== 'events') return;
    const bizId = pilotConfig?.enabled && pilotConfig.businessId
      ? pilotConfig.businessId
      : (selectedHotel?.businessId || '');
    if (!bizId) return;
    const fetchVenues = async () => {
      try {
        const bizDoc = await getDoc(doc(db, 'businesses', bizId));
        if (bizDoc.exists()) {
          const data = bizDoc.data();
          if (data.eventVenues) {
            setEventVenues(data.eventVenues);
          }
        }
      } catch {}
    };
    fetchVenues();
  }, [bookingMode, pilotConfig, selectedHotel?.businessId]);

  const getRoomPrice = () => {
    if (selectedRoom) {
      const guestPrice = selectedRoom.guests?.[0]?.price || 0;
      return guestPrice;
    }
    return selectedHotel?.price || 0;
  };

  const calculateTotal = (hotel: typeof accommodations[0]) => {
    const nights = Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)));
    const basePrice = getRoomPrice();
    let total = 0;
    if (selectedPromo) {
      total = selectedPromo.price;
    } else {
      total = basePrice * nights;
      total += children * (hotel.childPrice || 0) * nights;
      total += tweens * (hotel.tweenPrice || 0) * nights;
      total += addons.breakfast ? 250 * breakfastPeople : 0;
      total += addons.lateCheckin ? 150 : 0;
    }
    return total;
  };

  const handleBook = async (hotel: typeof accommodations[0]) => {
    if (!user) {
      login();
      return;
    }

    setBookingStatus(prev => ({ ...prev, [hotel.id]: 'loading' }));
    setTestError(null);
    setAvailabilityError(null);

    // Check availability before booking
    const nights = Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)));
    const dateStr = checkIn.toLocaleDateString();

    // Room-level availability: check if this specific room item has stock
    if (selectedRoom) {
      const roomStock = selectedRoom.stock ?? selectedRoom.total ?? 0;
      if (roomStock <= 0) {
        setBookingStatus(prev => ({ ...prev, [hotel.id]: 'idle' }));
        setAvailabilityError(`Sorry, "${selectedRoom.name}" is fully booked for your selected dates. Please choose another room.`);
        return;
      }
    }

    // Per-room date overlap check
    const roomAvail = await checkRoomAvailability(selectedRoom?.id, checkIn, checkOut);
    if (!roomAvail.available) {
      setBookingStatus(prev => ({ ...prev, [hotel.id]: 'idle' }));
      setAvailabilityError(roomAvail.message);
      return;
    }

    // Property-level availability (general capacity check)
    const availability = await checkAvailability(hotel.id, dateStr, adults + children + tweens);
    if (!availability.available) {
      setBookingStatus(prev => ({ ...prev, [hotel.id]: 'idle' }));
      setAvailabilityError(`Sorry, this accommodation is not fully available for your selected dates. Only ${availability.remaining} guest slots remaining.`);
      return;
    }

    const total = calculateTotal(hotel);
    const selectedAddonDetails = businessServices.filter(s => selectedAddons.includes(s.id));
    const legacyAddons: { id: string; name: string; price: number }[] = [];
    if (addons.breakfast) legacyAddons.push({ id: 'breakfast', name: 'Breakfast Bundle', price: 250 * breakfastPeople });
    if (addons.lateCheckin) legacyAddons.push({ id: 'lateCheckin', name: 'Late Check-in', price: 150 });

    try {
      await addDoc(collection(db, 'bookings'), {
        touristUid: user.uid,
        touristName: user.displayName || 'Anonymous',
        serviceId: hotel.id,
        serviceName: hotel.name,
        serviceType: 'stay',
        businessId: hotel.businessId,
        roomId: selectedRoom?.id || null,
        roomName: selectedRoom?.name || null,
        date: `${checkIn.toLocaleDateString()} - ${checkOut.toLocaleDateString()}`,
        checkInTimestamp: Timestamp.fromDate(checkIn),
        checkOutTimestamp: Timestamp.fromDate(checkOut),
        adults,
        children,
        tweens,
        breakfastPeople: addons.breakfast ? breakfastPeople : 0,
        promoPackage: selectedPromo ? selectedPromo.name : null,
        status: 'pending',
        paymentStatus: 'UNPAID',
        amount: total,
        totalPrice: total,
        purposeOfVisit,
        addons: selectedAddonDetails.length > 0 ? selectedAddonDetails : legacyAddons,
        createdAt: serverTimestamp()
      });
      setBookingStatus(prev => ({ ...prev, [hotel.id]: 'success' }));
      setTimeout(() => {
        setBookingStatus(prev => ({ ...prev, [hotel.id]: 'idle' }));
        setSelectedHotel(null);
        setSelectedPromo(null);
        setChildren(0);
        setTweens(0);
        setBreakfastPeople(2);
        setSelectedAddons([]);
        setBusinessServices([]);
        setPurposeOfVisit('leisure');
      }, 3000);
    } catch (error: any) {
      console.error("Booking error:", error);
      setTestError(error.message || String(error));
      setBookingStatus(prev => ({ ...prev, [hotel.id]: 'idle' }));
      try {
        handleFirestoreError(error, OperationType.CREATE, 'bookings');
      } catch (e) {}
    }
  };

  return (
    <div className="bg-white min-h-screen pb-40 selection:bg-island-emerald/20">
      {/* Header */}
      <section className="relative h-[calc(45vh+5rem)] flex items-center overflow-hidden">
        <motion.img 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
          src="/images/hero-sunken.png" 
          alt="Catarman Resorts" 
          className="absolute inset-0 w-full h-full object-cover brightness-50"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-island-volcanic/60 via-transparent to-white"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-island-emerald font-bold tracking-wider text-xs mb-4 block">Verified Accommodations</span>
            <h1 className="text-6xl md:text-8xl font-black text-white mb-6 tracking-tighter leading-none drop-shadow-2xl">
              Island <span className="text-transparent bg-clip-text bg-gradient-to-r from-island-emerald to-white">Stays.</span>
            </h1>
            <p className="text-xl text-white/80 font-medium max-w-2xl drop-shadow-lg leading-relaxed">
              From luxury beachfront villas to historic ancestral stays, discover the premier resting places.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search & Filter */}
      <div className="max-w-7xl mx-auto px-6 -mt-14 relative z-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-4 rounded-[3rem] shadow-2xl flex flex-wrap md:flex-nowrap gap-4 items-center border border-slate-100"
        >
          <div className="flex-1 relative">
            <UilSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size="24" />
            <input 
              type="text" 
              placeholder="Search by name or landmark..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-5 bg-stone-50 rounded-2xl outline-none focus:ring-4 focus:ring-island-emerald/5 transition-all font-bold text-slate-900"
            />
          </div>
          <button className="btn-secondary px-8 py-5 rounded-2xl">
            <UilFilter size="20" /> Filter
          </button>
          <button className="btn-volcanic px-12 py-5 rounded-2xl">
            Execute Search
          </button>
        </motion.div>
        {testError && (
          <div className="mt-6 p-5 bg-rose-50 text-rose-700 rounded-2xl border-2 border-rose-100 font-bold text-sm shadow-lg">
            Operational Error: {testError}
          </div>
        )}
      </div>

        {/* Listings */}
      <section className="max-w-7xl mx-auto px-6 mt-32">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div>
            <span className="text-island-coral font-bold tracking-wider text-xs mb-4 block">Availability Grid</span>
            <h2 className="text-5xl md:text-6xl font-black text-island-volcanic tracking-tighter">
              {bookingMode === 'stays' ? 'Verified Stays.' : 'Event Venues.'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="inline-flex items-center gap-1 p-1.5 bg-white border border-[#e3e8ee] rounded-full shadow-[0_1px_1px_rgba(14,17,22,0.04),0_20px_40px_-24px_rgba(14,17,22,0.18)]">
              <button
                onClick={() => setBookingMode('stays')}
                className={`h-9 px-[18px] rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  bookingMode === 'stays'
                    ? '!bg-[#0e1116] !text-white shadow-[0_1px_1px_rgba(14,17,22,0.06),0_8px_18px_-10px_rgba(14,17,22,0.5)]'
                    : 'text-[#5b6472] hover:text-[#0e1116]'
                }`}
              >
                Stays
              </button>
              <button
                onClick={() => setBookingMode('events')}
                className={`h-9 px-[18px] rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  bookingMode === 'events'
                    ? '!bg-[#0e1116] !text-white shadow-[0_1px_1px_rgba(14,17,22,0.06),0_8px_18px_-10px_rgba(14,17,22,0.5)]'
                    : 'text-[#5b6472] hover:text-[#0e1116]'
                }`}
              >
                Events
              </button>
            </div>
            {bookingMode === 'stays' && (
              <div className="inline-flex items-center gap-1 p-1.5 bg-white border border-[#e3e8ee] rounded-full shadow-[0_1px_1px_rgba(14,17,22,0.04),0_20px_40px_-24px_rgba(14,17,22,0.18)] overflow-x-auto">
                {types.map((tab) => (
                  <button 
                    key={tab} 
                    onClick={() => setSelectedTab(tab)}
                    className={`h-9 px-[18px] rounded-full text-sm font-medium text-[#5b6472] whitespace-nowrap transition-[background-color,color,box-shadow] duration-220 ease-[cubic-bezier(0.22,1,0.36,1)] hover:text-[#0e1116] focus-visible:shadow-[0_0_0_3px_rgba(46,125,239,0.32)] ${
                      selectedTab === tab 
                        ? '!bg-[#0e1116] !text-white shadow-[0_1px_1px_rgba(14,17,22,0.06),0_8px_18px_-10px_rgba(14,17,22,0.5)]' 
                        : ''
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {bookingMode === 'events' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {eventVenues.length === 0 ? (
              <div className="col-span-full text-center py-20">
                <p className="text-2xl font-black text-slate-300 tracking-tighter">No event venues available</p>
                <p className="text-sm text-slate-400 mt-2">Check back later for event venue listings.</p>
              </div>
            ) : eventVenues.map((venue, idx) => (
              <motion.div
                key={venue.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group bg-white rounded-[4rem] overflow-hidden border-2 border-slate-100 shadow-xl hover:shadow-2xl transition-all duration-500 p-5"
              >
                <div className="px-5 pb-5">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <span className="text-xs font-bold text-island-emerald tracking-wider mb-2 block">Event Venue</span>
                      <h3 className="text-4xl font-black text-island-volcanic tracking-tighter leading-tight">{venue.name}</h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mb-6 flex-wrap">
                    <span className="px-4 py-1.5 bg-stone-50 rounded-full text-[10px] font-bold text-slate-500 border border-slate-100">
                      Seats {venue.capacitySeated}
                    </span>
                    <span className="px-4 py-1.5 bg-stone-50 rounded-full text-[10px] font-bold text-slate-500 border border-slate-100">
                      Half-day: ₱{venue.halfDayPrice.toLocaleString()}
                    </span>
                    <span className="px-4 py-1.5 bg-stone-50 rounded-full text-[10px] font-bold text-slate-500 border border-slate-100">
                      Full-day: ₱{venue.fullDayPrice.toLocaleString()}
                    </span>
                  </div>
                  <button
                    onClick={() => { setSelectedVenue(venue); setEventStart(null); setEventEnd(null); setEventType(''); setExpectedPax(50); }}
                    className="w-full bg-island-green text-white py-6 rounded-3xl font-bold text-xs uppercase tracking-widest hover:shadow-xl hover:shadow-island-green/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                  >
                    <UilCalendarAlt size="20" /> Book This Venue
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {bookingMode === 'stays' && 
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {filtered.length === 0 ? (
            <div className="col-span-full text-center py-20">
              <p className="text-2xl font-black text-slate-300 tracking-tighter">No stays found</p>
              <p className="text-sm text-slate-400 mt-2">Try a different search or filter</p>
            </div>
          ) : filtered.map((hotel, idx) => (
            <motion.div
              key={hotel.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group bg-white rounded-[4rem] overflow-hidden border-2 border-slate-100 shadow-xl hover:shadow-2xl transition-all duration-500 p-5"
            >
              <div className="relative h-80 rounded-[3rem] overflow-hidden mb-10">
                <img 
                  src={hotel.image} 
                  alt={hotel.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-8 right-8 px-5 py-2.5 bg-white/90 backdrop-blur-xl rounded-2xl text-xs font-black flex items-center gap-2 text-island-volcanic shadow-2xl border border-white">
                  <UilStar size="18" className="text-island-sunset" /> {hotel.rating}
                </div>
                <div className="absolute bottom-8 left-8 flex gap-3">
                  {hotel.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="px-4 py-1.5 bg-island-volcanic/60 backdrop-blur-xl text-white text-[10px] font-bold tracking-wider rounded-full border border-white/20 shadow-xl">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="px-5 pb-5">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <span className="text-xs font-bold text-island-emerald tracking-wider mb-2 block">{hotel.type}</span>
                    <h3 className="text-4xl font-black text-island-volcanic tracking-tighter leading-tight">{hotel.name}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 font-semibold tracking-tight mb-1 block">Starts at</span>
                    <p className="text-3xl font-black text-island-volcanic tracking-tighter">₱{hotel.price.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-8 mb-6 py-8 border-y-2 border-stone-50">
                  <div className="flex items-center gap-3 text-slate-500 font-semibold text-xs tracking-tight">
                    <UilWifi size="20" className="text-island-emerald" /> Wifi
                  </div>
                  <div className="flex items-center gap-3 text-slate-500 font-semibold text-xs tracking-tight">
                    <UilCoffee size="20" className="text-island-emerald" /> Breakfast
                  </div>
                  <div className="flex items-center gap-3 text-slate-500 font-semibold text-xs tracking-tight">
                    <UilWind size="20" className="text-island-emerald" /> Climate
                  </div>
                </div>

                {/* Promo Packages Toggle */}
                {hotel.promoPackages && hotel.promoPackages.length > 0 && (
                  <div className="mb-6">
                    <button
                      onClick={() => setExpandedPromo(expandedPromo === hotel.id ? null : hotel.id)}
                      className="w-full flex items-center justify-between p-4 bg-island-emerald/5 rounded-2xl border border-island-emerald/10 hover:bg-island-emerald/10 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <UilGift size="18" className="text-island-emerald" />
                        <span className="text-sm font-bold text-island-green">Promo Packages ({hotel.promoPackages.length})</span>
                      </div>
                      <UilAngleDown size="20" className={`text-island-emerald transition-transform duration-300 ${expandedPromo === hotel.id ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {expandedPromo === hotel.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-4 space-y-4">
                            {hotel.promoPackages.map((pkg) => (
                              <div key={pkg.id} className="bg-white border-2 border-island-emerald/20 rounded-2xl p-5 shadow-sm">
                                <div className="flex items-start justify-between mb-3">
                                  <div>
                                    <h4 className="text-lg font-black text-island-volcanic tracking-tighter">{pkg.name}</h4>
                                    <p className="text-xs text-slate-500 font-medium mt-1">{pkg.description}</p>
                                  </div>
                                  <span className="text-2xl font-black text-island-volcanic">₱{pkg.price.toLocaleString()}</span>
                                </div>
                                <div className="flex flex-wrap gap-2 mb-4">
                                  <span className="px-3 py-1 bg-stone-50 rounded-full text-[10px] font-bold text-slate-500 border border-slate-100">
                                    <UilUsersAlt size="12" className="inline mr-1" />{pkg.persons} pax
                                  </span>
                                  <span className="px-3 py-1 bg-stone-50 rounded-full text-[10px] font-bold text-slate-500 border border-slate-100">
                                    <UilCalendarAlt size="12" className="inline mr-1" />{pkg.days}D/{pkg.nights}N
                                  </span>
                                </div>
                                <div className="space-y-1 mb-4">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Inclusions:</span>
                                  {pkg.inclusions.map((inc, i) => (
                                    <div key={i} className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                                      <UilCheckCircle size="12" className="text-island-emerald shrink-0" />
                                      <span>{inc}</span>
                                    </div>
                                  ))}
                                </div>
                                <button
                                  onClick={(e) => { e.stopPropagation(); setSelectedHotel(hotel); setSelectedPromo(pkg); }}
                                  className="w-full bg-island-emerald text-white py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-island-green transition-all"
                                >
                                  Book This Package
                                </button>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                <button 
                  onClick={() => { setSelectedHotel(hotel); setSelectedPromo(null); }}
                  disabled={bookingStatus[hotel.id] === 'success'}
                  className="w-full bg-island-green text-white py-6 rounded-3xl font-bold text-xs uppercase tracking-widest hover:shadow-xl hover:shadow-island-green/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {bookingStatus[hotel.id] === 'success' ? (
                    <><UilCheckCircle size="24" /> Reservation Confirmed</>
                  ) : (
                    <><UilCalendarAlt size="20" /> Book Now</>
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      }
      </section>

      {/* Booking Modal */}
      <AnimatePresence>
        {selectedHotel && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedHotel(null)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div initial={{ opacity: 0, scale: 0.92, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 30 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white/95 backdrop-blur-3xl z-10 px-8 pt-8 pb-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-island-green tracking-tight">{selectedHotel.name}</h3>
                  <p className="text-xs text-slate-400 font-medium">₱{selectedHotel.price.toLocaleString()} / night</p>
                </div>
                <button onClick={() => { setSelectedHotel(null); setSelectedPromo(null); setAddons({ breakfast: false, lateCheckin: false }); setChildren(0); setTweens(0); setBreakfastPeople(2); setSelectedAddons([]); setBusinessServices([]); setPurposeOfVisit('leisure'); }}
                  className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-500 hover:bg-island-green hover:text-white transition-all">
                  <UilTimes size="18" />
                </button>
              </div>

              <div className="px-8 pt-6 pb-8 space-y-6">
                {/* Room Selection */}
                {roomsLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <UilRefresh size="20" className="animate-spin text-island-emerald" />
                  </div>
                ) : rooms.length > 0 ? (
                  <div>
                    <h4 className="text-sm font-bold text-island-green mb-3 flex items-center gap-2">
                      <UilBuilding size="16" className="text-island-emerald" /> Select Room Type
                    </h4>
                    <div className="space-y-2">
                      {rooms.map((room) => {
                        const roomPrice = room.guests?.[0]?.price || 0;
                        const isSelected = selectedRoom?.id === room.id;
                        const stock = room.stock ?? room.total ?? 0;
                        const isOutOfStock = stock === 0;
                        return (
                          <button
                            key={room.id}
                            onClick={() => !isOutOfStock && setSelectedRoom(room)}
                            disabled={isOutOfStock}
                            className={`w-full text-left p-5 rounded-2xl border-2 transition-all ${
                              isOutOfStock
                                ? 'border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed'
                                : isSelected
                                ? 'border-island-green bg-island-green/5 shadow-md'
                                : 'border-slate-100 bg-white hover:border-island-emerald/30 hover:shadow-sm'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="text-base font-bold text-island-volcanic">{room.name}</p>
                                <div className="flex flex-wrap gap-1.5 mt-1.5">
                                  {room.descriptionChecklist?.slice(0, 4).map((amenity: string, i: number) => (
                                    <span key={i} className="px-2 py-0.5 bg-stone-50 rounded-full text-[8px] font-semibold text-slate-500 border border-stone-100">
                                      {amenity}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-black text-island-volcanic">₱{roomPrice.toLocaleString()}</p>
                                <p className="text-[9px] text-slate-400 font-medium">/ night</p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
                              <div className="flex items-center gap-3 text-[10px] text-slate-500">
                                {room.guests?.map((g: any, i: number) => (
                                  <span key={i} className="font-semibold">{g.name}: ₱{g.price}</span>
                                ))}
                              </div>
                              <span className={`text-[9px] font-bold ${
                                isOutOfStock ? 'text-island-coral' : stock < 3 ? 'text-island-sunset' : 'text-island-emerald'
                              }`}>
                                {stock} left
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                {/* Date/Time Pickers */}
                <div>
                  <h4 className="text-sm font-bold text-island-green mb-3 flex items-center gap-2">
                    <UilCalendarAlt size="16" className="text-island-emerald" /> Check-in / Check-out
                  </h4>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="text-[10px] font-bold text-slate-400 mb-1 block">Check-in</label>
                      <DatePicker
                        selected={checkIn}
                        onChange={(date: Date | null) => { if (date) { setCheckIn(date); setCheckInTime(date); } }}
                        showTimeSelect
                        dateFormat="MMM d, yyyy h:mm aa"
                        timeFormat="h:mm aa"
                        timeIntervals={30}
                        minDate={new Date()}
                        className="w-full px-4 py-3 bg-stone-50 border-2 border-stone-100 rounded-2xl outline-none focus:ring-4 focus:ring-island-emerald/5 text-sm font-semibold text-slate-800"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] font-bold text-slate-400 mb-1 block">Check-out</label>
                      <DatePicker
                        selected={checkOut}
                        onChange={(date: Date | null) => { if (date) { setCheckOut(date); setCheckOutTime(date); } }}
                        showTimeSelect
                        dateFormat="MMM d, yyyy h:mm aa"
                        timeFormat="h:mm aa"
                        timeIntervals={30}
                        minDate={checkIn || new Date()}
                        className="w-full px-4 py-3 bg-stone-50 border-2 border-stone-100 rounded-2xl outline-none focus:ring-4 focus:ring-island-emerald/5 text-sm font-semibold text-slate-800"
                      />
                    </div>
                  </div>
                </div>

                {/* Purpose of Visit */}
                <div>
                  <h4 className="text-sm font-bold text-island-green mb-3 flex items-center gap-2">
                    <UilGlobe size="16" className="text-island-emerald" /> Purpose of Visit
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: 'leisure', label: 'Leisure' },
                      { value: 'business', label: 'Business' },
                      { value: 'family', label: 'Family' },
                      { value: 'transit', label: 'Transit' },
                      { value: 'other', label: 'Other' },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setPurposeOfVisit(opt.value as typeof purposeOfVisit)}
                        className={`px-5 py-2.5 rounded-full text-[10px] font-bold tracking-wider border-2 transition-all ${
                          purposeOfVisit === opt.value
                            ? 'bg-island-green text-white border-island-green'
                            : 'bg-white text-slate-400 border-slate-100 hover:border-island-green/30'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Guests */}
                <div>
                  <h4 className="text-sm font-bold text-island-green mb-3 flex items-center gap-2">
                    <UilUsersAlt size="16" className="text-island-emerald" /> Guests
                  </h4>
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-semibold text-slate-700">Adults</span>
                        <span className="text-[10px] text-slate-400 block font-medium">Max {selectedHotel.maxAdults}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <button onClick={() => setAdults(Math.max(1, adults - 1))} className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-500 border border-slate-200 hover:bg-island-green hover:text-white transition-all shadow-sm">
                          <UilMinus size="14" />
                        </button>
                        <span className="w-6 text-center text-base font-bold text-island-green">{adults}</span>
                        <button onClick={() => setAdults(Math.min(selectedHotel.maxAdults, adults + 1))} className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-500 border border-slate-200 hover:bg-island-green hover:text-white transition-all shadow-sm">
                          <UilPlus size="14" />
                        </button>
                      </div>
                    </div>
                    {selectedHotel.childPrice && (
                      <div className="flex items-center justify-between pt-3 border-t border-slate-200/50">
                        <div className="flex items-center gap-2">
                          <UilUser size="16" className="text-island-sunset" />
                          <span className="text-sm font-semibold text-slate-700">Children</span>
                          <span className="text-[10px] text-slate-400 font-medium">₱{selectedHotel.childPrice}/night</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <button onClick={() => setChildren(Math.max(0, children - 1))} className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-500 border border-slate-200 hover:bg-island-green hover:text-white transition-all shadow-sm">
                            <UilMinus size="14" />
                          </button>
                          <span className="w-6 text-center text-base font-bold text-island-green">{children}</span>
                          <button onClick={() => setChildren(Math.min(4, children + 1))} className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-500 border border-slate-200 hover:bg-island-green hover:text-white transition-all shadow-sm">
                            <UilPlus size="14" />
                          </button>
                        </div>
                      </div>
                    )}
                    {selectedHotel.tweenPrice && (
                      <div className="flex items-center justify-between pt-3 border-t border-slate-200/50">
                        <div className="flex items-center gap-2">
                          <UilUsersAlt size="16" className="text-island-sunset" />
                          <span className="text-sm font-semibold text-slate-700">Tweens</span>
                          <span className="text-[10px] text-slate-400 font-medium">₱{selectedHotel.tweenPrice}/night</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <button onClick={() => setTweens(Math.max(0, tweens - 1))} className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-500 border border-slate-200 hover:bg-island-green hover:text-white transition-all shadow-sm">
                            <UilMinus size="14" />
                          </button>
                          <span className="w-6 text-center text-base font-bold text-island-green">{tweens}</span>
                          <button onClick={() => setTweens(Math.min(4, tweens + 1))} className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-500 border border-slate-200 hover:bg-island-green hover:text-white transition-all shadow-sm">
                            <UilPlus size="14" />
                          </button>
                        </div>
                      </div>
                    )}
                    {adults + children + tweens > selectedHotel.maxAdults && (
                      <div className="pt-2 text-[10px] text-island-coral font-semibold flex items-center gap-1">
                        <span>Total guests exceeds max capacity of {selectedHotel.maxAdults}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Add-ons (from business services) */}
                <div>
                  <h4 className="text-sm font-bold text-island-green mb-3">Add-ons</h4>
                  <div className="space-y-2">
                    {businessServices.length === 0 ? (
                      <>
                        {[
                          { id: 'breakfast', label: 'Breakfast Bundle', price: 250, icon: UilUtensils },
                          { id: 'lateCheckin', label: 'Late Check-in', price: 150, icon: UilMoon },
                        ].map(item => (
                          <div key={item.id} className={`rounded-2xl border-2 transition-all ${
                            (addons as any)[item.id] ? 'border-island-green bg-island-green/5' : 'border-slate-100 bg-white'
                          }`}>
                            <button onClick={() => setAddons(prev => ({ ...prev, [item.id]: !(prev as any)[item.id] }))}
                              className="w-full flex items-center justify-between p-4"
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${(addons as any)[item.id] ? 'bg-island-green text-white' : 'bg-slate-50 text-slate-400'}`}>
                                  <item.icon size="18" />
                                </div>
                                <div className="text-left">
                                  <span className="block text-sm font-semibold text-slate-800">{item.label}</span>
                                  <span className="text-[10px] text-slate-400 font-medium">+ ₱{item.price}</span>
                                </div>
                              </div>
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${(addons as any)[item.id] ? 'bg-island-green border-island-green text-white' : 'border-slate-300'}`}>
                                {(addons as any)[item.id] && <UilCheckCircle size="12" />}
                              </div>
                            </button>
                            {(addons as any)[item.id] && item.id === 'breakfast' && (
                              <div className="px-4 pb-4 flex items-center justify-between border-t border-island-green/10 pt-3">
                                <span className="text-xs font-semibold text-slate-600">For how many people?</span>
                                <div className="flex items-center gap-3">
                                  <button onClick={() => setBreakfastPeople(Math.max(1, breakfastPeople - 1))} className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-slate-500 border border-slate-200 hover:bg-island-green hover:text-white transition-all shadow-sm">
                                    <UilMinus size="12" />
                                  </button>
                                  <span className="w-5 text-center text-sm font-bold text-island-green">{breakfastPeople}</span>
                                  <button onClick={() => setBreakfastPeople(Math.min(adults + children + tweens, breakfastPeople + 1))} className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-slate-500 border border-slate-200 hover:bg-island-green hover:text-white transition-all shadow-sm">
                                    <UilPlus size="12" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </>
                    ) : (
                      businessServices.map((svc) => {
                        const isSelected = selectedAddons.includes(svc.id);
                        return (
                          <div key={svc.id} className={`rounded-2xl border-2 transition-all ${
                            isSelected ? 'border-island-green bg-island-green/5' : 'border-slate-100 bg-white'
                          }`}>
                            <button onClick={() => setSelectedAddons(prev =>
                              isSelected ? prev.filter(id => id !== svc.id) : [...prev, svc.id]
                            )} className="w-full flex items-center justify-between p-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isSelected ? 'bg-island-green text-white' : 'bg-slate-50 text-slate-400'}`}>
                                  <UilUtensils size="18" />
                                </div>
                                <div className="text-left">
                                  <span className="block text-sm font-semibold text-slate-800">{svc.name}</span>
                                  <span className="text-[10px] text-slate-400 font-medium">+ ₱{svc.price}</span>
                                </div>
                              </div>
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-island-green border-island-green text-white' : 'border-slate-300'}`}>
                                {isSelected && <UilCheckCircle size="12" />}
                              </div>
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Total - Price Calculator */}
                <PriceCalculator
                  basePrice={getRoomPrice()}
                  nights={Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)))}
                  addons={[
                    ...(businessServices.filter(s => selectedAddons.includes(s.id))),
                    ...(addons.breakfast ? [{ id: 'breakfast', name: 'Breakfast Bundle', price: 250 * breakfastPeople }] : []),
                    ...(addons.lateCheckin ? [{ id: 'lateCheckin', name: 'Late Check-in', price: 150 }] : []),
                  ]}
                  taxRate={12}
                />

                {/* Availability Warning */}
                {availabilityError && (
                  <div className="p-4 bg-rose-50 rounded-2xl border-2 border-rose-100 text-island-coral text-xs font-bold flex items-start gap-3">
                    <UilTimesCircle size="18" className="shrink-0 mt-0.5" />
                    <span>{availabilityError}</span>
                  </div>
                )}

                {/* Success + QR */}
                {bookingStatus[selectedHotel.id] === 'success' ? (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-island-emerald/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <UilCheckCircle size="32" className="text-island-emerald" />
                    </div>
                    <p className="text-lg font-black text-island-volcanic tracking-tighter mb-2">Booking Confirmed!</p>
                    <p className="text-xs text-slate-500 font-medium mb-6">
                      Your booking request has been submitted. Check your email for the confirmation.
                    </p>
                    <div className="bg-white rounded-2xl p-4 border-2 border-slate-100 inline-block mx-auto mb-6 shadow-sm">
                      <QRCodeSVG
                        value={`${window.location.origin}/my-bookings`}
                        size={140}
                        level="M"
                        includeMargin
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 font-semibold">
                      Show this QR code at check-in
                    </p>
                  </div>
                ) : (
                  <>
                {/* Confirm */}
                {adults + children + tweens > selectedHotel.maxAdults ? (
                  <div className="w-full bg-rose-50 text-island-coral py-5 rounded-2xl font-bold text-xs text-center border-2 border-rose-100">
                    Guest limit exceeded. Max {selectedHotel.maxAdults} guests.
                  </div>
                ) : (
                  <button onClick={() => handleBook(selectedHotel)}
                    disabled={bookingStatus[selectedHotel.id] === 'loading'}
                    className="w-full bg-island-green text-white py-5 rounded-2xl font-bold text-sm shadow-xl shadow-island-green/20 hover:shadow-island-green/40 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {bookingStatus[selectedHotel.id] === 'loading' ? (
                      <UilRefresh size="22" className="animate-spin" />
                    ) : (
                      <><UilCalendarAlt size="20" /> Book now</>
                    )}
                  </button>
                )}
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Event Booking Modal */}
      <AnimatePresence>
        {selectedVenue && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedVenue(null)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div initial={{ opacity: 0, scale: 0.92, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 30 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white/95 backdrop-blur-3xl z-10 px-8 pt-8 pb-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-island-green tracking-tight">{selectedVenue.name}</h3>
                  <p className="text-xs text-slate-400 font-medium">Event Venue</p>
                </div>
                <button onClick={() => { setSelectedVenue(null); }}
                  className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-500 hover:bg-island-green hover:text-white transition-all">
                  <UilTimes size="18" />
                </button>
              </div>

              <div className="px-8 pt-6 pb-8 space-y-6">
                {/* Event Type */}
                <div>
                  <h4 className="text-sm font-bold text-island-green mb-3">Event Type</h4>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    className="w-full px-5 py-4 bg-stone-50 border-2 border-stone-100 rounded-2xl outline-none focus:ring-4 focus:ring-island-emerald/5 text-sm font-semibold text-slate-800"
                  >
                    <option value="">Select event type...</option>
                    <option value="wedding">Wedding</option>
                    <option value="conference">Conference</option>
                    <option value="party">Party</option>
                    <option value="meeting">Meeting</option>
                    <option value="workshop">Workshop</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Expected Pax */}
                <div>
                  <h4 className="text-sm font-bold text-island-green mb-3">Expected Pax</h4>
                  <input
                    type="number"
                    value={expectedPax}
                    onChange={(e) => setExpectedPax(Number(e.target.value))}
                    min={1}
                    max={selectedVenue.capacitySeated}
                    className="w-full px-5 py-4 bg-stone-50 border-2 border-stone-100 rounded-2xl outline-none focus:ring-4 focus:ring-island-emerald/5 text-sm font-semibold text-slate-800"
                  />
                  <p className="text-xs text-slate-400 mt-1">Max capacity: {selectedVenue.capacitySeated} pax</p>
                </div>

                {/* Event Date/Time */}
                <div>
                  <h4 className="text-sm font-bold text-island-green mb-3">Event Start</h4>
                  <DatePicker
                    selected={eventStart}
                    onChange={(date: Date | null) => setEventStart(date)}
                    showTimeSelect
                    dateFormat="MMM d, yyyy h:mm aa"
                    timeFormat="h:mm aa"
                    timeIntervals={30}
                    minDate={new Date()}
                    className="w-full px-5 py-4 bg-stone-50 border-2 border-stone-100 rounded-2xl outline-none focus:ring-4 focus:ring-island-emerald/5 text-sm font-semibold text-slate-800"
                    placeholderText="Select event start"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-island-green mb-3">Event End</h4>
                  <DatePicker
                    selected={eventEnd}
                    onChange={(date: Date | null) => setEventEnd(date)}
                    showTimeSelect
                    dateFormat="MMM d, yyyy h:mm aa"
                    timeFormat="h:mm aa"
                    timeIntervals={30}
                    minDate={eventStart || new Date()}
                    className="w-full px-5 py-4 bg-stone-50 border-2 border-stone-100 rounded-2xl outline-none focus:ring-4 focus:ring-island-emerald/5 text-sm font-semibold text-slate-800"
                    placeholderText="Select event end"
                  />
                </div>

                {/* Price breakdown */}
                <div className="bg-island-green/5 rounded-2xl p-5 border border-island-green/10 space-y-2">
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Half-day rate</span>
                    <span className="font-semibold">₱{selectedVenue.halfDayPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Full-day rate</span>
                    <span className="font-semibold">₱{selectedVenue.fullDayPrice.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-island-green/10 pt-2 flex justify-between items-center">
                    <span className="text-base font-bold text-island-green">Overtime/hr</span>
                    <span className="text-lg font-black text-island-volcanic">₱{selectedVenue.overtimeRate.toLocaleString()}</span>
                  </div>
                </div>

                {/* Submit */}
                <button
                  onClick={async () => {
                    if (!user) { login(); return; }
                    if (!eventType || !eventStart || !eventEnd) return;
                    try {
                      const pilotBizId = pilotConfig?.enabled && pilotConfig.businessId ? pilotConfig.businessId : '';
                      await addDoc(collection(db, 'bookings'), {
                        touristUid: user.uid,
                        touristName: user.displayName || 'Anonymous',
                        touristEmail: user.email || '',
                        serviceName: selectedVenue.name,
                        serviceType: 'stay',
                        businessId: pilotBizId || 'pilot_business',
                        bookingCategory: 'event',
                        eventVenueId: selectedVenue.id,
                        eventType,
                        expectedPax,
                        eventStartTimestamp: Timestamp.fromDate(eventStart),
                        eventEndTimestamp: Timestamp.fromDate(eventEnd),
                        status: 'pending',
                        paymentStatus: 'UNPAID',
                        amount: selectedVenue.fullDayPrice,
                        createdAt: serverTimestamp(),
                      });
                      toast.success('Event inquiry submitted!');
                      setSelectedVenue(null);
                    } catch (error: any) {
                      handleFirestoreError(error, OperationType.CREATE, 'bookings');
                    }
                  }}
                  disabled={!eventType || !eventStart || !eventEnd}
                  className="w-full bg-island-green text-white py-5 rounded-2xl font-bold text-sm shadow-xl shadow-island-green/20 hover:shadow-island-green/40 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  Submit Event Inquiry
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
