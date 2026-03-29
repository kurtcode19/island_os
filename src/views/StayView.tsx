import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Hotel, Star, MapPin, Wifi, Coffee, Wind, Waves, ArrowRight, Search, Filter, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../App';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const accommodations = [
  {
    id: 'stay-1',
    name: 'Blue Lagoon Resort & Spa',
    type: 'Luxury Resort',
    rating: 4.9,
    reviews: 128,
    price: 8500,
    image: 'https://image.kkday.com/v2/image/get/w_960%2Cc_fit%2Cq_55%2Ct_webp/s1.kkday.com/dyhotel_175987/20250918203629_zYO9b/jpg',
    tags: ['Beachfront', 'Pool', 'Spa'],
    businessId: 'biz-resort-1'
  },
  {
    id: 'stay-2',
    name: 'Volcanic Eco-Lodge',
    type: 'Eco-Stay',
    rating: 4.7,
    reviews: 85,
    price: 3200,
    image: 'https://images.trvl-media.com/lodging/12000000/11610000/11607200/11607107/a51d0cd1.jpg?impolicy=resizecrop&rw=575&rh=575&ra=fill',
    tags: ['Mountain View', 'Sustainable', 'Quiet'],
    businessId: 'biz-lodge-1'
  },
  {
    id: 'stay-3',
    name: 'White Island Homestay',
    type: 'Homestay',
    rating: 4.8,
    reviews: 56,
    price: 1500,
    image: 'https://pix6.agoda.net/hotelImages/870/870032/870032_15071314040032171296.jpg?s=1024x768',
    tags: ['Local Experience', 'Budget', 'Near Port'],
    businessId: 'biz-homestay-1'
  },
  {
    id: 'stay-4',
    name: 'Hibok-Hibok Glamping',
    type: 'Glamping',
    rating: 4.6,
    reviews: 42,
    price: 4500,
    image: 'https://static.wixstatic.com/media/47e390_6412453b496c43e2ae3659aa4e10c4f2~mv2.jpg/v1/fill/w_980,h_735,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/47e390_6412453b496c43e2ae3659aa4e10c4f2~mv2.jpg',
    tags: ['Adventure', 'Star Gazing', 'Nature'],
    businessId: 'biz-glamping-1'
  },
];

export default function StayView() {
  const { user, login } = useAuth();
  const [bookingStatus, setBookingStatus] = useState<{[key: string]: 'idle' | 'loading' | 'success'}>({});
  const [testError, setTestError] = useState<string | null>(null);

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
      } catch (e) {
        // Ignore the thrown error from handleFirestoreError
      }
    }
  };

  return (
    <div className="bg-island-cream min-h-screen pb-20">
      {/* Header */}
      <section className="relative h-[40vh] flex items-center overflow-hidden">
        <img 
          src="https://picsum.photos/seed/camiguin-island-aerial/2000/1000" 
          alt="Camiguin Resorts" 
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
              Find Your <span className="not-italic text-island-emerald">Island Home</span>
            </h1>
            <p className="text-xl text-slate-200 font-light max-w-2xl">
              From luxury beachfront resorts to cozy mountain eco-lodges, discover the perfect place to rest in Camiguin.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search & Filter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="glass p-4 rounded-[2.5rem] shadow-xl flex flex-wrap md:flex-nowrap gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by name or location..." 
              className="w-full pl-12 pr-4 py-4 bg-white/50 rounded-2xl outline-none focus:ring-2 focus:ring-island-emerald/20 transition-all"
            />
          </div>
          <button className="px-8 py-4 bg-white rounded-2xl border border-slate-100 font-bold text-island-green flex items-center gap-2 hover:bg-slate-50 transition-all">
            <Filter size={20} /> Filters
          </button>
          <button className="px-10 py-4 island-gradient text-white rounded-2xl font-bold shadow-lg shadow-island-emerald/20">
            Search
          </button>
        </div>
        {testError && (
          <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-2xl border border-red-200 break-all">
            <strong>Error:</strong> {testError}
          </div>
        )}
      </div>

      {/* Listings */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="flex justify-between items-end mb-12">
          <div>
            <span className="text-island-coral font-bold uppercase tracking-[0.2em] text-xs mb-2 block">Accommodations</span>
            <h2 className="text-4xl font-serif font-bold text-island-green italic">Featured <span className="not-italic text-island-emerald">Stays</span></h2>
          </div>
          <div className="flex gap-4">
            {['All', 'Resorts', 'Eco-Lodges', 'Homestays'].map((tab) => (
              <button key={tab} className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${tab === 'All' ? 'bg-island-green text-white' : 'bg-white text-slate-500 hover:bg-slate-100'}`}>
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {accommodations.map((hotel, idx) => (
            <motion.div
              key={hotel.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group bg-white rounded-[3rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all"
            >
              <div className="relative h-80 overflow-hidden">
                <img 
                  src={hotel.image} 
                  alt={hotel.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-6 right-6 px-4 py-2 glass rounded-full text-xs font-bold flex items-center gap-2 text-island-green">
                  <Star size={14} className="text-island-sunset fill-island-sunset" /> {hotel.rating} ({hotel.reviews})
                </div>
                <div className="absolute bottom-6 left-6 flex gap-2">
                  {hotel.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-[10px] font-bold rounded-full uppercase tracking-widest border border-white/30">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="p-10">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-xs font-bold text-island-emerald uppercase tracking-widest mb-1">{hotel.type}</p>
                    <h3 className="text-3xl font-serif font-bold text-island-green">{hotel.name}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Per Night</p>
                    <p className="text-2xl font-bold text-island-green">₱{hotel.price.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 mb-8 py-6 border-y border-slate-50">
                  <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <Wifi size={18} className="text-island-emerald" /> Free Wifi
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <Coffee size={18} className="text-island-emerald" /> Breakfast
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <Wind size={18} className="text-island-emerald" /> AC
                  </div>
                </div>
                <button 
                  onClick={() => handleBook(hotel)}
                  disabled={bookingStatus[hotel.id] === 'loading' || bookingStatus[hotel.id] === 'success'}
                  className={`w-full py-5 rounded-2xl font-bold flex items-center justify-center gap-3 group transition-all ${
                    bookingStatus[hotel.id] === 'success'
                      ? 'bg-green-500 text-white'
                      : bookingStatus[hotel.id] === 'loading'
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'island-gradient text-white shadow-lg shadow-island-emerald/20 hover:scale-[1.02] active:scale-[0.98]'
                  }`}
                >
                  {bookingStatus[hotel.id] === 'success' ? (
                    <>
                      <CheckCircle2 size={20} />
                      Booking Confirmed
                    </>
                  ) : bookingStatus[hotel.id] === 'loading' ? (
                    <div className="w-6 h-6 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      Book This Stay <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
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
