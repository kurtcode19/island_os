import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Ship, Car, Bike, MapPin, Clock, Calendar, ArrowRight, Info, ShieldCheck, Waves, Navigation, X, CheckCircle2, RefreshCw, Sparkles } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

import { transportOptions, schedules } from '../data/transport';

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
    <div className="bg-[#F0FDF4] min-h-screen pb-40 selection:bg-island-emerald/20">
      {/* Header */}
      <section className="relative h-[45vh] flex items-center overflow-hidden">
        <motion.img 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
          src="https://img.atlasobscura.com/CmlPBCqrdngS4DE4q_DDyDdVYBjhcSTHrsI9PUEbvkQ/rs:fill:780:520:1/g:ce/q:81/sm:1/scp:1/ar:1/aHR0cHM6Ly9hdGxh/cy1kZXYuczMuYW1h/em9uYXdzLmNvbS91/cGxvYWRzL3BsYWNl/X2ltYWdlcy85OTA0/ZjhlMDJiMGM0ODM5/NWJfU3Vua2VuX0Nl/bWV0ZXJ5LF9DYXRh/cm1hbixfQ2FtaWd1/aW4uanBn.jpg" 
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
            <span className="text-island-emerald font-black uppercase tracking-[0.4em] text-[10px] mb-4 block">Municipal Logistics</span>
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
              <span className="text-island-coral font-black uppercase tracking-[0.4em] text-[10px] mb-4 block">Services Marketplace</span>
              <h2 className="text-5xl md:text-6xl font-black text-island-volcanic tracking-tighter mb-12">Transit Nodes.</h2>
              
              <div className="grid grid-cols-1 gap-8">
                {transportOptions.map((opt, idx) => (
                  <motion.div
                    key={opt.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="group bg-white p-10 rounded-[3.5rem] border-2 border-slate-100 shadow-xl hover:shadow-2xl transition-all duration-500 flex flex-col md:flex-row items-center gap-10"
                  >
                    <div className={`w-24 h-24 rounded-[2rem] ocean-gradient text-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform`}>
                      <opt.icon size={44} strokeWidth={2.5} />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-3">
                        <h3 className="text-3xl font-black text-island-volcanic tracking-tighter">{opt.title}</h3>
                        <span className="px-4 py-1.5 bg-stone-50 text-slate-500 text-[9px] font-black rounded-full uppercase tracking-widest border border-slate-100">
                          {opt.provider}
                        </span>
                      </div>
                      <p className="text-slate-500 font-medium mb-6 leading-relaxed">{opt.route}</p>
                      <div className="flex flex-wrap justify-center md:justify-start gap-8">
                        <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <Clock size={16} strokeWidth={3} className="text-island-emerald" /> {opt.duration}
                        </div>
                        <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <ShieldCheck size={16} strokeWidth={3} className="text-island-emerald" /> Verified Node
                        </div>
                      </div>
                    </div>
                    <div className="text-center md:text-right">
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1 block">Starts At</span>
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
                <span className="text-island-emerald font-black uppercase tracking-[0.4em] text-[10px] mb-6 block">Real-time Telemetry</span>
                <h3 className="text-4xl md:text-5xl font-black mb-6 tracking-tighter">Live <span className="text-island-emerald">Ferry Tracker.</span></h3>
                <p className="text-slate-300 font-medium text-xl mb-10 max-w-md leading-relaxed">
                  Advanced GPS tracking for all municipal ferry nodes in the Catarman channel.
                </p>
                <div className="flex flex-wrap items-center gap-10">
                  <button className="btn-primary px-10 py-6 rounded-2xl">
                    Launch Node Tracker
                  </button>
                  <div className="flex items-center gap-3 text-island-emerald font-black uppercase tracking-widest text-[11px]">
                    <span className="w-2.5 h-2.5 rounded-full bg-island-emerald animate-pulse shadow-[0_0_10px_rgba(16,185,129,1)]"></span>
                    4 Active Nodes
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Schedule Sidebar */}
          <div className="space-y-10">
            <div className="bg-white p-12 rounded-[4rem] border-2 border-slate-100 shadow-xl">
              <div className="flex items-center gap-4 mb-10 pb-6 border-b-2 border-stone-50">
                <div className="w-14 h-14 ocean-gradient text-white rounded-2xl flex items-center justify-center shadow-lg">
                  <Waves size={28} strokeWidth={2.5} />
                </div>
                <h3 className="text-3xl font-black text-island-volcanic tracking-tighter">Schedules.</h3>
              </div>
              
              <div className="space-y-8">
                {schedules.map((s, idx) => (
                  <div key={idx} className="flex items-center justify-between py-5 border-b border-slate-50 last:border-0">
                    <div>
                      <p className="text-xl font-black text-island-volcanic tracking-tighter">{s.time}</p>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{s.from} → {s.to}</p>
                    </div>
                    <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-sm ${s.type === 'warning' ? 'bg-rose-50 text-island-coral border border-rose-100' : 'bg-emerald-50 text-island-emerald border border-emerald-100'}`}>
                      {s.status}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-12 p-8 bg-stone-50 rounded-3xl flex items-start gap-5 border border-slate-100">
                <Info size={24} strokeWidth={3} className="text-blue-500 shrink-0 mt-1" />
                <p className="text-xs text-slate-500 font-bold leading-relaxed uppercase tracking-wider">
                  Operational status depends on climate node data. Terminal arrival advised 45m prior.
                </p>
              </div>
            </div>

            <div className="volcanic-gradient p-12 rounded-[4rem] text-white shadow-2xl border border-white/10">
              <h3 className="text-2xl font-black mb-6 tracking-tighter">Bespoke Guides.</h3>
              <p className="text-slate-400 font-medium mb-10 leading-relaxed">
                Assign a verified local heritage agent with secure transit for a deep immersion.
              </p>
              <button className="btn-primary w-full py-6 rounded-2xl text-xs">
                Request Agent
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
                  <div className={`w-20 h-20 rounded-[1.75rem] ocean-gradient text-white flex items-center justify-center shadow-2xl border border-white/10`}>
                    <selectedTransport.icon size={44} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-island-volcanic tracking-tighter">{selectedTransport.title}</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-1">{selectedTransport.provider}</p>
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
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Confirmed Fare</span>
                    <span className="text-4xl font-black text-island-volcanic tracking-tighter">₱{selectedTransport.price.toLocaleString()}</span>
                  </div>
                  <ShieldCheck size={48} className="text-island-emerald opacity-20" />
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
                    <p className="text-island-emerald font-black uppercase tracking-[0.3em] text-[11px]">Booking Active</p>
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
                    Commit to Transit
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
