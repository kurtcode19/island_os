import { motion } from 'motion/react';

interface CategoryPillsProps {
  categories: { name: string; image?: string }[];
  selected: string;
  onSelect: (name: string) => void;
}

export function CategoryPills({ categories, selected, onSelect }: CategoryPillsProps) {
  return (
    <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-6 px-6">
      {categories.map((cat) => (
        <button
          key={cat.name}
          onClick={() => onSelect(cat.name)}
          className={`flex items-center gap-2.5 pl-2.5 pr-5 py-2 rounded-full transition-all border shrink-0 ${
            selected === cat.name
              ? 'bg-[var(--accent-soft)] border-[var(--accent-soft)] text-white font-bold shadow-sm'
              : 'bg-[#F3F5F7] border-transparent text-[var(--muted)] font-semibold hover:bg-gray-200'
          }`}
        >
          {cat.image && (
            <div className="w-7 h-7 rounded-full overflow-hidden border-2 border-white/50 shrink-0">
              <img src={cat.image} alt="" className="w-full h-full object-cover" />
            </div>
          )}
          <span className="text-xs whitespace-nowrap">{cat.name}</span>
        </button>
      ))}
    </div>
  );
}
