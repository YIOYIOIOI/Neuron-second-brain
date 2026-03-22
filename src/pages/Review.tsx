import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../store/useStore';
import { Plus, Trash2, BookOpen, ArrowRight, ExternalLink, ArrowLeft, ChevronLeft, ChevronRight, Pin } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { useNavigate } from 'react-router-dom';
import { ReviewDeck, ReviewCard } from '../types';

export default function Review() {
  const { reviewDecks, reviewCards, activeReviewDeckId, setActiveReviewDeckId, addReviewDeck, deleteReviewDeck, addReviewCard, updateReviewCard, deleteReviewCard, knowledgeList, setReviewCompleted, isReviewCompletedToday } = useStore();
  const { t, language } = useTranslation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDeck, setShowCreateDeck] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckDesc, setNewDeckDesc] = useState('');
  const [reviewMode, setReviewMode] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [addCardDeckId, setAddCardDeckId] = useState<string | null>(null);
  const [selectedKnowledgeId, setSelectedKnowledgeId] = useState('');
  const [expandedDeckId, setExpandedDeckId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 150);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (reviewDecks.length > 0 && !activeReviewDeckId) {
      setActiveReviewDeckId(reviewDecks[0].id);
    }
  }, [reviewDecks, activeReviewDeckId, setActiveReviewDeckId]);

  const handleCreateDeck = () => {
    if (!newDeckName.trim()) return;
    const newDeck: ReviewDeck = {
      id: crypto.randomUUID(),
      name: newDeckName.trim(),
      description: newDeckDesc.trim(),
      createdAt: new Date().toISOString(),
      cardCount: 0
    };
    addReviewDeck(newDeck);
    setNewDeckName('');
    setNewDeckDesc('');
    setShowCreateDeck(false);
  };

  const activeDeck = reviewDecks.find(d => d.id === activeReviewDeckId);
  const deckCards = reviewCards.filter(c => c.deckId === activeReviewDeckId);
  const currentCard = deckCards[currentCardIndex];
  const reviewCompleted = activeReviewDeckId ? isReviewCompletedToday(activeReviewDeckId) : false;

  const handleNextCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      if (currentCardIndex < deckCards.length - 1) {
        setCurrentCardIndex(prev => prev + 1);
      } else {
        if (activeReviewDeckId) {
          setReviewCompleted(activeReviewDeckId, true);
        }
      }
    }, 300);
  };

  const handleReviewAgain = () => {
    if (activeReviewDeckId) {
      setReviewCompleted(activeReviewDeckId, false);
    }
    setCurrentCardIndex(0);
    setIsFlipped(false);
  };

  const getSourceKnowledge = (cardId: string) => {
    const card = reviewCards.find(c => c.id === cardId);
    if (!card) return null;
    return knowledgeList.find(k => k.id === card.sourceKnowledgeId);
  };

  const handleAddCard = () => {
    const targetDeckId = addCardDeckId || activeReviewDeckId;
    if (!targetDeckId) return;

    let question = newQuestion.trim();
    let answer = newAnswer.trim();

    // If knowledge is selected, use its data
    if (selectedKnowledgeId) {
      const knowledge = knowledgeList.find(k => k.id === selectedKnowledgeId);
      if (knowledge) {
        question = question || knowledge.title;
        answer = answer || knowledge.summary;
      }
    }

    if (!question || !answer) return;

    const newCard: ReviewCard = {
      id: crypto.randomUUID(),
      deckId: targetDeckId,
      question,
      answer,
      sourceKnowledgeId: selectedKnowledgeId || undefined,
      createdAt: new Date().toISOString()
    };

    addReviewCard(newCard);
    setNewQuestion('');
    setNewAnswer('');
    setSelectedKnowledgeId('');
    setShowAddCard(false);
    setAddCardDeckId(null);
  };

  if (isLoading) {
    return (
      <div className="px-8 md:px-24 py-12 min-h-screen">
        <div className="animate-pulse">
          <div className="h-12 bg-border-subtle rounded w-1/3 mb-4"></div>
          <div className="h-6 bg-border-subtle rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  // No decks - show empty state
  if (reviewDecks.length === 0) {
    return (
      <div className="px-8 md:px-24 py-12 min-h-screen flex flex-col items-center justify-center">
        <BookOpen className="w-16 h-16 text-text-secondary mb-4" />
        <h2 className="text-2xl font-serif mb-2">{language === 'zh' ? '还没有复习库' : 'No Review Decks Yet'}</h2>
        <p className="text-text-secondary mb-6">{language === 'zh' ? '创建第一个复习库开始学习' : 'Create your first deck to start learning'}</p>
        <button
          onClick={() => setShowCreateDeck(true)}
          className="px-6 py-2.5 bg-text-primary text-bg-primary rounded-lg hover:bg-text-secondary transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {language === 'zh' ? '创建复习库' : 'Create Deck'}
        </button>

        {/* Create deck modal */}
        <AnimatePresence>
          {showCreateDeck && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
              onClick={() => setShowCreateDeck(false)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-bg-primary border border-border-subtle rounded-xl p-6 w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-xl font-medium mb-4">{language === 'zh' ? '创建复习库' : 'Create Review Deck'}</h2>
                <input
                  type="text"
                  value={newDeckName}
                  onChange={(e) => setNewDeckName(e.target.value)}
                  placeholder={language === 'zh' ? '复习库名称' : 'Deck name'}
                  className="w-full px-4 py-2 border border-border-subtle rounded-lg mb-3 focus:outline-none focus:border-text-primary"
                  autoFocus
                />
                <textarea
                  value={newDeckDesc}
                  onChange={(e) => setNewDeckDesc(e.target.value)}
                  placeholder={language === 'zh' ? '描述（可选）' : 'Description (optional)'}
                  className="w-full px-4 py-2 border border-border-subtle rounded-lg mb-4 focus:outline-none focus:border-text-primary resize-none"
                  rows={3}
                />
                <div className="mb-4 p-3 bg-bg-secondary/50 rounded-lg border border-border-subtle">
                  <p className="text-xs text-text-secondary mb-2">{language === 'zh' ? '💡 提示：创建后可以从知识详情页添加卡片到此复习库' : '💡 Tip: After creating, add cards from knowledge detail pages'}</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCreateDeck(false)}
                    className="flex-1 px-4 py-2 border border-border-subtle rounded-lg hover:bg-bg-secondary transition-colors"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    onClick={handleCreateDeck}
                    disabled={!newDeckName.trim()}
                    className="flex-1 px-4 py-2 bg-text-primary text-bg-primary rounded-lg hover:bg-text-secondary transition-colors disabled:opacity-50"
                  >
                    {language === 'zh' ? '创建' : 'Create'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  const progress = deckCards.length > 0 ? Math.round(((currentCardIndex + 1) / deckCards.length) * 100) : 0;

  // Main review interface with sidebar
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left Sidebar - Deck List */}
      <motion.div
        initial={false}
        animate={{ width: sidebarCollapsed ? 60 : 280 }}
        className="border-r border-border-subtle bg-bg-primary flex flex-col relative"
      >
        {/* Sidebar Header */}
        {!sidebarCollapsed && (
          <div className="p-4 border-b border-border-subtle">
            <h2 className="text-lg font-medium mb-2">{t('reviewTitle')}</h2>
            <button
              onClick={() => setShowCreateDeck(true)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-bg-secondary hover:bg-border-subtle rounded-lg transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              {language === 'zh' ? '新建' : 'New'}
            </button>
          </div>
        )}

        {/* Deck List */}
        <div className="flex-1 overflow-y-auto p-2">
          {reviewDecks.map(deck => {
            const cardCount = reviewCards.filter(c => c.deckId === deck.id).length;
            const isActive = deck.id === activeReviewDeckId;

            return (
              <button
                key={deck.id}
                onClick={() => {
                  setActiveReviewDeckId(deck.id);
                  setCurrentCardIndex(0);
                  setIsFlipped(false);
                  setReviewCompleted(false);
                  setExpandedDeckId(null);
                }}
                className={`w-full p-3 rounded-lg mb-2 text-left transition-all relative overflow-hidden group ${
                  isActive ? 'bg-accent/10 border border-accent' : 'hover:bg-bg-secondary border border-transparent'
                }`}
                title={sidebarCollapsed ? deck.name : undefined}
              >
                <motion.div
                  animate={{ x: expandedDeckId === deck.id ? -120 : 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="relative"
                >
                  {sidebarCollapsed ? (
                    <div className="flex flex-col items-center">
                      <BookOpen className={`w-5 h-5 ${isActive ? 'text-accent' : 'text-text-secondary'}`} />
                      <span className="text-xs mt-1">{cardCount}</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-medium text-sm ${isActive ? 'text-accent' : ''}`}>{deck.name}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedDeckId(expandedDeckId === deck.id ? null : deck.id);
                          }}
                          className="p-1 hover:bg-border-subtle rounded transition-opacity"
                        >
                          <ChevronRight className={`w-3 h-3 text-text-secondary transition-transform ${expandedDeckId === deck.id ? 'rotate-180' : ''}`} />
                        </button>
                      </div>
                      <p className="text-xs text-text-secondary line-clamp-1">{deck.description}</p>
                      <span className="text-xs text-text-secondary mt-1">{cardCount} {language === 'zh' ? '张卡片' : 'cards'}</span>
                    </>
                  )}
                </motion.div>

                {/* Action buttons revealed on expand */}
                {!sidebarCollapsed && (
                  <div className="absolute right-0 top-0 h-full flex items-center gap-1 pr-3 bg-bg-primary">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setAddCardDeckId(deck.id);
                        setShowAddCard(true);
                        setExpandedDeckId(null);
                      }}
                      className="p-2 hover:bg-accent/10 rounded transition-colors"
                      title={language === 'zh' ? '添加卡片' : 'Add card'}
                    >
                      <Plus className="w-4 h-4 text-accent" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Pin functionality placeholder
                        setExpandedDeckId(null);
                      }}
                      className="p-2 hover:bg-accent/10 rounded transition-colors"
                      title={language === 'zh' ? '置顶' : 'Pin'}
                    >
                      <Pin className="w-4 h-4 text-text-secondary" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDeleteConfirm(deck.id);
                        setExpandedDeckId(null);
                      }}
                      className="p-2 hover:bg-red-500/10 rounded transition-colors"
                      title={language === 'zh' ? '删除' : 'Delete'}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-4 w-6 h-6 bg-bg-primary border border-border-subtle rounded-full flex items-center justify-center hover:bg-bg-secondary transition-colors"
        >
          {sidebarCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </motion.div>

      {/* Main Review Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-y-auto">
        {!activeDeck || deckCards.length === 0 ? (
          <div className="text-center">
            <BookOpen className="w-16 h-16 text-text-secondary mx-auto mb-4" />
            <h2 className="text-2xl font-serif mb-2">{language === 'zh' ? '此复习库为空' : 'This Deck is Empty'}</h2>
            <p className="text-text-secondary mb-4">{language === 'zh' ? '在知识详情页添加卡片到此复习库' : 'Add cards from knowledge detail pages'}</p>
            <button
              onClick={() => setShowAddCard(true)}
              className="px-6 py-2.5 bg-text-primary text-bg-primary rounded-lg hover:bg-text-secondary transition-colors flex items-center gap-2 mx-auto"
            >
              <Plus className="w-4 h-4" />
              {language === 'zh' ? '手动添加卡片' : 'Add Card Manually'}
            </button>
          </div>
        ) : reviewCompleted ? (
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-10 h-10 text-accent" />
            </div>
            <h2 className="text-3xl font-serif mb-2">{language === 'zh' ? '复习完成！' : 'Review Complete!'}</h2>
            <p className="text-text-secondary mb-6">{language === 'zh' ? `已完成 ${deckCards.length} 张卡片的复习` : `Reviewed ${deckCards.length} cards`}</p>
            <div className="flex gap-3">
              <button
                onClick={handleReviewAgain}
                className="px-6 py-2.5 bg-text-primary text-bg-primary rounded-lg hover:bg-text-secondary transition-colors"
              >
                {language === 'zh' ? '再次复习' : 'Review Again'}
              </button>
              <button
                onClick={() => setShowAddCard(true)}
                className="px-6 py-2.5 border border-border-subtle rounded-lg hover:bg-bg-secondary transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {language === 'zh' ? '添加卡片' : 'Add Card'}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="w-full max-w-2xl aspect-[4/3] relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentCardIndex + (isFlipped ? '-back' : '-front')}
                  initial={{ opacity: 0, rotateY: isFlipped ? -90 : 90 }}
                  animate={{ opacity: 1, rotateY: 0 }}
                  exit={{ opacity: 0, rotateY: isFlipped ? 90 : -90 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0 bg-bg-primary border border-border-subtle rounded-2xl p-12 flex flex-col justify-center items-center cursor-pointer shadow-xl"
                  onClick={() => setIsFlipped(!isFlipped)}
                >
                  {!isFlipped ? (
                    <div className="text-center">
                      <p className="text-xs uppercase tracking-widest text-text-secondary mb-4">{language === 'zh' ? '问题' : 'Question'}</p>
                      <h2 className="text-2xl font-serif leading-relaxed">{currentCard.question}</h2>
                      <p className="text-sm text-text-secondary mt-8">{language === 'zh' ? '点击查看答案' : 'Click to reveal'}</p>
                    </div>
                  ) : (
                    <div className="text-center w-full">
                      <p className="text-xs uppercase tracking-widest text-text-secondary mb-4">{language === 'zh' ? '答案' : 'Answer'}</p>
                      <p className="text-lg leading-relaxed mb-8">{currentCard.answer}</p>
                      <div className="flex flex-col gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const source = getSourceKnowledge(currentCard.id);
                            if (source) navigate(`/note/${source.id}`);
                          }}
                          className="inline-flex items-center justify-center gap-2 text-sm text-text-secondary hover:text-accent transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          {language === 'zh' ? '查看出处' : 'View Source'}
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleNextCard(); }}
                          className="px-6 py-2.5 bg-text-primary text-bg-primary rounded-lg hover:bg-text-secondary transition-colors"
                        >
                          {currentCardIndex < deckCards.length - 1 ? (language === 'zh' ? '下一张' : 'Next') : (language === 'zh' ? '完成' : 'Finish')}
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="mt-8 flex items-center gap-4 text-xs uppercase tracking-widest text-text-secondary">
              <span>{language === 'zh' ? '进度' : 'Progress'}</span>
              <div className="w-48 h-1 bg-border-subtle rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-text-primary"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <span>{currentCardIndex + 1} / {deckCards.length}</span>
            </div>
          </>
        )}
      </div>

      {/* Create deck modal */}
      <AnimatePresence>
        {showCreateDeck && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowCreateDeck(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-bg-primary border border-border-subtle rounded-xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-medium mb-4">{language === 'zh' ? '创建复习库' : 'Create Review Deck'}</h2>
              <input
                type="text"
                value={newDeckName}
                onChange={(e) => setNewDeckName(e.target.value)}
                placeholder={language === 'zh' ? '复习库名称' : 'Deck name'}
                className="w-full px-4 py-2 border border-border-subtle rounded-lg mb-3 focus:outline-none focus:border-text-primary"
                autoFocus
              />
              <textarea
                value={newDeckDesc}
                onChange={(e) => setNewDeckDesc(e.target.value)}
                placeholder={language === 'zh' ? '描述（可选）' : 'Description (optional)'}
                className="w-full px-4 py-2 border border-border-subtle rounded-lg mb-4 focus:outline-none focus:border-text-primary resize-none"
                rows={3}
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCreateDeck(false)}
                  className="flex-1 px-4 py-2 border border-border-subtle rounded-lg hover:bg-bg-secondary transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleCreateDeck}
                  disabled={!newDeckName.trim()}
                  className="flex-1 px-4 py-2 bg-text-primary text-bg-primary rounded-lg hover:bg-text-secondary transition-colors disabled:opacity-50"
                >
                  {language === 'zh' ? '创建' : 'Create'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-bg-primary border border-border-subtle rounded-xl p-6 w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-medium mb-4">{language === 'zh' ? '确认删除' : 'Confirm Delete'}</h2>
              <p className="text-sm text-text-secondary mb-6">
                {language === 'zh' ? '确定要删除此复习库吗？此操作无法撤销。' : 'Are you sure you want to delete this deck? This action cannot be undone.'}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 border border-border-subtle rounded-lg hover:bg-bg-secondary transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={() => {
                    if (showDeleteConfirm) {
                      deleteReviewDeck(showDeleteConfirm);
                      setShowDeleteConfirm(null);
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  {language === 'zh' ? '删除' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}\n      </AnimatePresence>

      {/* Add card modal */}
      <AnimatePresence>
        {showAddCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowAddCard(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-bg-primary border border-border-subtle rounded-xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-medium mb-4">{language === 'zh' ? '添加复习卡片' : 'Add Review Card'}</h2>

              <div className="mb-4">
                <label className="block text-sm text-text-secondary mb-2">{language === 'zh' ? '从知识库选择（可选）' : 'Select from Knowledge (Optional)'}</label>
                <select
                  value={selectedKnowledgeId}
                  onChange={(e) => {
                    setSelectedKnowledgeId(e.target.value);
                    if (e.target.value) {
                      const knowledge = knowledgeList.find(k => k.id === e.target.value);
                      if (knowledge) {
                        setNewQuestion(knowledge.title);
                        setNewAnswer(knowledge.summary);
                      }
                    }
                  }}
                  className="w-full px-4 py-2 border border-border-subtle rounded-lg focus:outline-none focus:border-text-primary mb-3"
                >
                  <option value="">{language === 'zh' ? '手动输入' : 'Manual input'}</option>
                  {knowledgeList.map(k => (
                    <option key={k.id} value={k.id}>{k.title}</option>
                  ))}
                </select>
              </div>

              <input
                type="text"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder={language === 'zh' ? '问题' : 'Question'}
                className="w-full px-4 py-2 border border-border-subtle rounded-lg mb-3 focus:outline-none focus:border-text-primary"
                autoFocus
              />
              <textarea
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                placeholder={language === 'zh' ? '答案' : 'Answer'}
                className="w-full px-4 py-2 border border-border-subtle rounded-lg mb-4 focus:outline-none focus:border-text-primary resize-none"
                rows={4}
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddCard(false)}
                  className="flex-1 px-4 py-2 border border-border-subtle rounded-lg hover:bg-bg-secondary transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleAddCard}
                  disabled={(!newQuestion.trim() || !newAnswer.trim()) && !selectedKnowledgeId}
                  className="flex-1 px-4 py-2 bg-text-primary text-bg-primary rounded-lg hover:bg-text-secondary transition-colors disabled:opacity-50"
                >
                  {language === 'zh' ? '添加' : 'Add'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
