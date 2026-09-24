import { useState } from 'react';
import { motion } from 'motion/react';
import { UilStar, UilHeart } from '@/icons';

const FAV_KEY = 'island_favorites';

export function getFavorites(): string[] {
  try { return JSON.parse(localStorage.getItem(FAV_KEY) || '[]'); } catch { return []; }
}

export function toggleFavorite(id: string | number): string[] {
  const key = String(id);
  const next = getFavorites().includes(key)
    ? getFavorites().filter(x => x !== key)
    : [...getFavorites(), key];
  localStorage.setItem(FAV_KEY, JSON.stringify(next));
  return next;
}

export function FavoriteButton({ id, className = '' }: { id: string | number; className?: string }) {
  const [fav, setFav] = useState(getFavorites().includes(String(id)));
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        toggleFavorite(id);
        setFav(getFavorites().includes(String(id)));
      }}
      aria-label="Save to favorites"
      className={`w-8 h-8 rounded-full backdrop-blur-sm flex items-center justify-center hover:scale-105 transition-all shadow-sm ${fav ? 'bg-rose-500 text-white' : 'bg-white/80 text-gray-700 hover:bg-white'} ${className}`}
    >
      <UilHeart size="15" className={fav ? 'fill-white' : ''} />
    </button>
  );
}

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
  const [fav, setFav] = useState(getFavorites().includes(String(item.id)));
  return (
    <motion.div
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="shrink-0 w-44 rounded-2xl overflow-hidden cursor-pointer bg-white shadow-sm border border-gray-100"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(item.id);
            setFav(getFavorites().includes(String(item.id)));
          }}
          className={`absolute top-2.5 right-2.5 w-7 h-7 rounded-full backdrop-blur-sm flex items-center justify-center transition-all shadow-sm ${fav ? 'bg-rose-500 text-white' : 'bg-white/80 text-gray-700 hover:bg-white'}`}
          aria-label="Save to favorites"
        >
          <UilHeart size="13" className={fav ? 'fill-white' : ''} />
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
