import { Search, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useTranslation } from '../hooks/useTranslation';

export function SearchBar() {
  const { searchQuery, setSearchQuery } = useStore();
  const { t } = useTranslation();

  return (
    <div className="relative w-full max-w-md">
      <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder={t('searchPlaceholder')}
        className="w-full bg-transparent border-b border-border-subtle py-2 pl-8 pr-8 text-sm font-light focus:outline-none focus:border-text-primary transition-colors placeholder:text-text-secondary/50"
      />
      {searchQuery && (
        <button 
          onClick={() => setSearchQuery('')}
          className="absolute right-0 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
