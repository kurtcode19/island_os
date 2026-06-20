import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Ship, Car, Bike, MapPin, Clock, Calendar, ArrowRight, Info, ShieldCheck, Waves, Navigation, X, CheckCircle2, RefreshCw, Sparkles, AlertTriangle } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { transportOptions, schedules } from '../data/transport';
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
      const bookingData = {
        touristUid: user.uid,
        touristName: user.displayName || 'Anonymous',
        touristEmail: user.email || '',
        serviceId: transport.id,
        serviceName: transport.title,
        serviceType: 'transport',
        businessId: transport.businessId,
        date: selectedDate,
        guests: selectedGuests,
        amount: transport.price * selectedGuests,
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
      <section className="relative h-[45vh] flex items-center overflow-hidden">
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
            <h1 className="text-6xl md:text-8xl font-black text-white mb-6 tracking-tighter leading-none drop-shadow-2xl">
              Island <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-white">Flow.</span>
            </h1>
            <p className="text-xl text-white/80 font-medium max-w-2xl drop-shadow-lg leading-relaxed">
              Seamless ferry bookings, local transport loops, and real-time tracking for the Catarman pilot adventure.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Booking Options */}
          <div className="lg:col-span-2 space-y-12">
            <div>
              <span className="text-island-coral font-bold tracking-wider text-xs mb-4 block">Available Services</span>
              <h2 className="text-5xl md:text-6xl font-black text-island-volcanic tracking-tighter mb-12">Transit Options.</h2>
              
              <div className="grid grid-cols-1 gap-8">
                {transportOptions.map((opt, idx) => (
                  <motion.div
                    key={opt.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="group bg-white p-10 rounded-[3.5rem] border-2 border-slate-100 shadow-xl hover:shadow-2xl transition-all duration-500 flex flex-col md:flex-row items-center gap-10"
                  >
                    <div className={`w-24 h-24 rounded-[2rem] emerald-gradient text-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform`}>
                      <opt.icon size={44} strokeWidth={2.5} />
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
                          <Clock size={16} strokeWidth={3} className="text-island-emerald" /> {opt.duration}
                        </div>
                        <div className="flex items-center gap-3 text-xs font-semibold text-slate-400 tracking-tight">
                          <ShieldCheck size={16} strokeWidth={3} className="text-island-emerald" /> Verified Route
                        </div>
                      </div>
                    </div>
                    <div className="text-center md:text-right">
                      <span className="text-xs text-slate-400 font-semibold tracking-tight mb-1 block">Starts at</span>
                      <p className="text-4xl font-black text-island-volcanic tracking-tighter mb-6">₱{opt.price.toLocaleString()}</p>
                      <button 
                        onClick={() => setSelectedTransport(opt)}
                        className="btn-primary px-10 py-5 rounded-2xl"
                      >
                        Reserve <ArrowRight size={20} strokeWidth={3} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Tracking Teaser */}
            <div className="volcanic-gradient p-16 rounded-[4rem] text-white relative overflow-hidden shadow-3xl border border-white/10">
              <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
                <Navigation size={400} className="absolute -top-20 -right-20 rotate-12" />
              </div>
              <div className="relative z-10">
                <span className="text-island-emerald font-bold tracking-wider text-xs mb-6 block">Live Tracking</span>
                <h3 className="text-4xl md:text-5xl font-black mb-6 tracking-tighter">Live <span className="text-island-emerald">Ferry Tracker.</span></h3>
                <p className="text-slate-300 font-medium text-xl mb-10 max-w-md leading-relaxed">
                  Advanced GPS tracking for all municipal ferry nodes in the Catarman channel.
                </p>
                <div className="flex flex-wrap items-center gap-10">
                  <button className="btn-primary px-10 py-6 rounded-2xl">
                    Open Ferry Tracker
                  </button>
                  <div className="flex items-center gap-3 text-island-emerald font-semibold tracking-tight text-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-island-emerald animate-pulse shadow-[0_0_10px_rgba(16,185,129,1)]"></span>
                    4 Active Vessels
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Schedule Sidebar */}
          <div className="space-y-10">
            <div className="bg-white p-12 rounded-[4rem] border-2 border-slate-100 shadow-xl">
              <div className="flex items-center gap-4 mb-10 pb-6 border-b-2 border-stone-50">
                <div className="w-14 h-14 emerald-gradient text-white rounded-2xl flex items-center justify-center shadow-lg">
                  <Waves size={28} strokeWidth={2.5} />
                </div>
                <h3 className="text-3xl font-black text-island-volcanic tracking-tighter">Schedules.</h3>
              </div>
              
              <div className="space-y-8">
                {schedules.map((s, idx) => (
                  <div key={idx} className="flex items-center justify-between py-5 border-b border-slate-50 last:border-0">
                    <div>
                      <p className="text-xl font-black text-island-volcanic tracking-tighter">{s.time}</p>
                      <p className="text-xs text-slate-400 font-semibold tracking-tight mt-1">{s.from} → {s.to}</p>
                    </div>
                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold tracking-wider shadow-sm ${s.type === 'warning' ? 'bg-rose-50 text-island-coral border border-rose-100' : 'bg-emerald-50 text-island-emerald border border-emerald-100'}`}>
                      {s.status}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-12 p-8 bg-stone-50 rounded-3xl flex items-start gap-5 border border-slate-100">
                <Info size={24} strokeWidth={3} className="text-blue-500 shrink-0 mt-1" />
                <p className="text-xs text-slate-500 font-medium leading-relaxed tracking-tight">
                  Schedules may change depending on weather conditions. Please arrive at the terminal at least 45 minutes early.
                </p>
              </div>
            </div>

            <div className="volcanic-gradient p-12 rounded-[4rem] text-white shadow-2xl border border-white/10">
              <h3 className="text-2xl font-black mb-6 tracking-tighter">Local Guides.</h3>
              <p className="text-slate-400 font-medium mb-10 leading-relaxed">
                Book a verified local guide with transport for a deeper experience.
              </p>
              <button className="btn-primary w-full py-6 rounded-2xl text-xs">
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
              className="relative w-full max-w-xl bg-white rounded-[4rem] overflow-hidden shadow-3xl border-2 border-slate-100"
            >
              <button 
                onClick={() => setSelectedTransport(null)}
                className="absolute top-8 right-8 p-4 bg-slate-100 rounded-full text-slate-600 hover:text-island-coral active:scale-90 transition-all shadow-sm"
              >
                <X size={24} strokeWidth={3} />
              </button>

              <div className="p-12">
                <div className="flex items-center gap-6 mb-10 pb-10 border-b-2 border-stone-50">
                  <div className={`w-20 h-20 rounded-[1.75rem] emerald-gradient text-white flex items-center justify-center shadow-2xl border border-white/10`}>
                    <selectedTransport.icon size={44} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-island-volcanic tracking-tighter">{selectedTransport.title}</h3>
                    <p className="text-xs font-semibold text-slate-400 tracking-tight mt-1">{selectedTransport.provider}</p>
                  </div>
                </div>

                <div className="space-y-6 mb-12">
                  <div className="flex items-center gap-4 text-slate-600 font-bold">
                    <MapPin size={24} strokeWidth={3} className="text-island-emerald" />
                    <span className="text-lg tracking-tight">{selectedTransport.route}</span>
                  </div>
                  <div className="flex items-center gap-4 text-slate-600 font-bold">
                    <Clock size={24} strokeWidth={3} className="text-island-emerald" />
                    <span className="text-lg tracking-tight">{selectedTransport.duration}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-10 bg-stone-50 rounded-[3rem] mb-12 border border-slate-100">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-400 tracking-tight mb-1">Confirmed Fare</span>
                    <span className="text-4xl font-black text-island-volcanic tracking-tighter">₱{selectedTransport.price.toLocaleString()}</span>
                  </div>
                  <ShieldCheck size={48} className="text-island-emerald opacity-20" />
                </div>

                <div className="mb-8">
                  <DateGuestPicker
                    onDateChange={setSelectedDate}
                    onGuestsChange={setSelectedGuests}
                  />
                </div>

                {bookingStatus === 'success' ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-5 py-6 bg-emerald-50 rounded-[3rem] border-2 border-emerald-100"
                  >
                    <div className="w-16 h-16 btn-primary rounded-full shadow-2xl">
                      <CheckCircle2 size={36} strokeWidth={3} />
                    </div>
                    <p className="text-island-emerald font-bold tracking-wider text-xs">Booking Confirmed</p>
                  </motion.div>
                ) : (
                  <button 
                    onClick={() => handleBookTransport(selectedTransport)}
                    disabled={bookingStatus === 'loading'}
                    className="btn-primary w-full py-8 rounded-[2.5rem] text-sm disabled:opacity-50"
                  >
                    {bookingStatus === 'loading' ? (
                      <RefreshCw size={24} className="animate-spin" />
                    ) : (
                      <Sparkles size={24} strokeWidth={2.5} />
                    )}
                    Confirm Booking
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
