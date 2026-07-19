import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UilHeart, UilMapMarker, UilClock, UilUsersAlt, UilCheckCircle, UilTimes, UilRefresh, UilArrowRight, UilStar, UilCalendarAlt, UilMinus, UilPlus, UilShieldCheck } from '@/icons';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { rentalVehicles } from '../data/rentals';
import { getPilotConfig, type PilotConfig } from '../lib/pilotService';

export default function RentalsView() {
  const { user, login } = useAuth();
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [rentDays, setRentDays] = useState(1);
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [pilotConfig, setPilotConfig] = useState<PilotConfig | null>(null);
  const isSubmitting = useRef(false);

  useEffect(() => {
    getPilotConfig().then(setPilotConfig);
  }, []);

  const visibleVehicles = pilotConfig?.enabled && pilotConfig.businessId
    ? rentalVehicles.filter(v => v.merchantId === pilotConfig.businessId)
    : rentalVehicles;

  const handleBook = async (vehicle: any) => {
    if (!user) { login(); return; }
    if (isSubmitting.current) return;
    isSubmitting.current = true;
    setBookingStatus('loading');
    try {
      let businessId = vehicle.businessId;
      if (pilotConfig?.enabled && pilotConfig.businessId) {
        businessId = pilotConfig.businessId;
      }
      await addDoc(collection(db, 'bookings'), {
        touristUid: user.uid,
        touristName: user.displayName || 'Anonymous',
        touristEmail: user.email || '',
        serviceId: vehicle.id,
        serviceName: vehicle.name,
        serviceType: 'rental',
        businessId: businessId || '',
        date: new Date().toLocaleDateString(),
        status: 'pending',
        paymentStatus: 'UNPAID',
        amount: vehicle.rate * rentDays,
        details: { days: rentDays, rate: vehicle.rate, unit: vehicle.rateUnit },
        createdAt: serverTimestamp()
      });
      setBookingStatus('success');
      setTimeout(() => { setBookingStatus('idle'); setSelectedVehicle(null); isSubmitting.current = false; }, 2000);
    } catch (error) {
      setBookingStatus('idle');
      isSubmitting.current = false;
      handleFirestoreError(error, OperationType.CREATE, 'bookings');
    }
  };

  return (
    <div className="bg-white min-h-screen selection:bg-island-emerald/20">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <span className="text-[10px] font-black text-island-emerald uppercase tracking-[0.4em]">Island Mobility</span>
          <h1 className="text-5xl md:text-6xl font-black text-island-volcanic tracking-tighter mt-3">Getting Around.</h1>
          <p className="text-base md:text-lg text-slate-500 font-medium mt-4 max-w-2xl">Rentals, transports, and ways to explore Catarman.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {visibleVehicles.map((vehicle, idx) => (
              <motion.div
                key={vehicle.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedVehicle(vehicle)}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer hover:shadow-lg transition-shadow"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img src={vehicle.image} alt={vehicle.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-gray-700 hover:bg-white hover:scale-105 transition-all shadow-sm">
                    <UilHeart size="15" />
                  </div>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1">
                    {[0, 1, 2].map((i) => (
                      <span key={i} className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-white' : 'bg-white/40'}`} />
                    ))}
                  </div>
                </div>
                <div className="px-4 pt-3 pb-4 space-y-1">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-semibold text-gray-900 leading-tight truncate">{vehicle.name}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">{vehicle.type} · {vehicle.transmission}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <UilStar size="12" className="text-amber-500" />
                      <span className="text-xs font-semibold text-gray-700">4.8</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">{vehicle.capacity} seats</p>
                  <div className="pt-1">
                    <span className="text-sm font-semibold text-gray-900">₱{vehicle.rate.toLocaleString()}</span>
                    <span className="text-xs text-gray-500"> {vehicle.rateUnit}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
      </div>

      {/* Vehicle Booking Modal */}
      <AnimatePresence>
        {selectedVehicle && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { if (bookingStatus !== 'loading') setSelectedVehicle(null); }}
              className="absolute inset-0 bg-island-volcanic/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative w-full max-w-xl bg-white rounded-[2rem] overflow-hidden shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <button onClick={() => setSelectedVehicle(null)}
                className="absolute top-6 right-6 p-3 bg-slate-100 rounded-full text-slate-500 hover:text-island-coral active:scale-90 transition-all z-10">
                <UilTimes size="18" />
              </button>

              <div className="p-8">
                <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-50">
                  <div className={`w-14 h-14 ${selectedVehicle.color} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                    <selectedVehicle.icon size="28" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-island-volcanic tracking-tighter">{selectedVehicle.name}</h3>
                    <p className="text-[10px] font-bold text-island-emerald uppercase tracking-widest mt-1">{selectedVehicle.type} • {selectedVehicle.transmission}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 rounded-2xl text-xs font-semibold text-slate-600">
                      <UilUsersAlt size="16" /> {selectedVehicle.capacity} seats
                    </div>
                    <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 rounded-2xl text-xs font-semibold text-slate-600">
                      <UilClock size="16" /> per {selectedVehicle.rateUnit}
                    </div>
                    <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 rounded-2xl text-xs font-semibold text-slate-600">
                      <UilCheckCircle size="16" /> {selectedVehicle.available} left
                    </div>
                  </div>

                  {selectedVehicle.features?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold text-island-volcanic mb-3">Features</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedVehicle.features.map((f: string, i: number) => (
                          <div key={i} className="flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-xl">
                            <UilCheckCircle size="12" className="text-island-emerald shrink-0" />
                            <span className="text-[11px] font-semibold text-slate-600">{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-3xl">
                    <span className="text-sm font-semibold text-slate-600">Rental duration</span>
                    <div className="flex items-center gap-3 ml-auto">
                      <button onClick={() => setRentDays(Math.max(1, rentDays - 1))} className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-island-green hover:text-white transition-all">
                        <UilMinus size="12" />
                      </button>
                      <span className="text-lg font-black text-island-volcanic w-8 text-center">{rentDays}</span>
                      <button onClick={() => setRentDays(Math.min(30, rentDays + 1))} className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-island-green hover:text-white transition-all">
                        <UilPlus size="12" />
                      </button>
                      <span className="text-xs font-semibold text-slate-400 ml-1">{selectedVehicle.rateUnit}(s)</span>
                    </div>
                  </div>

                  <div className="bg-island-volcanic p-6 rounded-3xl text-white">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm text-white/60">Rate</span>
                      <span className="text-lg font-bold">₱{selectedVehicle.rate.toLocaleString()} × {rentDays} {selectedVehicle.rateUnit}(s)</span>
                    </div>
                    <div className="border-t border-white/10 pt-3 flex justify-between items-center">
                      <span className="text-base font-bold">Total</span>
                      <span className="text-2xl font-black">₱{(selectedVehicle.rate * rentDays).toLocaleString()}</span>
                    </div>
                  </div>

                  <button onClick={() => handleBook(selectedVehicle)}
                    disabled={bookingStatus === 'loading' || bookingStatus === 'success'}
                    className="w-full bg-island-green text-white py-5 rounded-2xl font-bold text-sm shadow-xl hover:shadow-lg active:scale-95 transition-all disabled:opacity-50">
                    {bookingStatus === 'success' ? (
                      <><UilCheckCircle size="20" className="inline mr-2" /> Booked!</>
                    ) : bookingStatus === 'loading' ? (
                      <><UilRefresh size="20" className="inline mr-2 animate-spin" /> Booking...</>
                    ) : (
                      <><UilArrowRight size="20" className="inline mr-2" /> Book Now — ₱{(selectedVehicle.rate * rentDays).toLocaleString()}</>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


    </div>
  );
}
