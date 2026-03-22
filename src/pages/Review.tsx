import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../store/useStore';
import { Check, X, ArrowRight } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { Link } from 'react-router-dom';

export default function Review() {
  const { knowledgeList } = useStore();
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  // Only review items that have a summary
  const reviewItems = knowledgeList.filter(item => item.summary);

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setReviewedCount(prev => prev + 1);
      setCurrentIndex((prev) => prev + 1);
    }, 300);
  };

  if (isLoading) {
    return (
      <div className="px-8 md:px-24 lg:px-48 py-12 min-h-screen max-w-5xl mx-auto flex flex-col items-center justify-center relative bg-bg-primary text-text-primary">
        <header className="absolute top-12 left-8 md:left-24 lg:left-48 border-b border-border-subtle pb-8 w-full max-w-md">
          <h1 className="text-5xl md:text-7xl font-serif tracking-tighter mb-4">{t('reviewTitle')}</h1>
          <p className="text-text-secondary text-lg font-light max-w-md leading-relaxed">
            {t('reviewDesc')}
          </p>
        </header>

        <div className="w-full max-w-2xl aspect-[4/3] relative mt-32">
          <div className="w-full h-full bg-bg-secondary/20 rounded-sm border border-border-subtle p-12 flex flex-col justify-center items-center text-center animate-pulse">
            <div className="h-8 bg-border-subtle rounded w-3/4 mb-8"></div>
            <div className="h-4 bg-border-subtle rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (reviewItems.length === 0) {
    return <div className="min-h-screen flex items-center justify-center font-serif text-2xl">{t('noReviewItems')}</div>;
  }

  const isCompleted = reviewedCount >= reviewItems.length;
  const currentItem = reviewItems[currentIndex % reviewItems.length];
  const progressPercentage = Math.round((reviewedCount / reviewItems.length) * 100);

  return (
    <div className="px-8 md:px-24 lg:px-48 py-12 min-h-screen max-w-5xl mx-auto flex flex-col items-center justify-center relative bg-bg-primary text-text-primary">
      <header className="absolute top-12 left-8 md:left-24 lg:left-48 border-b border-border-subtle pb-8 w-full max-w-md">
        <h1 className="text-5xl md:text-7xl font-serif tracking-tighter mb-4">{t('reviewTitle')}</h1>
        <p className="text-text-secondary text-lg font-light max-w-md leading-relaxed">
          {t('reviewDesc')}
        </p>
      </header>

      <div className="w-full max-w-2xl aspect-[4/3] relative perspective-1000 mt-32">
        <AnimatePresence mode="wait">
          {isCompleted ? (
            <motion.div
              key="completed"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 w-full h-full bg-white shadow-xl border border-border-subtle rounded-3xl p-12 flex flex-col justify-center items-center text-center"
            >
              <h2 className="text-4xl md:text-5xl font-serif leading-tight mb-8">
                {t('completedReview')}
              </h2>
              <Link
                to="/dashboard"
                className="group inline-flex items-center gap-4 text-sm uppercase tracking-widest font-medium border-b border-text-primary pb-2 hover:text-text-secondary hover:border-text-secondary transition-colors"
              >
                {t('backToIndex')}
                <motion.span
                  className="inline-block"
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <ArrowRight className="w-4 h-4" />
                </motion.span>
              </Link>
            </motion.div>
          ) : (
            <motion.div
              key={currentIndex + (isFlipped ? '-back' : '-front')}
              initial={{ opacity: 0, rotateY: isFlipped ? -90 : 90, scale: 0.9 }}
              animate={{ opacity: 1, rotateY: 0, scale: 1 }}
              exit={{ opacity: 0, rotateY: isFlipped ? 90 : -90, scale: 0.9 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 w-full h-full bg-white shadow-xl border border-border-subtle rounded-3xl p-12 flex flex-col justify-center items-center text-center cursor-pointer"
              onClick={() => setIsFlipped(!isFlipped)}
              style={{ backfaceVisibility: 'hidden' }}
            >
              {!isFlipped ? (
                <>
                  <div className="text-xs uppercase tracking-widest font-mono text-text-secondary mb-8">
                    {t('card')} {currentIndex + 1} {t('of')} {reviewItems.length}
                  </div>
                  <h2 className="text-4xl md:text-5xl font-serif leading-tight">
                    {currentItem.title}
                  </h2>
                  <div className="mt-12 text-sm uppercase tracking-widest font-medium text-text-secondary border-b border-text-secondary pb-1 inline-block">
                    {t('clickToReveal')}
                  </div>
                </>
              ) : (
                <>
                  <div className="text-xs uppercase tracking-widest font-mono text-text-secondary mb-8">
                    {t('aiSummary')}
                  </div>
                  <p className="text-xl md:text-2xl font-light leading-relaxed text-text-primary">
                    {currentItem.summary}
                  </p>
                  <div className="mt-auto pt-12 flex gap-8">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleNext(); }}
                      className="w-16 h-16 rounded-full border border-border-subtle flex items-center justify-center text-text-secondary hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleNext(); }}
                      className="w-16 h-16 rounded-full border border-border-subtle flex items-center justify-center text-text-secondary hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition-colors"
                    >
                      <Check className="w-6 h-6" />
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <div className="mt-16 flex items-center gap-4 text-xs uppercase tracking-widest font-mono text-text-secondary">
        <span>Progress</span>
        <div className="w-48 h-1 bg-border-subtle rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-text-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <span>{progressPercentage}%</span>
      </div>
    </div>
  );
}
