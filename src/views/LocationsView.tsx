import { motion } from 'motion/react';
import { MapPin, Compass, Navigation, Info, Star } from 'lucide-react';

const locations = [
  {
    id: 1,
    name: "Sunken Cemetery",
    type: "Historical",
    image: "https://eazytraveler.net/wp-content/uploads/2013/12/11264466243_993705526b_z.jpg",
    coords: "9.2014° N, 124.6675° E"
  },
  {
    id: 2,
    name: "Old Spanish Church Ruins",
    type: "Historical",
    image: "https://files01.pna.gov.ph/source/2024/05/06/camiguin-old-church-ruins-05032024jb.jpg",
    coords: "9.2123° N, 124.6543° E"
  },
  {
    id: 3,
    name: "Ardent Hot Springs",
    type: "Nature",
    image: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiQaP43OAXTNmtHca_inwoebHilEDuksnsxWraO6nUciaZfzozMtkYgNDHrDIOvov6iDJuk5qUsCIXE00PE8JFffm2L1JePVPp9dwkmiTUgXwXkx0s8nXBavOUOKIeIpT-CKzYwowm0Tv0/w1200-h630-p-k-no-nu/geejay-travel-log-ardent-hot-spring-camiguin-09.jpg",
    coords: "9.2234° N, 124.6789° E"
  }
];

export default function LocationsView() {
  return (
    <div className="min-h-screen bg-island-cream pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-12">
          <p className="text-xs font-bold text-island-emerald uppercase tracking-[0.3em] mb-3">Points of Interest</p>
          <h1 className="text-5xl font-serif font-bold text-island-green italic">Island <span className="not-italic">Locations</span></h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {locations.map((loc) => (
            <motion.div
              key={loc.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-white rounded-[3rem] overflow-hidden border border-slate-100 shadow-sm flex flex-col md:flex-row"
            >
              <div className="md:w-1/2 aspect-video md:aspect-auto relative">
                <img 
                  src={loc.image} 
                  alt={loc.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-10 md:w-1/2 flex flex-col justify-center">
                <div className="px-3 py-1 bg-island-emerald/10 text-island-emerald rounded-full text-[10px] font-bold uppercase tracking-widest w-fit mb-4">
                  {loc.type}
                </div>
                <h3 className="text-2xl font-bold text-island-green mb-2">{loc.name}</h3>
                <div className="flex items-center gap-2 text-slate-400 text-xs font-mono mb-8">
                  <MapPin size={14} />
                  {loc.coords}
                </div>
                <div className="flex gap-3">
                  <button className="flex-1 py-4 bg-island-green text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-island-emerald transition-all flex items-center justify-center gap-2">
                    <Navigation size={14} />
                    Directions
                  </button>
                  <button className="w-14 h-14 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:text-island-green transition-all">
                    <Info size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
