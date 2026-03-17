import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Calendar, Compass, Hotel, Ship, Utensils, Map as MapIcon, ArrowRight, Star, ShieldCheck, Waves, Mountain, Palmtree } from 'lucide-react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icon issue in Leaflet with React
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const experiences = [
  { id: 1, title: 'White Island Sandbar', type: 'Island Hopping', rating: 4.9, price: '₱1,500', image: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/15/61/b8/e7/white-island-is-an-uninhabited.jpg?w=700&h=-1&s=1' },
  { id: 2, title: 'Sunken Cemetery Diving', type: 'Diving', rating: 4.8, price: '₱2,500', image: 'https://eazytraveler.net/wp-content/uploads/2013/12/11264466243_993705526b_z.jpg' },
  { id: 3, title: 'Hibok-Hibok Volcano Hike', type: 'Adventure', rating: 4.7, price: '₱3,000', image: 'https://i.pinimg.com/564x/fe/75/c7/fe75c770631bcf5c9f1a93086ea071d3.jpg' },
  { id: 4, title: 'Katibawasan Falls', type: 'Nature', rating: 4.9, price: '₱500', image: 'https://chrisandwrensworld.com/wp-content/uploads/2025/04/katibawasan-falls.jpeg' },
];

const features = [
  { title: 'Smart Trip Planner', description: 'AI-powered itinerary builder that suggests resorts, tours, and restaurants.', icon: Compass, color: 'bg-island-ocean' },
  { title: 'Integrated Booking', description: 'Book resorts, homestays, tour packages, and island transport in one place.', icon: Hotel, color: 'bg-island-emerald' },
  { title: 'Experiences Marketplace', description: 'Browse diving tours, volcano hikes, and local food tours.', icon: Utensils, color: 'bg-island-coral' },
  { title: 'Digital Tourist Pass', description: 'QR code pass for attractions, transportation, and events.', icon: ShieldCheck, color: 'bg-purple-500' },
];

export default function LandingView() {
  return (
    <div className="relative overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://www.projectlupad.com/wp-content/uploads/2022/07/Mantigue-Island-Camiguin-Philippines-Aerial-View-Copyright-to-Project-LUPAD-5-1024x767.jpg" 
            alt="Camiguin Landscape" 
            className="w-full h-full object-cover brightness-[0.6] contrast-[1.1] saturate-[0.8]"
            referrerPolicy="no-referrer"
          />
          {/* Enhanced Gradient Overlay: Darker on the left for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-island-volcanic/90 via-island-volcanic/40 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-island-cream/20 via-transparent to-transparent"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-island-volcanic/60 backdrop-blur-md border border-white/20 text-white text-sm font-bold mb-6">
                <span className="w-2 h-2 rounded-full bg-island-coral animate-pulse"></span>
                The Island Born of Fire
              </div>
              <h1 className="text-6xl md:text-8xl font-serif font-bold text-white leading-[0.9] mb-8 italic drop-shadow-2xl">
                Explore <br />
                <span className="text-island-sunset not-italic">Camiguin</span> <br />
                Smarter.
              </h1>
              <p className="text-xl text-white/80 mb-10 leading-relaxed font-light max-w-lg drop-shadow-md">
                Discover the mystical beauty of the Philippines' most volcanic island through a seamless digital experience.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link to="/pass" className="px-10 py-5 island-gradient text-white rounded-full font-bold transition-all shadow-xl shadow-island-emerald/20 flex items-center gap-3 group">
                  Start Your Journey <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/stay" className="px-10 py-5 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/30 rounded-full font-bold transition-all">
                  Book a Stay
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="hidden lg:block relative"
            >
              <div className="relative z-10 rounded-[3rem] overflow-hidden border-8 border-white/10 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-700">
                <img src="https://www.projectlupad.com/wp-content/uploads/2022/07/Mantigue-Island-Camiguin-Philippines-Aerial-View-Copyright-to-Project-LUPAD-5-1024x767.jpg" alt="Mantigue Island" className="w-full aspect-[4/5] object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-island-coral rounded-full blur-3xl opacity-30"></div>
              <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-island-emerald rounded-full blur-3xl opacity-20"></div>
            </motion.div>
          </div>

          {/* Search Bar Overlay */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-20 bg-white p-3 rounded-[2.5rem] shadow-2xl max-w-5xl mx-auto flex flex-wrap md:flex-nowrap gap-2 items-center border border-white/20"
          >
            <div className="flex-1 flex items-center gap-4 px-6 py-4 rounded-3xl hover:bg-slate-50 transition-colors cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-island-emerald/10 flex items-center justify-center text-island-emerald">
                <MapPin size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-island-green/60 uppercase tracking-widest">Location</span>
                <input type="text" placeholder="Where to?" className="text-island-volcanic font-bold outline-none bg-transparent placeholder:text-slate-400" />
              </div>
            </div>
            <div className="w-px h-10 bg-slate-200 hidden md:block"></div>
            <div className="flex-1 flex items-center gap-4 px-6 py-4 rounded-3xl hover:bg-slate-50 transition-colors cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-island-coral/10 flex items-center justify-center text-island-coral">
                <Calendar size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-island-green/60 uppercase tracking-widest">Dates</span>
                <input type="text" placeholder="Add dates" className="text-island-volcanic font-bold outline-none bg-transparent placeholder:text-slate-400" />
              </div>
            </div>
            <div className="w-px h-10 bg-slate-200 hidden md:block"></div>
            <div className="flex-1 flex items-center gap-4 px-6 py-4 rounded-3xl hover:bg-slate-50 transition-colors cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-island-ocean/10 flex items-center justify-center text-island-ocean">
                <Compass size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-island-green/60 uppercase tracking-widest">Activity</span>
                <input type="text" placeholder="What to do?" className="text-island-volcanic font-bold outline-none bg-transparent placeholder:text-slate-400" />
              </div>
            </div>
            <button className="island-gradient p-5 rounded-[2rem] text-white hover:shadow-lg hover:shadow-island-emerald/30 transition-all">
              <Search size={24} />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 bg-island-cream relative">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-transparent to-island-cream -translate-y-full"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-center mb-24">
            <div className="lg:col-span-1">
              <span className="text-island-coral font-bold uppercase tracking-[0.2em] text-xs mb-4 block">The Ecosystem</span>
              <h2 className="text-5xl md:text-6xl font-serif font-bold text-island-green leading-tight mb-6 italic">
                The Operating <br /> System for <br /> <span className="not-italic text-island-emerald">IsleGO</span>
              </h2>
            </div>
            <div className="lg:col-span-2">
              <p className="text-xl text-slate-500 font-light leading-relaxed">
                IsleGO connects every touchpoint of your journey. From the moment you land to your final sunset, we ensure the island's magic is just a tap away.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -10 }}
                className="p-10 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all group"
              >
                <div className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg group-hover:scale-110 transition-transform`}>
                  <feature.icon size={28} />
                </div>
                <h3 className="text-2xl font-serif font-bold text-island-green mb-4">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed font-light">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Marketplace Section */}
      <section className="py-32 bg-island-green text-white rounded-[4rem] mx-4 my-8 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/3 h-full opacity-10 pointer-events-none">
          <Palmtree size={400} className="absolute -top-20 -right-20 rotate-12" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div className="max-w-xl">
              <span className="text-island-emerald font-bold uppercase tracking-[0.2em] text-xs mb-4 block">Handpicked for you</span>
              <h2 className="text-5xl md:text-6xl font-serif font-bold mb-6 italic">Island <span className="not-italic text-island-emerald">Experiences</span></h2>
              <p className="text-emerald-100/60 font-light text-lg">Curated adventures that capture the soul of Camiguin.</p>
            </div>
            <button className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full font-bold flex items-center gap-3 transition-all">
              Explore All <ArrowRight size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {experiences.map((exp) => (
              <motion.div 
                key={exp.id}
                whileHover={{ y: -15 }}
                className="group bg-white/5 backdrop-blur-sm rounded-[3rem] overflow-hidden border border-white/10 hover:bg-white/10 transition-all"
              >
                <div className="relative h-72 overflow-hidden">
                  <img 
                    src={exp.image} 
                    alt={exp.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-6 right-6 px-4 py-2 glass rounded-full text-xs font-bold flex items-center gap-2 text-island-green">
                    <Star size={14} className="text-island-sunset fill-island-sunset" /> {exp.rating}
                  </div>
                  <div className="absolute bottom-6 left-6">
                    <span className="px-3 py-1 bg-island-coral text-white text-[10px] font-bold rounded-full uppercase tracking-widest">
                      {exp.type}
                    </span>
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-serif font-bold mb-4">{exp.title}</h3>
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-xs text-emerald-100/50 uppercase font-bold tracking-wider">Starts at</span>
                      <span className="text-xl font-bold">{exp.price}</span>
                    </div>
                    <button className="w-12 h-12 island-gradient rounded-2xl flex items-center justify-center text-white shadow-lg shadow-island-emerald/20">
                      <ArrowRight size={20} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Map Teaser */}
      <section className="py-32 bg-island-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="relative">
              <div className="rounded-[4rem] overflow-hidden shadow-2xl relative aspect-square z-0">
                <MapContainer 
                  center={[9.22, 124.68]} 
                  zoom={11} 
                  style={{ height: '100%', width: '100%' }}
                  scrollWheelZoom={false}
                  zoomControl={false}
                  dragging={false}
                  doubleClickZoom={false}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[9.2014, 124.6675]} icon={customIcon} />
                  <Marker position={[9.2500, 124.6500]} icon={customIcon} />
                </MapContainer>
                <div className="absolute inset-0 bg-island-green/10 pointer-events-none"></div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl animate-bounce">
                    <MapPin size={40} className="text-island-coral" />
                  </div>
                </div>
              </div>
              {/* Floating UI Elements */}
              <div className="absolute -right-10 top-20 glass p-6 rounded-3xl shadow-xl max-w-[200px] hidden md:block">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-island-emerald/10 flex items-center justify-center text-island-emerald">
                    <Hotel size={16} />
                  </div>
                  <span className="text-xs font-bold">Resorts</span>
                </div>
                <div className="space-y-2">
                  <div className="h-1.5 w-full bg-slate-100 rounded-full"></div>
                  <div className="h-1.5 w-2/3 bg-slate-100 rounded-full"></div>
                </div>
              </div>
            </div>
            
            <div>
              <span className="text-island-coral font-bold uppercase tracking-[0.2em] text-xs mb-4 block">Navigation</span>
              <h2 className="text-5xl md:text-6xl font-serif font-bold text-island-green leading-tight mb-8 italic">
                Navigate the <br /> <span className="not-italic text-island-emerald">Island Born of Fire</span>
              </h2>
              <p className="text-xl text-slate-500 font-light leading-relaxed mb-10">
                Our interactive map isn't just a guide—it's your personal concierge. Find hidden springs, track ferry schedules, and discover the island's best-kept secrets in real-time.
              </p>
              <div className="space-y-6 mb-12">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-island-emerald/10 flex items-center justify-center text-island-emerald">
                    <Waves size={20} />
                  </div>
                  <span className="font-bold text-island-green">Real-time Ferry & Transport Tracking</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-island-coral/10 flex items-center justify-center text-island-coral">
                    <Mountain size={20} />
                  </div>
                  <span className="font-bold text-island-green">Offline Trail Maps for Volcano Hikes</span>
                </div>
              </div>
              <Link to="/locations" className="px-10 py-5 island-gradient text-white rounded-full font-bold transition-all shadow-xl shadow-island-emerald/20 inline-flex items-center gap-3">
                Open Interactive Map <MapIcon size={20} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-island-volcanic text-white py-32 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-full h-1 bg-island-emerald"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-24">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-3 mb-8">
                <img src="/logo.png" alt="IsleGO Logo" className="w-12 h-12 object-contain rounded-xl" referrerPolicy="no-referrer" />
                <span className="text-3xl font-serif font-bold tracking-tight italic">Isle<span className="text-island-emerald not-italic">GO</span></span>
              </div>
              <p className="text-slate-400 leading-relaxed font-light text-lg">
                Building the digital infrastructure for the world's most beautiful island destinations.
              </p>
            </div>
            <div>
              <h4 className="font-serif text-xl font-bold mb-8 italic text-island-emerald">For Tourists</h4>
              <ul className="space-y-4 text-slate-400 font-light">
                <li><a href="#" className="hover:text-island-emerald transition-colors">Plan Your Trip</a></li>
                <li><a href="#" className="hover:text-island-emerald transition-colors">Book a Resort</a></li>
                <li><a href="#" className="hover:text-island-emerald transition-colors">Island Experiences</a></li>
                <li><a href="#" className="hover:text-island-emerald transition-colors">Tourist Pass</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-serif text-xl font-bold mb-8 italic text-island-emerald">For Partners</h4>
              <ul className="space-y-4 text-slate-400 font-light">
                <li><a href="#" className="hover:text-island-emerald transition-colors">List Your Property</a></li>
                <li><a href="#" className="hover:text-island-emerald transition-colors">Operator Dashboard</a></li>
                <li><a href="#" className="hover:text-island-emerald transition-colors">Guide Portal</a></li>
                <li><a href="#" className="hover:text-island-emerald transition-colors">Partner Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-serif text-xl font-bold mb-8 italic text-island-emerald">Connect</h4>
              <ul className="space-y-4 text-slate-400 font-light">
                <li><a href="#" className="hover:text-island-emerald transition-colors">About Camiguin</a></li>
                <li><a href="#" className="hover:text-island-emerald transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-island-emerald transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-island-emerald transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-slate-500 text-sm font-light">
            <p>© 2026 IsleGO. Built for the Island Born of Fire.</p>
            <div className="flex gap-8">
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
