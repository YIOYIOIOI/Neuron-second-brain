import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../store/useStore';
import { useTranslation } from '../hooks/useTranslation';
import { ArrowLeft, Sparkles, Download, BookOpen, Pin, PinOff, X, Plus, Search, MoreVertical } from 'lucide-react';
import { KnowledgeCard } from '../components/KnowledgeCard';
import { AdvancedBlockEditor } from '../components/editor/AdvancedBlockEditor';
import { PinnedCardsSidebar } from '../components/PinnedCardsSidebar';
import { FolderSidebar } from '../components/FolderSidebar';
import { ReviewCard } from '../types';
import toast from 'react-hot-toast';

export default function Detail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { knowledgeList, updateKnowledge, incrementAccessCount, reviewDecks, addReviewCard, pinnedCards, pinCard, unpinCard, sidebarCollapsed, navbarWidth, folderSidebarWidth, setFolderSidebarWidth, splitViewKnowledgeId } = useStore();
  const { t, language } = useTranslation();

  const actualId = splitViewKnowledgeId || id;
  const item = knowledgeList.find((n) => n.id === actualId);

  // Redirect to canvas if type is canvas
  useEffect(() => {
    if (item?.type === 'canvas' && !splitViewKnowledgeId) {
      navigate(`/note/canvas/${actualId}`, { replace: true });
    }
  }, [item, actualId, navigate, splitViewKnowledgeId]);

  const [isEditing, setIsEditing] = useState(true);
  const [editTitle, setEditTitle] = useState('');
  const [editSummary, setEditSummary] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editTags, setEditTags] = useState<string[]>([]);
  const [editReferences, setEditReferences] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [expandedTags, setExpandedTags] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showRefSearch, setShowRefSearch] = useState(false);
  const [refSearchQuery, setRefSearchQuery] = useState('');
  const [showReviewCardModal, setShowReviewCardModal] = useState(false);
  const [selectedDeckId, setSelectedDeckId] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);
  const [showFolderSidebar, setShowFolderSidebar] = useState(() => {
    const saved = localStorage.getItem('dashboardSidebarVisible');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [isResizing, setIsResizing] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [showActionsMenu, setShowActionsMenu] = useState(false);

  useEffect(() => {
    localStorage.setItem('dashboardSidebarVisible', JSON.stringify(showFolderSidebar));
  }, [showFolderSidebar]);

  // Auto-hide sidebar on narrow screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1280) {
        setShowFolderSidebar(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const actualNavbarWidth = sidebarCollapsed ? 64 : navbarWidth;
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
  }, [isResizing, sidebarCollapsed, navbarWidth, setFolderSidebarWidth]);

  const actualNavbarWidth = sidebarCollapsed ? 64 : navbarWidth;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 150);
    return () => clearTimeout(timer);
  }, [id]);

  useEffect(() => {
    if (actualId) {
      incrementAccessCount(actualId);
    }
  }, [actualId, incrementAccessCount]);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    setIsEditing(true);
  }, [location.search]);

  useEffect(() => {
    if (item) {
      setEditTitle(item.title);
      setEditSummary(item.summary);
      setEditContent(item.content);
      setEditTags(item.tags);
      setEditReferences(item.references || []);
    }
  }, [item]);

  // Auto-save
  useEffect(() => {
    if (!actualId || splitViewKnowledgeId) return;
    const timer = setTimeout(() => {
      updateKnowledge(actualId, {
        title: editTitle,
        summary: editSummary,
        content: editContent,
        tags: editTags,
        references: editReferences,
        updatedAt: new Date().toISOString(),
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, [editTitle, editSummary, editContent, editTags, editReferences, actualId, updateKnowledge, splitViewKnowledgeId]);

  // Filter knowledge for reference search
  const filteredKnowledgeForRef = useMemo(() => {
    if (!refSearchQuery.trim()) return [];
    return knowledgeList
      .filter(k => k.id !== actualId) // Exclude current item
      .filter(k => !editReferences.includes(k.id)) // Exclude already referenced
      .filter(k =>
        k.title.toLowerCase().includes(refSearchQuery.toLowerCase()) ||
        k.summary.toLowerCase().includes(refSearchQuery.toLowerCase())
      )
      .slice(0, 5);
  }, [knowledgeList, refSearchQuery, id, editReferences]);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="px-8 md:px-16 lg:px-24 py-12 min-h-screen max-w-6xl mx-auto animate-pulse"
      >
        <div className="mb-12">
          <div className="h-4 bg-border-subtle rounded w-24"></div>
        </div>
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
          <div className="flex-1">
            <div className="h-12 bg-border-subtle rounded w-3/4 mb-8"></div>
            <div className="h-4 bg-border-subtle rounded w-1/4 mb-12"></div>
            <div className="space-y-4">
              <div className="h-4 bg-border-subtle rounded w-full"></div>
              <div className="h-4 bg-border-subtle rounded w-full"></div>
              <div className="h-4 bg-border-subtle rounded w-5/6"></div>
              <div className="h-4 bg-border-subtle rounded w-full"></div>
              <div className="h-4 bg-border-subtle rounded w-4/5"></div>
            </div>
          </div>
          <div className="w-full lg:w-80 flex flex-col gap-12">
            <div>
              <div className="h-4 bg-border-subtle rounded w-20 mb-6"></div>
              <div className="flex gap-2">
                <div className="h-6 bg-border-subtle rounded-full w-16"></div>
                <div className="h-6 bg-border-subtle rounded-full w-20"></div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center font-serif text-2xl">
        <div className="mb-4">{t('noResults')}</div>
        <Link to="/dashboard" className="text-sm font-sans uppercase tracking-widest border-b border-text-primary pb-1">{t('backToIndex')}</Link>
      </div>
    );
  }

  const relatedItems = item.relatedIds
    ? knowledgeList.filter(n => item.relatedIds.includes(n.id))
    : [];

  const references = item.references
    ? knowledgeList.filter(n => item.references?.includes(n.id))
    : [];

  const backlinks = item.backlinks
    ? knowledgeList.filter(n => item.backlinks?.includes(n.id))
    : [];

  // Get reference items for edit mode
  const editReferenceItems = knowledgeList.filter(n => editReferences.includes(n.id));

  const dateStr = new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const readTime = Math.max(1, Math.ceil(item.content.split(' ').length / 200)) + ` ${t('readTime')}`;

  const handleSave = () => {
    if (actualId) {
      const currentVersion = {
        title: item.title,
        content: item.content,
        tags: item.tags,
        updatedAt: new Date().toISOString()
      };

      const newVersions = item.versions ? [currentVersion, ...item.versions] : [currentVersion];

      updateKnowledge(actualId, {
        title: editTitle,
        summary: editSummary,
        content: editContent,
        tags: editTags,
        references: editReferences,
        updatedAt: new Date().toISOString(),
        versions: newVersions
      });
      setIsEditing(false);
      toast.success(t('saveSuccess'));
    }
  };

  const handleCreateReviewCard = () => {
    if (!selectedDeckId || !actualId || !item) {
      toast.error(language === 'zh' ? '请选择复习库' : 'Please select a deck');
      return;
    }

    const newCard: ReviewCard = {
      id: crypto.randomUUID(),
      question: item.title,
      answer: item.content,
      sourceKnowledgeId: actualId,
      deckId: selectedDeckId,
      createdAt: new Date().toISOString(),
      nextReviewDate: new Date().toISOString(),
      reviewCount: 0,
      easeFactor: 2.5
    };

    addReviewCard(newCard);
    setShowReviewCardModal(false);
    setSelectedDeckId('');
    toast.success(language === 'zh' ? '已添加到复习库' : 'Added to review deck');
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault();
      if (!editTags.includes(newTag.trim())) {
        setEditTags([...editTags, newTag.trim()]);
      }
      setNewTag('');
    }
  };

  const handleTagBlur = () => {
    if (newTag.trim() && !editTags.includes(newTag.trim())) {
      setEditTags([...editTags, newTag.trim()]);
    }
    setNewTag('');
  };

  const removeTag = (tagToRemove: string) => {
    setEditTags(editTags.filter(tag => tag !== tagToRemove));
  };

  const addReference = (refId: string) => {
    if (!editReferences.includes(refId)) {
      setEditReferences([...editReferences, refId]);
    }
    setRefSearchQuery('');
    setShowRefSearch(false);
  };

  const removeReference = (refId: string) => {
    setEditReferences(editReferences.filter(r => r !== refId));
  };

  const handleExport = (format: 'markdown' | 'json' | 'text') => {
    if (!item) return;

    let content = '';
    let filename = '';
    let mimeType = '';

    if (format === 'markdown') {
      content = `# ${item.title}\n\n`;
      content += `**Created:** ${new Date(item.createdAt).toLocaleDateString()}\n\n`;
      if (item.tags.length > 0) {
        content += `**Tags:** ${item.tags.join(', ')}\n\n`;
      }
      content += `## Summary\n\n${item.summary}\n\n`;
      content += `## Content\n\n${item.content.replace(/<[^>]*>/g, '').trim()}\n`;
      filename = `${item.title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '-')}.md`;
      mimeType = 'text/markdown';
    } else if (format === 'json') {
      content = JSON.stringify(item, null, 2);
      filename = `${item.title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '-')}.json`;
      mimeType = 'application/json';
    } else {
      content = `${item.title}\n\n`;
      content += `Created: ${new Date(item.createdAt).toLocaleDateString()}\n\n`;
      if (item.tags.length > 0) {
        content += `Tags: ${item.tags.join(', ')}\n\n`;
      }
      content += `Summary:\n${item.summary}\n\n`;
      content += `Content:\n${item.content.replace(/<[^>]*>/g, '').trim()}\n`;
      filename = `${item.title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '-')}.txt`;
      mimeType = 'text/plain';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportModal(false);
    toast.success(language === 'zh' ? '导出成功！' : 'Export successful!');
  };

  return (
    <>
      {!splitViewKnowledgeId && (
      <div className="relative min-h-screen">
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
              {showFolderSidebar && (
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
                    <FolderSidebar />
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
              onClick={() => setShowFolderSidebar(!showFolderSidebar)}
              className="absolute top-1/2 -translate-y-1/2 w-6 h-20 bg-bg-primary border border-border-subtle border-l-0 shadow-[4px_0_8px_rgba(0,0,0,0.05)] flex items-center justify-center hover:bg-bg-secondary transition-colors group z-10"
              style={{
                right: 'calc(-24px + 1px)',
                borderTopRightRadius: '12px',
                borderBottomRightRadius: '12px',
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
              }}
              title={showFolderSidebar ? (language === 'zh' ? '收起' : 'Collapse') : (language === 'zh' ? '展开' : 'Expand')}
            >
              <motion.div
                animate={{ rotate: showFolderSidebar ? 0 : 180 }}
                transition={{ duration: 0.2 }}
              >
                <svg className="w-3.5 h-3.5 text-text-secondary group-hover:text-text-primary transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </motion.div>
            </button>
          </motion.div>
        </div>
      </div>
      )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="min-h-screen mx-auto transition-all duration-300 max-w-full"
          style={{
            marginLeft: splitViewKnowledgeId ? '0' : (showFolderSidebar ? `${actualNavbarWidth + folderSidebarWidth + 40}px` : `${actualNavbarWidth + 40}px`),
            paddingRight: '16px'
          }}
        >
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{
          opacity: 1,
          x: 0,
          borderRadius: scrollY > 50 ? '24px' : '0px',
        }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="sticky bg-bg-secondary/95 backdrop-blur-md z-[100] py-3 md:py-4 px-4 md:px-8 lg:px-16 mb-6 md:mb-8 flex justify-between items-center border border-border-subtle shadow-lg"
        style={{
          top: scrollY > 50 ? '72px' : '0',
          marginTop: scrollY > 50 ? '8px' : '0',
          marginBottom: scrollY > 50 ? '16px' : '0',
          marginLeft: scrollY > 50 ? 'auto' : '0',
          marginRight: scrollY > 50 ? '0' : '0',
          width: scrollY > 50 ? 'fit-content' : '100%',
        }}
      >
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm uppercase tracking-widest font-medium text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> {scrollY > 50 ? '' : t('back')}
        </button>

        {scrollY > 50 ? (
          <div className="relative">
            <button
              onClick={() => setShowActionsMenu(!showActionsMenu)}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            <AnimatePresence>
              {showActionsMenu && (
                <>
                  <div className="fixed inset-0 z-[90]" onClick={() => setShowActionsMenu(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 top-full mt-2 bg-bg-primary border border-border-subtle rounded-lg shadow-xl py-1 min-w-[160px] z-[100]"
                  >
                    <button
                      onClick={() => { setShowExportModal(true); setShowActionsMenu(false); }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-bg-secondary transition-colors flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" /> {t('export')}
                    </button>
                    <button
                      onClick={() => {
                        const isPinned = pinnedCards.some(c => c.id === item.id);
                        if (isPinned) {
                          unpinCard(item.id);
                        } else {
                          pinCard({ id: item.id, title: item.title, summary: item.summary });
                        }
                        setShowActionsMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-bg-secondary transition-colors flex items-center gap-2"
                    >
                      {pinnedCards.some(c => c.id === item.id) ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                      {pinnedCards.some(c => c.id === item.id) ? t('unpin') : t('pin')}
                    </button>
                    <button
                      onClick={() => { setShowReviewCardModal(true); setShowActionsMenu(false); }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-bg-secondary transition-colors flex items-center gap-2"
                    >
                      <BookOpen className="w-4 h-4" /> {t('addToReviewDeck')}
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex gap-4">
            <button
              onClick={() => setShowExportModal(true)}
              className="inline-flex items-center gap-2 text-sm uppercase tracking-widest font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              <Download className="w-4 h-4" /> {t('export')}
            </button>
            <button
              onClick={() => {
                const isPinned = pinnedCards.some(c => c.id === item.id);
                if (isPinned) {
                  unpinCard(item.id);
                } else {
                  pinCard({ id: item.id, title: item.title, summary: item.summary });
                }
              }}
              className="inline-flex items-center gap-2 text-sm uppercase tracking-widest font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              {pinnedCards.some(c => c.id === item.id) ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
              {pinnedCards.some(c => c.id === item.id) ? t('unpin') : t('pin')}
            </button>
            <button
              onClick={() => setShowReviewCardModal(true)}
              className="inline-flex items-center gap-2 text-sm uppercase tracking-widest font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              <BookOpen className="w-4 h-4" /> {t('addToReviewDeck')}
            </button>
          </div>
        )}
      </motion.div>

      <article className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 lg:gap-16 px-4 md:px-8 lg:px-16 py-8 md:py-12">
        <div className="lg:col-span-9 transition-all duration-500 ease-out">
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="mb-12 md:mb-16 border-b border-border-subtle pb-8 md:pb-12"
          >
            <div className="flex items-center gap-4 text-xs font-mono uppercase tracking-widest text-text-secondary mb-8">
              <span>{dateStr}</span>
              <span className="w-1 h-1 rounded-full bg-border-subtle" />
              <span>{readTime}</span>
            </div>

            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full text-2xl md:text-3xl lg:text-5xl font-serif leading-[1.1] tracking-tighter mb-6 bg-transparent border-b border-border-subtle focus:outline-none focus:border-text-primary py-2"
              placeholder={t('title')}
            />
            <textarea
              value={editSummary}
              onChange={(e) => setEditSummary(e.target.value)}
              className="w-full text-lg font-light text-text-secondary leading-relaxed bg-transparent border-b border-border-subtle focus:outline-none focus:border-text-primary resize-none py-2"
              placeholder="Summary..."
              rows={2}
            />
          </motion.header>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <AdvancedBlockEditor
              content={editContent}
              onChange={setEditContent}
              placeholder={t('content') || 'Type / for commands, @ to mention'}
            />
          </motion.div>
        </div>

        <motion.aside
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="lg:sticky lg:top-32 h-fit lg:col-span-3 transition-all duration-500 ease-out"
        >
          <div className="bg-bg-secondary/50 p-4 md:p-6 lg:p-8 rounded-2xl border border-border-subtle mb-6 md:mb-8">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-medium text-text-secondary mb-4 md:mb-6">
              <Sparkles className="w-4 h-4" /> {t('aiSummary')}
            </div>
            <p className="text-sm leading-relaxed font-light italic text-text-secondary">
              "{item.summary}"
            </p>
          </div>

          <div className="mb-6 md:mb-8">
            <h3 className="text-xs uppercase tracking-widest font-medium text-text-secondary mb-4 md:mb-6 border-b border-border-subtle pb-4">{t('tags')}</h3>
            <div className="flex flex-wrap gap-2">
              {editTags.map(tag => (
                <span key={tag} className="flex items-center gap-1 text-xs uppercase tracking-wider font-medium text-text-secondary bg-bg-secondary px-3 py-1.5 rounded-sm">
                  {tag}
                  <button onClick={() => removeTag(tag)} className="hover:text-text-primary"><X className="w-3 h-3" /></button>
                </span>
              ))}
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={handleAddTag}
                onBlur={handleTagBlur}
                placeholder={t('addTag')}
                className="text-xs uppercase tracking-wider font-medium bg-transparent border-b border-border-subtle focus:outline-none focus:border-text-primary w-full mt-2 py-1"
              />
            </div>
          </div>

          {/* References Section */}
          <div className="mb-6 md:mb-8">
            <h3 className="text-xs uppercase tracking-widest font-medium text-text-secondary mb-4 md:mb-6 border-b border-border-subtle pb-4">{t('references')}</h3>
            <div className="space-y-3">
                {editReferenceItems.map(ref => (
                  <div key={ref.id} className="flex items-center justify-between gap-2 p-2 bg-bg-secondary/50 rounded-md group">
                    <span className="text-sm font-serif line-clamp-1">{ref.title}</span>
                    <button
                      onClick={() => removeReference(ref.id)}
                      className="p-1 opacity-0 group-hover:opacity-100 hover:bg-border-subtle rounded transition-all"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {/* Add reference */}
                <div className="relative">
                  {!showRefSearch ? (
                    <button
                      onClick={() => setShowRefSearch(true)}
                      className="flex items-center gap-2 text-xs text-text-secondary hover:text-text-primary transition-colors w-full py-2"
                    >
                      <Plus className="w-3 h-3" />
                      {language === 'zh' ? '添加引用' : 'Add reference'}
                    </button>
                  ) : (
                    <div className="relative">
                      <div className="flex items-center gap-2 border border-border-subtle rounded-md px-3 py-2">
                        <Search className="w-3 h-3 text-text-secondary" />
                        <input
                          type="text"
                          value={refSearchQuery}
                          onChange={(e) => setRefSearchQuery(e.target.value)}
                          placeholder={language === 'zh' ? '搜索知识...' : 'Search knowledge...'}
                          className="flex-1 text-sm bg-transparent focus:outline-none"
                          autoFocus
                        />
                        <button onClick={() => { setShowRefSearch(false); setRefSearchQuery(''); }}>
                          <X className="w-3 h-3 text-text-secondary hover:text-text-primary" />
                        </button>
                      </div>

                      <AnimatePresence>
                        {filteredKnowledgeForRef.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute top-full left-0 right-0 mt-1 bg-bg-primary border border-border-subtle rounded-md shadow-lg z-10 overflow-hidden"
                          >
                            {filteredKnowledgeForRef.map(k => (
                              <button
                                key={k.id}
                                onClick={() => addReference(k.id)}
                                className="w-full text-left px-3 py-2 hover:bg-bg-secondary/50 transition-colors"
                              >
                                <div className="text-sm font-medium line-clamp-1">{k.title}</div>
                                <div className="text-xs text-text-secondary line-clamp-1">{k.summary}</div>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </div>
          </div>

          {backlinks.length > 0 && (
            <div className="mb-6 md:mb-8">
              <h3 className="text-xs uppercase tracking-widest font-medium text-text-secondary mb-4 md:mb-6 border-b border-border-subtle pb-4">{t('backlinks')}</h3>
              <ul className="flex flex-col gap-3">
                {backlinks.map(bl => (
                  <li key={bl.id}>
                    <Link to={`/note/${bl.id}`} className="text-sm font-serif hover:text-accent transition-colors line-clamp-2">
                      {bl.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {item.versions && item.versions.length > 0 && (
            <div>
              <h3 className="text-xs uppercase tracking-widest font-medium text-text-secondary mb-4 md:mb-6 border-b border-border-subtle pb-4">{t('versionHistory')}</h3>
              <ul className="flex flex-col gap-3">
                {item.versions.map((version, idx) => (
                  <li key={idx} className="flex flex-col gap-1">
                    <span className="text-xs text-text-secondary font-mono">
                      {new Date(version.updatedAt).toLocaleString()}
                    </span>
                    <button
                      onClick={() => {
                        setEditTitle(version.title);
                        setEditContent(version.content);
                        setEditTags(version.tags);
                      }}
                      className="text-sm font-serif text-left hover:text-accent transition-colors line-clamp-2"
                    >
                      {version.title} ({t('restoreVersion')})
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.aside>
      </article>

      {relatedItems.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mt-32 pt-16 border-t border-border-subtle"
        >
          <h3 className="text-2xl font-serif mb-12">{t('relatedThoughts')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {relatedItems.map((relatedItem) => (
              <KnowledgeCard key={relatedItem.id} item={relatedItem} />
            ))}
          </div>
        </motion.section>
      )}

      {/* Review Card Modal */}
      <AnimatePresence>
        {showReviewCardModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowReviewCardModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-bg-primary border border-border-subtle rounded-xl p-6 w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-medium mb-4">{t('createReviewCard')}</h2>

              <div className="mb-4">
                <label className="block text-sm text-text-secondary mb-2">{t('selectDeck')}</label>
                <select
                  value={selectedDeckId}
                  onChange={(e) => setSelectedDeckId(e.target.value)}
                  className="w-full px-4 py-2 border border-border-subtle rounded-lg focus:outline-none focus:border-text-primary"
                >
                  <option value="">{language === 'zh' ? '选择复习库' : 'Select a deck'}</option>
                  {reviewDecks.map(deck => (
                    <option key={deck.id} value={deck.id}>{deck.name}</option>
                  ))}
                </select>
              </div>

              <div className="mb-6 p-4 bg-bg-secondary/50 rounded-lg border border-border-subtle">
                <p className="text-xs text-text-secondary mb-2">{language === 'zh' ? '问题' : 'Question'}</p>
                <p className="text-sm font-medium mb-3">{item?.title}</p>
                <p className="text-xs text-text-secondary mb-2">{language === 'zh' ? '答案' : 'Answer'}</p>
                <p className="text-sm line-clamp-3">{item?.content}</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowReviewCardModal(false)}
                  className="flex-1 px-4 py-2 border border-border-subtle rounded-lg hover:bg-bg-secondary transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleCreateReviewCard}
                  className="flex-1 px-4 py-2 bg-text-primary text-bg-primary rounded-lg hover:bg-text-secondary transition-colors"
                >
                  {language === 'zh' ? '创建' : 'Create'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Export Modal */}
      <AnimatePresence>
        {showExportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowExportModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-bg-primary border border-border-subtle rounded-xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-medium mb-4">{t('exportFormat')}</h2>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => handleExport('markdown')}
                  className="w-full px-4 py-3 border border-border-subtle rounded-lg hover:bg-bg-secondary transition-colors text-left"
                >
                  <div className="font-medium">{t('exportAsMarkdown')}</div>
                  <div className="text-xs text-text-secondary mt-1">{language === 'zh' ? '适合文档编辑和发布' : 'Best for documentation'}</div>
                </button>
                <button
                  onClick={() => handleExport('json')}
                  className="w-full px-4 py-3 border border-border-subtle rounded-lg hover:bg-bg-secondary transition-colors text-left"
                >
                  <div className="font-medium">{t('exportAsJSON')}</div>
                  <div className="text-xs text-text-secondary mt-1">{language === 'zh' ? '包含完整数据结构' : 'Complete data structure'}</div>
                </button>
                <button
                  onClick={() => handleExport('text')}
                  className="w-full px-4 py-3 border border-border-subtle rounded-lg hover:bg-bg-secondary transition-colors text-left"
                >
                  <div className="font-medium">{t('exportAsText')}</div>
                  <div className="text-xs text-text-secondary mt-1">{language === 'zh' ? '纯文本格式' : 'Plain text format'}</div>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </motion.div>
      <PinnedCardsSidebar />
    </>
  );
}
