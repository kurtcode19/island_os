import { motion } from 'motion/react';
import { ShoppingBag, Store, Search, MapPin, Star, Sparkles } from 'lucide-react';

const shops = [
  {
    id: 1,
    name: "Catarman Crafts",
    category: "Gifts",
    rating: 4.8,
    image: "https://picsum.photos/seed/local-souvenirs-crafts/800/600",
    description: "Best local crafts and delicacies from the heart of Catarman."
  },
  {
    id: 2,
    name: "Municipal Public Market",
    category: "Market",
    rating: 4.5,
    image: "https://picsum.photos/seed/tropical-market-fruits/800/600",
    description: "Fresh produce and local street food node."
  },
  {
    id: 3,
    name: "Island Node Boutique",
    category: "Apparel",
    rating: 4.7,
    image: "https://picsum.photos/seed/surf-shop-beach/800/600",
    description: "Verified island wear and gear."
  }
];

export default function ShopsView() {
  return (
    <div className="min-h-screen bg-[#F0FDF4] pb-40 selection:bg-island-emerald/20">
      <div className="max-w-7xl mx-auto px-6 py-20">
        <header className="mb-16">
          <span className="text-xs font-bold text-island-emerald tracking-wider mb-3 block">Local Shops</span>
          <h1 className="text-6xl font-black text-island-volcanic tracking-tighter">Verified <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-island-emerald to-island-volcanic">Marketplace.</span></h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {shops.map((shop) => (
            <motion.div
              key={shop.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-[3.5rem] overflow-hidden border-2 border-slate-100 shadow-xl hover:shadow-2xl transition-all duration-500 group p-5"
            >
              <div className="aspect-[4/3] rounded-[2.5rem] overflow-hidden relative mb-8">
                <img 
                  src={shop.image} 
                  alt={shop.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-6 right-6 px-4 py-1.5 bg-white/95 backdrop-blur-xl rounded-full text-[10px] font-bold text-island-volcanic tracking-wider shadow-lg border border-slate-100">
                  {shop.category}
                </div>
              </div>
              <div className="px-4 pb-4">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-black text-island-volcanic tracking-tighter">{shop.name}</h3>
                  <div className="flex items-center gap-1.5 text-island-emerald font-black text-sm">
                    <Star size={16} fill="currentColor" />
                    {shop.rating}
                  </div>
                </div>
                <p className="text-slate-500 font-medium text-sm mb-10 leading-relaxed">{shop.description}</p>
                <button className="btn-volcanic w-full py-5 rounded-2xl">
                  <MapPin size={18} strokeWidth={3} />
                  View Location
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
