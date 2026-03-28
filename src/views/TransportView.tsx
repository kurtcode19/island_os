import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Ship, Car, Bike, MapPin, Clock, Calendar, ArrowRight, Info, ShieldCheck, Waves, Navigation, X, CheckCircle2, RefreshCw } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../App';
import { useNavigate } from 'react-router-dom';

const transportOptions = [
  {
    id: 'trans_1',
    title: 'Fast Craft Ferry',
    provider: 'SuperCat / OceanJet',
    route: 'Balingoan ↔ Benoni',
    duration: '45 mins',
    price: 450,
    businessId: 'ferry_co',
    icon: Ship,
    color: 'bg-island-ocean',
  },
  {
    id: 'trans_2',
    title: 'Private Van Rental',
    provider: 'Camiguin Tours',
    route: 'Island-wide / Airport Transfer',
    duration: 'Full Day',
    price: 2500,
    businessId: 'van_rentals_inc',
    icon: Car,
    color: 'bg-island-emerald',
  },
  {
    id: 'trans_3',
    title: 'Scooter Rental',
    provider: 'Local Rentals',
    route: 'Self-drive',
    duration: '24 Hours',
    price: 500,
    businessId: 'local_bikes',
    icon: Bike,
    color: 'bg-island-coral',
  },
];

const schedules = [
  { time: '06:00 AM', from: 'Balingoan', to: 'Benoni', status: 'On Time' },
  { time: '08:30 AM', from: 'Balingoan', to: 'Benoni', status: 'On Time' },
  { time: '10:45 AM', from: 'Balingoan', to: 'Benoni', status: 'Delayed (15m)', type: 'warning' },
  { time: '01:30 PM', from: 'Balingoan', to: 'Benoni', status: 'On Time' },
  { time: '04:00 PM', from: 'Balingoan', to: 'Benoni', status: 'On Time' },
];

export default function TransportView() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [selectedTransport, setSelectedTransport] = useState<any>(null);
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleBookTransport = async (transport: any) => {
    if (!user) {
      login();
      return;
    }

    setBookingStatus('loading');
    try {
      const bookingData = {
        touristUid: user.uid,
        touristName: user.displayName || 'Anonymous',
        touristEmail: user.email || '',
        serviceId: transport.id,
        serviceName: transport.title,
        serviceType: 'transport',
        businessId: transport.businessId,
        date: new Date().toLocaleDateString(),
        amount: transport.price,
        status: 'pending',
        paymentStatus: 'UNPAID',
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'bookings'), bookingData);
      setBookingStatus('success');
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
    <div className="bg-island-cream min-h-screen pb-20">
      {/* Header */}
      <section className="relative h-[40vh] flex items-center overflow-hidden">
        <img 
          src="https://picsum.photos/seed/coastal-road-camiguin/2000/1000" 
          alt="Camiguin Transport" 
          className="absolute inset-0 w-full h-full object-cover brightness-50"
          referrerPolicy="no-referrer"
        />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-4 italic">
              Getting <span className="not-italic text-island-emerald">Around</span>
            </h1>
            <p className="text-xl text-slate-200 font-light max-w-2xl">
              Seamless ferry bookings, vehicle rentals, and real-time transport tracking for your island adventure.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Booking Options */}
          <div className="lg:col-span-2 space-y-12">
            <div>
              <span className="text-island-coral font-bold uppercase tracking-[0.2em] text-xs mb-2 block">Services</span>
              <h2 className="text-4xl font-serif font-bold text-island-green mb-8 italic">Transport <span className="not-italic text-island-emerald">Marketplace</span></h2>
              
              <div className="grid grid-cols-1 gap-6">
                {transportOptions.map((opt, idx) => (
                  <motion.div
                    key={opt.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-center gap-8"
                  >
                    <div className={`w-20 h-20 rounded-3xl ${opt.color}/10 flex items-center justify-center text-island-green`}>
                      <opt.icon size={40} className={opt.color.replace('bg-', 'text-')} />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                        <h3 className="text-2xl font-serif font-bold text-island-green">{opt.title}</h3>
                        <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-full uppercase tracking-widest w-fit mx-auto md:mx-0">
                          {opt.provider}
                        </span>
                      </div>
                      <p className="text-slate-500 font-light mb-4">{opt.route}</p>
                      <div className="flex flex-wrap justify-center md:justify-start gap-6">
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <Clock size={16} className="text-island-emerald" /> {opt.duration}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <ShieldCheck size={16} className="text-island-emerald" /> Instant Confirmation
                        </div>
                      </div>
                    </div>
                    <div className="text-center md:text-right">
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Starts at</p>
                      <p className="text-3xl font-bold text-island-green mb-4">₱{opt.price.toLocaleString()}</p>
                      <button 
                        onClick={() => setSelectedTransport(opt)}
                        className="px-8 py-3 island-gradient text-white rounded-xl font-bold shadow-lg shadow-island-emerald/20 flex items-center gap-2"
                      >
                        Book Now <ArrowRight size={18} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Tracking Teaser */}
            <div className="bg-island-green p-12 rounded-[3.5rem] text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
                <Navigation size={300} className="absolute -top-20 -right-20 rotate-12" />
              </div>
              <div className="relative z-10">
                <h3 className="text-3xl font-serif font-bold mb-4 italic">Live <span className="not-italic text-island-emerald">Ferry Tracker</span></h3>
                <p className="text-emerald-100/70 font-light text-lg mb-8 max-w-md">
                  Never miss a boat. Track every ferry in the Camiguin-Balingoan channel in real-time.
                </p>
                <div className="flex items-center gap-6">
                  <button className="px-8 py-4 bg-white text-island-green rounded-2xl font-bold shadow-xl">
                    Open Live Tracker
                  </button>
                  <div className="flex items-center gap-2 text-island-emerald font-bold">
                    <span className="w-2 h-2 rounded-full bg-island-emerald animate-pulse"></span>
                    4 Ferries Active
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Schedule Sidebar */}
          <div className="space-y-8">
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-island-ocean/10 rounded-xl flex items-center justify-center text-island-ocean">
                  <Waves size={20} />
                </div>
                <h3 className="text-2xl font-serif font-bold text-island-green">Ferry Schedule</h3>
              </div>
              
              <div className="space-y-6">
                {schedules.map((s, idx) => (
                  <div key={idx} className="flex items-center justify-between py-4 border-b border-slate-50 last:border-0">
                    <div>
                      <p className="text-lg font-bold text-island-green">{s.time}</p>
                      <p className="text-xs text-slate-400 font-medium">{s.from} → {s.to}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${s.type === 'warning' ? 'bg-island-sunset/10 text-island-sunset' : 'bg-island-emerald/10 text-island-emerald'}`}>
                      {s.status}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-10 p-6 bg-slate-50 rounded-2xl flex items-start gap-4">
                <Info size={20} className="text-island-ocean shrink-0 mt-1" />
                <p className="text-xs text-slate-500 leading-relaxed">
                  Schedules may change due to weather conditions. We recommend arriving at the port 45 minutes before departure.
                </p>
              </div>
            </div>

            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
              <h3 className="text-xl font-serif font-bold text-island-green mb-6">Need a Guide?</h3>
              <p className="text-sm text-slate-500 font-light mb-8">
                Book a certified local guide with a private vehicle for a stress-free island tour.
              </p>
              <button className="w-full py-4 border-2 border-island-emerald text-island-emerald rounded-2xl font-bold hover:bg-island-emerald hover:text-white transition-all">
                Browse Tour Guides
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {selectedTransport && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTransport(null)}
              className="absolute inset-0 bg-island-volcanic/60 backdrop-blur-sm"
            ></motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[3rem] overflow-hidden shadow-2xl"
            >
              <button 
                onClick={() => setSelectedTransport(null)}
                className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full text-slate-400 hover:text-island-coral transition-colors z-10"
              >
                <X size={20} />
              </button>

              <div className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-16 h-16 rounded-2xl ${selectedTransport.color}/10 flex items-center justify-center text-island-green`}>
                    <selectedTransport.icon size={32} className={selectedTransport.color.replace('bg-', 'text-')} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-serif font-bold text-island-green italic">{selectedTransport.title}</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{selectedTransport.provider}</p>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 text-slate-500">
                    <MapPin size={18} className="text-island-emerald" />
                    <span className="text-sm">{selectedTransport.route}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-500">
                    <Clock size={18} className="text-island-emerald" />
                    <span className="text-sm">{selectedTransport.duration}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-6 bg-island-cream rounded-3xl mb-8">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-island-green/60 uppercase tracking-widest">Total Fare</span>
                    <span className="text-2xl font-bold text-island-green">₱{selectedTransport.price.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-island-emerald">
                    <ShieldCheck size={20} />
                    <span className="text-xs font-bold uppercase tracking-widest">Secure Booking</span>
                  </div>
                </div>

                {bookingStatus === 'success' ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center gap-3 py-4"
                  >
                    <div className="w-12 h-12 bg-island-emerald rounded-full flex items-center justify-center text-white">
                      <CheckCircle2 size={24} />
                    </div>
                    <p className="text-island-emerald font-bold uppercase tracking-widest text-xs">Booking Successful!</p>
                  </motion.div>
                ) : (
                  <button 
                    onClick={() => handleBookTransport(selectedTransport)}
                    disabled={bookingStatus === 'loading'}
                    className="w-full py-5 island-gradient text-white rounded-2xl font-bold text-sm uppercase tracking-widest shadow-lg shadow-island-emerald/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {bookingStatus === 'loading' ? (
                      <RefreshCw size={20} className="animate-spin" />
                    ) : (
                      <Ship size={20} />
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
