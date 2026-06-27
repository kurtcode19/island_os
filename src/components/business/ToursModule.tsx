import { motion } from 'motion/react';
import { UilCompass as Compass, UilPlus as Plus, UilSearch as Search, UilFilter as Filter, UilAngleRightB as ChevronRight, UilUsersAlt as Users, UilClock as Clock, UilMapMarker as MapPin, UilStar as Star, UilArrowRight as ArrowRight } from '@/icons';

const tours = [
  { id: 'TR-101', name: 'Sunken Cemetery Dive', category: 'Diving', duration: '3h', guests: 4, maxGuests: 8, price: '₱2,500', rating: 4.9, status: 'Active', image: '/images/hero-sunken.png' },

  { id: 'TR-104', name: 'Katibawasan Falls Tour', category: 'Nature', duration: '2h', guests: 0, maxGuests: 10, price: '₱500', rating: 4.9, status: 'Draft', image: '/images/Katibawasan Falls – the tallest waterfall on Camiguin.jpg' },
];

export default function ToursModule() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size="18" />
            <input 
              type="text" 
              placeholder="Search tours..." 
              className="pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-island-emerald/5 transition-all w-full md:w-72 shadow-sm"
            />
          </div>
          <button className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-600 hover:bg-slate-50 shadow-sm">
            <Filter size="20" />
          </button>
        </div>
        <button className="flex items-center gap-2 px-8 py-4 btn-primary">
          <Plus size="20" /> Create New Tour
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {tours.map((tour, idx) => (
          <motion.div 
            key={tour.id}
            initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col md:flex-row group"
          >
            <div className="md:w-48 h-48 md:h-auto relative overflow-hidden">
              <img 
                src={tour.image} 
                alt={tour.name} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-bold text-island-green flex items-center gap-1">
                <Star size="12" className="text-island-sunset fill-island-sunset" /> {tour.rating}
              </div>
            </div>
            <div className="flex-1 p-8 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="px-3 py-1 bg-island-emerald/10 text-island-emerald text-[10px] font-bold rounded-full uppercase tracking-widest">
                    {tour.category}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                    tour.status === 'Active' ? 'bg-island-emerald/10 text-island-emerald' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {tour.status}
                  </span>
                </div>
                <h3 className="text-2xl font-serif font-bold text-island-green mb-4 group-hover:text-island-emerald transition-colors">{tour.name}</h3>
                <div className="flex flex-wrap gap-6 text-xs text-slate-400 font-bold uppercase tracking-widest">
                  <div className="flex items-center gap-2"><Clock size="14" /> {tour.duration}</div>
                  <div className="flex items-center gap-2"><Users size="14" /> {tour.guests} / {tour.maxGuests} guests</div>
                </div>
              </div>
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-50">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Price per person</span>
                  <span className="text-xl font-bold text-island-green">{tour.price}</span>
                </div>
                <button className="w-12 h-12 btn-primary shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                  <ArrowRight size="20" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
