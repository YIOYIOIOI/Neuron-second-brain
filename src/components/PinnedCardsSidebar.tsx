import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useTranslation } from '../hooks/useTranslation';
import { ChevronRight, ChevronLeft, PinOff, PenTool } from 'lucide-react';
import { cn } from './Navbar';

interface PinnedNode {
  id: string;
  title: string;
  summary: string;
}

export function PinnedCardsSidebar() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { pinnedCards, unpinCard, setEditorState } = useStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleWriteWithPinned = () => {
    if (pinnedCards.length === 0) return;
    const content = pinnedCards.map((node, idx) =>
      `${idx + 1}. **${node.title}**: ${node.summary}`
    ).join('\n\n');
    setEditorState({ content, isOpen: true });
    navigate('/writing');
  };

  if (pinnedCards.length === 0) {
    return (
      <motion.div
        initial={{ x: 320 }}
        animate={{ x: isCollapsed ? 320 : 0 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="fixed right-0 top-16 h-[calc(100vh-4rem)] w-80 bg-bg-primary border-l border-border-subtle shadow-xl z-40 flex items-center justify-center"
      >
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -left-8 top-4 w-8 h-12 bg-bg-primary border border-r-0 border-border-subtle rounded-l-lg flex items-center justify-center hover:bg-bg-secondary transition-colors shadow-lg"
        >
          {isCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
        <p className="text-text-secondary text-sm">{t('noPinnedCards')}</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ x: 300 }}
      animate={{ x: isCollapsed ? 240 : 0 }}
      exit={{ x: 300 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="fixed right-0 top-16 h-[calc(100vh-4rem)] w-80 bg-bg-primary border-l border-border-subtle shadow-xl z-40 flex flex-col"
    >
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -left-8 top-4 w-8 h-12 bg-bg-primary border border-r-0 border-border-subtle rounded-l-lg flex items-center justify-center hover:bg-bg-secondary transition-colors"
      >
        {isCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      <div className="p-4 border-b border-border-subtle">
        <h3 className="text-sm font-medium mb-1">
          {t('pinnedCards')} ({pinnedCards.length})
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <AnimatePresence>
          {pinnedCards.map(node => (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-3 bg-bg-secondary/50 rounded-lg border border-border-subtle hover:border-text-secondary/30 transition-colors group"
            >
              <div className="flex items-start justify-between mb-2">
                <h4
                  className="font-medium text-sm cursor-pointer hover:text-accent transition-colors line-clamp-1"
                  onClick={() => navigate(`/note/${node.id}`)}
                >
                  {node.title}
                </h4>
                <button
                  onClick={() => unpinCard(node.id)}
                  className="p-1 opacity-0 group-hover:opacity-100 hover:bg-border-subtle rounded transition-all"
                >
                  <PinOff className="w-3 h-3" />
                </button>
              </div>
              <p className="text-xs text-text-secondary line-clamp-2">{node.summary}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="p-4 border-t border-border-subtle">
        <button
          onClick={handleWriteWithPinned}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-text-primary text-bg-primary rounded-lg hover:bg-text-secondary transition-colors text-sm font-medium"
        >
          <PenTool className="w-4 h-4" />
          {t('writeWithPinned')}
        </button>
      </div>
    </motion.div>
  );
}
