import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UilBuilding, UilStar, UilMapMarker, UilWifi, UilCoffee, UilWind, UilWater, UilArrowRight, UilSearch, UilFilter, UilCheckCircle, UilRefresh, UilCalendarAlt, UilPlus, UilMinus, UilSun, UilMoon, UilTimes, UilAngleLeftB, UilAngleRightB, UilUsersAlt, UilGift, UilUser, UilUtensils, UilAngleDown } from '@/icons';
import { useAuth } from '../context/AuthContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

import { accommodations, type PromoPackage } from '../data/accommodations';

function BookingCalendar({ checkIn, checkOut, onSelectCheckIn, onSelectCheckOut }: { 
  checkIn: Date; checkOut: Date; 
  onSelectCheckIn: (d: Date) => void; onSelectCheckOut: (d: Date) => void 
}) {
  const [viewDate, setViewDate] = useState(new Date(2026, 5, 1));
  const [selecting, setSelecting] = useState<'checkin' | 'checkout'>('checkin');

  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const isSameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  const isInRange = (d: Date) => d > checkIn && d < checkOut;
  const isPast = (d: Date) => d < new Date(2026, 5, 14);

  const handleClick = (day: number) => {
    const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    if (selecting === 'checkin') { onSelectCheckIn(date); setSelecting('checkout'); }
    else {
      if (date <= checkIn) { onSelectCheckIn(date); setSelecting('checkout'); }
      else { onSelectCheckOut(date); setSelecting('checkin'); }
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100">
      <div className="flex items-center justify-between mb-5">
        <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1))} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-island-green hover:text-white transition-all">
          <UilAngleLeftB size="16" />
        </button>
        <span className="text-sm font-bold text-island-green">{viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
        <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1))} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-island-green hover:text-white transition-all">
          <UilAngleRightB size="16" />
        </button>
      </div>
      <div className="flex gap-2 mb-3">
        <button onClick={() => setSelecting('checkin')} className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${selecting === 'checkin' ? 'bg-island-green text-white' : 'bg-slate-50 text-slate-500'}`}>Check-in</button>
        <button onClick={() => setSelecting('checkout')} className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${selecting === 'checkout' ? 'bg-island-green text-white' : 'bg-slate-50 text-slate-500'}`}>Check-out</button>
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {dayNames.map(d => <div key={d} className="text-center text-[9px] font-semibold text-slate-400 py-1">{d}</div>)}
        {emptyDays.map(i => <div key={`e-${i}`} />)}
        {days.map(d => {
          const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), d);
          const isCI = isSameDay(date, checkIn);
          const isCO = isSameDay(date, checkOut);
          return (
            <button key={d} onClick={() => !isPast(date) && handleClick(d)} disabled={isPast(date)}
              className={`p-1.5 text-xs font-semibold rounded-full transition-all
                ${isCI || isCO ? 'bg-island-green text-white scale-105 z-10 shadow-lg' : ''}
                ${isInRange(date) ? 'bg-island-green/10 text-island-green' : ''}
                ${!isCI && !isCO && !isInRange(date) && !isPast(date) ? 'text-slate-700 hover:bg-slate-50' : ''}
                ${isPast(date) ? 'text-slate-200 cursor-not-allowed' : ''}`}
            >{d}</button>
          );
        })}
      </div>
      <div className="flex justify-between mt-3 pt-3 border-t border-slate-100 text-[10px] text-slate-400 font-medium">
        <span>In: <strong className="text-island-green">{checkIn.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</strong></span>
        <span>Out: <strong className="text-island-green">{checkOut.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</strong></span>
      </div>
    </div>
  );
}

export default function StayView() {
  const { user, login } = useAuth();
  const [bookingStatus, setBookingStatus] = useState<{[key: string]: 'idle' | 'loading' | 'success'}>({});
  const [testError, setTestError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHotel, setSelectedHotel] = useState<typeof accommodations[0] | null>(null);
  const [checkIn, setCheckIn] = useState(new Date(2026, 5, 15));
  const [checkOut, setCheckOut] = useState(new Date(2026, 5, 18));
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [tweens, setTweens] = useState(0);
  const [addons, setAddons] = useState({ breakfast: false, lateCheckin: false });
  const [breakfastPeople, setBreakfastPeople] = useState(2);
  const [selectedPromo, setSelectedPromo] = useState<PromoPackage | null>(null);
  const [expandedPromo, setExpandedPromo] = useState<string | null>(null);

  const types = ['All', ...new Set(accommodations.map(a => a.type))];
  const filtered = accommodations.filter(a =>
    (selectedTab === 'All' || a.type === selectedTab) &&
    (a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     a.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  const calculateTotal = (hotel: typeof accommodations[0]) => {
    const nights = Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)));
    let total = 0;
    if (selectedPromo) {
      total = selectedPromo.price;
    } else {
      total = hotel.price * nights;
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

    const nights = Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)));
    const total = calculateTotal(hotel);

    try {
      await addDoc(collection(db, 'bookings'), {
        touristUid: user.uid,
        touristName: user.displayName || 'Anonymous',
        serviceId: hotel.id,
        serviceName: hotel.name,
        serviceType: 'stay',
        businessId: hotel.businessId,
        date: `${checkIn.toLocaleDateString()} - ${checkOut.toLocaleDateString()}`,
        adults,
        children,
        tweens,
        breakfastPeople: addons.breakfast ? breakfastPeople : 0,
        promoPackage: selectedPromo ? selectedPromo.name : null,
        status: 'pending',
        paymentStatus: 'UNPAID',
        amount: total,
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
    <div className="bg-[#F0FDF4] min-h-screen pb-40 selection:bg-island-emerald/20">
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
        <div className="absolute inset-0 bg-gradient-to-b from-island-volcanic/60 via-transparent to-[#F4F4F1]"></div>
        
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
              From luxury beachfront villas to historic ancestral stays, discover the premier resting places in Catarman.
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
            <h2 className="text-5xl md:text-6xl font-black text-island-volcanic tracking-tighter">Verified Stays.</h2>
          </div>
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
        </div>

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
                <button onClick={() => { setSelectedHotel(null); setSelectedPromo(null); setAddons({ breakfast: false, lateCheckin: false }); setChildren(0); setTweens(0); setBreakfastPeople(2); }}
                  className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-500 hover:bg-island-green hover:text-white transition-all">
                  <UilTimes size="18" />
                </button>
              </div>

              <div className="px-8 pt-6 pb-8 space-y-6">
                {/* Calendar */}
                <div>
                  <h4 className="text-sm font-bold text-island-green mb-3 flex items-center gap-2">
                    <UilCalendarAlt size="16" className="text-island-emerald" /> Select dates
                  </h4>
                  <BookingCalendar checkIn={checkIn} checkOut={checkOut} onSelectCheckIn={setCheckIn} onSelectCheckOut={setCheckOut} />
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

                {/* Add-ons */}
                <div>
                  <h4 className="text-sm font-bold text-island-green mb-3">Add-ons</h4>
                  <div className="space-y-2">
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
                  </div>
                </div>

                {/* Total */}
                <div className="bg-island-green/5 rounded-2xl p-5 border border-island-green/10 space-y-3">
                  {selectedPromo ? (
                    <div className="flex justify-between text-sm text-slate-600">
                      <span>{selectedPromo.name} ({selectedPromo.days}D/{selectedPromo.nights}N)</span>
                      <span className="font-semibold">₱{selectedPromo.price.toLocaleString()}</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between text-sm text-slate-600">
                        <span>₱{selectedHotel.price.toLocaleString()} x {Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)))} nights</span>
                        <span className="font-semibold">₱{(selectedHotel.price * Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)))).toLocaleString()}</span>
                      </div>
                      {children > 0 && selectedHotel.childPrice && (
                        <div className="flex justify-between text-sm text-slate-600"><span>Children ({children} x ₱{selectedHotel.childPrice})</span><span>+ ₱{(children * selectedHotel.childPrice * Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)))).toLocaleString()}</span></div>
                      )}
                      {tweens > 0 && selectedHotel.tweenPrice && (
                        <div className="flex justify-between text-sm text-slate-600"><span>Tweens ({tweens} x ₱{selectedHotel.tweenPrice})</span><span>+ ₱{(tweens * selectedHotel.tweenPrice * Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)))).toLocaleString()}</span></div>
                      )}
                      {addons.breakfast && <div className="flex justify-between text-sm text-slate-600"><span>Breakfast Bundle x {breakfastPeople}</span><span>+ ₱{(250 * breakfastPeople).toLocaleString()}</span></div>}
                      {addons.lateCheckin && <div className="flex justify-between text-sm text-slate-600"><span>Late Check-in</span><span>+ ₱150</span></div>}
                    </>
                  )}
                  <div className="border-t border-island-green/10 pt-3 flex justify-between items-center">
                    <span className="text-base font-bold text-island-green">Total</span>
                    <span className="text-xl font-black text-island-green">₱{calculateTotal(selectedHotel).toLocaleString()}</span>
                  </div>
                </div>

                {/* Confirm */}
                {adults + children + tweens > selectedHotel.maxAdults ? (
                  <div className="w-full bg-rose-50 text-island-coral py-5 rounded-2xl font-bold text-xs text-center border-2 border-rose-100">
                    Guest limit exceeded. Max {selectedHotel.maxAdults} guests.
                  </div>
                ) : (
                  <button onClick={() => handleBook(selectedHotel)}
                    disabled={bookingStatus[selectedHotel.id] === 'loading' || bookingStatus[selectedHotel.id] === 'success'}
                    className="w-full bg-island-green text-white py-5 rounded-2xl font-bold text-sm shadow-xl shadow-island-green/20 hover:shadow-island-green/40 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {bookingStatus[selectedHotel.id] === 'success' ? (
                      <><UilCheckCircle size="22" /> Confirmed</>
                    ) : bookingStatus[selectedHotel.id] === 'loading' ? (
                      <UilRefresh size="22" className="animate-spin" />
                    ) : (
                      <><UilCalendarAlt size="20" /> Book now</>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
