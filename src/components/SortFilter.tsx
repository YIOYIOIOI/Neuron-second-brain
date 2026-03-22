import { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { useTranslation } from '../hooks/useTranslation';
import { Clock, ArrowDownAZ, ArrowUpZA, History, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function SortFilter() {
  const { sortBy, setSortBy } = useStore();
  const { language } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const options = [
    { value: 'recent' as const, icon: Clock, labelEn: 'Recent', labelZh: '最新' },
    { value: 'oldest' as const, icon: History, labelEn: 'Oldest', labelZh: '最早' },
    { value: 'title-asc' as const, icon: ArrowDownAZ, labelEn: 'A-Z', labelZh: '名称 (A-Z)' },
    { value: 'title-desc' as const, icon: ArrowUpZA, labelEn: 'Z-A', labelZh: '名称 (Z-A)' },
  ];

  const currentOption = options.find(o => o.value === sortBy) || options[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-colors bg-bg-secondary text-text-secondary hover:bg-border-subtle"
      >
        <currentOption.icon className="w-3.5 h-3.5" />
        <span>{language === 'zh' ? currentOption.labelZh : currentOption.labelEn}</span>
        <ChevronDown className="w-3 h-3 ml-1 opacity-50" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 mt-1 w-36 bg-bg-primary border border-border-subtle shadow-lg rounded-lg overflow-hidden z-50"
          >
            {options.map(option => (
              <button
                key={option.value}
                onClick={() => {
                  setSortBy(option.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors ${
                  sortBy === option.value
                    ? 'bg-accent/10 text-accent'
                    : 'hover:bg-bg-secondary text-text-primary'
                }`}
              >
                <option.icon className="w-3.5 h-3.5" />
                {language === 'zh' ? option.labelZh : option.labelEn}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}