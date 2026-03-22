import { useState, useRef, useEffect, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { cn } from './Navbar';
import { ChevronDown, Search, X, Tag } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { motion, AnimatePresence } from 'motion/react';

export function TagFilter() {
  const { knowledgeList, selectedTags, toggleTag } = useStore();
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get all tags with count
  const tagData = useMemo(() => {
    const tagCount: Record<string, number> = {};
    const tagLastUsed: Record<string, string> = {};

    knowledgeList.forEach(item => {
      item.tags.forEach(tag => {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
        if (!tagLastUsed[tag] || item.createdAt > tagLastUsed[tag]) {
          tagLastUsed[tag] = item.createdAt;
        }
      });
    });

    const allTags = Object.keys(tagCount);

    // Sort by count for common tags
    const commonTags = [...allTags].sort((a, b) => tagCount[b] - tagCount[a]).slice(0, 5);

    // Sort by last used for recent tags
    const recentTags = [...allTags].sort((a, b) => tagLastUsed[b].localeCompare(tagLastUsed[a])).slice(0, 5);

    return { allTags, commonTags, recentTags, tagCount };
  }, [knowledgeList]);

  // Filter tags by search
  const filteredTags = useMemo(() => {
    if (!searchQuery.trim()) return tagData.allTags;
    return tagData.allTags.filter(tag =>
      tag.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tagData.allTags, searchQuery]);

  // Display tags (when collapsed)
  const displayTags = useMemo(() => {
    // Show selected tags first, then common tags
    const tags = [...selectedTags];
    tagData.commonTags.forEach(tag => {
      if (!tags.includes(tag) && tags.length < 6) {
        tags.push(tag);
      }
    });
    return tags;
  }, [selectedTags, tagData.commonTags]);

  if (tagData.allTags.length === 0) return null;

  const TagButton = ({ tag, size = 'normal' }: { tag: string; size?: 'normal' | 'small' }) => {
    const isSelected = selectedTags.includes(tag);
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleTag(tag);
        }}
        className={cn(
          "rounded-md transition-all duration-200 border whitespace-nowrap font-medium",
          size === 'small' ? 'text-[10px] px-2 py-1' : 'text-xs px-3 py-1.5',
          isSelected
            ? "bg-text-primary text-bg-primary border-text-primary"
            : "bg-transparent text-text-secondary border-border-subtle hover:border-text-primary hover:text-text-primary hover:scale-105"
        )}
      >
        {tag}
        {tagData.tagCount[tag] > 1 && (
          <span className={cn(
            "ml-1.5 opacity-60",
            size === 'small' ? 'text-[9px]' : 'text-[10px]'
          )}>
            {tagData.tagCount[tag]}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="mt-6 relative" ref={containerRef}>
      {/* Collapsed view */}
      <div className="flex items-center gap-2 flex-wrap">
        {displayTags.map(tag => (
          <TagButton key={tag} tag={tag} />
        ))}

        {/* Expand button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 border",
            isExpanded
              ? "bg-text-primary text-bg-primary border-text-primary"
              : "text-text-secondary border-border-subtle hover:border-text-primary hover:text-text-primary"
          )}
        >
          <Tag className="w-3 h-3" />
          {tagData.allTags.length > displayTags.length && (
            <span>+{tagData.allTags.length - displayTags.length}</span>
          )}
          <ChevronDown className={cn(
            "w-3 h-3 transition-transform duration-200",
            isExpanded && "rotate-180"
          )} />
        </button>

        {/* Clear all button */}
        {selectedTags.length > 0 && (
          <button
            onClick={() => selectedTags.forEach(tag => toggleTag(tag))}
            className="flex items-center gap-1 px-2 py-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors"
          >
            <X className="w-3 h-3" />
            {t('cancel')}
          </button>
        )}
      </div>

      {/* Expanded dropdown */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="absolute top-full left-0 right-0 mt-2 bg-bg-primary border border-border-subtle rounded-xl shadow-xl z-50 overflow-hidden"
            style={{ minWidth: '320px' }}
          >
            {/* Search */}
            <div className="p-3 border-b border-border-subtle">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                <input
                  type="text"
                  placeholder={t('searchTags')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-bg-secondary/50 border border-border-subtle rounded-lg text-sm focus:outline-none focus:border-text-secondary transition-colors"
                  autoFocus
                />
              </div>
            </div>

            {/* Tag sections */}
            <div className="max-h-64 overflow-y-auto custom-scrollbar">
              {searchQuery ? (
                // Search results
                <div className="p-3">
                  {filteredTags.length === 0 ? (
                    <div className="text-sm text-text-secondary text-center py-4">
                      {t('noTagsFound')}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {filteredTags.map(tag => (
                        <TagButton key={tag} tag={tag} size="small" />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {/* Common tags */}
                  <div className="p-3 border-b border-border-subtle">
                    <div className="text-[10px] uppercase tracking-wider text-text-secondary font-medium mb-2">
                      {t('commonTags')}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {tagData.commonTags.map(tag => (
                        <TagButton key={tag} tag={tag} size="small" />
                      ))}
                    </div>
                  </div>

                  {/* Recent tags */}
                  <div className="p-3 border-b border-border-subtle">
                    <div className="text-[10px] uppercase tracking-wider text-text-secondary font-medium mb-2">
                      {t('recentTags')}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {tagData.recentTags.map(tag => (
                        <TagButton key={tag} tag={tag} size="small" />
                      ))}
                    </div>
                  </div>

                  {/* All tags */}
                  <div className="p-3">
                    <div className="text-[10px] uppercase tracking-wider text-text-secondary font-medium mb-2">
                      {t('allTags')}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {tagData.allTags.map(tag => (
                        <TagButton key={tag} tag={tag} size="small" />
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
