import { useEffect, useRef, useMemo, useState } from 'react';
import { useStore } from '../store/useStore';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { KnowledgeCard } from '../components/KnowledgeCard';
import { SearchBar } from '../components/SearchBar';
import { TagFilter } from '../components/TagFilter';
import { TypeFilter } from '../components/TypeFilter';
import { SortFilter } from '../components/SortFilter';
import { FolderSidebar } from '../components/FolderSidebar';
import { PinnedCardsSidebar } from '../components/PinnedCardsSidebar';
import { useTranslation } from '../hooks/useTranslation';
import { motion, AnimatePresence } from 'motion/react';

gsap.registerPlugin(ScrollTrigger);

export default function Dashboard() {
  const { knowledgeList, searchQuery, selectedTags, activeFolderId, setActiveFolderId, folders, sidebarCollapsed, knowledgeTypeFilter, sortBy, navbarWidth, folderSidebarWidth, setFolderSidebarWidth } = useStore();
  const { t, language } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSidebar, setShowSidebar] = useState(() => {
    const saved = localStorage.getItem('dashboardSidebarVisible');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    localStorage.setItem('dashboardSidebarVisible', JSON.stringify(showSidebar));
  }, [showSidebar]);

  // Auto-hide sidebar on narrow screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1280) {
        setShowSidebar(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate the left position based on main Navbar state
  const actualNavbarWidth = sidebarCollapsed ? 64 : navbarWidth;

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = Math.max(180, Math.min(400, e.clientX - actualNavbarWidth));
      setFolderSidebarWidth(newWidth);
    };

    const handleMouseUp = () => setIsResizing(false);

    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, actualNavbarWidth, setFolderSidebarWidth]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  const filteredList = useMemo(() => {
    const filtered = knowledgeList.filter(item => {
      // Folder filter
      if (activeFolderId === 'uncategorized') {
        if (item.folderId) return false;
      } else if (activeFolderId !== null) {
        if (item.folderId !== activeFolderId) return false;
      }

      // Type filter
      if (knowledgeTypeFilter !== 'all') {
        const itemType = item.type || 'note';
        if (itemType !== knowledgeTypeFilter) return false;
      }

      const matchesSearch = searchQuery === '' ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.summary.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTags = selectedTags.length === 0 ||
        selectedTags.every(tag => item.tags.includes(tag));

      return matchesSearch && matchesTags;
    });

    // Apply sorting
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        case 'recent':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }, [knowledgeList, searchQuery, selectedTags, activeFolderId, knowledgeTypeFilter, sortBy]);

  useEffect(() => {
    if (isLoading || !containerRef.current || filteredList.length === 0) return;

    const cards = containerRef.current.querySelectorAll('.note-card');

    gsap.fromTo(cards,
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
        }
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, [filteredList, isLoading]);

  // Get current folder name for display
  const getCurrentFolderName = () => {
    if (activeFolderId === null) return language === 'zh' ? '全部文件' : 'All Files';
    if (activeFolderId === 'uncategorized') return language === 'zh' ? '未分类' : 'Uncategorized';
    const folder = folders.find(f => f.id === activeFolderId);
    return folder?.name || '';
  };

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)]">
      {/* Floating Folder Sidebar - Dynamic Island Style */}
      <div
        className="fixed top-14 bottom-0 z-30 transition-all duration-300 flex items-center"
        style={{ left: `${actualNavbarWidth}px` }}
      >
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="relative flex items-center h-full"
        >
          {/* Island container - full height, left flush, right rounded */}
          <AnimatePresence mode="wait">
            {showSidebar && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: folderSidebarWidth, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                className="h-full bg-bg-primary/98 backdrop-blur-md border-r border-border-subtle shadow-2xl overflow-hidden relative"
                style={{
                  borderTopRightRadius: '24px',
                  borderBottomRightRadius: '24px',
                  borderTopLeftRadius: '0',
                  borderBottomLeftRadius: '0',
                }}
              >
                <div style={{ width: folderSidebarWidth }} className="h-full">
                  <FolderSidebar
                    activeFolderId={activeFolderId}
                    onSelectFolder={setActiveFolderId}
                  />
                </div>
                <div
                  onMouseDown={() => setIsResizing(true)}
                  className="absolute right-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-accent/50 transition-colors z-10"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Toggle button - protruding outward on the right, vertically centered */}
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="absolute top-1/2 -translate-y-1/2 w-6 h-20 bg-bg-primary border border-border-subtle border-l-0 shadow-[4px_0_8px_rgba(0,0,0,0.05)] flex items-center justify-center hover:bg-bg-secondary transition-colors group z-10"
            style={{
              right: 'calc(-24px + 1px)',
              borderTopRightRadius: '12px',
              borderBottomRightRadius: '12px',
              borderTopLeftRadius: 0,
              borderBottomLeftRadius: 0,
            }}            title={showSidebar ? (language === 'zh' ? '收起' : 'Collapse') : (language === 'zh' ? '展开' : 'Expand')}
          >
            <motion.div
              animate={{ rotate: showSidebar ? 0 : 180 }}
              transition={{ duration: 0.2 }}
            >
              <svg className="w-3.5 h-3.5 text-text-secondary group-hover:text-text-primary transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </motion.div>
          </button>
        </motion.div>
      </div>

      {/* Main Content */}
      <div
        className="transition-all duration-300"
        style={{
          marginLeft: showSidebar ? `${folderSidebarWidth + 40}px` : '40px',
          paddingRight: '16px'
        }}
      >
        <div className="px-4 md:px-8 lg:px-12 py-8 min-h-full">
          {/* Header */}
          <header className="mb-8 md:mb-12 flex flex-col md:flex-row justify-between items-start md:items-end border-b border-border-subtle pb-4 md:pb-6 gap-4 md:gap-6">
            <div>
              <div className="flex items-center gap-2 md:gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif tracking-tighter">{t('indexTitle')}</h1>
                {activeFolderId !== null && (
                  <span className="text-sm text-text-secondary px-2 py-1 bg-bg-secondary rounded-md">
                    {getCurrentFolderName()}
                  </span>
                )}
              </div>
              <p className="text-text-secondary text-base font-light max-w-md leading-relaxed">
                {t('indexDesc')}
              </p>
            </div>
            <div className="w-full md:w-auto flex flex-col items-start md:items-end">
              <SearchBar />
              <TagFilter />
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <TypeFilter />
                <SortFilter />
              </div>            </div>          </header>

          {isLoading ? (
            <motion.div
              className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-x-6 md:gap-x-8 gap-y-12 md:gap-y-16"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse flex flex-col h-full">
                  <div className="flex justify-between items-center mb-6 border-b border-border-subtle pb-4">
                    <div className="h-3 bg-border-subtle rounded w-20"></div>
                    <div className="h-3 bg-border-subtle rounded w-16"></div>
                  </div>
                  <div className="h-8 bg-border-subtle rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-border-subtle rounded w-full mb-2"></div>
                  <div className="h-4 bg-border-subtle rounded w-5/6 mb-8"></div>
                  <div className="flex justify-between items-center mt-auto pt-6 border-t border-border-subtle">
                    <div className="flex gap-2">
                      <div className="h-6 bg-border-subtle rounded w-12"></div>
                      <div className="h-6 bg-border-subtle rounded w-16"></div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-border-subtle"></div>
                  </div>
                </div>
              ))}
            </motion.div>
          ) : filteredList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-text-secondary">
              <div className="text-4xl mb-4 font-serif">{t('noResults')}</div>
              <p className="font-light">{t('tryAdjusting')}</p>
              {activeFolderId !== null && (
                <button
                  onClick={() => setActiveFolderId(null)}
                  className="mt-4 text-sm text-accent hover:underline"
                >
                  {language === 'zh' ? '查看全部文件' : 'View all files'}
                </button>
              )}
            </div>
          ) : (
            <motion.div
              ref={containerRef}
              className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-x-6 md:gap-x-8 gap-y-12 md:gap-y-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              {filteredList.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05, ease: 'easeOut' }}
                >
                  <KnowledgeCard item={item} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
      <PinnedCardsSidebar />
    </div>
  );
}
