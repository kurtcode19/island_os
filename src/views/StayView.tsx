import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Hotel, Star, MapPin, Wifi, Coffee, Wind, Waves, ArrowRight, Search, Filter, CheckCircle2, Sparkles, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

import { accommodations } from '../data/accommodations';

export default function StayView() {
  const { user, login } = useAuth();
  const [bookingStatus, setBookingStatus] = useState<{[key: string]: 'idle' | 'loading' | 'success'}>({});
  const [testError, setTestError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState('All');

  const handleBook = async (hotel: typeof accommodations[0]) => {
    if (!user) {
      login();
      return;
    }

    setBookingStatus(prev => ({ ...prev, [hotel.id]: 'loading' }));
    setTestError(null);

    try {
      await addDoc(collection(db, 'bookings'), {
        touristUid: user.uid,
        touristName: user.displayName || 'Anonymous',
        serviceId: hotel.id,
        serviceName: hotel.name,
        serviceType: 'stay',
        businessId: hotel.businessId,
        date: new Date().toISOString(),
        status: 'pending',
        paymentStatus: 'UNPAID',
        amount: hotel.price,
        createdAt: serverTimestamp()
      });
      setBookingStatus(prev => ({ ...prev, [hotel.id]: 'success' }));
      setTimeout(() => {
        setBookingStatus(prev => ({ ...prev, [hotel.id]: 'idle' }));
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
            <span className="text-island-emerald font-black uppercase tracking-[0.4em] text-[10px] mb-4 block">Verified Accommodations</span>
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
            <span className="text-island-coral font-black uppercase tracking-[0.4em] text-[10px] mb-4 block">Availability Grid</span>
            <h2 className="text-5xl md:text-6xl font-black text-island-volcanic tracking-tighter">Verified Stays.</h2>
          </div>
          <div className="flex gap-3 bg-stone-100 p-2 rounded-[2rem] border border-slate-200 shadow-inner">
            {['All', 'Resorts', 'Homestays'].map((tab) => (
              <button 
                key={tab} 
                onClick={() => setSelectedTab(tab)}
                className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                  selectedTab === tab 
                    ? 'volcanic-gradient text-white shadow-xl shadow-island-volcanic/20' 
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
                    <span key={tag} className="px-4 py-1.5 bg-island-volcanic/60 backdrop-blur-xl text-white text-[9px] font-black rounded-full uppercase tracking-widest border border-white/20 shadow-xl">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="px-5 pb-5">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <span className="text-[10px] font-black text-island-emerald uppercase tracking-[0.3em] mb-2 block">{hotel.type}</span>
                    <h3 className="text-4xl font-black text-island-volcanic tracking-tighter leading-tight">{hotel.name}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1 block">Starts At</span>
                    <p className="text-3xl font-black text-island-volcanic tracking-tighter">₱{hotel.price.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-8 mb-10 py-8 border-y-2 border-stone-50">
                  <div className="flex items-center gap-3 text-slate-500 font-bold text-xs uppercase tracking-widest">
                    <Wifi size={20} strokeWidth={3} className="text-island-emerald" /> Wifi
                  </div>
                  <div className="flex items-center gap-3 text-slate-500 font-bold text-xs uppercase tracking-widest">
                    <Coffee size={20} strokeWidth={3} className="text-island-emerald" /> Breakfast
                  </div>
                  <div className="flex items-center gap-3 text-slate-500 font-bold text-xs uppercase tracking-widest">
                    <Wind size={20} strokeWidth={3} className="text-island-emerald" /> Climate
                  </div>
                </div>

                <button 
                  onClick={() => handleBook(hotel)}
                  disabled={bookingStatus[hotel.id] === 'loading' || bookingStatus[hotel.id] === 'success'}
                  className={`btn-primary w-full py-6 rounded-3xl ${
                    bookingStatus[hotel.id] === 'success' ? 'bg-emerald-600 shadow-none' : ''
                  }`}
                >
                  {bookingStatus[hotel.id] === 'success' ? (
                    <>
                      <CheckCircle2 size={24} strokeWidth={3} />
                      Assignment Confirmed
                    </>
                  ) : bookingStatus[hotel.id] === 'loading' ? (
                    <RefreshCw size={24} strokeWidth={3} className="animate-spin" />
                  ) : (
                    <>
                      Reserve Accommodation <ArrowRight size={24} strokeWidth={3} />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
