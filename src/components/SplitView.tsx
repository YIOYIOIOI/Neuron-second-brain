import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { useStore } from '../store/useStore';
import Detail from '../pages/Detail';

export function SplitView() {
  const { splitViewOpen, splitViewWidth, splitViewKnowledgeId, setSplitViewOpen, setSplitViewWidth } = useStore();
  const [isResizing, setIsResizing] = useState(false);
  const [mountedKnowledgeId, setMountedKnowledgeId] = useState<string | null>(null);

  useEffect(() => {
    if (splitViewOpen && splitViewKnowledgeId && !mountedKnowledgeId) {
      setMountedKnowledgeId(splitViewKnowledgeId);
    } else if (!splitViewOpen) {
      setMountedKnowledgeId(null);
    }
  }, [splitViewOpen, splitViewKnowledgeId, mountedKnowledgeId]);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = Math.max(400, Math.min(1000, window.innerWidth - e.clientX));
      setSplitViewWidth(newWidth);
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
  }, [isResizing, setSplitViewWidth]);

  if (!splitViewOpen || !mountedKnowledgeId) return null;

  return (
    <motion.div
      key="split-view"
      initial={{ x: splitViewWidth }}
      animate={{ x: 0 }}
      exit={{ x: splitViewWidth }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="fixed right-0 top-14 h-[calc(100vh-3.5rem)] bg-bg-primary border-l border-border-subtle shadow-2xl z-[60] overflow-hidden"
      style={{ width: splitViewWidth }}
    >
      <div
        onMouseDown={() => setIsResizing(true)}
        className="absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-accent/50 transition-colors z-[70]"
      />
      <button
        onClick={() => {
          setSplitViewOpen(false);
        }}
        className="absolute top-4 right-4 z-[70] p-2 bg-bg-secondary hover:bg-border-subtle rounded-lg transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
      <div className="h-full overflow-y-auto">
        <Detail knowledgeId={mountedKnowledgeId} key={mountedKnowledgeId} />
      </div>
    </motion.div>
  );
}
