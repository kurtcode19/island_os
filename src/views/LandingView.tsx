import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Compass, 
  Hotel, 
  Ship, 
  Utensils, 
  Map as MapIcon, 
  ArrowRight, 
  Star, 
  ShieldCheck, 
  Waves, 
  Mountain, 
  Palmtree, 
  ShoppingBag, 
  Users, 
  Building2,
  X,
  CheckCircle2,
  RefreshCw,
  Bell,
  Sparkles,
  Ticket,
  ChevronRight
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { locations } from '../data/locations';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

// Fix for default marker icon issue in Leaflet with React
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const experiences = [
  { id: 'exp_2', title: 'Sunken Cemetery Snorkeling', type: 'Diving', rating: 4.8, price: 2500, businessId: 'camiguin_divers', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=1000' },
  { id: 'exp_5', title: 'Gui-ob Church Ruins Visit', type: 'Historical', rating: 4.9, price: 100, businessId: 'catarman_heritage', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=1000' },
  { id: 'exp_6', title: 'Tuasan Falls Adventure', type: 'Nature', rating: 4.7, price: 300, businessId: 'nature_guides', image: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?auto=format&fit=crop&q=80&w=1000' },
  { id: 'exp_7', title: 'Bura Soda Water Park', type: 'Nature', rating: 4.8, price: 200, businessId: 'soda_park', image: 'https://images.unsplash.com/photo-1540541338287-41700207def5?auto=format&fit=crop&q=80&w=1000' },
];

const features = [
  { title: 'Catarman Smart Planner', description: 'AI-powered itinerary builder that suggests Catarman resorts and tours.', icon: Compass, color: 'bg-emerald-600', shadow: 'shadow-emerald-600/20' },
  { title: 'Local Catarman Booking', description: 'Book Catarman-specific homestays, tours, and local transport.', icon: Hotel, color: 'bg-green-700', shadow: 'shadow-green-700/20' },
  { title: 'Municipal Marketplace', description: 'Browse Catarman diving tours and local heritage site visits.', icon: Utensils, color: 'bg-teal-600', shadow: 'shadow-teal-600/20' },
  { title: 'Pilot Tourist Pass', description: 'Digital QR pass for Catarman attractions and local events.', icon: ShieldCheck, color: 'bg-emerald-500', shadow: 'shadow-emerald-500/20' },
];

export default function LandingView() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [selectedExp, setSelectedExp] = useState<any>(null);
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'loading' | 'success'>('idle');

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
    <div className="relative bg-island-cream selection:bg-island-emerald/20 selection:text-island-emerald overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[98vh] flex items-center pt-20 pb-32 overflow-hidden">
        <motion.div 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: [0.2, 0, 0.2, 1] }}
          className="absolute inset-0 z-0"
        >
          <img 
            src="https://img.atlasobscura.com/CmlPBCqrdngS4DE4q_DDyDdVYBjhcSTHrsI9PUEbvkQ/rs:fill:780:520:1/g:ce/q:81/sm:1/scp:1/ar:1/aHR0cHM6Ly9hdGxh/cy1kZXYuczMuYW1h/em9uYXdzLmNvbS91/cGxvYWRzL3BsYWNl/X2ltYWdlcy85OTA0/ZjhlMDJiMGM0ODM5/NWJfU3Vua2VuX0Nl/bWV0ZXJ5LF9DYXRh/cm1hbixfQ2FtaWd1/aW4uanBn.jpg" 
            alt="Catarman Landscape" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-island-volcanic/75 via-island-volcanic/30 to-island-cream"></div>
        </motion.div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <div className="max-w-4xl">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-island-volcanic/40 backdrop-blur-xl border border-white/20 text-white text-[10px] font-black uppercase tracking-[0.3em] mb-10 shadow-2xl">
                <span className="w-2 h-2 rounded-full bg-island-emerald animate-pulse"></span>
                Pilot Test: Catarman Municipality
              </div>
              <h1 className="text-8xl md:text-[11rem] font-bold text-white leading-[0.8] mb-12 tracking-tighter drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                Catarman. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-island-emerald/60">Lush Life.</span>
              </h1>
              <p className="text-xl md:text-3xl text-white/90 mb-14 leading-relaxed font-semibold max-w-2xl drop-shadow-xl text-balance">
                Experience the heritage and emerald wonders of Catarman, Camiguin through our specialized pilot digital platform.
              </p>
              
              <div className="flex flex-wrap gap-6">
                <Link to="/planner" className="btn-primary px-12 py-6 rounded-2xl text-sm group hover:scale-[1.05] active:scale-95">
                  Start AI Planner <ArrowRight size={20} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/stay" className="px-12 py-6 bg-white/10 hover:bg-white/20 backdrop-blur-xl text-white border-2 border-white/30 rounded-2xl font-black text-xs uppercase tracking-[0.25em] transition-all hover:scale-[1.05] active:scale-95 shadow-2xl">
                  Book a Stay
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Modern Search Experience */}
      <section className="relative z-20 -mt-28 px-6">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="max-w-6xl mx-auto bg-white p-4 rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(6,78,59,0.15)] flex flex-wrap md:flex-nowrap gap-3 items-center border border-emerald-100"
        >
          <div className="flex-1 flex items-center gap-5 px-8 py-6 rounded-[2rem] hover:bg-emerald-50/50 transition-colors cursor-pointer group">
            <div className="w-14 h-14 rounded-2xl emerald-gradient flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-lg shadow-island-emerald/20">
              <MapPin size={24} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-island-green/40 uppercase tracking-widest mb-1">Destination</span>
              <input type="text" placeholder="Where to?" className="text-island-green font-bold outline-none bg-transparent placeholder:text-slate-300 text-base" />
            </div>
          </div>
          <div className="w-px h-16 bg-emerald-50 hidden md:block"></div>
          <div className="flex-1 flex items-center gap-5 px-8 py-6 rounded-[2rem] hover:bg-emerald-50/50 transition-colors cursor-pointer group">
            <div className="w-14 h-14 rounded-2xl lush-gradient flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-lg shadow-green-500/20">
              <Calendar size={24} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-island-green/40 uppercase tracking-widest mb-1">Check-in</span>
              <input type="text" placeholder="Add dates" className="text-island-green font-bold outline-none bg-transparent placeholder:text-slate-300 text-base" />
            </div>
          </div>
          <div className="w-px h-16 bg-emerald-50 hidden md:block"></div>
          <button className="btn-volcanic px-12 py-7 rounded-[2rem] text-sm">
            <Search size={28} strokeWidth={3} />
            <span className="font-black text-xs uppercase tracking-[0.2em]">Search</span>
          </button>
        </motion.div>
      </section>

      {/* Quick Access Icons */}
      <section className="py-32 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { to: '/transport', icon: Ship, label: 'Island Transport', sub: 'Ferry & Rent', gradient: 'lush-gradient' },
            { to: '/locations', icon: MapIcon, label: 'Explore', sub: 'Landmarks', gradient: 'emerald-gradient' },
            { to: '/shops', icon: ShoppingBag, label: 'Market', sub: 'Local Crafts', gradient: 'lush-gradient' },
            { to: '/pass', icon: Ticket, label: 'QR Pass', sub: 'Digital ID', gradient: 'forest-gradient' }
          ].map((item, idx) => (
            <Link key={idx} to={item.to} className="group">
              <motion.div 
                whileHover={{ y: -12 }}
                className="p-12 rounded-[3.5rem] bg-white border border-emerald-50 flex flex-col items-center text-center transition-all duration-500 group-hover:shadow-3xl group-hover:shadow-emerald-900/10"
              >
                <div className={`w-24 h-24 rounded-[2.5rem] ${item.gradient} text-white flex items-center justify-center mb-10 shadow-2xl transition-all duration-500 group-hover:scale-110`}>
                  <item.icon size={40} strokeWidth={2} />
                </div>
                <h3 className="text-2xl font-bold text-island-green mb-3 tracking-tighter">{item.label}</h3>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">{item.sub}</p>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-40 bg-island-sand/30 relative">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-transparent to-island-sand/30 -translate-y-full"></div>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-center mb-24">
            <div className="lg:col-span-1">
              <span className="text-island-coral font-black uppercase tracking-[0.4em] text-[10px] mb-6 block">The Ecosystem</span>
              <h2 className="text-5xl md:text-7xl font-bold text-island-green leading-tight mb-8 tracking-tighter">
                The Operating <br /> System for <br /> <span className="text-island-emerald">Catarman eLaag.</span>
              </h2>
            </div>
            <div className="lg:col-span-2">
              <p className="text-2xl text-island-green/70 font-medium leading-relaxed max-w-2xl">
                Catarman eLaag connects every touchpoint of your journey. From the moment you land to your final sunset, we ensure Catarman's magic is just a tap away.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <Link 
                key={idx}
                to={idx === 0 ? "/pass" : idx === 1 ? "/stay" : idx === 2 ? "/transport" : "/pass"}
                className="group"
              >
                <motion.div 
                  whileHover={{ y: -15 }}
                  className="p-12 h-full rounded-[3.5rem] bg-white border border-emerald-50 shadow-xl group-hover:shadow-3xl transition-all duration-500"
                >
                  <div className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center text-white mb-10 shadow-lg group-hover:scale-110 transition-transform duration-500 shadow-opacity-20`}>
                    <feature.icon size={32} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-2xl font-bold text-island-green mb-6 tracking-tight leading-snug">{feature.title}</h3>
                  <p className="text-island-green/60 leading-relaxed font-medium text-sm">{feature.description}</p>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Marketplace Section */}
      <section className="py-40 bg-island-volcanic text-white rounded-[5rem] mx-6 my-10 overflow-hidden relative shadow-[0_50px_100px_-20px_rgba(2,44,34,0.5)] border border-emerald-900/30">
        <div className="absolute top-0 right-0 w-1/3 h-full opacity-10 pointer-events-none text-island-emerald">
          <Palmtree size={600} className="absolute -top-40 -right-40 rotate-12" />
        </div>
        
        <div className="max-w-7xl mx-auto px-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-10">
            <div className="max-w-xl">
              <span className="text-island-emerald font-black uppercase tracking-[0.4em] text-[10px] mb-6 block text-emerald-400">Handpicked for you</span>
              <h2 className="text-6xl md:text-8xl font-bold mb-8 tracking-tighter leading-[0.9]">Island <br /><span className="text-island-emerald">Experiences.</span></h2>
              <p className="text-emerald-100/60 font-medium text-xl leading-relaxed">Curated adventures that capture the emerald soul of Catarman.</p>
            </div>
            <Link to="/transport" className="px-12 py-6 glass-dark hover:bg-white text-white hover:text-island-volcanic border-2 border-white/20 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center gap-4 shadow-2xl">
              Explore All <ArrowRight size={20} strokeWidth={3} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {experiences.map((exp) => (
              <div 
                key={exp.id}
                className="group cursor-pointer"
                onClick={() => setSelectedExp(exp)}
              >
                <motion.div 
                  whileHover={{ y: -15 }}
                  className="h-full bg-emerald-950/40 backdrop-blur-xl rounded-[3.5rem] overflow-hidden border border-white/10 hover:bg-emerald-900/60 transition-all duration-500"
                >
                  <div className="relative h-80 overflow-hidden">
                    <img 
                      src={exp.image} 
                      alt={exp.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-6 right-6 px-5 py-2.5 bg-white/90 backdrop-blur-xl rounded-2xl flex items-center gap-2 text-island-volcanic shadow-xl border border-white">
                      <Star size={16} fill="#D97706" className="text-island-sunset" /> 
                      <span className="font-black text-sm">{exp.rating}</span>
                    </div>
                    <div className="absolute bottom-6 left-6">
                      <span className="px-5 py-2 emerald-gradient text-white text-[10px] font-black rounded-full uppercase tracking-widest shadow-2xl">
                        {exp.type}
                      </span>
                    </div>
                  </div>
                  <div className="p-10">
                    <h3 className="text-2xl font-bold mb-5 tracking-tighter leading-tight text-white">{exp.title}</h3>
                    <div className="flex justify-between items-center mt-8">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-emerald-400/60 uppercase font-black tracking-[0.2em] mb-1">Starts at</span>
                        <span className="text-3xl font-bold text-island-emerald tracking-tighter">₱{exp.price.toLocaleString()}</span>
                      </div>
                      <div className="w-14 h-14 btn-primary rounded-2xl group-hover:scale-110">
                        <ArrowRight size={24} strokeWidth={3} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </div>

        {/* Booking Modal */}
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
                className="relative w-full max-w-2xl bg-white rounded-[4rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(2,44,34,0.5)] border-2 border-emerald-50"
              >
                <button 
                  onClick={() => setSelectedExp(null)}
                  className="absolute top-8 right-8 p-4 bg-emerald-50 rounded-full text-island-green hover:text-island-coral active:scale-90 transition-all shadow-sm"
                >
                  <X size={24} strokeWidth={3} />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="h-full relative">
                    <img src={selectedExp.image} alt={selectedExp.title} className="w-full h-full object-cover min-h-[400px]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-island-green/80 to-transparent flex flex-col justify-end p-10">
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-island-emerald mb-3">Verified Experience</span>
                      <h4 className="text-3xl font-bold text-white tracking-tighter leading-none">{selectedExp.title}</h4>
                    </div>
                  </div>

                  <div className="p-12">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-2xl">
                        <Star size={18} fill="#D97706" className="text-island-sunset" />
                        <span className="text-sm font-black text-island-green">{selectedExp.rating}</span>
                      </div>
                      <span className="text-[10px] font-black text-island-green/40 uppercase tracking-widest">{selectedExp.type}</span>
                    </div>

                    <p className="text-island-green/70 text-lg font-medium leading-relaxed mb-12">Experience the Catarman pilot platform. This landmark represents the profound heritage of our municipality.</p>

                    <div className="space-y-8">
                      <div className="flex items-center justify-between p-8 bg-emerald-50/50 rounded-[2.5rem] border border-emerald-100">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-island-green/40 uppercase tracking-widest mb-1">Total Fee</span>
                          <span className="text-4xl font-bold text-island-green tracking-tighter">₱{selectedExp.price.toLocaleString()}</span>
                        </div>
                        <ShieldCheck size={40} className="text-island-emerald opacity-30" />
                      </div>

                      {bookingStatus === 'success' ? (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex flex-col items-center gap-5 py-6 bg-emerald-50 rounded-[2.5rem] border-2 border-emerald-200"
                        >
                          <div className="w-16 h-16 btn-primary rounded-full shadow-2xl">
                            <CheckCircle2 size={36} strokeWidth={3} />
                          </div>
                          <p className="text-island-emerald font-black uppercase tracking-[0.3em] text-[10px]">Booking Verified</p>
                        </motion.div>
                      ) : (
                        <button 
                          onClick={() => handleBookExperience(selectedExp)}
                          disabled={bookingStatus === 'loading'}
                          className="btn-primary w-full py-7 rounded-[2.5rem] text-sm disabled:opacity-50"
                        >
                          {bookingStatus === 'loading' ? (
                            <RefreshCw size={24} className="animate-spin" />
                          ) : (
                            <Sparkles size={24} strokeWidth={2.5} />
                          )}
                          Reserve Now
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </section>

      {/* Integrated Map & Navigation Section */}
      <section className="py-48 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="rounded-[5rem] overflow-hidden shadow-[0_60px_100px_-20px_rgba(6,78,59,0.15)] relative aspect-square z-0 border-[16px] border-white ring-2 ring-emerald-50">
                <MapContainer 
                  center={[9.20, 124.66]} 
                  zoom={14} 
                  style={{ height: '100%', width: '100%' }}
                  scrollWheelZoom={false}
                  zoomControl={false}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {locations.map((loc) => (
                    <Marker 
                      key={loc.id} 
                      position={[loc.lat, loc.lng]} 
                      icon={customIcon}
                    >
                      <Popup>
                        <div className="p-5 min-w-[200px]">
                          <h4 className="font-bold text-island-green m-0 text-base mb-2 tracking-tight">{loc.name}</h4>
                          <div className="flex items-center gap-2.5 text-[10px] font-black text-island-emerald uppercase tracking-[0.2em]">
                            <Users size={14} />
                            {loc.visitors} active nodes
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
              
              {/* Floating Map UI */}
              <div className="absolute -right-12 top-1/4 bg-white/95 backdrop-blur-3xl p-10 rounded-[3rem] shadow-[0_30px_60px_-15px_rgba(6,78,59,0.2)] max-w-[280px] hidden md:block border border-emerald-50">
                <div className="flex items-center gap-5 mb-8">
                  <div className="w-14 h-14 rounded-2xl emerald-gradient flex items-center justify-center text-white shadow-xl">
                    <Hotel size={28} strokeWidth={2.5} />
                  </div>
                  <span className="text-base font-black uppercase tracking-[0.2em] text-island-green leading-none">Verified <br />Resorts</span>
                </div>
                <div className="space-y-4">
                  <div className="h-2.5 w-full bg-emerald-50 rounded-full"></div>
                  <div className="h-2.5 w-2/3 bg-emerald-50 rounded-full opacity-60"></div>
                </div>
                <div className="mt-10 flex -space-x-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-emerald-100 overflow-hidden shadow-xl">
                      <img src={`https://i.pravatar.cc/100?u=${i+20}`} alt="" />
                    </div>
                  ))}
                  <div className="w-10 h-10 rounded-full border-2 border-white emerald-gradient flex items-center justify-center text-[10px] font-black text-white shadow-2xl tracking-tighter">+12k</div>
                </div>
              </div>
            </motion.div>
            
            <div>
              <span className="text-island-coral font-black uppercase tracking-[0.5em] text-[10px] mb-8 block">Intelligent Pilot</span>
              <h2 className="text-6xl md:text-8xl font-bold text-island-green leading-[0.95] mb-12 tracking-tighter">
                Explore the <br /><span className="text-island-emerald">Emerald</span> <br /> heart of Catarman.
              </h2>
              <p className="text-2xl text-island-green/60 font-medium leading-relaxed mb-16 max-w-xl">
                Our pilot interactive map focuses exclusively on Catarman. Discover heritage sites and natural springs within the municipality in real-time.
              </p>
              
              <div className="space-y-10 mb-20">
                <div className="flex items-center gap-8 group">
                  <div className="w-16 h-16 rounded-[1.5rem] bg-emerald-50 flex items-center justify-center text-island-emerald border border-emerald-100 group-hover:scale-110 transition-transform shadow-lg group-hover:emerald-gradient group-hover:text-white duration-500">
                    <Waves size={32} strokeWidth={2.5} />
                  </div>
                  <div>
                    <span className="font-bold text-island-green text-xl block tracking-tight">Local Transport Pulse</span>
                    <span className="text-base text-island-green/40 font-medium italic">Real-time GPS nodes for Catarman tricycle loops</span>
                  </div>
                </div>
                <div className="flex items-center gap-8 group">
                  <div className="w-16 h-16 rounded-[1.5rem] bg-emerald-50 flex items-center justify-center text-island-coral border border-emerald-100 group-hover:scale-110 transition-transform shadow-lg group-hover:coral-gradient group-hover:text-white duration-500">
                    <Mountain size={32} strokeWidth={2.5} />
                  </div>
                  <div>
                    <span className="font-bold text-island-green text-xl block tracking-tight">Heritage Pathway Maps</span>
                    <span className="text-base text-island-green/40 font-medium italic">Curated walking trails through Catarman's old town</span>
                  </div>
                </div>
              </div>
              
              <Link to="/locations" className="btn-volcanic px-14 py-7 rounded-3xl text-sm border border-emerald-900/20">
                Launch Interactive Map <MapIcon size={24} strokeWidth={2.5} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Luxury Footer */}
      <footer className="bg-island-volcanic text-white pt-48 pb-20 relative overflow-hidden border-t border-emerald-900/30">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-island-emerald/20 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-24 mb-40">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-5 mb-12 group cursor-pointer" onClick={() => navigate('/')}>
                <div className="w-16 h-16 forest-gradient rounded-2xl flex items-center justify-center text-white shadow-3xl border border-emerald-100/10 group-hover:scale-105 transition-transform duration-700">
                  <img src="/images/logo.png" alt="Catarman eLaag Logo" className="w-12 h-12 object-contain" referrerPolicy="no-referrer" />
                </div>
                <span className="text-5xl font-serif font-bold tracking-tighter italic text-white">Catarman <span className="text-island-emerald not-italic">eLaag</span></span>
              </div>
              <p className="text-emerald-100/40 leading-relaxed font-medium text-2xl max-w-md">
                Building the emerald digital infrastructure for the world's most beautiful island destinations. Starting with Catarman.
              </p>
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.5em] mb-12 text-emerald-500/40">Tourist Portal</h4>
              <ul className="space-y-8 text-base font-bold text-emerald-100/70">
                <li><a href="#" className="hover:text-island-emerald transition-all flex items-center gap-3 group">AI Journey Planner <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" /></a></li>
                <li><a href="#" className="hover:text-island-emerald transition-all flex items-center gap-3 group">Municipal Stays <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" /></a></li>
                <li><a href="#" className="hover:text-island-emerald transition-all flex items-center gap-3 group">Heritage Market <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" /></a></li>
                <li><a href="#" className="hover:text-island-emerald transition-all flex items-center gap-3 group">Digital Access Pass <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" /></a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.5em] mb-12 text-emerald-500/40">Node Registry</h4>
              <ul className="space-y-8 text-base font-bold text-emerald-100/70">
                <li><a href="#" className="hover:text-island-emerald transition-all">Municipal Stats</a></li>
                <li><a href="#" className="hover:text-island-emerald transition-all">Safety Intelligence</a></li>
                <li><a href="#" className="hover:text-island-emerald transition-all">Business Partnering</a></li>
                <li><a href="#" className="hover:text-island-emerald transition-all">Pilot Documentation</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-24 border-t border-emerald-900/30 flex flex-col md:flex-row justify-between items-center gap-10 text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500/20">
            <p>© 2026 Catarman eLaag • Catarman Emerald Node v1.0.5</p>
            <div className="flex gap-12">
              <a href="#" className="hover:text-white transition-colors">Instagram</a>
              <a href="#" className="hover:text-white transition-colors">Facebook</a>
              <a href="#" className="hover:text-white transition-colors">Twitter</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
5