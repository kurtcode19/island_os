import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UilCar, UilTruck, UilStore, UilMapMarker, UilClock, UilUsersAlt, UilCheckCircle, UilTimes, UilCalendar, UilRefresh, UilArrowRight, UilStar, UilPhone } from '@/icons';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { rentalVehicles, rentalMerchants, getVehiclesByMerchant } from '../data/rentals';

export default function RentalsView() {
  const { user, login } = useAuth();
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [expandedMerchant, setExpandedMerchant] = useState<string | null>(null);
  const [rentDays, setRentDays] = useState(1);
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleBook = async (vehicle: any) => {
    if (!user) { login(); return; }
    setBookingStatus('loading');
    try {
      await addDoc(collection(db, 'bookings'), {
        touristUid: user.uid,
        touristName: user.displayName || 'Anonymous',
        touristEmail: user.email || '',
        serviceId: vehicle.id,
        serviceName: vehicle.name,
        serviceType: 'rental',
        businessId: vehicle.businessId,
        date: new Date().toLocaleDateString(),
        status: 'pending',
        paymentStatus: 'UNPAID',
        amount: vehicle.rate * rentDays,
        details: { days: rentDays, rate: vehicle.rate, unit: vehicle.rateUnit },
        createdAt: serverTimestamp()
      });
      setBookingStatus('success');
      setTimeout(() => { setBookingStatus('idle'); setSelectedVehicle(null); }, 2000);
    } catch (error) {
      setBookingStatus('idle');
      handleFirestoreError(error, OperationType.CREATE, 'bookings');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
        <span className="text-[10px] font-black text-island-emerald uppercase tracking-[0.4em]">Island Mobility</span>
        <h1 className="text-5xl font-black text-island-volcanic tracking-tighter mt-3">Rental Vehicles</h1>
        <p className="text-lg text-slate-500 font-medium mt-4 max-w-2xl">
          Scooters, bikes, tricycles, and more — get around the island your way.
        </p>
      </motion.div>

      <div className="space-y-16">
        {rentalMerchants.map((merchant, mIdx) => {
          const vehicles = getVehiclesByMerchant(merchant.id);
          const isExpanded = expandedMerchant === merchant.id;
          return (
            <motion.section
              key={merchant.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: mIdx * 0.1 }}
            >
              <div
                onClick={() => setExpandedMerchant(isExpanded ? null : merchant.id)}
                className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-xl hover:shadow-2xl transition-all cursor-pointer mb-8"
              >
                <div className="relative h-48 overflow-hidden">
                  <img src={merchant.image} alt={merchant.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-r from-island-volcanic/70 to-transparent" />
                  <div className="absolute inset-0 p-8 flex flex-col justify-end">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white">
                        <UilStore size="24" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-black text-white tracking-tighter">{merchant.name}</h2>
                        <p className="text-sm text-white/70 font-medium">{merchant.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-white/60">
                      <span className="flex items-center gap-1"><UilMapMarker size="12" /> {merchant.location}</span>
                      <span className="flex items-center gap-1"><UilStar size="12" className="text-amber-400" /> {merchant.rating}</span>
                      <span className="flex items-center gap-1"><UilPhone size="12" /> {merchant.contact}</span>
                    </div>
                  </div>
                </div>
                <div className="px-8 py-4 flex items-center justify-between">
                  <span className="text-sm font-bold text-island-emerald">{vehicles.length} vehicle{vehicles.length > 1 ? 's' : ''} available</span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{isExpanded ? 'Tap to close' : 'Tap to browse'}</span>
                </div>
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 overflow-hidden"
                  >
                    {vehicles.map((vehicle) => (
                      <motion.div
                        key={vehicle.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -4 }}
                        onClick={() => setSelectedVehicle(vehicle)}
                        className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-xl hover:shadow-2xl transition-all cursor-pointer group"
                      >
                        <div className="relative h-52 overflow-hidden">
                          <img src={vehicle.image} alt={vehicle.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                          <div className={`absolute top-5 left-5 ${vehicle.color} text-white px-3 py-1.5 rounded-xl text-[10px] font-bold`}>
                            {vehicle.available} available
                          </div>
                          <div className="absolute bottom-5 left-5 right-5 flex justify-between items-end">
                            <h3 className="text-2xl font-black text-white tracking-tighter">{vehicle.name}</h3>
                            <div className="bg-white/90 backdrop-blur-xl px-4 py-2 rounded-2xl text-right">
                              <span className="text-xl font-black text-island-green">₱{vehicle.rate.toLocaleString()}</span>
                              <span className="text-[10px] text-slate-500 font-semibold ml-1">/{vehicle.rateUnit}</span>
                            </div>
                          </div>
                        </div>
                        <div className="p-8 space-y-5">
                          <div className="flex items-center gap-2 text-[10px] font-bold text-island-emerald uppercase tracking-widest">
                            <div className={`w-8 h-8 ${vehicle.color} rounded-lg flex items-center justify-center text-white`}>
                              <vehicle.icon size={16} />
                            </div>
                            {vehicle.type} • {vehicle.transmission}
                          </div>
                          <div className="flex gap-4 text-xs text-slate-500 font-medium">
                            <span className="flex items-center gap-1.5"><UilUsersAlt size="14" /> {vehicle.capacity} seats</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {vehicle.features.map((f, i) => (
                              <span key={i} className="px-3 py-1 bg-slate-50 rounded-full text-[10px] font-semibold text-slate-500">{f}</span>
                            ))}
                          </div>
                          <button className="w-full bg-island-green text-white py-4 rounded-2xl font-bold text-sm shadow-lg hover:shadow-xl active:scale-95 transition-all">
                            Rent Now
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>
          );
        })}
      </div>

      {/* Booking Modal */}
      {selectedVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm" onClick={() => { if (bookingStatus !== 'loading') setSelectedVehicle(null) }}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[3rem] max-w-lg w-full p-10 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => setSelectedVehicle(null)} className="absolute top-6 right-6 w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors">
              <UilTimes size="18" />
            </button>

            <div className="flex items-center gap-4 mb-8">
              <div className={`w-14 h-14 ${selectedVehicle.color} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                <selectedVehicle.icon size={28} />
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
                  <UilClock size="16" /> {selectedVehicle.rateUnit}
                </div>
                <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 rounded-2xl text-xs font-semibold text-slate-600">
                  <UilCheckCircle size="16" /> {selectedVehicle.available} left
                </div>
              </div>

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

              <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-3xl">
                <span className="text-sm font-semibold text-slate-600">Rental duration</span>
                <div className="flex items-center gap-3 ml-auto">
                  <button onClick={() => setRentDays(Math.max(1, rentDays - 1))} className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-island-green hover:text-white transition-all">-</button>
                  <span className="text-lg font-black text-island-volcanic w-8 text-center">{rentDays}</span>
                  <button onClick={() => setRentDays(Math.min(30, rentDays + 1))} className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-island-green hover:text-white transition-all">+</button>
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

              <button
                onClick={() => handleBook(selectedVehicle)}
                disabled={bookingStatus === 'loading' || bookingStatus === 'success'}
                className="w-full bg-island-green text-white py-5 rounded-2xl font-bold text-sm shadow-xl hover:shadow-lg active:scale-95 transition-all disabled:opacity-50"
              >
                {bookingStatus === 'success' ? (
                  <><UilCheckCircle size="20" className="inline mr-2" /> Booked!</>
                ) : bookingStatus === 'loading' ? (
                  <><UilRefresh size="20" className="inline mr-2 animate-spin" /> Booking...</>
                ) : (
                  <><UilArrowRight size="20" className="inline mr-2" /> Book Now — ₱{(selectedVehicle.rate * rentDays).toLocaleString()}</>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
