import { motion } from 'motion/react';
import { UilStar, UilHeart } from '@/icons';

interface CardItem {
  id: number;
  name: string;
  category: string;
  rating: number;
  price?: number;
  image: string;
  distance?: string;
}

interface CardCarouselProps {
  items: CardItem[];
  onCardClick: (item: CardItem) => void;
  title?: string;
}

function Card({ item, onClick }: { item: CardItem; onClick: () => void }) {
  return (
    <motion.div
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="shrink-0 w-44 rounded-2xl overflow-hidden cursor-pointer bg-white shadow-sm border border-gray-100"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
        <button
          onClick={(e) => { e.stopPropagation(); }}
          className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-gray-700 hover:bg-white transition-all shadow-sm"
        >
          <UilHeart size="13" />
        </button>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <span key={i} className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-white' : 'bg-white/40'}`} />
          ))}
        </div>
      </div>
      <div className="px-3 pt-2 pb-3 space-y-0.5">
        <div className="flex items-start justify-between">
          <h4 className="text-sm font-semibold text-gray-900 leading-tight truncate">{item.name}</h4>
          <div className="flex items-center gap-0.5 shrink-0 ml-1">
            <UilStar size="10" className="text-amber-500" />
            <span className="text-[11px] font-semibold text-gray-700">{item.rating}</span>
          </div>
        </div>
        <p className="text-[11px] text-gray-500">{item.distance || item.category}</p>
        <div className="pt-0.5">
          <span className="text-xs font-semibold text-gray-900">₱{item.price?.toLocaleString()}</span>
          <span className="text-[10px] text-gray-500"> night</span>
        </div>
      </div>
    </motion.div>
  );
}

export function CardCarousel({ items, onCardClick, title }: CardCarouselProps) {
  return (
    <div>
      {title && (
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xl font-bold text-gray-900 tracking-tight">{title}</h3>
          <button className="text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors">View All</button>
        </div>
      )}
      <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-6 px-6 pb-1">
        {items.map((item) => (
          <Card key={item.id} item={item} onClick={() => onCardClick(item)} />
        ))}
      </div>
    </div>
  );
}
