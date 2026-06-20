import { MagnifyingGlass, Sliders } from '@phosphor-icons/react';

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (value: string) => void;
  onFilter?: () => void;
}

export function SearchBar({ placeholder = 'Search destination, place', onSearch, onFilter }: SearchBarProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex-1">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]">
          <MagnifyingGlass size={18} />
        </div>
        <input
          type="text"
          placeholder={placeholder}
          onChange={(e) => onSearch?.(e.target.value)}
          className="w-full h-12 pl-11 pr-4 bg-[#F3F5F7] rounded-full text-sm font-semibold text-[var(--text)] outline-none focus:ring-2 focus:ring-[var(--accent-start)]/20 transition-all placeholder:text-[var(--muted)]/50"
        />
      </div>
      {onFilter && (
        <button
          onClick={onFilter}
          aria-label="Filter"
          className="w-11 h-11 rounded-full bg-white border border-gray-100 flex items-center justify-center text-[var(--muted)] shadow-sm active:scale-90 transition-all shrink-0"
        >
          <Sliders size={18} />
        </button>
      )}
    </div>
  );
}
