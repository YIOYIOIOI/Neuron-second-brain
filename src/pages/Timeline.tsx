import { useMemo, useEffect, useRef, useState } from 'react';
import { useStore } from '../store/useStore';
import { useTranslation } from '../hooks/useTranslation';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import {
  isToday, isThisWeek, isThisMonth, parseISO, format,
  startOfMonth, endOfMonth, eachDayOfInterval, isSameDay,
  subMonths, addMonths, startOfWeek, endOfWeek, isWithinInterval,
  subDays, eachWeekOfInterval, getDay
} from 'date-fns';
import { enUS, zhCN } from 'date-fns/locale';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { KnowledgeItem } from '../types';
import {
  Search, Calendar, BarChart3, List, ChevronLeft, ChevronRight,
  Edit2, Star, StarOff, X, Filter, Pin, PinOff
} from 'lucide-react';
import { cn } from '../components/Navbar';
import { PinnedCardsSidebar } from '../components/PinnedCardsSidebar';

gsap.registerPlugin(ScrollTrigger);

type ViewMode = 'list' | 'calendar' | 'heatmap';

type GroupedItems = {
  today: KnowledgeItem[];
  thisWeek: KnowledgeItem[];
  thisMonth: KnowledgeItem[];
  older: KnowledgeItem[];
};

export default function Timeline() {
  const { knowledgeList, updateKnowledge, pinnedCards, pinCard, unpinCard } = useStore();
  const { t, language } = useTranslation();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  // View and filter states
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null
  });
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Get all tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    knowledgeList.forEach(item => item.tags.forEach(tag => tagSet.add(tag)));
    return Array.from(tagSet);
  }, [knowledgeList]);

  // Filter items
  const filteredItems = useMemo(() => {
    return knowledgeList.filter(item => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          item.title.toLowerCase().includes(query) ||
          item.summary.toLowerCase().includes(query) ||
          item.content.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Tag filter
      if (selectedTags.length > 0) {
        const hasAllTags = selectedTags.every(tag => item.tags.includes(tag));
        if (!hasAllTags) return false;
      }

      // Date range filter
      if (dateRange.start || dateRange.end) {
        const itemDate = parseISO(item.createdAt);
        if (dateRange.start && dateRange.end) {
          if (!isWithinInterval(itemDate, { start: dateRange.start, end: dateRange.end })) {
            return false;
          }
        } else if (dateRange.start && itemDate < dateRange.start) {
          return false;
        } else if (dateRange.end && itemDate > dateRange.end) {
          return false;
        }
      }

      return true;
    });
  }, [knowledgeList, searchQuery, selectedTags, dateRange]);

  // Group items for list view
  const groupedItems = useMemo(() => {
    const sorted = [...filteredItems].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const groups: GroupedItems = {
      today: [],
      thisWeek: [],
      thisMonth: [],
      older: []
    };

    sorted.forEach(item => {
      const date = parseISO(item.createdAt);
      if (isToday(date)) groups.today.push(item);
      else if (isThisWeek(date)) groups.thisWeek.push(item);
      else if (isThisMonth(date)) groups.thisMonth.push(item);
      else groups.older.push(item);
    });

    return groups;
  }, [filteredItems]);

  // Calendar data
  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  // Heatmap data (last 365 days)
  const heatmapData = useMemo(() => {
    const today = new Date();
    const startDate = subDays(today, 364);
    const weeks = eachWeekOfInterval({ start: startDate, end: today }, { weekStartsOn: 0 });

    const activityMap = new Map<string, number>();
    knowledgeList.forEach(item => {
      const dateKey = format(parseISO(item.createdAt), 'yyyy-MM-dd');
      activityMap.set(dateKey, (activityMap.get(dateKey) || 0) + 1);
    });

    return weeks.map(weekStart => {
      const days = [];
      for (let i = 0; i < 7; i++) {
        const day = new Date(weekStart);
        day.setDate(weekStart.getDate() + i);
        const dateKey = format(day, 'yyyy-MM-dd');
        days.push({
          date: day,
          count: activityMap.get(dateKey) || 0
        });
      }
      return days;
    });
  }, [knowledgeList]);

  // Get items for a specific day
  const getItemsForDay = (date: Date) => {
    return filteredItems.filter(item => isSameDay(parseISO(item.createdAt), date));
  };

  // GSAP animation for list view
  useEffect(() => {
    if (viewMode !== 'list' || !containerRef.current) return;

    const nodes = containerRef.current.querySelectorAll('.timeline-node');

    gsap.fromTo(nodes,
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.6,
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
  }, [groupedItems, viewMode]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const toggleMilestone = (id: string, current: boolean) => {
    updateKnowledge(id, { isMilestone: !current });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTags([]);
    setDateRange({ start: null, end: null });
  };

  const hasActiveFilters = searchQuery || selectedTags.length > 0 || dateRange.start || dateRange.end;

  // Render list view group
  const renderGroup = (title: string, items: KnowledgeItem[]) => {
    if (items.length === 0) return null;

    return (
      <div className="mb-16 relative">
        <h2 className="text-xs uppercase tracking-widest font-mono text-text-secondary mb-8 sticky top-24 bg-bg-primary/90 backdrop-blur-sm py-4 z-10">
          {title}
        </h2>
        <div className="border-l border-border-subtle ml-2 pl-8 flex flex-col gap-8">
          {items.map(item => (
            <div
              key={item.id}
              className="timeline-node group relative"
            >
              {/* Milestone indicator */}
              {item.isMilestone && (
                <div className="absolute -left-[41px] top-0 w-4 h-4 rounded-full bg-yellow-400 border-2 border-bg-primary flex items-center justify-center">
                  <Star className="w-2 h-2 text-yellow-800" />
                </div>
              )}
              {!item.isMilestone && (
                <div className="absolute -left-[37px] top-1.5 w-2 h-2 rounded-full bg-border-subtle group-hover:bg-text-primary transition-colors" />
              )}

              <div className="flex items-start justify-between gap-4">
                <Link to={`/note/${item.id}`} className="flex-1 block">
                  <div className="text-xs font-mono text-text-secondary mb-2">
                    {format(parseISO(item.createdAt), language === 'zh' ? 'yyyy年MM月dd日 • HH:mm' : 'MMM d, yyyy • HH:mm', { locale: language === 'zh' ? zhCN : enUS })}
                  </div>
                  <h3 className="text-2xl font-serif mb-3 group-hover:text-accent transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-text-secondary font-light leading-relaxed line-clamp-2">
                    {item.summary}
                  </p>
                  {item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {item.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-bg-secondary rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>

                {/* Quick actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      const isPinned = pinnedCards.some(c => c.id === item.id);
                      if (isPinned) {
                        unpinCard(item.id);
                      } else {
                        pinCard({ id: item.id, title: item.title, summary: item.summary });
                      }
                    }}
                    className={cn(
                      "p-2 rounded-md transition-colors",
                      pinnedCards.some(c => c.id === item.id)
                        ? "bg-text-primary text-bg-primary"
                        : "hover:bg-bg-secondary text-text-secondary"
                    )}
                    title={pinnedCards.some(c => c.id === item.id) ? t('unpin') : t('pin')}
                  >
                    {pinnedCards.some(c => c.id === item.id) ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => toggleMilestone(item.id, !!item.isMilestone)}
                    className={cn(
                      "p-2 rounded-md transition-colors",
                      item.isMilestone
                        ? "bg-yellow-100 text-yellow-600"
                        : "hover:bg-bg-secondary text-text-secondary"
                    )}
                    title={language === 'zh' ? (item.isMilestone ? '取消里程碑' : '标记为里程碑') : (item.isMilestone ? 'Remove milestone' : 'Mark as milestone')}
                  >
                    {item.isMilestone ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => navigate(`/note/${item.id}?edit=true`)}
                    className="p-2 rounded-md hover:bg-bg-secondary text-text-secondary transition-colors"
                    title={language === 'zh' ? '编辑' : 'Edit'}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render calendar view
  const renderCalendar = () => {
    const weekDays = language === 'zh'
      ? ['日', '一', '二', '三', '四', '五', '六']
      : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className="bg-bg-secondary/30 rounded-xl border border-border-subtle p-6">
        {/* Calendar header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setCurrentMonth(prev => subMonths(prev, 1))}
            className="p-2 hover:bg-bg-secondary rounded-md transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h3 className="text-lg font-serif">
            {format(currentMonth, language === 'zh' ? 'yyyy年 M月' : 'MMMM yyyy', { locale: language === 'zh' ? zhCN : enUS })}
          </h3>
          <button
            onClick={() => setCurrentMonth(prev => addMonths(prev, 1))}
            className="p-2 hover:bg-bg-secondary rounded-md transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Week headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map(day => (
            <div key={day} className="text-center text-xs font-mono text-text-secondary py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map(day => {
            const items = getItemsForDay(day);
            const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
            const isTodayDate = isToday(day);
            const hasMilestone = items.some(item => item.isMilestone);

            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "min-h-[80px] p-2 rounded-md border transition-colors",
                  isCurrentMonth ? "bg-bg-primary border-border-subtle" : "bg-bg-secondary/30 border-transparent",
                  isTodayDate && "ring-2 ring-text-primary",
                  items.length > 0 && "cursor-pointer hover:border-text-secondary"
                )}
              >
                <div className={cn(
                  "text-sm font-mono mb-1 flex items-center justify-between",
                  isCurrentMonth ? "text-text-primary" : "text-text-secondary/50"
                )}>
                  <span>{format(day, 'd')}</span>
                  {hasMilestone && <Star className="w-3 h-3 text-yellow-500 fill-current" />}
                </div>
                {items.length > 0 && (
                  <div className="space-y-1">
                    {items.slice(0, 2).map(item => (
                      <Link
                        key={item.id}
                        to={`/note/${item.id}`}
                        className={cn(
                          "block text-[10px] truncate px-1 py-0.5 rounded transition-colors",
                          item.isMilestone
                            ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                            : "bg-bg-secondary hover:bg-border-subtle"
                        )}
                      >
                        {item.title}
                      </Link>
                    ))}
                    {items.length > 2 && (
                      <div className="text-[10px] text-text-secondary px-1">
                        +{items.length - 2} {language === 'zh' ? '更多' : 'more'}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render heatmap view
  const renderHeatmap = () => {
    const months = [];
    const today = new Date();
    for (let i = 11; i >= 0; i--) {
      months.push(subMonths(today, i));
    }

    const getIntensity = (count: number) => {
      if (count === 0) return 'bg-bg-secondary';
      if (count === 1) return 'bg-green-200';
      if (count === 2) return 'bg-green-300';
      if (count === 3) return 'bg-green-400';
      return 'bg-green-500';
    };

    const totalContributions = knowledgeList.filter(item => {
      const date = parseISO(item.createdAt);
      return date >= subDays(today, 364);
    }).length;

    return (
      <div className="bg-bg-secondary/30 rounded-xl border border-border-subtle p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-serif">
            {language === 'zh' ? '学习活动' : 'Learning Activity'}
          </h3>
          <div className="text-sm text-text-secondary">
            {totalContributions} {language === 'zh' ? '条知识（过去一年）' : 'contributions in the last year'}
          </div>
        </div>

        {/* Month labels */}
        <div className="flex mb-2 ml-8">
          {months.map((month, i) => (
            <div
              key={i}
              className="text-[10px] font-mono text-text-secondary"
              style={{ width: `${100 / 12}%` }}
            >
              {format(month, language === 'zh' ? 'M月' : 'MMM', { locale: language === 'zh' ? zhCN : enUS })}
            </div>
          ))}
        </div>

        {/* Heatmap grid */}
        <div className="flex gap-1">
          {/* Day labels */}
          <div className="flex flex-col gap-1 text-[10px] font-mono text-text-secondary pr-2">
            <div className="h-3"></div>
            <div className="h-3">Mon</div>
            <div className="h-3"></div>
            <div className="h-3">Wed</div>
            <div className="h-3"></div>
            <div className="h-3">Fri</div>
            <div className="h-3"></div>
          </div>

          {/* Weeks */}
          <div className="flex gap-1 flex-1">
            {heatmapData.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.map((day, dayIndex) => {
                  const dayItems = getItemsForDay(day.date);
                  return (
                    <div
                      key={dayIndex}
                      className={cn(
                        "w-3 h-3 rounded-sm transition-colors cursor-pointer",
                        getIntensity(day.count),
                        day.date > today && "opacity-30"
                      )}
                      title={`${format(day.date, 'MMM d, yyyy')}: ${day.count} ${day.count === 1 ? 'item' : 'items'}`}
                      onClick={() => {
                        if (dayItems.length === 1) {
                          navigate(`/note/${dayItems[0].id}`);
                        } else if (dayItems.length > 1) {
                          setDateRange({ start: day.date, end: day.date });
                          setViewMode('list');
                        }
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-2 mt-4 text-[10px] text-text-secondary">
          <span>{language === 'zh' ? '较少' : 'Less'}</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-sm bg-bg-secondary" />
            <div className="w-3 h-3 rounded-sm bg-green-200" />
            <div className="w-3 h-3 rounded-sm bg-green-300" />
            <div className="w-3 h-3 rounded-sm bg-green-400" />
            <div className="w-3 h-3 rounded-sm bg-green-500" />
          </div>
          <span>{language === 'zh' ? '较多' : 'More'}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="px-8 md:px-16 lg:px-24 py-12 min-h-screen max-w-6xl mx-auto">
      <header className="mb-12 border-b border-border-subtle pb-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <h1 className="text-5xl md:text-7xl font-serif tracking-tighter mb-4">{t('timelineTitle')}</h1>
            <p className="text-text-secondary text-lg font-light leading-relaxed">
              {t('timelineDesc')}
            </p>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center gap-1 bg-bg-secondary/50 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                viewMode === 'list' ? "bg-text-primary text-bg-primary" : "hover:bg-bg-secondary"
              )}
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">{language === 'zh' ? '列表' : 'List'}</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                viewMode === 'calendar' ? "bg-text-primary text-bg-primary" : "hover:bg-bg-secondary"
              )}
            >
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">{language === 'zh' ? '日历' : 'Calendar'}</span>
            </button>
            <button
              onClick={() => setViewMode('heatmap')}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                viewMode === 'heatmap' ? "bg-text-primary text-bg-primary" : "hover:bg-bg-secondary"
              )}
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">{language === 'zh' ? '热力图' : 'Heatmap'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'zh' ? '搜索知识...' : 'Search knowledge...'}
              className="w-full pl-10 pr-4 py-2.5 bg-bg-secondary/50 border border-border-subtle rounded-lg text-sm focus:outline-none focus:border-text-secondary transition-colors"
            />
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm border transition-colors",
              showFilters || hasActiveFilters
                ? "bg-text-primary text-bg-primary border-text-primary"
                : "bg-bg-secondary/50 border-border-subtle hover:border-text-secondary"
            )}
          >
            <Filter className="w-4 h-4" />
            {language === 'zh' ? '筛选' : 'Filter'}
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-yellow-400" />
            )}
          </button>
        </div>

        {/* Expanded filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-4 space-y-4">
                {/* Tags */}
                <div>
                  <label className="text-xs uppercase tracking-widest font-mono text-text-secondary mb-2 block">
                    {language === 'zh' ? '标签筛选' : 'Filter by Tags'}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {allTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={cn(
                          "px-3 py-1.5 rounded-md text-xs transition-colors",
                          selectedTags.includes(tag)
                            ? "bg-text-primary text-bg-primary"
                            : "bg-bg-secondary hover:bg-border-subtle"
                        )}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date range */}
                <div>
                  <label className="text-xs uppercase tracking-widest font-mono text-text-secondary mb-2 block">
                    {language === 'zh' ? '时间范围' : 'Date Range'}
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="date"
                      value={dateRange.start ? format(dateRange.start, 'yyyy-MM-dd') : ''}
                      onChange={(e) => setDateRange(prev => ({
                        ...prev,
                        start: e.target.value ? new Date(e.target.value) : null
                      }))}
                      className="px-3 py-2 bg-bg-secondary/50 border border-border-subtle rounded-lg text-sm focus:outline-none focus:border-text-secondary"
                    />
                    <span className="text-text-secondary">—</span>
                    <input
                      type="date"
                      value={dateRange.end ? format(dateRange.end, 'yyyy-MM-dd') : ''}
                      onChange={(e) => setDateRange(prev => ({
                        ...prev,
                        end: e.target.value ? new Date(e.target.value) : null
                      }))}
                      className="px-3 py-2 bg-bg-secondary/50 border border-border-subtle rounded-lg text-sm focus:outline-none focus:border-text-secondary"
                    />
                    {hasActiveFilters && (
                      <button
                        onClick={clearFilters}
                        className="flex items-center gap-1 px-3 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
                      >
                        <X className="w-4 h-4" />
                        {language === 'zh' ? '清除筛选' : 'Clear'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content */}
      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-text-secondary">
          <div className="text-4xl mb-4 font-serif">{t('noResults')}</div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm uppercase tracking-widest border-b border-text-secondary pb-1 hover:text-text-primary hover:border-text-primary transition-colors"
            >
              {language === 'zh' ? '清除筛选' : 'Clear filters'}
            </button>
          )}
        </div>
      ) : (
        <>
          {viewMode === 'list' && (
            <div ref={containerRef} className="relative">
              {renderGroup(t('today'), groupedItems.today)}
              {renderGroup(t('thisWeek'), groupedItems.thisWeek)}
              {renderGroup(t('thisMonth'), groupedItems.thisMonth)}
              {renderGroup(t('older'), groupedItems.older)}
            </div>
          )}

          {viewMode === 'calendar' && renderCalendar()}

          {viewMode === 'heatmap' && renderHeatmap()}
        </>
      )}
      <PinnedCardsSidebar />
    </div>
  );
}
