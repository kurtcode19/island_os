import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UilArrowLeft, UilMapMarker, UilClock, UilCheckCircle, UilSync, UilCalendarAlt, UilMinus, UilPlus, UilShieldCheck } from '@/icons';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

import { rentalVehicles, getMerchantByVehicle } from '../data/rentals';
import { transportOptions } from '../data/transport';
import { getPilotConfig, type PilotConfig } from '../lib/pilotService';

export default function TransportView() {
  const { user, login } = useAuth();
  const [mobilityFilter, setMobilityFilter] = useState<'Rentals' | 'Transports'>('Rentals');
  const [selectedTransport, setSelectedTransport] = useState<any>(null);
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [transportDate, setTransportDate] = useState('');
  const [transportGuests, setTransportGuests] = useState(1);
  const [pilotConfig, setPilotConfig] = useState<PilotConfig | null>(null);
  const isSubmitting = useRef(false);

  useEffect(() => {
    getPilotConfig().then(setPilotConfig);
  }, []);

  const visibleTransportOptions = pilotConfig?.enabled && pilotConfig.businessId
    ? transportOptions.filter(o => o.businessId === pilotConfig.businessId)
    : transportOptions;

  const handleBookTransport = async (transport: any) => {
    if (!user) { login(); return; }
    if (!transportDate) {
      toast.error('Please select a travel date');
      return;
    }
    if (isSubmitting.current) return;
    isSubmitting.current = true;
    setBookingStatus('loading');
    try {
      await addDoc(collection(db, 'bookings'), {
        touristUid: user.uid,
        touristName: user.displayName || 'Anonymous',
        touristEmail: user.email || '',
        serviceId: transport.id,
        serviceName: transport.title,
        serviceType: 'transport',
        businessId: transport.businessId || 'catarman_lgu',
        date: transportDate,
        guests: transportGuests,
        route: transport.route,
        duration: transport.duration,
        amount: transport.price * transportGuests,
        status: 'pending',
        paymentStatus: 'UNPAID',
        createdAt: serverTimestamp(),
      });
      setBookingStatus('success');
      toast.success('Booking request submitted!');
      setTimeout(() => {
        setBookingStatus('idle');
        setSelectedTransport(null);
        isSubmitting.current = false;
      }, 2000);
    } catch (error) {
      setBookingStatus('idle');
      isSubmitting.current = false;
      handleFirestoreError(error, OperationType.CREATE, 'bookings');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white selection:bg-emerald-500/20">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-16">

        {/* header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <span className="text-[10px] font-black text-emerald-700 uppercase tracking-[0.4em]">Island Mobility</span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-emerald-950 tracking-tighter mt-1">
            Getting Around
          </h1>
        </motion.div>

        {/* search */}
        <div className="mb-6">
          <div className="flex items-center gap-3 bg-white rounded-2xl px-5 py-3.5 border border-stone-200 shadow-sm">
            <svg className="w-5 h-5 text-stone-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input type="text" placeholder="Search vehicles..." readOnly
              className="text-sm font-semibold text-stone-500 bg-transparent outline-none w-full placeholder:text-stone-400/60" />
          </div>
        </div>

        {/* filter pills */}
        <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
          {['Rentals', 'Transports'].map(s => (
            <button key={s} onClick={() => setMobilityFilter(s as 'Rentals' | 'Transports')}
              className={`px-5 py-2.5 rounded-full text-xs font-black tracking-wider whitespace-nowrap transition-all ${
                mobilityFilter === s ? 'bg-emerald-700 text-white shadow-lg' : 'bg-amber-50 text-emerald-700/60 hover:text-emerald-700'
              }`}>
              {s}
            </button>
          ))}
        </div>

        {/* rentals */}
        {mobilityFilter === 'Rentals' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {rentalVehicles.map((vehicle, idx) => {
              const merchant = getMerchantByVehicle(vehicle);
              return (
                <motion.div
                  key={vehicle.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white rounded-[24px] border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img src={vehicle.image} alt={vehicle.name} className="w-full h-full object-cover" />
                    <div className={`absolute top-2 left-2 ${vehicle.color} text-white px-2 py-0.5 rounded-xl text-[9px] font-bold shadow-lg`}>
                      {vehicle.available} left
                    </div>
                    <div className={`absolute top-2 right-2 w-7 h-7 ${vehicle.color} rounded-full flex items-center justify-center text-white shadow-lg`}>
                      <vehicle.icon size="12" />
                    </div>
                  </div>
                  <div className="px-4 py-3 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-black text-stone-800 tracking-tighter leading-tight">{vehicle.name}</h3>
                      <div className="text-right shrink-0">
                        <span className="text-sm font-black text-stone-800">₱{vehicle.rate.toLocaleString()}</span>
                        <span className="text-[8px] text-stone-500 font-semibold ml-0.5">/{vehicle.rateUnit}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">{vehicle.type} • {vehicle.transmission}</span>
                      <span className="text-[9px] font-semibold text-stone-400">{vehicle.capacity} seats</span>
                    </div>
                    {merchant && (
                      <span className="text-[7px] font-bold text-stone-400 tracking-wide block">by {merchant.name} • {merchant.location}</span>
                    )}
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {vehicle.features.slice(0, 2).map((f, i) => (
                        <span key={i} className="px-2 py-0.5 bg-stone-100 rounded-full text-[8px] font-semibold text-stone-500">{f}</span>
                      ))}
                      {vehicle.features.length > 2 && (
                        <span className="px-2 py-0.5 bg-stone-100 rounded-full text-[8px] font-semibold text-stone-500">+{vehicle.features.length - 2}</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* transports */}
        {mobilityFilter === 'Transports' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {visibleTransportOptions.map((option, idx) => (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white rounded-[24px] border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedTransport(option)}
              >
                <div className="p-4">
                  <h3 className="text-base font-black text-emerald-700 tracking-tighter mb-1">{option.title}</h3>
                  <p className="text-[10px] text-emerald-700/50 font-medium mb-1">{option.provider} • {option.route}</p>
                  <span className="text-sm font-black text-emerald-600">₱{option.price.toLocaleString()}</span>
                  <span className="text-[10px] text-emerald-700/40 font-medium ml-1">/ {option.duration}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Transport Booking Modal */}
      <AnimatePresence>
        {selectedTransport && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-0 bg-white z-[60] flex flex-col overflow-y-auto no-scrollbar"
          >
            {/* sticky header */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-3xl z-10 px-5 md:px-6 pt-5 md:pt-6 pb-4 border-b border-stone-100">
              <div className="flex items-center gap-4">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedTransport(null)}
                  className="w-10 h-10 md:w-11 md:h-11 bg-stone-100 rounded-full flex items-center justify-center text-emerald-700 hover:bg-stone-200 transition-colors shrink-0"
                >
                  <UilArrowLeft size="20" />
                </motion.button>
                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-emerald-700 tracking-tight leading-tight truncate">{selectedTransport.title}</h3>
                  <p className="text-[10px] text-emerald-700/40 font-medium">{selectedTransport.provider}</p>
                </div>
              </div>
            </div>

            {/* content */}
            <div className="px-5 md:px-6 pt-5 md:pt-6 space-y-5 md:space-y-6 pb-8 max-w-lg mx-auto w-full">
              <div className="flex items-center gap-4 text-emerald-700 font-bold">
                <UilMapMarker size="20" className="text-emerald-500 shrink-0" />
                <span className="text-sm">{selectedTransport.route}</span>
              </div>
              <div className="flex items-center gap-4 text-emerald-700 font-bold">
                <UilClock size="20" className="text-emerald-500 shrink-0" />
                <span className="text-sm">{selectedTransport.duration}</span>
              </div>

              <div className="flex items-center justify-between p-5 md:p-6 bg-stone-50 rounded-3xl border border-stone-200">
                <div>
                  <span className="text-[10px] font-semibold text-stone-400 tracking-tight mb-1 block">Fare</span>
                  <span className="text-2xl md:text-3xl font-black text-emerald-700 tracking-tighter">₱{selectedTransport.price.toLocaleString()}</span>
                </div>
                <UilShieldCheck size="36" className="text-emerald-500 opacity-20" />
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-bold text-emerald-700 flex items-center gap-2">
                  <UilCalendarAlt size="18" className="text-emerald-500" /> Select date
                </h4>
                <input type="date"
                  value={transportDate}
                  onChange={e => setTransportDate(e.target.value)}
                  className="w-full bg-white rounded-2xl p-4 text-sm font-semibold text-emerald-700 border-2 border-stone-200 focus:border-emerald-500 outline-none transition-colors"
                />
              </div>

              <div>
                <h4 className="text-sm font-bold text-emerald-700 mb-4">Passengers</h4>
                <div className="bg-white rounded-3xl p-5 border border-stone-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-emerald-700">Guests</span>
                    <div className="flex items-center gap-4">
                      <button onClick={() => setTransportGuests(Math.max(1, transportGuests - 1))}
                        className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-emerald-700 border border-stone-200 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all">
                        <UilMinus size="14" />
                      </button>
                      <span className="w-8 text-center text-base font-bold text-emerald-700">{transportGuests}</span>
                      <button onClick={() => setTransportGuests(Math.min(selectedTransport.maxPassengers || 10, transportGuests + 1))}
                        className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-emerald-700 border border-stone-200 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all">
                        <UilPlus size="14" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleBookTransport(selectedTransport)}
                  disabled={!transportDate || bookingStatus === 'loading' || bookingStatus === 'success'}
                  className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-5 rounded-2xl font-bold text-sm shadow-xl shadow-emerald-600/20 hover:shadow-emerald-600/40 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {bookingStatus === 'success' ? (
                    <><UilCheckCircle size="22" /> Booking Confirmed</>
                  ) : bookingStatus === 'loading' ? (
                    <UilSync size="22" className="animate-spin" />
                  ) : (
                    <>Book — ₱{(selectedTransport.price * transportGuests).toLocaleString()}</>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
