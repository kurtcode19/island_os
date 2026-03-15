import { motion } from 'motion/react';
import { ShoppingBag, Store, Search, MapPin, Star } from 'lucide-react';

const shops = [
  {
    id: 1,
    name: "Island Souvenirs",
    category: "Gifts",
    rating: 4.8,
    image: "https://picsum.photos/seed/tropical-crafts/800/600",
    description: "Best local crafts and delicacies."
  },
  {
    id: 2,
    name: "Camiguin Public Market",
    category: "Market",
    rating: 4.5,
    image: "https://picsum.photos/seed/local-market-fruit/800/600",
    description: "Fresh produce and local street food."
  },
  {
    id: 3,
    name: "Surf & Sand Shop",
    category: "Apparel",
    rating: 4.7,
    image: "https://picsum.photos/seed/beach-surf-shop/800/600",
    description: "Beachwear and surfing gear."
  }
];

export default function ShopsView() {
  return (
    <div className="min-h-screen bg-island-cream pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-12">
          <p className="text-xs font-bold text-island-emerald uppercase tracking-[0.3em] mb-3">Retail & Markets</p>
          <h1 className="text-5xl font-serif font-bold text-island-green italic">Island <span className="not-italic">Shops</span></h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {shops.map((shop) => (
            <motion.div
              key={shop.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all group"
            >
              <div className="aspect-[4/3] overflow-hidden relative">
                <img 
                  src={shop.image} 
                  alt={shop.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-bold text-island-green uppercase tracking-widest">
                  {shop.category}
                </div>
              </div>
              <div className="p-8">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-island-green">{shop.name}</h3>
                  <div className="flex items-center gap-1 text-island-emerald font-bold text-sm">
                    <Star size={14} fill="currentColor" />
                    {shop.rating}
                  </div>
                </div>
                <p className="text-slate-500 text-sm mb-6 leading-relaxed">{shop.description}</p>
                <button className="w-full py-4 bg-slate-50 text-island-green rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-island-green hover:text-white transition-all flex items-center justify-center gap-2">
                  <MapPin size={14} />
                  View on Map
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
