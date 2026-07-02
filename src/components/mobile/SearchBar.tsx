import { UilSearch } from '@/icons';

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (value: string) => void;
  onFilter?: () => void;
}

export function SearchBar({ placeholder = 'Search destinations', onSearch }: SearchBarProps) {
  return (
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
        <UilSearch size="18" />
      </div>
      <input
        type="text"
        placeholder={placeholder}
        onChange={(e) => onSearch?.(e.target.value)}
        className="w-full h-11 pl-11 pr-4 bg-gray-100 rounded-full text-sm font-medium text-gray-900 outline-none focus:ring-2 focus:ring-gray-300 transition-all placeholder:text-gray-400"
      />
    </div>
  );
}
