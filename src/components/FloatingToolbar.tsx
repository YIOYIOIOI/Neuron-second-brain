import { useState } from 'react';
import {
  Type, Palette, Bold, Italic, Underline, Link2, Strikethrough,
  Code, MoreHorizontal, MessageSquare, Sparkles, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../store/useStore';

interface FloatingToolbarProps {
  x: number;
  y: number;
  onFormat: (format: string) => void;
  onAI: (action: string) => void;
}

export function FloatingToolbar({ x, y, onFormat, onAI }: FloatingToolbarProps) {
  const [showMore, setShowMore] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const { language, smoothCursor, setSmoothCursor } = useStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className="fixed z-50 bg-bg-primary border border-border-subtle rounded-lg shadow-2xl backdrop-blur-sm"
      style={{ left: x, top: y }}
    >
      <div className="p-1.5 space-y-1">
        {/* Format buttons */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => onFormat('text')}
            className="p-1.5 hover:bg-bg-secondary rounded transition-colors"
            title="Turn into text"
          >
            <Type size={16} className="text-text-secondary" />
          </button>
          <button
            onClick={() => setShowMore(!showMore)}
            className="p-1.5 hover:bg-bg-secondary rounded transition-colors"
            title="Text color"
          >
            <Palette size={16} className="text-text-secondary" />
          </button>
          <div className="w-px h-4 bg-border-subtle mx-0.5" />
          <button
            onClick={() => onFormat('bold')}
            className="p-1.5 hover:bg-bg-secondary rounded transition-colors"
            title="Bold"
          >
            <Bold size={16} className="text-text-secondary" />
          </button>
          <button
            onClick={() => onFormat('italic')}
            className="p-1.5 hover:bg-bg-secondary rounded transition-colors"
            title="Italic"
          >
            <Italic size={16} className="text-text-secondary" />
          </button>
          <button
            onClick={() => onFormat('underline')}
            className="p-1.5 hover:bg-bg-secondary rounded transition-colors"
            title="Underline"
          >
            <Underline size={16} className="text-text-secondary" />
          </button>
          <button
            onClick={() => onFormat('link')}
            className="p-1.5 hover:bg-bg-secondary rounded transition-colors"
            title="Link"
          >
            <Link2 size={16} className="text-text-secondary" />
          </button>
          <button
            onClick={() => onFormat('strikethrough')}
            className="p-1.5 hover:bg-bg-secondary rounded transition-colors"
            title="Strikethrough"
          >
            <Strikethrough size={16} className="text-text-secondary" />
          </button>
          <button
            onClick={() => onFormat('code')}
            className="p-1.5 hover:bg-bg-secondary rounded transition-colors"
            title="Code"
          >
            <Code size={16} className="text-text-secondary" />
          </button>
          <div className="w-px h-4 bg-border-subtle mx-0.5" />
          <button
            onClick={() => setSmoothCursor(!smoothCursor)}
            className={`p-1.5 rounded transition-colors ${smoothCursor ? 'bg-accent/20' : 'hover:bg-bg-secondary'}`}
            title={language === 'zh' ? '平滑光标' : 'Smooth cursor'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-secondary">
              <path d="M3 12h18M12 3v18"/>
            </svg>
          </button>
          <button
            onClick={() => setShowMore(!showMore)}
            className="p-1.5 hover:bg-bg-secondary rounded transition-colors"
            title="More"
          >
            <MoreHorizontal size={16} className="text-text-secondary" />
          </button>
        </div>

        {/* Comment */}
        <div className="flex items-center gap-1 pt-1 border-t border-border-subtle">
          <button
            onClick={() => onFormat('comment')}
            className="flex items-center gap-1.5 px-2 py-1 hover:bg-bg-secondary rounded transition-colors text-xs text-text-secondary w-full"
          >
            <MessageSquare size={14} />
            <span>{language === 'zh' ? '添加评论' : 'Add comment'}</span>
          </button>
        </div>

        {/* AI Actions */}
        <div className="pt-1 border-t border-border-subtle">
          <button
            onClick={() => setShowAI(!showAI)}
            className="flex items-center justify-between gap-1.5 px-2 py-1 hover:bg-bg-secondary rounded transition-colors text-xs text-text-secondary w-full"
          >
            <div className="flex items-center gap-1.5">
              <Sparkles size={14} />
              <span>{language === 'zh' ? 'AI 助手' : 'Ask AI'}</span>
            </div>
            <ChevronDown size={12} className={`transition-transform ${showAI ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showAI && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                <div className="mt-1 space-y-0.5">
                  <button
                    onClick={() => onAI('improve')}
                    className="px-2 py-1 hover:bg-bg-secondary rounded transition-colors text-xs text-text-secondary w-full text-left"
                  >
                    {language === 'zh' ? '提升写作' : 'Improve writing'}
                  </button>
                  <button
                    onClick={() => onAI('fix')}
                    className="px-2 py-1 hover:bg-bg-secondary rounded transition-colors text-xs text-text-secondary w-full text-left"
                  >
                    {language === 'zh' ? '校对' : 'Fix spelling & grammar'}
                  </button>
                  <button
                    onClick={() => onAI('explain')}
                    className="px-2 py-1 hover:bg-bg-secondary rounded transition-colors text-xs text-text-secondary w-full text-left"
                  >
                    {language === 'zh' ? '解释' : 'Explain this'}
                  </button>
                  <button
                    onClick={() => onAI('reformat')}
                    className="px-2 py-1 hover:bg-bg-secondary rounded transition-colors text-xs text-text-secondary w-full text-left"
                  >
                    {language === 'zh' ? '重新格式化' : 'Reformat'}
                  </button>
                  <button
                    onClick={() => onAI('edit')}
                    className="px-2 py-1 hover:bg-bg-secondary rounded transition-colors text-xs text-text-secondary w-full text-left"
                  >
                    {language === 'zh' ? '使用 AI 编辑' : 'Edit with AI'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
