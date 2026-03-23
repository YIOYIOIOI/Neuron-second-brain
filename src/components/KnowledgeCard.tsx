import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowUpRight, Pin, PinOff, FileText, Lightbulb, Trash2, Palette } from 'lucide-react';
import { KnowledgeItem } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { useStore } from '../store/useStore';

interface Props {
  key?: string;
  item: KnowledgeItem;
}

export function KnowledgeCard({ item }: Props) {
  const { t, language } = useTranslation();
  const { pinnedCards, pinCard, unpinCard, deleteKnowledge } = useStore();
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });

  const isPinned = pinnedCards.some(c => c.id === item.id);

  const handlePin = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isPinned) {
      unpinCard(item.id);
    } else {
      pinCard({ id: item.id, title: item.title, summary: item.summary });
    }
  };

  const dateStr = new Date(item.createdAt).toLocaleDateString(
    language === 'zh' ? 'zh-CN' : 'en-US',
    { month: 'short', day: 'numeric', year: 'numeric' }
  );
  const readTime = Math.max(1, Math.ceil(item.content.split(' ').length / 200)) + ' ' + t('readTime');
  const importanceScore = Math.round(
    (item.content.length * 0.01) + ((item.backlinks?.length || 0) * 5) + ((item.accessCount || 0) * 2)
  );
  const itemType = item.type || 'note';

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('knowledge-id', item.id);
    e.dataTransfer.effectAllowed = 'move';
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenuPos({ x: e.clientX, y: e.clientY });
    setShowContextMenu(true);
  };

  const handleDelete = () => {
    deleteKnowledge(item.id);
    setShowContextMenu(false);
  };

  const handleOpen = () => {
    navigate(`/note/${item.id}`);
    setShowContextMenu(false);
  };

  const handleTogglePin = () => {
    if (isPinned) {
      unpinCard(item.id);
    } else {
      pinCard({ id: item.id, title: item.title, summary: item.summary });
    }
    setShowContextMenu(false);
  };

  return (
    <>
      <article
        className={`note-card group flex flex-col h-full cursor-grab active:cursor-grabbing transition-all duration-300 bg-bg-primary border border-border-subtle rounded-lg p-4 md:p-6 hover:shadow-xl hover:border-text-secondary hover:-translate-y-1 ${
          isDragging ? 'opacity-40 scale-[0.98]' : 'opacity-100'
        }`}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onContextMenu={handleContextMenu}
      >
        <Link
          to={`/note/${item.id}`}
          className="flex flex-col h-full"
          draggable={false}
          onClick={(e) => isDragging && e.preventDefault()}
        >
          <div className="flex justify-between items-center mb-4 md:mb-6 text-xs uppercase tracking-widest font-mono text-text-secondary border-b border-border-subtle pb-3 md:pb-4">
            <div className="flex items-center gap-2 md:gap-3">
              {itemType === 'concept' ? (
                <Lightbulb className="w-3.5 h-3.5 text-accent" />
              ) : itemType === 'canvas' ? (
                <Palette className="w-3.5 h-3.5 text-accent" />
              ) : (
                <FileText className="w-3.5 h-3.5" />
              )}
              <span>{dateStr}</span>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <span className="flex items-center gap-1" title={t('importance')}>
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                {importanceScore}
              </span>
              <span className="hidden sm:inline">{readTime}</span>
            </div>
          </div>

          <h2 className="text-xl md:text-2xl lg:text-3xl font-serif leading-tight mb-3 md:mb-4 group-hover:text-accent transition-colors duration-300">
            {item.title}
          </h2>

          <p className="text-sm md:text-base text-text-secondary font-light leading-relaxed mb-6 md:mb-8 flex-grow">
            {item.summary}
          </p>

          <div className="flex justify-between items-center mt-auto pt-4 md:pt-6 border-t border-transparent group-hover:border-border-subtle transition-colors duration-300">
            <div className="flex gap-2 flex-wrap">
              {item.tags.slice(0, 2).map(tag => (
                <span
                  key={tag}
                  className="text-xs uppercase tracking-wider font-medium text-text-secondary bg-bg-secondary px-2 py-1 rounded-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePin}
                className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-300 ${
                  isPinned
                    ? 'bg-text-primary text-bg-primary border-text-primary'
                    : 'border-border-subtle hover:bg-text-primary hover:text-bg-primary hover:scale-110'
                }`}
                title={isPinned ? t('unpin') : t('pin')}
              >
                {isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
              </button>
              <div className="w-8 h-8 rounded-full border border-border-subtle flex items-center justify-center group-hover:bg-text-primary group-hover:text-bg-primary transition-all duration-300 transform group-hover:scale-110">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </Link>
      </article>

      {showContextMenu && (
        <>
          <div className="fixed inset-0 z-50" onClick={() => setShowContextMenu(false)} />
          <div
            className="fixed z-[60] bg-bg-primary border border-border-subtle rounded-lg shadow-xl py-1 min-w-[120px]"
            style={{ left: contextMenuPos.x, top: contextMenuPos.y }}
          >
            <button
              onClick={handleOpen}
              className="w-full px-4 py-2 text-left text-sm hover:bg-bg-secondary transition-colors flex items-center gap-2"
            >
              <ArrowUpRight className="w-4 h-4" />
              {language === 'zh' ? '打开' : 'Open'}
            </button>
            <button
              onClick={handleTogglePin}
              className="w-full px-4 py-2 text-left text-sm hover:bg-bg-secondary transition-colors flex items-center gap-2"
            >
              {isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
              {isPinned ? (language === 'zh' ? '取消固定' : 'Unpin') : (language === 'zh' ? '固定' : 'Pin')}
            </button>
            <button
              onClick={handleDelete}
              className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 hover:text-red-600 transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              {language === 'zh' ? '删除' : 'Delete'}
            </button>
          </div>
        </>
      )}
    </>
  );
}
