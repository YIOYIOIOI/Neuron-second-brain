import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { FloatingToolbar } from './FloatingToolbar';
import { AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';
import { useStore } from '../store/useStore';

interface Block {
  id: string;
  type: 'text';
  content: string;
}

interface BlockEditorProps {
  initialContent?: string;
  onChange: (blocks: Block[]) => void;
  placeholder?: string;
}

export function BlockEditor({ initialContent = '', onChange, placeholder = 'Start writing...' }: BlockEditorProps) {
  const [blocks, setBlocks] = useState<Block[]>([
    { id: crypto.randomUUID(), type: 'text', content: initialContent }
  ]);
  const blockRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const isComposing = useRef(false);
  const [toolbar, setToolbar] = useState<{ show: boolean; x: number; y: number } | null>(null);
  const selectionRef = useRef<{ blockId: string; range: Range } | null>(null);
  const { smoothCursor } = useStore();

  useEffect(() => {
    onChange(blocks);
  }, [blocks, onChange]);

  useEffect(() => {
    const handleSelectionChange = () => {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
        setToolbar(null);
        return;
      }

      const range = sel.getRangeAt(0);
      const selectedText = range.toString().trim();
      if (!selectedText) {
        setToolbar(null);
        return;
      }

      // Find which block contains the selection
      let blockId: string | null = null;
      for (const [id, el] of blockRefs.current.entries()) {
        if (el.contains(range.commonAncestorContainer)) {
          blockId = id;
          break;
        }
      }

      if (!blockId) return;

      const rect = range.getBoundingClientRect();
      setToolbar({
        show: true,
        x: rect.left + rect.width / 2,
        y: rect.bottom + 8,
      });

      selectionRef.current = { blockId, range: range.cloneRange() };
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, []);

  const focusBlock = (blockId: string, position: 'start' | 'end' | number = 'end') => {
    setTimeout(() => {
      const el = blockRefs.current.get(blockId);
      if (!el) return;

      el.focus();
      const range = document.createRange();
      const sel = window.getSelection();

      if (position === 'start') {
        range.setStart(el.childNodes[0] || el, 0);
      } else if (position === 'end') {
        range.selectNodeContents(el);
        range.collapse(false);
      } else {
        const textNode = el.childNodes[0] || el;
        range.setStart(textNode, Math.min(position, (textNode.textContent || '').length));
      }

      range.collapse(true);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }, 0);
  };

  const getCursorPosition = (el: HTMLDivElement): number => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return 0;

    const range = sel.getRangeAt(0);
    const preRange = range.cloneRange();
    preRange.selectNodeContents(el);
    preRange.setEnd(range.endContainer, range.endOffset);
    return preRange.toString().length;
  };

  const handleKeyDown = (blockId: string, e: KeyboardEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const cursorPos = getCursorPosition(el);
    const content = el.textContent || '';

    // Enter: split block
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();

      const beforeCursor = content.slice(0, cursorPos);
      const afterCursor = content.slice(cursorPos);

      const newBlockId = crypto.randomUUID();

      setBlocks(prev => {
        const idx = prev.findIndex(b => b.id === blockId);
        const updated = [...prev];
        updated[idx] = { ...updated[idx], content: beforeCursor };
        updated.splice(idx + 1, 0, { id: newBlockId, type: 'text', content: afterCursor });
        return updated;
      });

      focusBlock(newBlockId, 'start');
    }

    // Shift + Enter: insert newline
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      document.execCommand('insertLineBreak');
    }

    // Backspace at start: merge with previous
    if (e.key === 'Backspace' && cursorPos === 0) {
      e.preventDefault();

      setBlocks(prev => {
        const idx = prev.findIndex(b => b.id === blockId);
        if (idx === 0) return prev;

        const prevBlock = prev[idx - 1];
        const currentBlock = prev[idx];
        const mergedContent = prevBlock.content + currentBlock.content;
        const cursorPosition = prevBlock.content.length;

        const updated = [...prev];
        updated[idx - 1] = { ...prevBlock, content: mergedContent };
        updated.splice(idx, 1);

        focusBlock(prevBlock.id, cursorPosition);
        return updated;
      });
    }

    // Delete empty block
    if (e.key === 'Backspace' && content === '' && blocks.length > 1) {
      e.preventDefault();

      setBlocks(prev => {
        const idx = prev.findIndex(b => b.id === blockId);
        if (idx === 0) return prev;

        const updated = [...prev];
        updated.splice(idx, 1);
        focusBlock(updated[idx - 1].id, 'end');
        return updated;
      });
    }
  };

  const handleInput = (blockId: string, e: React.FormEvent<HTMLDivElement>) => {
    if (isComposing.current) return;
    const content = e.currentTarget.textContent || '';
    setBlocks(prev => prev.map(b => b.id === blockId ? { ...b, content } : b));
  };

  const handleFormat = (format: string) => {
    if (!selectionRef.current) return;

    const sel = window.getSelection();
    if (!sel) return;

    sel.removeAllRanges();
    sel.addRange(selectionRef.current.range);

    switch (format) {
      case 'bold':
        document.execCommand('bold');
        break;
      case 'italic':
        document.execCommand('italic');
        break;
      case 'underline':
        document.execCommand('underline');
        break;
      case 'strikethrough':
        document.execCommand('strikeThrough');
        break;
      case 'code':
        document.execCommand('insertHTML', false, `<code>${sel.toString()}</code>`);
        break;
      case 'link':
        const url = prompt('Enter URL:');
        if (url) document.execCommand('createLink', false, url);
        break;
      case 'comment':
        toast.success('Comment feature coming soon!');
        break;
    }

    setToolbar(null);
  };

  const handleAI = async (action: string) => {
    if (!selectionRef.current) return;

    const selectedText = selectionRef.current.range.toString();
    toast.loading(`AI ${action}...`);

    // Simulate AI processing
    setTimeout(() => {
      toast.dismiss();
      toast.success(`AI ${action} completed!`);
    }, 1500);

    setToolbar(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);

    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = `\n![${file.name}](${event.target?.result})\n`;
          const newBlockId = crypto.randomUUID();
          setBlocks(prev => [...prev, { id: newBlockId, type: 'text', content: img }]);
          toast.success('Image added!');
        };
        reader.readAsDataURL(file);
      } else {
        toast.success(`File "${file.name}" uploaded!`);
      }
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <>
      <div
        className={`space-y-1 ${smoothCursor ? 'smooth-cursor' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {blocks.map((block, idx) => (
          <div
            key={block.id}
            ref={el => {
              if (el && !blockRefs.current.has(block.id)) {
                blockRefs.current.set(block.id, el);
                if (el.textContent !== block.content) {
                  el.textContent = block.content;
                }
              }
            }}
            contentEditable
            suppressContentEditableWarning
            onKeyDown={e => handleKeyDown(block.id, e)}
            onInput={e => handleInput(block.id, e)}
            onCompositionStart={() => isComposing.current = true}
            onCompositionEnd={(e) => {
              isComposing.current = false;
              handleInput(block.id, e as any);
            }}
            className="min-h-[1.5em] px-4 py-2 focus:outline-none focus:bg-bg-secondary/30 rounded transition-colors"
            data-placeholder={idx === 0 && !block.content ? placeholder : ''}
            style={{
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
            }}
          />
        ))}
      </div>

      <AnimatePresence>
        {toolbar?.show && (
          <FloatingToolbar
            x={toolbar.x}
            y={toolbar.y}
            onFormat={handleFormat}
            onAI={handleAI}
          />
        )}
      </AnimatePresence>
    </>
  );
}
