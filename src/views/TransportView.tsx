import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UilShip, UilCar, UilMapMarker, UilClock, UilCalendar, UilArrowRight, UilInfoCircle, UilShieldCheck, UilWater, UilNavigator, UilTimes, UilCheckCircle, UilRefresh, UilStar, UilExclamationTriangle, UilPlane, UilPlus, UilMinus, UilUsersAlt, UilTruck, UilExchange, UilUser } from '@/icons';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { transportOptions, schedules, type TransportOption } from '../data/transport';
import DateGuestPicker from '../components/shared/DateGuestPicker';
import { checkAvailability } from '../lib/capacityService';
import { logEvent } from '../lib/auditService';

export default function TransportView() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [selectedTransport, setSelectedTransport] = useState<any>(null);
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedGuests, setSelectedGuests] = useState(1);
  const [transportTab, setTransportTab] = useState<'to' | 'from' | 'within'>('to');
  const [adultCount, setAdultCount] = useState(1);
  const [childrenCount, setChildrenCount] = useState(0);
  const [bringVehicle, setBringVehicle] = useState(false);
  const [roundtrip, setRoundtrip] = useState(false);

  const handleBookTransport = async (transport: any) => {
    if (!user) {
      login();
      return;
    }

    if (!selectedDate) {
      toast.error('Please select a travel date');
      return;
    }

    setBookingStatus('loading');

    // Check capacity
    const availability = await checkAvailability(transport.id, selectedDate, selectedGuests);
    if (!availability.available) {
      toast.error(`Only ${availability.remaining} seats remaining on this date`);
      setBookingStatus('idle');
      return;
    }

    try {
      const guestTotal = adultCount + childrenCount;
      const finalAmount = transport.price * (roundtrip ? 2 : 1) * guestTotal + (bringVehicle ? 500 : 0);

      const bookingData = {
        touristUid: user.uid,
        touristName: user.displayName || 'Anonymous',
        touristEmail: user.email || '',
        serviceId: transport.id,
        serviceName: transport.title,
        serviceType: 'transport',
        businessId: transport.businessId,
        date: selectedDate,
        guests: guestTotal,
        adults: adultCount,
        children: childrenCount,
        roundtrip,
        bringVehicle,
        amount: finalAmount,
        status: 'pending',
        paymentStatus: 'UNPAID',
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'bookings'), bookingData);
      logEvent('created', 'bookings', undefined, `Transport booking for ${transport.title} on ${selectedDate}`);
      setBookingStatus('success');
      toast.success('Booking request submitted!');
      setTimeout(() => {
        setBookingStatus('idle');
        setSelectedTransport(null);
        navigate('/my-bookings');
      }, 2000);
    } catch (error) {
      setBookingStatus('idle');
      handleFirestoreError(error, OperationType.CREATE, 'bookings');
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
          alt="Catarman Transport" 
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
            <span className="text-island-emerald font-bold tracking-wider text-xs mb-4 block">Transport</span>
            <h1 className="text-5xl md:text-8xl font-black text-white mb-6 tracking-tighter leading-none drop-shadow-2xl">
              Island <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-white">Flow.</span>
            </h1>
            <p className="text-base md:text-xl text-white/80 font-medium max-w-2xl drop-shadow-lg leading-relaxed">
              Seamless ferry bookings, local transport loops, and real-time tracking for the Catarman pilot adventure.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 mt-20">
        {/* Transport Tabs */}
        <div className="flex gap-3 bg-stone-100 p-2 rounded-[2rem] border border-slate-200 shadow-inner w-fit mb-12">
          {[
            { id: 'to' as const, label: 'To Camiguin', icon: UilExchange },
            { id: 'from' as const, label: 'From Camiguin', icon: UilExchange },
            { id: 'within' as const, label: 'Within Camiguin', icon: UilMapMarker },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTransportTab(tab.id)}
              className={`flex items-center gap-2 px-8 py-3 rounded-full text-xs font-bold tracking-wider transition-all ${
                transportTab === tab.id
                  ? 'sunset-gradient text-white shadow-xl shadow-island-sunset/20'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Booking Options */}
          <div className="lg:col-span-2 space-y-12">
            <div>
              <span className="text-island-coral font-bold tracking-wider text-xs mb-4 block">Available Services</span>
              <h2 className="text-5xl md:text-6xl font-black text-island-volcanic tracking-tighter mb-12">Transit Options.</h2>
              
              <div className="grid grid-cols-1 gap-8">
                {transportOptions.filter(o => o.tab === transportTab).map((opt, idx) => (
                  <motion.div
                    key={opt.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="group bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3.5rem] border-2 border-slate-100 shadow-xl hover:shadow-2xl transition-all duration-500 flex flex-col md:flex-row items-center gap-6 md:gap-10"
                  >
                    <div className={`w-16 h-16 md:w-24 md:h-24 rounded-[1rem] md:rounded-[2rem] emerald-gradient text-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform`}>
                      <opt.icon size="28" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-3">
                        <h3 className="text-3xl font-black text-island-volcanic tracking-tighter">{opt.title}</h3>
                        <span className="px-4 py-1.5 bg-stone-50 text-slate-500 text-[10px] font-bold tracking-wider rounded-full border border-slate-100">
                          {opt.provider}
                        </span>
                      </div>
                      <p className="text-slate-500 font-medium mb-6 leading-relaxed">{opt.route}</p>
                      <div className="flex flex-wrap justify-center md:justify-start gap-8">
                        <div className="flex items-center gap-3 text-xs font-semibold text-slate-400 tracking-tight">
                          <UilClock size="16" className="text-island-emerald" /> {opt.duration}
                        </div>
                        <div className="flex items-center gap-3 text-xs font-semibold text-slate-400 tracking-tight">
                          <UilShieldCheck size="16" className="text-island-emerald" /> Verified Route
                        </div>
                      </div>
                    </div>
                    <div className="flex md:flex-col items-center md:items-end gap-4 md:gap-0">
                      <div className="text-center md:text-right">
                        <span className="text-xs text-slate-400 font-semibold tracking-tight mb-1 block">Starts at</span>
                        <p className="text-3xl md:text-4xl font-black text-island-volcanic tracking-tighter">₱{opt.price.toLocaleString()}</p>
                      </div>
                      <button 
                        onClick={() => setSelectedTransport(opt)}
                        className="btn-primary px-8 md:px-10 py-4 md:py-5 rounded-2xl text-xs md:text-sm"
                      >
                        Reserve <UilArrowRight size="18" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Tracking Teaser */}
            <div className="volcanic-gradient p-8 md:p-16 rounded-[2rem] md:rounded-[4rem] text-white relative overflow-hidden shadow-3xl border border-white/10">
              <div className="relative z-10">
                <span className="text-island-emerald font-bold tracking-wider text-xs mb-4 md:mb-6 block">Live Tracking</span>
                <h3 className="text-3xl md:text-5xl font-black mb-4 md:mb-6 tracking-tighter">Live <span className="text-island-emerald">Ferry Tracker.</span></h3>
                <p className="text-sm md:text-xl text-slate-300 font-medium mb-6 md:mb-10 max-w-md leading-relaxed">
                  Advanced GPS tracking for all municipal ferry terminals in the Catarman channel.
                </p>
                <div className="flex flex-wrap items-center gap-6 md:gap-10">
                  <button className="btn-primary px-8 md:px-10 py-4 md:py-6 rounded-2xl text-xs md:text-sm">
                    Open Ferry Tracker
                  </button>
                  <div className="flex items-center gap-3 text-island-emerald font-semibold tracking-tight text-xs md:text-sm">
                    <span className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-island-emerald animate-pulse shadow-[0_0_10px_rgba(16,185,129,1)]"></span>
                    4 Active Vessels
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Schedule Sidebar */}
          <div className="space-y-10">
            <div className="bg-white p-8 md:p-12 rounded-[2rem] md:rounded-[4rem] border-2 border-slate-100 shadow-xl">
              <div className="flex items-center gap-4 mb-8 md:mb-10 pb-6 border-b-2 border-stone-50">
                <div className="w-12 h-12 md:w-14 md:h-14 emerald-gradient text-white rounded-2xl flex items-center justify-center shadow-lg">
                  <UilWater size="24" />
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-island-volcanic tracking-tighter">Schedules.</h3>
              </div>
              
              <div className="space-y-6 md:space-y-8">
                {schedules.map((s, idx) => (
                  <div key={idx} className="flex items-center justify-between py-4 md:py-5 border-b border-slate-50 last:border-0">
                    <div>
                      <p className="text-lg md:text-xl font-black text-island-volcanic tracking-tighter">{s.time}</p>
                      <p className="text-[10px] md:text-xs text-slate-400 font-semibold tracking-tight mt-1">{s.from} → {s.to}</p>
                    </div>
                    <div className={`px-3 md:px-4 py-1.5 rounded-full text-[9px] md:text-[10px] font-bold tracking-wider shadow-sm ${s.type === 'warning' ? 'bg-rose-50 text-island-coral border border-rose-100' : 'bg-emerald-50 text-island-emerald border border-emerald-100'}`}>
                      {s.status}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 md:mt-12 p-6 md:p-8 bg-stone-50 rounded-2xl md:rounded-3xl flex items-start gap-4 md:gap-5 border border-slate-100">
                <UilInfoCircle size="20" className="text-blue-500 shrink-0 mt-1" />
                <p className="text-[10px] md:text-xs text-slate-500 font-medium leading-relaxed tracking-tight">
                  Schedules may change depending on weather conditions. Please arrive at the terminal at least 45 minutes early.
                </p>
              </div>
            </div>

            <div className="volcanic-gradient p-8 md:p-12 rounded-[2rem] md:rounded-[4rem] text-white shadow-2xl border border-white/10">
              <h3 className="text-xl md:text-2xl font-black mb-4 md:mb-6 tracking-tighter">Local Guides.</h3>
              <p className="text-sm md:text-base text-slate-400 font-medium mb-6 md:mb-10 leading-relaxed">
                Book a verified local guide with transport for a deeper experience.
              </p>
              <button className="btn-primary w-full py-5 md:py-6 rounded-2xl text-[10px] md:text-xs">
                Find a Guide
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {selectedTransport && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTransport(null)}
              className="absolute inset-0 bg-island-volcanic/80 backdrop-blur-md"
            ></motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative w-full max-w-xl bg-white rounded-[2rem] md:rounded-[4rem] overflow-hidden shadow-3xl border-2 border-slate-100 mx-4 md:mx-0 max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={() => setSelectedTransport(null)}
                className="absolute top-4 md:top-8 right-4 md:right-8 p-3 md:p-4 bg-slate-100 rounded-full text-slate-600 hover:text-island-coral active:scale-90 transition-all shadow-sm z-10"
              >
                <UilTimes size="20" />
              </button>

              <div className="p-6 md:p-12">
                <div className="flex items-center gap-4 md:gap-6 mb-8 md:mb-10 pb-8 md:pb-10 border-b-2 border-stone-50">
                  <div className={`w-14 h-14 md:w-20 md:h-20 rounded-[1rem] md:rounded-[1.75rem] emerald-gradient text-white flex items-center justify-center shadow-2xl border border-white/10`}>
                    <selectedTransport.icon size="32" />
                  </div>
                  <div>
                    <h3 className="text-2xl md:text-3xl font-black text-island-volcanic tracking-tighter">{selectedTransport.title}</h3>
                    <p className="text-[10px] md:text-xs font-semibold text-slate-400 tracking-tight mt-1">{selectedTransport.provider}</p>
                  </div>
                </div>

                <div className="space-y-4 md:space-y-6 mb-8 md:mb-12">
                  <div className="flex items-center gap-4 text-slate-600 font-bold">
                    <UilMapMarker size="20" className="text-island-emerald shrink-0" />
                    <span className="text-sm md:text-lg tracking-tight">{selectedTransport.route}</span>
                  </div>
                  <div className="flex items-center gap-4 text-slate-600 font-bold">
                    <UilClock size="20" className="text-island-emerald shrink-0" />
                    <span className="text-sm md:text-lg tracking-tight">{selectedTransport.duration}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-6 md:p-10 bg-stone-50 rounded-[2rem] md:rounded-[3rem] mb-8 md:mb-12 border border-slate-100">
                  <div className="flex flex-col">
                    <span className="text-[10px] md:text-xs font-semibold text-slate-400 tracking-tight mb-1">Confirmed Fare</span>
                    <span className="text-3xl md:text-4xl font-black text-island-volcanic tracking-tighter">₱{selectedTransport.price.toLocaleString()}</span>
                  </div>
                  <UilShieldCheck size="36" className="text-island-emerald opacity-20" />
                </div>

                {/* Travel Date & Guest Details */}
                <div className="space-y-4 md:space-y-6 mb-6 md:mb-8">
                  <DateGuestPicker
                    onDateChange={setSelectedDate}
                    onGuestsChange={setSelectedGuests}
                  />

                  {/* Adult / Children Count */}
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-4">
                    <h5 className="text-[10px] md:text-xs font-bold text-island-green flex items-center gap-2">
                      <UilUsersAlt size="14" /> Passenger Details
                    </h5>
                    <div className="flex items-center justify-between">
                      <span className="text-xs md:text-sm font-semibold text-slate-700">Adults</span>
                      <div className="flex items-center gap-3 md:gap-4">
                        <button onClick={() => setAdultCount(Math.max(1, adultCount - 1))} className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-white flex items-center justify-center text-slate-500 border border-slate-200 hover:bg-island-green hover:text-white transition-all shadow-sm">
                          <UilMinus size="12" />
                        </button>
                        <span className="w-6 text-center text-sm md:text-base font-bold text-island-green">{adultCount}</span>
                        <button onClick={() => setAdultCount(Math.min(10, adultCount + 1))} className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-white flex items-center justify-center text-slate-500 border border-slate-200 hover:bg-island-green hover:text-white transition-all shadow-sm">
                          <UilPlus size="12" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-200/50">
                      <div className="flex items-center gap-2">
                        <UilUser size="14" className="text-island-sunset" />
                        <span className="text-xs md:text-sm font-semibold text-slate-700">Children</span>
                      </div>
                      <div className="flex items-center gap-3 md:gap-4">
                        <button onClick={() => setChildrenCount(Math.max(0, childrenCount - 1))} className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-white flex items-center justify-center text-slate-500 border border-slate-200 hover:bg-island-green hover:text-white transition-all shadow-sm">
                          <UilMinus size="12" />
                        </button>
                        <span className="w-6 text-center text-sm md:text-base font-bold text-island-green">{childrenCount}</span>
                        <button onClick={() => setChildrenCount(Math.min(6, childrenCount + 1))} className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-white flex items-center justify-center text-slate-500 border border-slate-200 hover:bg-island-green hover:text-white transition-all shadow-sm">
                          <UilPlus size="12" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Bring Vehicle & Roundtrip Options */}
                  <div className="space-y-2 md:space-y-3">
                    {transportTab !== 'within' && (
                      <label className="flex items-center justify-between p-4 bg-white rounded-2xl border-2 border-slate-100 cursor-pointer hover:border-island-green/30 transition-all">
                        <div className="flex items-center gap-3">
                          <UilTruck size="16" className="text-island-emerald shrink-0" />
                          <span className="text-xs md:text-sm font-semibold text-slate-700">Bring a vehicle?</span>
                        </div>
                        <div
                          onClick={() => setBringVehicle(!bringVehicle)}
                          className={`w-9 md:w-10 h-5 md:h-6 rounded-full transition-all relative shrink-0 ${bringVehicle ? 'bg-island-emerald' : 'bg-slate-200'}`}
                        >
                          <div className={`w-3.5 md:w-4 h-3.5 md:h-4 bg-white rounded-full absolute top-0.5 md:top-1 transition-all shadow-sm ${bringVehicle ? 'left-4 md:left-5' : 'left-1'}`} />
                        </div>
                      </label>
                    )}
                    {selectedTransport && selectedTransport.hasRoundtrip && (
                      <label className="flex items-center justify-between p-4 bg-white rounded-2xl border-2 border-slate-100 cursor-pointer hover:border-island-green/30 transition-all">
                        <div className="flex items-center gap-3">
                          <UilExchange size="16" className="text-island-emerald shrink-0" />
                          <span className="text-xs md:text-sm font-semibold text-slate-700">Roundtrip booking?</span>
                        </div>
                        <div
                          onClick={() => setRoundtrip(!roundtrip)}
                          className={`w-9 md:w-10 h-5 md:h-6 rounded-full transition-all relative shrink-0 ${roundtrip ? 'bg-island-emerald' : 'bg-slate-200'}`}
                        >
                          <div className={`w-3.5 md:w-4 h-3.5 md:h-4 bg-white rounded-full absolute top-0.5 md:top-1 transition-all shadow-sm ${roundtrip ? 'left-4 md:left-5' : 'left-1'}`} />
                        </div>
                      </label>
                    )}
                  </div>
                </div>

                {bookingStatus === 'success' ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-5 py-6 bg-emerald-50 rounded-[2rem] md:rounded-[3rem] border-2 border-emerald-100"
                  >
                    <div className="w-14 h-14 md:w-16 md:h-16 btn-primary rounded-full shadow-2xl">
                      <UilCheckCircle size="28" />
                    </div>
                    <p className="text-[10px] md:text-xs text-island-emerald font-bold tracking-wider">Booking Confirmed</p>
                  </motion.div>
                ) : (
                  <button 
                    onClick={() => handleBookTransport(selectedTransport)}
                    disabled={bookingStatus === 'loading'}
                    className="btn-primary w-full py-6 md:py-8 rounded-[2rem] md:rounded-[2.5rem] text-xs md:text-sm disabled:opacity-50"
                  >
                    {bookingStatus === 'loading' ? (
                      <UilRefresh size="20" className="animate-spin" />
                    ) : (
                      <UilStar size="20" />
                    )}
                    {roundtrip ? 'Book Roundtrip' : 'Confirm Booking'}
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
