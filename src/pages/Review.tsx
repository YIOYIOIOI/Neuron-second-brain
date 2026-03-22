import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../store/useStore';
import { Plus, Trash2, BookOpen, ArrowRight, ExternalLink } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { useNavigate } from 'react-router-dom';
import { ReviewDeck, ReviewCard } from '../types';

export default function Review() {
  const { reviewDecks, reviewCards, activeReviewDeckId, setActiveReviewDeckId, addReviewDeck, deleteReviewDeck, addReviewCard, updateReviewCard, deleteReviewCard, knowledgeList } = useStore();
  const { t, language } = useTranslation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDeck, setShowCreateDeck] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckDesc, setNewDeckDesc] = useState('');
  const [reviewMode, setReviewMode] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 150);
    return () => clearTimeout(timer);
  }, []);

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

  const handleNextCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      if (currentCardIndex < deckCards.length - 1) {
        setCurrentCardIndex(prev => prev + 1);
      } else {
        setReviewMode(false);
        setCurrentCardIndex(0);
      }
    }, 300);
  };

  const getSourceKnowledge = (cardId: string) => {
    const card = reviewCards.find(c => c.id === cardId);
    if (!card) return null;
    return knowledgeList.find(k => k.id === card.sourceKnowledgeId);
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

  // Review mode
  if (reviewMode && activeDeck && deckCards.length > 0) {
    const progress = Math.round(((currentCardIndex + 1) / deckCards.length) * 100);

    return (
      <div className="px-8 md:px-24 py-12 min-h-screen max-w-4xl mx-auto flex flex-col items-center justify-center">
        <header className="absolute top-12 left-8 md:left-24">
          <h1 className="text-4xl font-serif tracking-tighter mb-2">{activeDeck.name}</h1>
          <p className="text-text-secondary text-sm">{language === 'zh' ? '复习模式' : 'Review Mode'}</p>
        </header>

        <div className="w-full max-w-2xl aspect-[4/3] relative mt-32">
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
                  <p className="text-lg leading-relaxed mb-6">{currentCard.answer}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const source = getSourceKnowledge(currentCard.id);
                      if (source) navigate(`/note/${source.id}`);
                    }}
                    className="inline-flex items-center gap-2 text-sm text-accent hover:underline"
                  >
                    <ExternalLink className="w-4 h-4" />
                    {language === 'zh' ? '查看出处' : 'View Source'}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleNextCard(); }}
                    className="mt-8 px-6 py-2 bg-text-primary text-bg-primary rounded-lg hover:bg-text-secondary transition-colors"
                  >
                    {currentCardIndex < deckCards.length - 1 ? (language === 'zh' ? '下一张' : 'Next') : (language === 'zh' ? '完成' : 'Finish')}
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-16 flex items-center gap-4 text-xs uppercase tracking-widest text-text-secondary">
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
      </div>
    );
  }

  // Deck list view
  return (
    <div className="px-8 md:px-24 py-12 min-h-screen">
      <header className="mb-12 border-b border-border-subtle pb-6">
        <h1 className="text-5xl font-serif tracking-tighter mb-2">{t('reviewTitle')}</h1>
        <p className="text-text-secondary text-base font-light max-w-md">{language === 'zh' ? '创建复习库，添加知识卡片进行间隔重复学习' : 'Create review decks and add cards for spaced repetition'}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Create new deck card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="border-2 border-dashed border-border-subtle rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-text-secondary transition-colors min-h-[200px]"
          onClick={() => setShowCreateDeck(true)}
        >
          <Plus className="w-8 h-8 text-text-secondary mb-2" />
          <p className="text-sm text-text-secondary">{language === 'zh' ? '创建复习库' : 'Create Deck'}</p>
        </motion.div>

        {/* Existing decks */}
        {reviewDecks.map(deck => {
          const cardCount = reviewCards.filter(c => c.deckId === deck.id).length;
          return (
            <motion.div
              key={deck.id}
              whileHover={{ scale: 1.02 }}
              className="border border-border-subtle rounded-xl p-6 flex flex-col cursor-pointer hover:border-text-secondary transition-colors"
              onClick={() => {
                setActiveReviewDeckId(deck.id);
                if (cardCount > 0) {
                  setReviewMode(true);
                  setCurrentCardIndex(0);
                  setIsFlipped(false);
                }
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <BookOpen className="w-6 h-6 text-text-secondary" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(language === 'zh' ? '确定删除此复习库？' : 'Delete this deck?')) {
                      deleteReviewDeck(deck.id);
                    }
                  }}
                  className="p-1 hover:bg-border-subtle rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-text-secondary" />
                </button>
              </div>
              <h3 className="text-lg font-medium mb-2">{deck.name}</h3>
              <p className="text-sm text-text-secondary mb-4 line-clamp-2">{deck.description}</p>
              <div className="mt-auto flex items-center justify-between text-xs text-text-secondary">
                <span>{cardCount} {language === 'zh' ? '张卡片' : 'cards'}</span>
                {cardCount > 0 && (
                  <span className="flex items-center gap-1">
                    {language === 'zh' ? '开始复习' : 'Start'} <ArrowRight className="w-3 h-3" />
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
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
    </div>
  );
}
