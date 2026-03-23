import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useParams, useNavigate, Routes, Route } from 'react-router-dom';
import Detail from '../pages/Detail';

function SplitViewContent() {
  const { splitViewKnowledgeId } = useStore();
  return <Detail key={splitViewKnowledgeId} />;
}

export function SplitView() {
  const { splitViewOpen, splitViewWidth, splitViewKnowledgeId, setSplitViewOpen, setSplitViewWidth } = useStore();
  const [isResizing, setIsResizing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (splitViewOpen && splitViewKnowledgeId) {
      navigate(`/note/${splitViewKnowledgeId}`, { replace: false });
    }
  }, [splitViewKnowledgeId, splitViewOpen]);

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

  if (!splitViewOpen || !splitViewKnowledgeId) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: splitViewWidth }}
        animate={{ x: 0 }}
        exit={{ x: splitViewWidth }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="fixed right-0 top-14 h-[calc(100vh-3.5rem)] bg-bg-primary border-l border-border-subtle shadow-2xl z-50 overflow-hidden"
        style={{ width: splitViewWidth }}
      >
        <div
          onMouseDown={() => setIsResizing(true)}
          className="absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-accent/50 transition-colors z-50"
        />
        <button
          onClick={() => setSplitViewOpen(false)}
          className="absolute top-4 right-4 z-50 p-2 bg-bg-secondary hover:bg-border-subtle rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="h-full overflow-y-auto">
          <SplitViewContent />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
