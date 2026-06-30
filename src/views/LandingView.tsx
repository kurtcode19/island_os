import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  UilArrowRight, 
  UilStar, 
  UilTimes, 
  UilCheckCircle, 
  UilRefresh, 
  UilAngleRightB,
  UilArrowUpRight
} from '@/icons';
import { useAuth } from '../context/AuthContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { SearchWidget } from '../components/SearchWidget';
import { ProcessFlow } from '../components/ProcessFlow';
import { bookingFlow, tripPlannerFlow } from '../data/processFlow';

const experiences = [
  { id: 'exp_2', title: 'Sunken Cemetery Exploration', type: 'Heritage', rating: 4.8, price: 150, businessId: 'catarman_lgu', image: '/images/hero-sunken.png' },
  { id: 'exp_5', title: 'Gui-ob Church Ruins Tour', type: 'Historical', rating: 4.9, price: 100, businessId: 'catarman_heritage', image: '/images/old-spanish-church-ruins-big-tree.jpg' },
  { id: 'exp_6', title: 'Tuasan Falls Adventure', type: 'Nature', rating: 4.7, price: 300, businessId: 'nature_guides', image: '/images/tuasan.jpg' },
];

const highlights = [
  { id: '01', title: 'Heritage Trails', description: "We don't just guide tours; we preserve the stories of Catarman, from the sunken landmarks to the colonial ruins that define our soul.", image: '/images/old-spanish-church-ruins-big-tree.jpg' },
  { id: '02', title: 'Local Partnerships', description: "Working closely with Catarman LGU and local businesses, we ensure your visit supports the community while offering authentic island life.", image: '/images/DigiPay-1.png' },
];

export default function LandingView() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [selectedExp, setSelectedExp] = useState<any>(null);
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [howItWorksTab, setHowItWorksTab] = useState<'booking' | 'planner'>('booking');

  const handleBookExperience = async (exp: any) => {
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
        serviceId: exp.id,
        serviceName: exp.title,
        serviceType: 'tour',
        businessId: exp.businessId,
        date: new Date().toLocaleDateString(),
        amount: exp.price,
        status: 'pending',
        paymentStatus: 'UNPAID',
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'bookings'), bookingData);
      setBookingStatus('success');
      setTimeout(() => {
        setBookingStatus('idle');
        setSelectedExp(null);
        navigate('/my-bookings');
      }, 2000);
    } catch (error) {
      setBookingStatus('idle');
      handleFirestoreError(error, OperationType.CREATE, 'bookings');
    }
  };

  return (
    <div className="bg-slate-50 selection:bg-island-volcanic selection:text-white overflow-x-hidden min-h-screen">
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <img 
          src="/philippines--camiguin-xl.jpg" 
          alt="Camiguin Island"
          className="absolute inset-0 w-full h-full object-cover brightness-50"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-island-volcanic/70 via-transparent to-slate-50"></div>
        
        <div className="relative z-10 max-w-[1600px] mx-auto px-6 w-full">
          <div className="flex flex-col lg:flex-row gap-16 min-h-[80vh] py-20 items-center">
            
            {/* Left Content Area */}
            <div className="flex-1 flex flex-col justify-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="flex items-center gap-4 mb-10 group">
                  <div className="w-12 h-[2px] bg-white/40 group-hover:w-20 transition-all duration-500"></div>
                  <p className="text-white/60 text-xs font-bold uppercase tracking-[0.4em]">
                    Welcome to Catarman eSuroy
                  </p>
                </div>

                <h1 className="text-6xl md:text-[7rem] lg:text-[8rem] font-black text-white leading-[0.8] tracking-tighter mb-12 uppercase italic">
                  Discover <br />
                  The Heart <br />
                  <span className="text-island-emerald not-italic">Of Catarman</span>
                </h1>

                <p className="text-white/70 text-lg font-medium leading-relaxed max-w-lg mb-16">
                  Explore the historic Sunken Cemetery, the mystical Church Ruins, and the crystal waters of Tuasan. 
                  Experience a municipality where heritage meets horizon.
                </p>

                <div className="flex flex-wrap gap-6">
                  <button 
                    onClick={() => navigate('/stay')}
                    className="bg-white text-island-volcanic px-12 py-6 rounded-full text-xs font-black uppercase tracking-[0.2em] flex items-center gap-4 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-black/20 group"
                  >
                    Start Exploring 
                    <div className="w-10 h-10 bg-island-volcanic/10 rounded-full flex items-center justify-center group-hover:bg-island-emerald group-hover:text-white transition-colors">
                      <UilArrowUpRight size="20" />
                    </div>
                  </button>
                </div>
              </motion.div>
            </div>

            {/* Right Image Area */}
            <div className="flex-1 relative z-10">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: [0.2, 0, 0.2, 1] }}
                className="h-full w-full rounded-[3.5rem] overflow-hidden shadow-2xl relative border-8 border-white/10 min-h-[500px]"
              >
                <img 
                  src="/images/explore-bg.jpg" 
                  alt="Sunken Cemetery Aerial" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                
                <div className="absolute top-10 right-10 bg-white/10 backdrop-blur-2xl px-10 py-6 rounded-3xl border border-white/20">
                  <p className="text-white text-5xl font-black tracking-tighter leading-none mb-1">98%</p>
                  <p className="text-white/60 text-xs font-medium tracking-tight">Satisfaction Rate</p>
                </div>
              </motion.div>

              </div>
          </div>
        </div>
      </section>

      {/* Rentals Section */}
      <section className="py-24 md:py-32 px-6 bg-island-cream/30">
        <div className="max-w-[1600px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex justify-between items-end mb-16"
          >
            <div>
              <span className="text-island-emerald font-bold tracking-wider text-xs mb-4 block">/ Rentals</span>
              <h2 className="text-5xl md:text-7xl font-black text-island-volcanic tracking-tighter leading-[0.9] mb-6 uppercase italic">
                Vehicles for <br className="md:hidden" />
                <span className="text-island-emerald not-italic"> every trip.</span>
              </h2>
              <p className="text-slate-500 text-lg font-medium max-w-xl">
                Scooters, bikes, tricycles, and SUVs — get around the island your way.
              </p>
            </div>
            <Link to="/rentals" className="hidden md:flex items-center gap-2 px-8 py-4 bg-island-volcanic text-white rounded-full font-bold text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">
              View All <UilArrowUpRight size="16" />
            </Link>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Scooter', rate: 500, unit: 'day', image: '/images/camiguin-rent-a-scooters.jpg', seats: 2 },
              { name: 'Mountain Bike', rate: 250, unit: 'day', image: '/images/mountainbike.jpg', seats: 1 },
              { name: 'Tricycle', rate: 300, unit: 'hour', image: '/images/tricycle.jpg', seats: 4 },
            ].map((v, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group bg-white rounded-[2.5rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all cursor-pointer"
                onClick={() => navigate('/rentals')}
              >
                <div className="relative h-56 overflow-hidden">
                  <img src={v.image} alt={v.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute bottom-5 left-5 right-5 flex justify-between items-end">
                    <h3 className="text-2xl font-black text-white tracking-tighter">{v.name}</h3>
                    <div className="bg-white/90 backdrop-blur-xl px-4 py-2 rounded-2xl text-right">
                      <span className="text-xl font-black text-island-green">₱{v.rate}</span>
                      <span className="text-[10px] text-slate-500 font-semibold ml-1">/{v.unit}</span>
                    </div>
                  </div>
                </div>
                <div className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <span>Up to {v.seats} seats</span>
                  </div>
                  <span className="text-[10px] font-bold text-island-emerald uppercase tracking-widest group-hover:translate-x-1 transition-transform">Browse →</span>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="mt-10 text-center md:hidden">
            <Link to="/rentals" className="inline-flex items-center gap-2 px-8 py-4 bg-island-volcanic text-white rounded-full font-bold text-xs uppercase tracking-widest">
              View All Vehicles <UilArrowUpRight size="16" />
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-[1600px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="text-island-emerald font-bold tracking-wider text-xs mb-4 block">/ How It Works</span>
            <h2 className="text-5xl md:text-7xl font-black text-island-volcanic tracking-tighter leading-[0.9] mb-6 uppercase italic">
              Your journey <br className="md:hidden" />
              <span className="text-island-emerald not-italic"> starts here.</span>
            </h2>
            <p className="text-slate-500 text-lg font-medium max-w-xl mx-auto">
              From discovery to exploration in just a few steps.
            </p>
          </motion.div>

          <div className="flex justify-center gap-4 mb-16">
            <button
              onClick={() => setHowItWorksTab('booking')}
              className={`px-8 py-4 rounded-full text-sm font-bold tracking-wider transition-all ${
                howItWorksTab === 'booking'
                  ? 'bg-island-volcanic text-white shadow-xl shadow-island-volcanic/20'
                  : 'bg-white text-slate-500 border border-slate-100 hover:border-island-emerald/30'
              }`}
            >
              Book an Experience
            </button>
            <button
              onClick={() => setHowItWorksTab('planner')}
              className={`px-8 py-4 rounded-full text-sm font-bold tracking-wider transition-all ${
                howItWorksTab === 'planner'
                  ? 'bg-island-volcanic text-white shadow-xl shadow-island-volcanic/20'
                  : 'bg-white text-slate-500 border border-slate-100 hover:border-island-emerald/30'
              }`}
            >
              Plan with AI
            </button>
          </div>

          <motion.div
            key={howItWorksTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-[4rem] p-10 md:p-16 shadow-xl border border-slate-100"
          >
            <ProcessFlow
              steps={howItWorksTab === 'booking' ? bookingFlow.steps : tripPlannerFlow.steps}
              variant="teaser"
            />
          </motion.div>

          <div className="text-center mt-12">
            <Link
              to="/how-it-works"
              className="inline-flex items-center gap-3 text-sm font-semibold text-island-emerald hover:text-island-green transition-colors group"
            >
              See full breakdown
              <UilArrowRight size="18" className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Search Widget Section */}
      <section className="px-6 py-12 md:px-12">
        <div className="max-w-[1600px] mx-auto flex justify-center">
          <SearchWidget />
        </div>
      </section>

      {/* Highlights Section */}
      <section className="py-40 px-6 max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center mb-40">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400 mb-8 block">/ Our Heritage</span>
            <h2 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-12 uppercase italic">
              What makes <br /> <span className="text-island-emerald not-italic">us unique?</span>
            </h2>
          </div>
          <div className="space-y-12">
            <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-md">
              Catarman offers a profound journey through Camiguin's volcanic history and vibrant local culture. From spiritual landmarks to hidden waterfalls.
            </p>
            <button onClick={() => navigate('/how-it-works')} className="bg-island-volcanic text-white px-10 py-5 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-3 hover:scale-105 transition-all shadow-xl">
              Learn More <UilArrowRight size="18" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {highlights.map((item) => (
            <div key={item.id} className="group">
              <div className="relative aspect-[16/10] rounded-[3.5rem] overflow-hidden mb-8 shadow-xl border border-slate-100">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                <div className="absolute top-8 right-8 w-16 h-16 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center text-2xl font-black text-white border border-white/20">
                  {item.id}
                </div>
              </div>
              <h3 className="text-4xl font-black mb-4 tracking-tighter uppercase italic">{item.title}</h3>
              <p className="text-slate-500 text-lg font-medium leading-relaxed max-w-sm">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Destinations Section */}
      <section className="relative py-40 overflow-hidden bg-white rounded-[5rem] mx-6 md:mx-12 shadow-inner shadow-slate-100">
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/explore-bg.jpg" 
            alt="Camiguin Destinations" 
            className="w-full h-full object-cover opacity-5 grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white"></div>
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-10">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400 mb-6 block">/ Catarman Landmarks</span>
              <h2 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] uppercase">
                Must Visit <br /> <span className="italic text-island-emerald font-normal">Destinations</span>
              </h2>
            </div>
            <div className="space-y-8 text-right">
              <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-xs ml-auto">
                Official municipal experiences verified by the Catarman Tourism Office.
              </p>
              <button onClick={() => navigate('/locations')} className="bg-island-volcanic text-white px-10 py-5 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-3 hover:scale-105 transition-all shadow-xl">
                See All <UilArrowRight size="18" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {experiences.map((exp, idx) => (
              <motion.div 
                key={exp.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: idx * 0.2 }}
                viewport={{ once: true }}
                className="group cursor-pointer"
                onClick={() => setSelectedExp(exp)}
              >
                <div className="relative aspect-[4/5] rounded-[3.5rem] overflow-hidden mb-8 shadow-2xl border-8 border-slate-50 transition-all duration-700 group-hover:-translate-y-4">
                  <img src={exp.image} alt={exp.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-island-volcanic/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute top-8 left-8 px-6 py-2 bg-white/90 backdrop-blur-md rounded-full text-island-volcanic text-[10px] font-black uppercase tracking-widest border border-white">
                    {exp.type}
                  </div>
                </div>
                <div className="flex justify-between items-start px-4">
                  <div>
                    <h3 className="text-3xl font-black mb-2 tracking-tighter uppercase italic">{exp.title}</h3>
                    <p className="text-island-emerald font-black italic">Starting from ₱{exp.price.toLocaleString()}</p>
                  </div>
                  <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center transition-all group-hover:bg-island-emerald group-hover:text-white group-hover:scale-110">
                    <UilArrowUpRight size="24" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-60 px-6 max-w-5xl mx-auto text-center">
        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400 mb-12 block">/ Testimonial</span>
        <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight italic font-serif">
          "The Sunken Cemetery was a spiritual experience unlike any other. Catarman's history is written in the landscape, and every guide we met treated us like family."
        </h2>
        <div className="mt-20 flex flex-col items-center gap-6">
          <img src="/images/logo.png" alt="Avatar" className="w-24 h-24 rounded-full shadow-2xl border-4 border-white object-cover" />
          <div>
            <p className="font-black tracking-tight text-xl uppercase italic">Marco Salvatierra</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Catarman Explorer</p>
          </div>
        </div>
      </section>

      {/* Integrated Modal */}
      <AnimatePresence>
          {selectedExp && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedExp(null)}
                className="absolute inset-0 bg-island-volcanic/90 backdrop-blur-md"
              ></motion.div>
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                className="relative w-full max-w-2xl bg-white rounded-[4rem] overflow-hidden shadow-2xl"
              >
                <button 
                  onClick={() => setSelectedExp(null)}
                  className="absolute top-8 right-8 p-4 bg-slate-50 rounded-full text-island-volcanic hover:text-island-coral active:scale-90 transition-all z-10"
                >
                  <UilTimes size="24" />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="h-full relative">
                    <img src={selectedExp.image} alt={selectedExp.title} className="w-full h-full object-cover min-h-[400px]" />
                  </div>

                  <div className="p-12">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full">
                        <UilStar size="18" className="text-island-sunset" />
                        <span className="text-sm font-bold">{selectedExp.rating}</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedExp.type}</span>
                    </div>

                    <h4 className="text-3xl font-bold mb-6 tracking-tighter leading-tight uppercase italic">{selectedExp.title}</h4>
                    <p className="text-slate-500 font-medium leading-relaxed mb-12">Experience the Catarman pilot platform. This landmark represents the profound heritage of our municipality.</p>

                    <div className="space-y-8">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Fee</span>
                        <span className="text-4xl font-bold text-island-volcanic tracking-tighter">₱{selectedExp.price.toLocaleString()}</span>
                      </div>

                      {bookingStatus === 'success' ? (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex items-center gap-4 py-6 text-emerald-600"
                        >
                          <UilCheckCircle size="32" />
                          <p className="font-bold uppercase tracking-widest text-xs">Booking Verified</p>
                        </motion.div>
                      ) : (
                        <button 
                          onClick={() => handleBookExperience(selectedExp)}
                          disabled={bookingStatus === 'loading'}
                          className="w-full bg-island-volcanic text-white py-7 rounded-full font-bold uppercase tracking-widest text-xs disabled:opacity-50 hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
                        >
                          {bookingStatus === 'loading' ? (
                            <UilRefresh size="24" className="animate-spin" />
                          ) : (
                            'Confirm Reservation'
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 pt-40 pb-20 mt-40">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-20 mb-40">
            <div className="max-w-md">
              <div className="flex items-center gap-4 mb-10 group cursor-pointer" onClick={() => navigate('/')}>
                <div className="w-12 h-12 bg-island-volcanic rounded-2xl flex items-center justify-center text-white">
                  <img src="/images/logo.png" alt="Catarman eSuroy Logo" className="w-8 h-8 object-contain" referrerPolicy="no-referrer" />
                </div>
                <span className="text-3xl font-black tracking-tighter uppercase italic">Catarman <span className="text-island-emerald not-italic">eSuroy</span></span>
              </div>
              <p className="text-slate-400 text-xl font-medium leading-relaxed italic">
                Preserving and digitizing the unique heritage of Catarman, Camiguin.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-20">
              <div className="space-y-8">
                <h4 className="text-xs font-bold tracking-wider text-slate-400">Explore</h4>
                <ul className="space-y-4 text-sm font-semibold tracking-tight">
                  <li><button onClick={() => navigate('/locations')} className="hover:text-island-emerald transition-all">Destinations</button></li>
                  <li><button onClick={() => navigate('/stay')} className="hover:text-island-emerald transition-all">Experiences</button></li>
                  <li><button onClick={() => navigate('/planner')} className="hover:text-island-emerald transition-all">Itineraries</button></li>
                </ul>
              </div>
              <div className="space-y-8">
                <h4 className="text-xs font-bold tracking-wider text-slate-400">Company</h4>
                <ul className="space-y-4 text-sm font-semibold tracking-tight">
                  <li><button onClick={() => navigate('/how-it-works')} className="hover:text-island-emerald transition-all">About Us</button></li>
                  <li><button className="hover:text-island-emerald transition-all cursor-default opacity-50">Careers</button></li>
                  <li><button className="hover:text-island-emerald transition-all cursor-default opacity-50">Contact</button></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="pt-20 border-t border-slate-50 flex justify-between items-center text-xs font-semibold tracking-tight text-slate-400">
            <p>© 2026 Catarman eSuroy</p>
            <div className="flex gap-10">
              <span className="text-slate-300 cursor-default">Instagram</span>
              <span className="text-slate-300 cursor-default">Facebook</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
