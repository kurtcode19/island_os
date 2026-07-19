import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UilArrowLeft, UilStar, UilMapMarker, UilBuilding, UilCheckCircle, UilSync, UilCalendarAlt, UilPlus, UilMinus, UilUsersAlt, UilGift, UilUtensils, UilMoon, UilGlobe, UilBedDouble } from '@/icons';
import { useAuth } from '../context/AuthContext';
import { db, handleFirestoreError, OperationType, Timestamp } from '../firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc, query, where, getDocs } from 'firebase/firestore';
import { toast } from 'sonner';

import { accommodations, type PromoPackage } from '../data/accommodations';
import { getPilotConfig, type PilotConfig } from '../lib/pilotService';
import { checkRoomAvailability } from '../lib/capacityService';

export default function StayView() {
  const { user, login } = useAuth();
  const [bookingMode, setBookingMode] = useState<'stays' | 'events'>('stays');
  const [selectedTab, setSelectedTab] = useState('All');
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
  const [purposeOfVisit, setPurposeOfVisit] = useState<'leisure' | 'business' | 'family' | 'transit' | 'other'>('leisure');
  const [businessServices, setBusinessServices] = useState<{ id: string; name: string; price: number }[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [pilotConfig, setPilotConfig] = useState<PilotConfig | null>(null);
  const isSubmitting = useRef(false);

  const [eventVenues, setEventVenues] = useState<{ id: string; name: string; capacitySeated: number; halfDayPrice: number; fullDayPrice: number; overtimeRate: number }[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<any | null>(null);
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

  useEffect(() => {
    if (!selectedHotel) return;
    setRooms([]);
    setSelectedRoom(null);
    setRoomsLoading(true);
    (async () => {
      try {
        const q = query(collection(db, 'inventory_items'), where('businessId', '==', selectedHotel.businessId), where('category', '==', 'Accommodation'));
        const snapshot = await getDocs(q);
        const roomData = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setRooms(roomData);
        if (roomData.length > 0) setSelectedRoom(roomData[0]);
      } catch {}
      setRoomsLoading(false);
    })();
    (async () => {
      try {
        const bizDoc = await getDoc(doc(db, 'businesses', selectedHotel.businessId));
        if (bizDoc.exists() && bizDoc.data().services) setBusinessServices(bizDoc.data().services);
      } catch {}
    })();
  }, [selectedHotel]);

  useEffect(() => {
    if (bookingMode !== 'events') return;
    const bizId = pilotConfig?.enabled && pilotConfig.businessId ? pilotConfig.businessId : (selectedHotel?.businessId || '');
    if (!bizId) return;
    (async () => {
      try {
        const bizDoc = await getDoc(doc(db, 'businesses', bizId));
        if (bizDoc.exists() && bizDoc.data().eventVenues) setEventVenues(bizDoc.data().eventVenues);
      } catch {}
    })();
  }, [bookingMode, pilotConfig, selectedHotel]);

  const getRoomPrice = () => {
    if (selectedRoom) return selectedRoom.guests?.[0]?.price || 0;
    return selectedHotel?.price || 0;
  };

  const calculateTotal = () => {
    const nights = Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)));
    if (selectedPromo) return selectedPromo.price;
    let total = getRoomPrice() * nights;
    if (selectedHotel) {
      total += children * (selectedHotel.childPrice || 0) * nights;
      total += tweens * (selectedHotel.tweenPrice || 0) * nights;
    }
    total += addons.breakfast ? 250 * breakfastPeople : 0;
    total += addons.lateCheckin ? 150 : 0;
    return total;
  };

  const handleBook = async () => {
    if (!user) { login(); return; }
    if (!selectedHotel) return;
    if (isSubmitting.current) return;
    isSubmitting.current = true;
    setBookingStatus('loading');
    setAvailabilityError(null);

    if (selectedRoom) {
      const roomStock = selectedRoom.stock ?? selectedRoom.total ?? 0;
      if (roomStock <= 0) {
        setBookingStatus('idle');
        setAvailabilityError(`"${selectedRoom.name}" is fully booked. Choose another room.`);
        return;
      }
      const roomAvail = await checkRoomAvailability(selectedRoom.id, checkIn, checkOut);
      if (!roomAvail.available) {
        setBookingStatus('idle');
        setAvailabilityError(roomAvail.message);
        return;
      }
    }

    const total = calculateTotal();
    const selectedAddonDetails = businessServices.filter(s => selectedAddons.includes(s.id));
    const legacyAddons: { id: string; name: string; price: number }[] = [];
    if (addons.breakfast) legacyAddons.push({ id: 'breakfast', name: 'Breakfast Bundle', price: 250 * breakfastPeople });
    if (addons.lateCheckin) legacyAddons.push({ id: 'lateCheckin', name: 'Late Check-in', price: 150 });

    try {
      await addDoc(collection(db, 'bookings'), {
        touristUid: user.uid,
        touristName: user.displayName || 'Anonymous',
        serviceId: selectedHotel.id,
        serviceName: selectedHotel.name,
        serviceType: 'stay',
        businessId: selectedHotel.businessId,
        roomId: selectedRoom?.id || null,
        roomName: selectedRoom?.name || null,
        date: `${checkIn.toLocaleDateString()} - ${checkOut.toLocaleDateString()}`,
        checkInTimestamp: Timestamp.fromDate(checkIn),
        checkOutTimestamp: Timestamp.fromDate(checkOut),
        adults, children, tweens,
        breakfastPeople: addons.breakfast ? breakfastPeople : 0,
        promoPackage: selectedPromo?.name || null,
        status: 'pending',
        paymentStatus: 'UNPAID',
        amount: total,
        totalPrice: total,
        purposeOfVisit,
        addons: selectedAddonDetails.length > 0 ? selectedAddonDetails : legacyAddons,
        createdAt: serverTimestamp()
      });
      setBookingStatus('success');
      toast.success('Booking confirmed!');
      setTimeout(() => {
        setBookingStatus('idle');
        setSelectedHotel(null);
        setSelectedPromo(null);
        setChildren(0);
        setTweens(0);
        setBreakfastPeople(2);
        setSelectedAddons([]);
        setBusinessServices([]);
        setPurposeOfVisit('leisure');
        isSubmitting.current = false;
      }, 2000);
    } catch (error) {
      setBookingStatus('idle');
      isSubmitting.current = false;
      handleFirestoreError(error, OperationType.CREATE, 'bookings');
    }
  };

  const nights = Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)));

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white selection:bg-emerald-500/20">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-16">

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <span className="text-[10px] font-black text-emerald-700 uppercase tracking-[0.4em]">Island Stays</span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-emerald-950 tracking-tighter mt-1">
            Find Your Stay
          </h1>
        </motion.div>

        <div className="mb-6">
          <div className="flex items-center gap-3 bg-white rounded-2xl px-5 py-3.5 border border-stone-200 shadow-sm">
            <svg className="w-5 h-5 text-stone-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input type="text" placeholder="Search by name or type..." readOnly
              className="text-sm font-semibold text-stone-500 bg-transparent outline-none w-full placeholder:text-stone-400/60" />
          </div>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
          {[['stays', 'Stays'], ['events', 'Events']].map(([key, label]) => (
            <button key={key} onClick={() => setBookingMode(key as 'stays' | 'events')}
              className={`px-5 py-2.5 rounded-full text-xs font-black tracking-wider whitespace-nowrap transition-all ${
                bookingMode === key ? 'bg-emerald-700 text-white shadow-lg' : 'bg-amber-50 text-emerald-700/60 hover:text-emerald-700'
              }`}>
              {label}
            </button>
          ))}
        </div>

        {bookingMode === 'stays' && (
          <>
            <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
              {types.map(tab => (
                <button key={tab} onClick={() => setSelectedTab(tab)}
                  className={`px-4 py-2 rounded-full text-[10px] font-black tracking-wider whitespace-nowrap transition-all ${
                    selectedTab === tab ? 'bg-emerald-100 text-emerald-800' : 'bg-white text-stone-500 border border-stone-200 hover:border-emerald-300'
                  }`}>
                  {tab}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {visibleAccommodations.filter(a => selectedTab === 'All' || a.type === selectedTab).map((hotel, idx) => (
                <motion.div
                  key={hotel.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setSelectedHotel(hotel); setSelectedPromo(null); setAddons({ breakfast: false, lateCheckin: false }); }}
                  className="bg-white rounded-[24px] border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-xl text-[9px] font-bold text-stone-700 shadow-lg">
                      {hotel.type}
                    </div>
                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-xl shadow-lg">
                      <UilStar size="10" className="text-amber-500" />
                      <span className="text-[9px] font-bold text-stone-700">{hotel.rating}</span>
                    </div>
                  </div>
                  <div className="px-4 py-3 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-black text-stone-800 tracking-tighter leading-tight">{hotel.name}</h3>
                      <div className="text-right shrink-0">
                        <span className="text-sm font-black text-stone-800">₱{hotel.price.toLocaleString()}</span>
                        <span className="text-[8px] text-stone-500 font-semibold ml-0.5">/night</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {hotel.tags.slice(0, 3).map(t => (
                        <span key={t} className="px-2 py-0.5 bg-stone-100 rounded-full text-[8px] font-semibold text-stone-500">{t}</span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {bookingMode === 'events' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {eventVenues.length === 0 ? (
              <div className="col-span-full text-center py-20">
                <p className="text-lg font-black text-stone-300 tracking-tighter">No event venues available</p>
              </div>
            ) : eventVenues.map((venue, idx) => (
              <motion.div
                key={venue.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setSelectedVenue(venue); setEventStart(null); setEventEnd(null); setEventType(''); setExpectedPax(50); }}
                className="bg-white rounded-[24px] border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="p-4">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 mb-3">
                    <UilBuilding size="18" />
                  </div>
                  <h3 className="text-base font-black text-emerald-700 tracking-tighter mb-1">{venue.name}</h3>
                  <p className="text-[10px] text-stone-500 font-medium mb-2">Seats {venue.capacitySeated}</p>
                  <div className="flex items-center gap-2 text-[10px] text-emerald-600 font-bold">
                    <span>₱{venue.halfDayPrice.toLocaleString()}/half</span>
                    <span>·</span>
                    <span>₱{venue.fullDayPrice.toLocaleString()}/full</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {selectedHotel && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-0 bg-white z-[60] flex flex-col overflow-y-auto no-scrollbar"
          >
            <div className="sticky top-0 bg-white/95 backdrop-blur-3xl z-10 px-5 md:px-6 pt-5 md:pt-6 pb-4 border-b border-stone-100">
              <div className="flex items-center gap-4">
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => { setSelectedHotel(null); setSelectedPromo(null); setAddons({ breakfast: false, lateCheckin: false }); setChildren(0); setTweens(0); setBreakfastPeople(2); setSelectedAddons([]); setBusinessServices([]); setPurposeOfVisit('leisure'); }}
                  className="w-10 h-10 md:w-11 md:h-11 bg-stone-100 rounded-full flex items-center justify-center text-emerald-700 hover:bg-stone-200 transition-colors shrink-0">
                  <UilArrowLeft size="20" />
                </motion.button>
                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-emerald-700 tracking-tight leading-tight truncate">{selectedHotel.name}</h3>
                  <p className="text-[10px] text-emerald-700/40 font-medium">{selectedHotel.type}</p>
                </div>
              </div>
            </div>

            <div className="px-5 md:px-6 pt-5 md:pt-6 space-y-5 md:space-y-6 pb-8 max-w-lg mx-auto w-full">
              {/* Room Selection */}
              {roomsLoading ? (
                <div className="flex items-center justify-center py-6"><UilSync size="20" className="animate-spin text-emerald-500" /></div>
              ) : rooms.length > 0 ? (
                <div>
                  <h4 className="text-sm font-bold text-emerald-700 mb-3 flex items-center gap-2"><UilBuilding size="16" className="text-emerald-500" /> Select Room</h4>
                  <div className="space-y-2">
                    {rooms.map(room => {
                      const roomPrice = room.guests?.[0]?.price || 0;
                      const isSelected = selectedRoom?.id === room.id;
                      const stock = room.stock ?? room.total ?? 0;
                      const isOutOfStock = stock === 0;
                      return (
                        <button key={room.id} onClick={() => !isOutOfStock && setSelectedRoom(room)} disabled={isOutOfStock}
                          className={`w-full text-left p-3 rounded-2xl border-2 transition-all ${
                            isOutOfStock ? 'border-stone-100 bg-stone-50 opacity-50 cursor-not-allowed' :
                            isSelected ? 'border-emerald-600 bg-emerald-50/50 shadow-sm' : 'border-stone-100 bg-white hover:border-emerald-300'
                          }`}>
                          <div className="flex items-center gap-3">
                            {room.image && (
                              <div className="w-14 h-14 rounded-xl bg-stone-100 overflow-hidden shrink-0">
                                <img src={room.image} alt={room.name} className="w-full h-full object-cover" onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-bold text-stone-800">{room.name}</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {room.descriptionChecklist?.slice(0, 3).map((a: string, i: number) => (
                                  <span key={i} className="px-1.5 py-0.5 bg-stone-50 rounded text-[7px] font-semibold text-stone-400 border border-stone-100">{a}</span>
                                ))}
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-sm font-black text-stone-800">₱{roomPrice.toLocaleString()}</p>
                              <p className={`text-[8px] font-bold ${isOutOfStock ? 'text-red-400' : stock < 3 ? 'text-amber-500' : 'text-emerald-500'}`}>
                                {isOutOfStock ? 'Full' : `${stock} left`}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {/* Promo Packages */}
              {selectedHotel.promoPackages && selectedHotel.promoPackages.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-emerald-700 mb-3 flex items-center gap-2"><UilGift size="16" className="text-emerald-500" /> Promo Packages</h4>
                  <div className="space-y-2">
                    {selectedHotel.promoPackages.map(pkg => (
                      <button key={pkg.id} onClick={() => setSelectedPromo(selectedPromo?.id === pkg.id ? null : pkg)}
                        className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                          selectedPromo?.id === pkg.id ? 'border-emerald-600 bg-emerald-50/50' : 'border-stone-100 bg-white hover:border-emerald-300'
                        }`}>
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-bold text-stone-800">{pkg.name}</p>
                            <p className="text-[10px] text-stone-500 mt-0.5">{pkg.description}</p>
                          </div>
                          <span className="text-base font-black text-stone-800 shrink-0 ml-2">₱{pkg.price.toLocaleString()}</span>
                        </div>
                        <div className="flex gap-2 mt-2">
                          <span className="px-2 py-0.5 bg-stone-50 rounded-full text-[8px] font-bold text-stone-500">{pkg.persons} pax</span>
                          <span className="px-2 py-0.5 bg-stone-50 rounded-full text-[8px] font-bold text-stone-500">{pkg.days}D/{pkg.nights}N</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Dates */}
              <div>
                <h4 className="text-sm font-bold text-emerald-700 mb-3 flex items-center gap-2"><UilCalendarAlt size="16" className="text-emerald-500" /> Check-in / Check-out</h4>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-[9px] font-bold text-stone-400 mb-1 block">Check-in</label>
                    <input type="date" value={checkIn.toISOString().split('T')[0]}
                      onChange={e => { const d = new Date(e.target.value + 'T14:00:00'); setCheckIn(d); }}
                      className="w-full px-4 py-3 bg-stone-50 border-2 border-stone-100 rounded-2xl outline-none text-sm font-semibold text-stone-700 focus:border-emerald-500 transition-colors" />
                  </div>
                  <div className="flex-1">
                    <label className="text-[9px] font-bold text-stone-400 mb-1 block">Check-out</label>
                    <input type="date" value={checkOut.toISOString().split('T')[0]}
                      onChange={e => { const d = new Date(e.target.value + 'T12:00:00'); setCheckOut(d); }}
                      className="w-full px-4 py-3 bg-stone-50 border-2 border-stone-100 rounded-2xl outline-none text-sm font-semibold text-stone-700 focus:border-emerald-500 transition-colors" />
                  </div>
                </div>
              </div>

              {/* Purpose of Visit */}
              <div>
                <h4 className="text-sm font-bold text-emerald-700 mb-3 flex items-center gap-2"><UilGlobe size="16" className="text-emerald-500" /> Purpose of Visit</h4>
                <div className="flex flex-wrap gap-2">
                  {['leisure', 'business', 'family', 'transit', 'other'].map(opt => (
                    <button key={opt} onClick={() => setPurposeOfVisit(opt as typeof purposeOfVisit)}
                      className={`px-4 py-2 rounded-full text-[9px] font-bold tracking-wider border-2 transition-all ${
                        purposeOfVisit === opt ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-stone-400 border-stone-100 hover:border-emerald-300'
                      }`}>
                      {opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Guests */}
              <div>
                <h4 className="text-sm font-bold text-emerald-700 mb-3 flex items-center gap-2"><UilUsersAlt size="16" className="text-emerald-500" /> Guests</h4>
                <div className="bg-stone-50 rounded-2xl p-4 border border-stone-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <div><span className="text-sm font-semibold text-stone-700">Adults</span><span className="text-[9px] text-stone-400 block font-medium">Max {selectedHotel.maxAdults}</span></div>
                    <div className="flex items-center gap-4">
                      <button onClick={() => setAdults(Math.max(1, adults - 1))} className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-stone-500 border border-stone-200 hover:bg-emerald-600 hover:text-white transition-all"><UilMinus size="12" /></button>
                      <span className="w-6 text-center text-base font-bold text-stone-800">{adults}</span>
                      <button onClick={() => setAdults(Math.min(selectedHotel.maxAdults, adults + 1))} className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-stone-500 border border-stone-200 hover:bg-emerald-600 hover:text-white transition-all"><UilPlus size="12" /></button>
                    </div>
                  </div>
                  {selectedHotel.childPrice && (
                    <div className="flex items-center justify-between pt-2 border-t border-stone-200/50">
                      <span className="text-sm font-semibold text-stone-700">Children <span className="text-[9px] text-stone-400 font-medium">₱{selectedHotel.childPrice}/night</span></span>
                      <div className="flex items-center gap-4">
                        <button onClick={() => setChildren(Math.max(0, children - 1))} className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-stone-500 border border-stone-200 hover:bg-emerald-600 hover:text-white transition-all"><UilMinus size="12" /></button>
                        <span className="w-6 text-center text-base font-bold text-stone-800">{children}</span>
                        <button onClick={() => setChildren(Math.min(4, children + 1))} className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-stone-500 border border-stone-200 hover:bg-emerald-600 hover:text-white transition-all"><UilPlus size="12" /></button>
                      </div>
                    </div>
                  )}
                  {selectedHotel.tweenPrice && (
                    <div className="flex items-center justify-between pt-2 border-t border-stone-200/50">
                      <span className="text-sm font-semibold text-stone-700">Tweens <span className="text-[9px] text-stone-400 font-medium">₱{selectedHotel.tweenPrice}/night</span></span>
                      <div className="flex items-center gap-4">
                        <button onClick={() => setTweens(Math.max(0, tweens - 1))} className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-stone-500 border border-stone-200 hover:bg-emerald-600 hover:text-white transition-all"><UilMinus size="12" /></button>
                        <span className="w-6 text-center text-base font-bold text-stone-800">{tweens}</span>
                        <button onClick={() => setTweens(Math.min(4, tweens + 1))} className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-stone-500 border border-stone-200 hover:bg-emerald-600 hover:text-white transition-all"><UilPlus size="12" /></button>
                      </div>
                    </div>
                  )}
                  {adults + children + tweens > selectedHotel.maxAdults && (
                    <p className="text-[10px] text-red-400 font-semibold">Exceeds max capacity of {selectedHotel.maxAdults}</p>
                  )}
                </div>
              </div>

              {/* Add-ons */}
              <div>
                <h4 className="text-sm font-bold text-emerald-700 mb-3">Add-ons</h4>
                <div className="space-y-2">
                  {(businessServices.length === 0 ? [
                    { id: 'breakfast', label: 'Breakfast Bundle', price: 250, icon: UilUtensils },
                    { id: 'lateCheckin', label: 'Late Check-in', price: 150, icon: UilMoon },
                  ] : businessServices.map(s => ({ id: s.id, label: s.name, price: s.price, icon: UilUtensils }))).map(item => {
                    const isOn = businessServices.length === 0 ? (addons as any)[item.id] : selectedAddons.includes(item.id);
                    return (
                      <div key={item.id} className={`rounded-2xl border-2 transition-all ${isOn ? 'border-emerald-600 bg-emerald-50/50' : 'border-stone-100 bg-white'}`}>
                        <button onClick={() => {
                          if (businessServices.length === 0) {
                            setAddons(prev => ({ ...prev, [item.id]: !(prev as any)[item.id] }));
                          } else {
                            setSelectedAddons(prev => isOn ? prev.filter(id => id !== item.id) : [...prev, item.id]);
                          }
                        }} className="w-full flex items-center justify-between p-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${isOn ? 'bg-emerald-600 text-white' : 'bg-stone-50 text-stone-400'}`}>
                              <item.icon size="16" />
                            </div>
                            <div className="text-left">
                              <span className="block text-sm font-semibold text-stone-800">{item.label}</span>
                              <span className="text-[9px] text-stone-400 font-medium">+ ₱{item.price}</span>
                            </div>
                          </div>
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${isOn ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-stone-300'}`}>
                            {isOn && <UilCheckCircle size="12" />}
                          </div>
                        </button>
                        {isOn && item.id === 'breakfast' && (
                          <div className="px-3 pb-3 flex items-center justify-between border-t border-emerald-100 pt-2">
                            <span className="text-[10px] font-semibold text-stone-600">For how many?</span>
                            <div className="flex items-center gap-3">
                              <button onClick={() => setBreakfastPeople(Math.max(1, breakfastPeople - 1))} className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-stone-500 border border-stone-200 hover:bg-emerald-600 hover:text-white transition-all"><UilMinus size="10" /></button>
                              <span className="w-4 text-center text-sm font-bold text-stone-800">{breakfastPeople}</span>
                              <button onClick={() => setBreakfastPeople(Math.min(adults + children + tweens, breakfastPeople + 1))} className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-stone-500 border border-stone-200 hover:bg-emerald-600 hover:text-white transition-all"><UilPlus size="10" /></button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Price Summary */}
              <div className="bg-stone-50 rounded-2xl p-4 border border-stone-100 space-y-2">
                <div className="flex justify-between text-xs text-stone-600">
                  <span>₱{getRoomPrice().toLocaleString()} × {nights} night{nights > 1 ? 's' : ''}</span>
                  <span className="font-semibold">₱{(getRoomPrice() * nights).toLocaleString()}</span>
                </div>
                {children > 0 && selectedHotel.childPrice && (
                  <div className="flex justify-between text-xs text-stone-600">
                    <span>Children × {children}</span>
                    <span className="font-semibold">₱{(children * selectedHotel.childPrice * nights).toLocaleString()}</span>
                  </div>
                )}
                {tweens > 0 && selectedHotel.tweenPrice && (
                  <div className="flex justify-between text-xs text-stone-600">
                    <span>Tweens × {tweens}</span>
                    <span className="font-semibold">₱{(tweens * selectedHotel.tweenPrice * nights).toLocaleString()}</span>
                  </div>
                )}
                {addons.breakfast && <div className="flex justify-between text-xs text-stone-600"><span>Breakfast</span><span className="font-semibold">₱{(250 * breakfastPeople).toLocaleString()}</span></div>}
                {addons.lateCheckin && <div className="flex justify-between text-xs text-stone-600"><span>Late Check-in</span><span className="font-semibold">₱150</span></div>}
                {selectedAddons.map(id => {
                  const svc = businessServices.find(s => s.id === id);
                  return svc ? <div key={id} className="flex justify-between text-xs text-stone-600"><span>{svc.name}</span><span className="font-semibold">₱{svc.price.toLocaleString()}</span></div> : null;
                })}
                <div className="border-t border-stone-200 pt-2 flex justify-between items-center">
                  <span className="text-sm font-bold text-stone-800">Total</span>
                  <span className="text-lg font-black text-emerald-700">₱{calculateTotal().toLocaleString()}</span>
                </div>
              </div>

              {/* Availability Error */}
              {availabilityError && (
                <div className="p-3 bg-rose-50 rounded-2xl border-2 border-rose-100 text-rose-600 text-[11px] font-bold">{availabilityError}</div>
              )}

              {/* Book Button */}
              {bookingStatus === 'success' ? (
                <div className="text-center py-6">
                  <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <UilCheckCircle size="28" className="text-emerald-600" />
                  </div>
                  <p className="text-lg font-black text-stone-800 tracking-tighter mb-1">Booking Confirmed!</p>
                  <p className="text-xs text-stone-500 font-medium">Check your email for confirmation details.</p>
                </div>
              ) : (
                <motion.button whileTap={{ scale: 0.97 }} onClick={handleBook}
                  disabled={bookingStatus === 'loading' || adults + children + tweens > selectedHotel.maxAdults}
                  className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-5 rounded-2xl font-bold text-sm shadow-xl shadow-emerald-600/20 hover:shadow-emerald-600/40 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed">
                  {bookingStatus === 'loading' ? (
                    <UilSync size="22" className="animate-spin" />
                  ) : (
                    <><UilBedDouble size="20" /> Book — ₱{calculateTotal().toLocaleString()}</>
                  )}
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Event Booking Modal */}
      <AnimatePresence>
        {selectedVenue && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-0 bg-white z-[60] flex flex-col overflow-y-auto no-scrollbar"
          >
            <div className="sticky top-0 bg-white/95 backdrop-blur-3xl z-10 px-5 md:px-6 pt-5 md:pt-6 pb-4 border-b border-stone-100">
              <div className="flex items-center gap-4">
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => setSelectedVenue(null)}
                  className="w-10 h-10 md:w-11 md:h-11 bg-stone-100 rounded-full flex items-center justify-center text-emerald-700 hover:bg-stone-200 transition-colors shrink-0">
                  <UilArrowLeft size="20" />
                </motion.button>
                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-emerald-700 tracking-tight leading-tight truncate">{selectedVenue.name}</h3>
                  <p className="text-[10px] text-emerald-700/40 font-medium">Event Venue</p>
                </div>
              </div>
            </div>

            <div className="px-5 md:px-6 pt-5 md:pt-6 space-y-5 md:space-y-6 pb-8 max-w-lg mx-auto w-full">
              <div>
                <h4 className="text-sm font-bold text-emerald-700 mb-3">Event Type</h4>
                <select value={eventType} onChange={e => setEventType(e.target.value)}
                  className="w-full px-5 py-4 bg-stone-50 border-2 border-stone-100 rounded-2xl outline-none text-sm font-semibold text-stone-700 focus:border-emerald-500 transition-colors">
                  <option value="">Select event type...</option>
                  {['wedding', 'conference', 'party', 'meeting', 'workshop', 'other'].map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>

              <div>
                <h4 className="text-sm font-bold text-emerald-700 mb-3">Expected Pax</h4>
                <input type="number" value={expectedPax} onChange={e => setExpectedPax(Number(e.target.value))} min={1} max={selectedVenue.capacitySeated}
                  className="w-full px-5 py-4 bg-stone-50 border-2 border-stone-100 rounded-2xl outline-none text-sm font-semibold text-stone-700 focus:border-emerald-500 transition-colors" />
                <p className="text-[10px] text-stone-400 mt-1">Max capacity: {selectedVenue.capacitySeated} pax</p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-emerald-700 mb-3">Event Start</h4>
                <input type="datetime-local" onChange={e => setEventStart(new Date(e.target.value))}
                  className="w-full px-5 py-4 bg-stone-50 border-2 border-stone-100 rounded-2xl outline-none text-sm font-semibold text-stone-700 focus:border-emerald-500 transition-colors" />
              </div>

              <div>
                <h4 className="text-sm font-bold text-emerald-700 mb-3">Event End</h4>
                <input type="datetime-local" onChange={e => setEventEnd(new Date(e.target.value))}
                  className="w-full px-5 py-4 bg-stone-50 border-2 border-stone-100 rounded-2xl outline-none text-sm font-semibold text-stone-700 focus:border-emerald-500 transition-colors" />
              </div>

              <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100 space-y-2">
                <div className="flex justify-between text-xs text-stone-600"><span>Half-day rate</span><span className="font-semibold">₱{selectedVenue.halfDayPrice.toLocaleString()}</span></div>
                <div className="flex justify-between text-xs text-stone-600"><span>Full-day rate</span><span className="font-semibold">₱{selectedVenue.fullDayPrice.toLocaleString()}</span></div>
                <div className="border-t border-emerald-100 pt-2 flex justify-between items-center">
                  <span className="text-sm font-bold text-stone-800">Overtime/hr</span>
                  <span className="text-base font-black text-emerald-700">₱{selectedVenue.overtimeRate.toLocaleString()}</span>
                </div>
              </div>

              <motion.button whileTap={{ scale: 0.97 }}
                onClick={async () => {
                  if (!user) { login(); return; }
                  if (!eventType || !eventStart || !eventEnd) return;
                  try {
                    const pilotBizId = pilotConfig?.enabled && pilotConfig.businessId ? pilotConfig.businessId : '';
                    await addDoc(collection(db, 'bookings'), {
                      touristUid: user.uid, touristName: user.displayName || 'Anonymous',
                      serviceName: selectedVenue.name, serviceType: 'stay',
                      businessId: pilotBizId || 'pilot_business',
                      bookingCategory: 'event', eventVenueId: selectedVenue.id,
                      eventType, expectedPax,
                      eventStartTimestamp: Timestamp.fromDate(eventStart),
                      eventEndTimestamp: Timestamp.fromDate(eventEnd),
                      status: 'pending', paymentStatus: 'UNPAID',
                      amount: selectedVenue.fullDayPrice, createdAt: serverTimestamp(),
                    });
                    toast.success('Event inquiry submitted!');
                    setSelectedVenue(null);
                  } catch (error) { handleFirestoreError(error, OperationType.CREATE, 'bookings'); }
                }}
                disabled={!eventType || !eventStart || !eventEnd}
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-5 rounded-2xl font-bold text-sm shadow-xl shadow-emerald-600/20 hover:shadow-emerald-600/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                Submit Event Inquiry
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
