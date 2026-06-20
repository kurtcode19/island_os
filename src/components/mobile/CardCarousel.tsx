import { motion } from 'motion/react';
import { Star, Heart, MapPin } from '@phosphor-icons/react';

interface CardItem {
  id: number;
  name: string;
  category: string;
  rating: number;
  price?: number;
  image: string;
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
      className="shrink-0 w-[170px] h-[220px] rounded-[20px] overflow-hidden relative cursor-pointer shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-lg)] transition-shadow"
    >
      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      <button
        onClick={(e) => { e.stopPropagation(); }}
        aria-label="Favorite"
        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white"
      >
        <Heart size={14} />
      </button>
      <div className="absolute bottom-3 left-3 right-3">
        <div className="flex items-center gap-1 text-white/80 text-[10px] font-semibold mb-1">
          <MapPin size={10} />
          <span>{item.category}</span>
        </div>
        <h4 className="text-white font-bold text-sm leading-tight">{item.name}</h4>
        <div className="flex items-center gap-1 mt-1">
          <Star size={10} fill="#FFD166" className="text-[#FFD166]" />
          <span className="text-white/90 text-[10px] font-semibold">{item.rating}</span>
        </div>
      </div>
    </motion.div>
  );
}

export function CardCarousel({ items, onCardClick, title }: CardCarouselProps) {
  return (
    <div>
      {title && (
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-black text-[var(--text)] tracking-tighter">{title}</h3>
          <button className="text-[10px] font-bold text-[var(--accent-start)] uppercase tracking-widest">View All</button>
        </div>
      )}
      <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-6 px-6 pb-2">
        {items.map((item) => (
          <Card key={item.id} item={item} onClick={() => onCardClick(item)} />
        ))}
      </div>
    </div>
  );
}
