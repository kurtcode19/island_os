import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Hotel, Star, MapPin, Wifi, Coffee, Wind, Waves, ArrowRight, Search, Filter, CheckCircle2, Sparkles, RefreshCw, CalendarDays, Plus, Minus, Sun, Moon, X, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

import { accommodations } from '../data/accommodations';

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
          <ChevronLeft size={16} strokeWidth={3} />
        </button>
        <span className="text-sm font-bold text-island-green">{viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
        <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1))} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-island-green hover:text-white transition-all">
          <ChevronRight size={16} strokeWidth={3} />
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
  const [selectedHotel, setSelectedHotel] = useState<typeof accommodations[0] | null>(null);
  const [checkIn, setCheckIn] = useState(new Date(2026, 5, 15));
  const [checkOut, setCheckOut] = useState(new Date(2026, 5, 18));
  const [guests, setGuests] = useState(2);
  const [addons, setAddons] = useState({ breakfast: false, lateCheckin: false });

  const handleBook = async (hotel: typeof accommodations[0]) => {
    if (!user) {
      login();
      return;
    }

    setBookingStatus(prev => ({ ...prev, [hotel.id]: 'loading' }));
    setTestError(null);

    const nights = Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)));
    const total = hotel.price * nights + (addons.breakfast ? 250 : 0) + (addons.lateCheckin ? 150 : 0);

    try {
      await addDoc(collection(db, 'bookings'), {
        touristUid: user.uid,
        touristName: user.displayName || 'Anonymous',
        serviceId: hotel.id,
        serviceName: hotel.name,
        serviceType: 'stay',
        businessId: hotel.businessId,
        date: `${checkIn.toLocaleDateString()} - ${checkOut.toLocaleDateString()}`,
        status: 'pending',
        paymentStatus: 'UNPAID',
        amount: total,
        createdAt: serverTimestamp()
      });
      setBookingStatus(prev => ({ ...prev, [hotel.id]: 'success' }));
      setTimeout(() => {
        setBookingStatus(prev => ({ ...prev, [hotel.id]: 'idle' }));
        setSelectedHotel(null);
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
      <section className="relative h-[45vh] flex items-center overflow-hidden">
        <motion.img 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
          src="https://img.atlasobscura.com/CmlPBCqrdngS4DE4q_DDyDdVYBjhcSTHrsI9PUEbvkQ/rs:fill:780:520:1/g:ce/q:81/sm:1/scp:1/ar:1/aHR0cHM6Ly9hdGxh/cy1kZXYuczMuYW1h/em9uYXdzLmNvbS91/cGxvYWRzL3BsYWNl/X2ltYWdlcy85OTA0/ZjhlMDJiMGM0ODM5/NWJfU3Vua2VuX0Nl/bWV0ZXJ5LF9DYXRh/cm1hbixfQ2FtaWd1/aW4uanBn.jpg" 
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
              Island <span className="text-transparent bg-clip-text bg-gradient-to-r from-island-emerald to-white">Habitats.</span>
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
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={24} strokeWidth={3} />
            <input 
              type="text" 
              placeholder="Search by name or landmark..." 
              className="w-full pl-14 pr-6 py-5 bg-stone-50 rounded-2xl outline-none focus:ring-4 focus:ring-island-emerald/5 transition-all font-bold text-slate-900"
            />
          </div>
          <button className="btn-secondary px-8 py-5 rounded-2xl">
            <Filter size={20} strokeWidth={3} /> Filter Nodes
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
          <div className="flex gap-3 bg-stone-100 p-2 rounded-[2rem] border border-slate-200 shadow-inner">
            {['All', 'Resorts', 'Homestays'].map((tab) => (
              <button 
                key={tab} 
                onClick={() => setSelectedTab(tab)}
                className={`px-8 py-3 rounded-full text-xs font-bold tracking-wider transition-all ${
                  selectedTab === tab 
                    ? 'sunset-gradient text-white shadow-xl shadow-island-sunset/20' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {accommodations.map((hotel, idx) => (
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
                  <Star size={18} fill="#D97706" className="text-island-sunset" /> {hotel.rating}
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
                
                <div className="flex items-center gap-8 mb-10 py-8 border-y-2 border-stone-50">
                  <div className="flex items-center gap-3 text-slate-500 font-semibold text-xs tracking-tight">
                    <Wifi size={20} strokeWidth={3} className="text-island-emerald" /> Wifi
                  </div>
                  <div className="flex items-center gap-3 text-slate-500 font-semibold text-xs tracking-tight">
                    <Coffee size={20} strokeWidth={3} className="text-island-emerald" /> Breakfast
                  </div>
                  <div className="flex items-center gap-3 text-slate-500 font-semibold text-xs tracking-tight">
                    <Wind size={20} strokeWidth={3} className="text-island-emerald" /> Climate
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedHotel(hotel)}
                  disabled={bookingStatus[hotel.id] === 'success'}
                  className="w-full bg-island-green text-white py-6 rounded-3xl font-bold text-xs uppercase tracking-widest hover:shadow-xl hover:shadow-island-green/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {bookingStatus[hotel.id] === 'success' ? (
                    <><CheckCircle2 size={24} strokeWidth={3} /> Reservation Confirmed</>
                  ) : (
                    <><CalendarDays size={20} /> Book Now</>
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
                <button onClick={() => { setSelectedHotel(null); setAddons({ breakfast: false, lateCheckin: false }); }}
                  className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-500 hover:bg-island-green hover:text-white transition-all">
                  <X size={18} strokeWidth={3} />
                </button>
              </div>

              <div className="px-8 pt-6 pb-8 space-y-6">
                {/* Calendar */}
                <div>
                  <h4 className="text-sm font-bold text-island-green mb-3 flex items-center gap-2">
                    <CalendarDays size={16} className="text-island-emerald" /> Select dates
                  </h4>
                  <BookingCalendar checkIn={checkIn} checkOut={checkOut} onSelectCheckIn={setCheckIn} onSelectCheckOut={setCheckOut} />
                </div>

                {/* Guests */}
                <div>
                  <h4 className="text-sm font-bold text-island-green mb-3 flex items-center gap-2">
                    <Users size={16} className="text-island-emerald" /> Guests
                  </h4>
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-700">Adults</span>
                      <div className="flex items-center gap-4">
                        <button onClick={() => setGuests(Math.max(1, guests - 1))} className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-500 border border-slate-200 hover:bg-island-green hover:text-white transition-all shadow-sm">
                          <Minus size={14} strokeWidth={3} />
                        </button>
                        <span className="w-6 text-center text-base font-bold text-island-green">{guests}</span>
                        <button onClick={() => setGuests(Math.min(10, guests + 1))} className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-500 border border-slate-200 hover:bg-island-green hover:text-white transition-all shadow-sm">
                          <Plus size={14} strokeWidth={3} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Add-ons */}
                <div>
                  <h4 className="text-sm font-bold text-island-green mb-3">Add-ons</h4>
                  <div className="space-y-2">
                    {[
                      { id: 'breakfast', label: 'Breakfast Bundle', price: 250, icon: Coffee },
                      { id: 'lateCheckin', label: 'Late Check-in', price: 150, icon: Moon },
                    ].map(item => (
                      <button key={item.id} onClick={() => setAddons(prev => ({ ...prev, [item.id]: !(prev as any)[item.id] }))}
                        className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                          (addons as any)[item.id] ? 'border-island-green bg-island-green/5' : 'border-slate-100 bg-white hover:border-slate-200'
                        }`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${(addons as any)[item.id] ? 'bg-island-green text-white' : 'bg-slate-50 text-slate-400'}`}>
                            <item.icon size={18} strokeWidth={2.5} />
                          </div>
                          <div className="text-left">
                            <span className="block text-sm font-semibold text-slate-800">{item.label}</span>
                            <span className="text-[10px] text-slate-400 font-medium">+ ₱{item.price}</span>
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${(addons as any)[item.id] ? 'bg-island-green border-island-green text-white' : 'border-slate-300'}`}>
                          {(addons as any)[item.id] && <CheckCircle2 size={12} strokeWidth={4} />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="bg-island-green/5 rounded-2xl p-5 border border-island-green/10 space-y-3">
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>₱{selectedHotel.price.toLocaleString()} x {Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)))} nights</span>
                    <span className="font-semibold">₱{(selectedHotel.price * Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)))).toLocaleString()}</span>
                  </div>
                  {addons.breakfast && <div className="flex justify-between text-sm text-slate-600"><span>Breakfast Bundle</span><span>+ ₱250</span></div>}
                  {addons.lateCheckin && <div className="flex justify-between text-sm text-slate-600"><span>Late Check-in</span><span>+ ₱150</span></div>}
                  <div className="border-t border-island-green/10 pt-3 flex justify-between items-center">
                    <span className="text-base font-bold text-island-green">Total</span>
                    <span className="text-xl font-black text-island-green">₱{(
                      selectedHotel.price * Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))) +
                      (addons.breakfast ? 250 : 0) + (addons.lateCheckin ? 150 : 0)
                    ).toLocaleString()}</span>
                  </div>
                </div>

                {/* Confirm */}
                <button onClick={() => handleBook(selectedHotel)}
                  disabled={bookingStatus[selectedHotel.id] === 'loading' || bookingStatus[selectedHotel.id] === 'success'}
                  className="w-full bg-island-green text-white py-5 rounded-2xl font-bold text-sm shadow-xl shadow-island-green/20 hover:shadow-island-green/40 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {bookingStatus[selectedHotel.id] === 'success' ? (
                    <><CheckCircle2 size={22} /> Confirmed</>
                  ) : bookingStatus[selectedHotel.id] === 'loading' ? (
                    <RefreshCw size={22} className="animate-spin" />
                  ) : (
                    <><CalendarDays size={20} /> Book now</>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
