import { useState } from 'react';
import { motion } from 'motion/react';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { KnowledgeItem } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { PinnedCardsSidebar } from '../components/PinnedCardsSidebar';

export default function Capture() {
  const [content, setContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { addKnowledge } = useStore();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleCapture = async () => {
    if (!content.trim()) return;
    setIsGenerating(true);

    // Simulate AI structuring
    await new Promise(resolve => setTimeout(resolve, 2000));

    const title = content.split('\n')[0].substring(0, 40) + (content.length > 40 ? '...' : '');
    const summary = `AI Summary: ${content.slice(0, 100)}...`;
    const tags = ['captured', 'unprocessed'];

    const newItem: KnowledgeItem = {
      id: Date.now().toString(),
      title,
      content,
      summary,
      tags,
      relatedIds: [],
      createdAt: new Date().toISOString(),
    };

    addKnowledge(newItem);

    setIsGenerating(false);
    navigate(`/note/${newItem.id}`);
  };

  return (
    <div className="px-8 md:px-24 lg:px-48 py-12 min-h-screen max-w-5xl mx-auto flex flex-col">
      <header className="mb-16 border-b border-border-subtle pb-8">
        <h1 className="text-5xl md:text-7xl font-serif tracking-tighter mb-4">{t('captureTitle')}</h1>
        <p className="text-text-secondary text-lg font-light max-w-md leading-relaxed">
          {t('captureDesc')}
        </p>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="flex-grow flex flex-col"
      >
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t('thoughtPlaceholder')}
          className="w-full flex-grow bg-transparent text-2xl md:text-3xl font-light leading-relaxed focus:outline-none resize-none placeholder:text-text-secondary/30"
          autoFocus
          disabled={isGenerating}
        />

        <div className="mt-8 flex justify-between items-center border-t border-border-subtle pt-8">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-mono text-text-secondary">
            <Sparkles className="w-4 h-4" />
            {t('aiStructureNote') || 'AI will automatically structure this note'}
          </div>
          
          <button
            onClick={handleCapture}
            disabled={!content.trim() || isGenerating}
            className="group flex items-center gap-3 px-6 py-3 bg-text-primary text-bg-primary rounded-full text-sm uppercase tracking-widest font-medium disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> {t('generating')}
              </>
            ) : (
              <>
                {t('saveThought')} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>
      </motion.div>
      <PinnedCardsSidebar />
    </div>
  );
}
