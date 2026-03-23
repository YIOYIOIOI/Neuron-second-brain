import { useEditor, EditorContent, ReactRenderer } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Mention from '@tiptap/extension-mention';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import UnderlineExtension from '@tiptap/extension-underline';
import HighlightExtension from '@tiptap/extension-highlight';
import Dropcursor from '@tiptap/extension-dropcursor';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { common, createLowlight } from 'lowlight';
import { useEffect, useRef, forwardRef, useImperativeHandle, useState } from 'react';
import { SlashMenu } from './SlashMenu';
import tippy, { Instance as TippyInstance } from 'tippy.js';
import { Heading1, Heading2, Heading3, Type, List, Code, GripVertical, Bold, Italic, Underline as UnderlineIcon, Strikethrough, ChevronDown, Smile, ListTodo } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { cn } from '../Navbar';
import { motion, AnimatePresence } from 'motion/react';
import 'tippy.js/dist/tippy.css';

const lowlight = createLowlight(common);

interface AdvancedBlockEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

// @ Mention List Component
interface MentionListProps {
  items: { id: string; title: string }[];
  command: (item: { id: string; title: string }) => void;
}

const MentionList = forwardRef<{ onKeyDown: (props: { event: KeyboardEvent }) => boolean }, MentionListProps>(
  ({ items, command }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => {
      setSelectedIndex(0);
    }, [items]);

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }: { event: KeyboardEvent }) => {
        if (event.key === 'ArrowUp') {
          setSelectedIndex((prev) => (prev - 1 + items.length) % items.length);
          return true;
        }
        if (event.key === 'ArrowDown') {
          setSelectedIndex((prev) => (prev + 1) % items.length);
          return true;
        }
        if (event.key === 'Enter') {
          if (items[selectedIndex]) {
            command(items[selectedIndex]);
          }
          return true;
        }
        return false;
      },
    }));

    if (items.length === 0) {
      return (
        <div className="bg-bg-primary border border-border-subtle rounded-lg shadow-xl p-3 text-sm text-text-secondary">
          No results
        </div>
      );
    }

    return (
      <div className="bg-bg-primary border border-border-subtle rounded-lg shadow-xl overflow-hidden max-h-64 overflow-y-auto">
        {items.map((item, index) => (
          <button
            key={item.id}
            onClick={() => command(item)}
            className={cn(
              'w-full text-left px-3 py-2 text-sm transition-colors',
              index === selectedIndex ? 'bg-bg-secondary' : 'hover:bg-bg-secondary/50'
            )}
          >
            <div className="font-medium truncate text-text-primary">{item.title}</div>
          </button>
        ))}
      </div>
    );
  }
);

MentionList.displayName = 'MentionList';

export function AdvancedBlockEditor({ content, onChange, placeholder = "Type '/' for commands" }: AdvancedBlockEditorProps) {
  const { knowledgeList } = useStore();
  const editorRef = useRef<HTMLDivElement>(null);

  // @ Mention suggestion
  const mentionSuggestion = {
    char: '@',
    items: ({ query }: { query: string }) => {
      return knowledgeList
        .filter(item =>
          item.title.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 8)
        .map(item => ({ id: item.id, title: item.title }));
    },
    render: () => {
      let component: ReactRenderer | null = null;
      let popup: TippyInstance[] | null = null;

      return {
        onStart: (props: any) => {
          component = new ReactRenderer(MentionList, {
            props,
            editor: props.editor,
          });

          if (!props.clientRect) return;

          popup = tippy('body', {
            getReferenceClientRect: props.clientRect,
            appendTo: () => document.body,
            content: component.element,
            showOnCreate: true,
            interactive: true,
            trigger: 'manual',
            placement: 'bottom-start',
          });
        },
        onUpdate(props: any) {
          component?.updateProps(props);
          if (!props.clientRect) return;
          popup?.[0]?.setProps({ getReferenceClientRect: props.clientRect });
        },
        onKeyDown(props: any) {
          if (props.event.key === 'Escape') {
            popup?.[0]?.hide();
            return true;
          }
          return (component?.ref as any)?.onKeyDown?.(props) || false;
        },
        onExit() {
          popup?.[0]?.destroy();
          component?.destroy();
        },
      };
    },
    command: ({ editor, range, props }: any) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent([
          {
            type: 'mention',
            attrs: {
              id: props.id,
              label: props.title,
            },
          },
          { type: 'text', text: ' ' },
        ])
        .run();
    },
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        heading: { levels: [1, 2, 3] },
        dropcursor: false,
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'code-block',
        },
      }),
      UnderlineExtension,
      HighlightExtension.configure({
        multicolor: true,
      }),
      Dropcursor.configure({
        color: 'var(--theme-accent)',
        width: 2,
      }),
      TextStyle,
      Color,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Placeholder.configure({ placeholder }),
      Mention.configure({
        HTMLAttributes: {
          class: 'mention',
        },
        suggestion: mentionSuggestion,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[400px] px-8 py-2',
      },
    },
  });

  const [showTextType, setShowTextType] = useState(false);
  const [showColor, setShowColor] = useState(false);
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiDialogPos, setAiDialogPos] = useState<{ x: number; y: number } | null>(null);
  const [selectedText, setSelectedText] = useState('');
  const [originalText, setOriginalText] = useState('');
  const [selectionRange, setSelectionRange] = useState<{ from: number; to: number } | null>(null);
  const [showAIActions, setShowAIActions] = useState(false);
  const [bubbleMenuPos, setBubbleMenuPos] = useState<{ x: number; y: number } | null>(null);
  const [recentColors, setRecentColors] = useState<Array<{ color: string; type: 'text' | 'bg' }>>([]);
  const { language } = useStore();

  const textColors = [
    '#1A1A1A', '#4A5568', '#718096', '#2D3748', '#3182CE',
    '#2C7A7B', '#38A169', '#D69E2E', '#C05621', '#E53E3E',
  ];

  const bgColors = [
    '#F7FAFC', '#EDF2F7', '#BEE3F8', '#B2F5EA', '#C6F6D5',
    '#FAF089', '#FBD38D', '#FEB2B2', '#FBB6CE', '#D6BCFA',
  ];

  const addRecentColor = (color: string, type: 'text' | 'bg') => {
    setRecentColors(prev => {
      const filtered = prev.filter(c => !(c.color === color && c.type === type));
      return [{ color, type }, ...filtered].slice(0, 10);
    });
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const editorEl = editorRef.current;

      if (showAIDialog && !target.closest('.ai-dialog-container')) {
        setShowAIDialog(false);
        setShowAIActions(false);
        setAiPrompt('');
        return;
      }

      if (editorEl && !editorEl.contains(target) && !target.closest('.ai-dialog-container')) {
        setBubbleMenuPos(null);
        setShowTextType(false);
        setShowColor(false);
        if (showAIDialog) {
          setShowAIDialog(false);
          setShowAIActions(false);
          setAiPrompt('');
        }
      }
    };

    if (showAIDialog || bubbleMenuPos) {
      setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
      }, 0);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showAIDialog, bubbleMenuPos]);

  const handleAIAction = (action: string) => {
    if (!editor) return;
    const { state } = editor.view;
    const { from, to } = state.selection;
    const text = state.doc.textBetween(from, to);

    setSelectedText(text);
    setOriginalText(text);
    setSelectionRange({ from, to });

    const end = editor.view.coordsAtPos(to);

    setAiDialogPos({
      x: end.left,
      y: end.bottom + 10
    });

    setTimeout(() => {
      setBubbleMenuPos(null);
      setShowAIDialog(true);
    }, 0);
  };

  const handleAISend = () => {
    if (!editor || !selectionRange) return;

    // Simulate AI modification
    const modifiedText = selectedText + ' [AI modified]';
    editor.chain().focus().deleteRange(selectionRange).insertContent(modifiedText).run();

    setShowAIActions(true);
  };

  const handleAccept = () => {
    setShowAIDialog(false);
    setShowAIActions(false);
    setAiPrompt('');
  };

  const handleDiscard = () => {
    if (!editor || !selectionRange) return;

    const { state } = editor.view;
    const currentText = state.doc.textBetween(selectionRange.from, state.doc.content.size);
    const modifiedLength = currentText.indexOf('[AI modified]');

    if (modifiedLength > -1) {
      editor.chain().focus()
        .deleteRange({ from: selectionRange.from, to: selectionRange.from + modifiedLength + 14 })
        .insertContent(originalText)
        .run();
    }

    setShowAIDialog(false);
    setShowAIActions(false);
    setAiPrompt('');
  };

  // Track text selection for bubble menu
  useEffect(() => {
    if (!editor) return;

    let isMouseDown = false;

    const handleMouseDown = () => {
      isMouseDown = true;
      setBubbleMenuPos(null);
    };

    const handleMouseUp = () => {
      isMouseDown = false;
      setTimeout(() => {
        const { state } = editor.view;
        const { from, to } = state.selection;

        if (from === to) {
          setBubbleMenuPos(null);
          return;
        }

        const end = editor.view.coordsAtPos(to);
        const editorRect = editorRef.current?.getBoundingClientRect();

        if (editorRect) {
          setBubbleMenuPos({
            x: end.right - editorRect.left + 10,
            y: end.bottom - editorRect.top + 5
          });
        }
      }, 10);
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [editor]);

  // Slash command
  useEffect(() => {
    if (!editor) return;

    const slashCommands = [
      {
        title: 'Text',
        description: 'Plain text paragraph',
        icon: Type,
        command: () => editor.chain().focus().setParagraph().run(),
      },
      {
        title: 'Heading 1',
        description: 'Large section heading',
        icon: Heading1,
        command: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      },
      {
        title: 'Heading 2',
        description: 'Medium section heading',
        icon: Heading2,
        command: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      },
      {
        title: 'Heading 3',
        description: 'Small section heading',
        icon: Heading3,
        command: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      },
      {
        title: 'Bullet List',
        description: 'Create a bullet list',
        icon: List,
        command: () => editor.chain().focus().toggleBulletList().run(),
      },
      {
        title: 'Task List',
        description: 'Create a task list',
        icon: ListTodo,
        command: () => editor.chain().focus().toggleTaskList().run(),
      },
      {
        title: 'Code Block',
        description: 'Code with syntax highlighting',
        icon: Code,
        command: () => editor.chain().focus().toggleCodeBlock().run(),
      },
    ];

    let component: ReactRenderer | null = null;
    let popup: TippyInstance[] | null = null;

    const handleUpdate = () => {
      const { state } = editor.view;
      const { selection } = state;
      const { $from } = selection;
      const text = $from.parent.textContent;
      const beforeText = text.slice(0, $from.parentOffset);

      if (beforeText.endsWith('/')) {
        const coords = editor.view.coordsAtPos($from.pos);

        if (!component) {
          component = new ReactRenderer(SlashMenu, {
            props: {
              items: slashCommands,
              command: (item: any) => {
                editor.chain().focus().deleteRange({ from: $from.pos - 1, to: $from.pos }).run();
                item.command();
                popup?.[0]?.hide();
              },
            },
            editor,
          });

          popup = tippy('body', {
            getReferenceClientRect: () => ({
              width: 0,
              height: 0,
              top: coords.top,
              bottom: coords.bottom,
              left: coords.left,
              right: coords.left,
              x: coords.left,
              y: coords.top,
              toJSON: () => ({}),
            }),
            appendTo: () => document.body,
            content: component.element,
            showOnCreate: true,
            interactive: true,
            trigger: 'manual',
            placement: 'bottom-start',
          });
        }
      } else if (component && !beforeText.endsWith('/')) {
        popup?.[0]?.hide();
        component?.destroy();
        component = null;
        popup = null;
      }
    };

    editor.on('update', handleUpdate);
    editor.on('selectionUpdate', handleUpdate);

    return () => {
      editor.off('update', handleUpdate);
      editor.off('selectionUpdate', handleUpdate);
      component?.destroy();
      popup?.[0]?.destroy();
    };
  }, [editor]);

  // Markdown shortcuts
  useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      const { state } = editor.view;
      const { selection } = state;
      const { $from } = selection;
      const text = $from.parent.textContent;
      const beforeText = text.slice(0, $from.parentOffset);

      if (beforeText.match(/^#\s$/)) {
        editor.chain().focus().deleteRange({ from: $from.pos - 2, to: $from.pos }).toggleHeading({ level: 1 }).run();
      } else if (beforeText.match(/^##\s$/)) {
        editor.chain().focus().deleteRange({ from: $from.pos - 3, to: $from.pos }).toggleHeading({ level: 2 }).run();
      } else if (beforeText.match(/^###\s$/)) {
        editor.chain().focus().deleteRange({ from: $from.pos - 4, to: $from.pos }).toggleHeading({ level: 3 }).run();
      } else if (beforeText.match(/^-\s$/)) {
        editor.chain().focus().deleteRange({ from: $from.pos - 2, to: $from.pos }).toggleBulletList().run();
      } else if (beforeText.match(/^```$/)) {
        editor.chain().focus().deleteRange({ from: $from.pos - 3, to: $from.pos }).toggleCodeBlock().run();
      }
    };

    editor.on('update', handleUpdate);

    return () => {
      editor.off('update', handleUpdate);
    };
  }, [editor]);

  return (
    <div ref={editorRef} className="advanced-block-editor relative">
      <EditorContent editor={editor} />

      {/* Custom Bubble Menu */}
      <AnimatePresence>
        {editor && bubbleMenuPos && !showAIDialog && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute z-50"
            style={{ left: bubbleMenuPos.x, top: bubbleMenuPos.y }}
          >
            <div className="bg-bg-primary border border-border-subtle rounded-lg shadow-xl p-1.5 flex flex-col gap-1">
              {/* Text Type & Formatting Row */}
              <div className="flex items-center gap-1">
                {/* Text Type Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => { setShowTextType(!showTextType); setShowColor(false); }}
                    className="flex items-center gap-1 px-2 py-1.5 text-xs hover:bg-bg-secondary rounded transition-colors"
                  >
                    <Type className="w-3.5 h-3.5" />
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  <AnimatePresence>
                    {showTextType && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute top-full left-0 mt-1 bg-bg-primary border border-border-subtle rounded-lg shadow-xl overflow-hidden z-50 min-w-[130px]"
                      >
                        <button onClick={() => { editor.chain().focus().setParagraph().run(); setShowTextType(false); }} className="w-full px-3 py-2 text-xs text-left hover:bg-bg-secondary flex items-center gap-2">
                          <Type className="w-3.5 h-3.5" />
                          {language === 'zh' ? '正文' : 'Text'}
                        </button>
                        <button onClick={() => { editor.chain().focus().toggleHeading({ level: 1 }).run(); setShowTextType(false); }} className="w-full px-3 py-2 text-xs text-left hover:bg-bg-secondary flex items-center gap-2">
                          <Heading1 className="w-3.5 h-3.5" />
                          {language === 'zh' ? '标题 1' : 'Heading 1'}
                        </button>
                        <button onClick={() => { editor.chain().focus().toggleHeading({ level: 2 }).run(); setShowTextType(false); }} className="w-full px-3 py-2 text-xs text-left hover:bg-bg-secondary flex items-center gap-2">
                          <Heading2 className="w-3.5 h-3.5" />
                          {language === 'zh' ? '标题 2' : 'Heading 2'}
                        </button>
                        <button onClick={() => { editor.chain().focus().toggleHeading({ level: 3 }).run(); setShowTextType(false); }} className="w-full px-3 py-2 text-xs text-left hover:bg-bg-secondary flex items-center gap-2">
                          <Heading3 className="w-3.5 h-3.5" />
                          {language === 'zh' ? '标题 3' : 'Heading 3'}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="w-px h-4 bg-border-subtle" />

                {/* Color Picker */}
                <div className="relative">
                  <button
                    onClick={() => { setShowColor(!showColor); setShowTextType(false); }}
                    className="w-7 h-7 rounded hover:bg-bg-secondary transition-colors flex items-center justify-center"
                    title={language === 'zh' ? '文本颜色' : 'Text Color'}
                  >
                    <div className="w-4 h-4 rounded border border-border-subtle" style={{ backgroundColor: editor.getAttributes('textStyle').color || '#000000' }} />
                  </button>
                  <AnimatePresence>
                    {showColor && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute top-full left-0 mt-1 bg-bg-primary border border-border-subtle rounded-lg shadow-xl p-3 z-50 w-[280px]"
                      >
                        {/* Recent Colors */}
                        {recentColors.length > 0 && (
                          <div className="mb-3">
                            <div className="text-xs text-text-secondary mb-2">{language === 'zh' ? '最近使用' : 'Recent'}</div>
                            <div className="grid grid-cols-5 gap-1.5">
                              {recentColors.map((item, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => {
                                    if (item.type === 'text') {
                                      editor.chain().focus().setColor(item.color).run();
                                    } else {
                                      editor.chain().focus().setHighlight({ color: item.color }).run();
                                    }
                                    setShowColor(false);
                                  }}
                                  className="w-6 h-6 rounded border border-border-subtle hover:scale-110 transition-transform flex items-center justify-center text-[10px] font-bold"
                                  style={{ backgroundColor: item.color, color: item.type === 'text' ? '#fff' : 'transparent' }}
                                >
                                  {item.type === 'text' ? 'A' : ''}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Text Color */}
                        <div className="mb-3">
                          <div className="text-xs text-text-secondary mb-2">{language === 'zh' ? '字体颜色' : 'Text Color'}</div>
                          <div className="grid grid-cols-5 gap-1.5">
                            {textColors.map((color) => (
                              <button
                                key={color}
                                onClick={() => { editor.chain().focus().setColor(color).run(); addRecentColor(color, 'text'); setShowColor(false); }}
                                className="w-6 h-6 rounded border border-border-subtle hover:scale-110 transition-transform flex items-center justify-center text-[10px] font-bold"
                                style={{ backgroundColor: color, color: '#fff' }}
                              >
                                A
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Background Color */}
                        <div className="mb-2">
                          <div className="text-xs text-text-secondary mb-2">{language === 'zh' ? '背景颜色' : 'Background'}</div>
                          <div className="grid grid-cols-5 gap-1.5">
                            {bgColors.map((color) => (
                              <button
                                key={color}
                                onClick={() => { editor.chain().focus().setHighlight({ color }).run(); addRecentColor(color, 'bg'); setShowColor(false); }}
                                className="w-6 h-6 rounded border border-border-subtle hover:scale-110 transition-transform"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Clear Button */}
                        <button
                          onClick={() => { editor.chain().focus().unsetColor().unsetHighlight().run(); setShowColor(false); }}
                          className="w-full mt-2 px-2 py-1.5 text-xs hover:bg-bg-secondary rounded transition-colors border-t border-border-subtle pt-2"
                        >
                          {language === 'zh' ? '清除颜色' : 'Clear Color'}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="w-px h-4 bg-border-subtle" />

                {/* Formatting Buttons */}
                <button
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  className={cn("p-1.5 rounded hover:bg-bg-secondary transition-colors", editor.isActive('bold') && "bg-bg-secondary")}
                  title={language === 'zh' ? '粗体' : 'Bold'}
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  className={cn("p-1.5 rounded hover:bg-bg-secondary transition-colors", editor.isActive('italic') && "bg-bg-secondary")}
                  title={language === 'zh' ? '斜体' : 'Italic'}
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleUnderline().run()}
                  className={cn("p-1.5 rounded hover:bg-bg-secondary transition-colors", editor.isActive('underline') && "bg-bg-secondary")}
                  title={language === 'zh' ? '下划线' : 'Underline'}
                >
                  <UnderlineIcon className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleStrike().run()}
                  className={cn("p-1.5 rounded hover:bg-bg-secondary transition-colors", editor.isActive('strike') && "bg-bg-secondary")}
                  title={language === 'zh' ? '删除线' : 'Strikethrough'}
                >
                  <Strikethrough className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleCode().run()}
                  className={cn("p-1.5 rounded hover:bg-bg-secondary transition-colors", editor.isActive('code') && "bg-bg-secondary")}
                  title={language === 'zh' ? '代码' : 'Code'}
                >
                  <Code className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* AI Edit Section */}
              <div className="border-t border-border-subtle pt-1 flex flex-col gap-1">
                <button
                  onClick={() => handleAIAction('improve')}
                  className="flex items-center gap-1.5 px-2 py-1.5 text-xs hover:bg-bg-secondary rounded transition-colors"
                >
                  <Smile className="w-3.5 h-3.5 text-accent" />
                  <span>{language === 'zh' ? '改进写作' : 'Improve Writing'}</span>
                </button>
                <button
                  onClick={() => handleAIAction('fix')}
                  className="flex items-center gap-1.5 px-2 py-1.5 text-xs hover:bg-bg-secondary rounded transition-colors"
                >
                  <Smile className="w-3.5 h-3.5 text-accent" />
                  <span>{language === 'zh' ? '修正拼写' : 'Fix Spelling'}</span>
                </button>
                <button
                  onClick={() => handleAIAction('simplify')}
                  className="flex items-center gap-1.5 px-2 py-1.5 text-xs hover:bg-bg-secondary rounded transition-colors"
                >
                  <Smile className="w-3.5 h-3.5 text-accent" />
                  <span>{language === 'zh' ? '简化表达' : 'Simplify'}</span>
                </button>
                <button
                  onClick={() => handleAIAction('expand')}
                  className="flex items-center gap-1.5 px-2 py-1.5 text-xs hover:bg-bg-secondary rounded transition-colors"
                >
                  <Smile className="w-3.5 h-3.5 text-accent" />
                  <span>{language === 'zh' ? '扩展内容' : 'Expand'}</span>
                </button>
                <div className="border-t border-border-subtle pt-1">
                  <button
                    onClick={() => handleAIAction('custom')}
                    className="flex items-center gap-1.5 px-2 py-1.5 text-xs hover:bg-bg-secondary rounded transition-colors w-full"
                  >
                    <Smile className="w-3.5 h-3.5 text-accent" />
                    <span>{language === 'zh' ? '使用 AI 编辑' : 'Edit with AI'}</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Dialog */}
      <AnimatePresence>
        {showAIDialog && aiDialogPos && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed z-[70] flex items-center gap-3 ai-dialog-container"
            style={{ left: aiDialogPos.x, top: aiDialogPos.y }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-10 rounded-full bg-bg-primary flex items-center justify-center shrink-0 relative z-10 border-2 border-accent/20">
              <Smile className="w-5 h-5 text-accent" />
            </div>
            <div className="bg-bg-primary border border-border-subtle rounded-xl shadow-2xl overflow-hidden" style={{ width: 600 }}>
              <div className="flex items-center gap-2 p-3 border-b border-border-subtle">
                <textarea
                  autoFocus
                  value={aiPrompt}
                  onChange={(e) => {
                    setAiPrompt(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAISend();
                    }
                  }}
                  placeholder={language === 'zh' ? '告诉 AI 如何修改...' : 'Tell AI how to modify...'}
                  className="flex-1 bg-transparent outline-none resize-none text-sm"
                  style={{ minHeight: 36, maxHeight: 120 }}
                  rows={1}
                />
                <button
                  onClick={handleAISend}
                  className="px-4 py-2 bg-accent text-white rounded-lg hover:opacity-90 transition-colors text-sm font-medium shrink-0"
                >
                  {language === 'zh' ? '发送' : 'Send'}
                </button>
              </div>
              {showAIActions && (
                <div className="flex gap-2 p-3 bg-bg-secondary/30">
                  <button
                    onClick={handleDiscard}
                    className="flex-1 px-4 py-2 text-sm rounded-lg hover:bg-bg-secondary transition-colors"
                  >
                    {language === 'zh' ? '放弃修改' : 'Discard'}
                  </button>
                  <button
                    onClick={handleAccept}
                    className="flex-1 px-4 py-2 text-sm bg-accent text-white rounded-lg hover:opacity-90 transition-colors"
                  >
                    {language === 'zh' ? '接受' : 'Accept'}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .advanced-block-editor .ProseMirror {
          outline: none;
        }
        .advanced-block-editor .ProseMirror > * {
          padding: 8px 12px;
          margin: 4px 0;
          border-radius: 4px;
          border: 1px solid transparent;
          transition: all 0.15s ease;
          position: relative;
        }
        .advanced-block-editor .ProseMirror > *:hover {
          background-color: var(--theme-bg-secondary);
          border-color: var(--theme-border-subtle);
        }
        .advanced-block-editor .ProseMirror > *:active::before {
          cursor: grabbing;
        }
        .advanced-block-editor .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: var(--theme-text-secondary);
          opacity: 0.5;
          pointer-events: none;
          height: 0;
        }
        .advanced-block-editor .mention {
          background-color: var(--theme-accent);
          color: white;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.9em;
        }
        .advanced-block-editor .code-block {
          background-color: var(--theme-bg-secondary);
          border: 1px solid var(--theme-border-subtle);
          border-radius: 8px;
          padding: 12px;
          font-family: 'Courier New', monospace;
          font-size: 0.9em;
        }
        .advanced-block-editor h1 {
          font-size: 2em;
          font-weight: 700;
          margin: 1em 0 0.5em;
        }
        .advanced-block-editor h2 {
          font-size: 1.5em;
          font-weight: 600;
          margin: 0.8em 0 0.4em;
        }
        .advanced-block-editor h3 {
          font-size: 1.2em;
          font-weight: 600;
          margin: 0.6em 0 0.3em;
        }
        .advanced-block-editor ul {
          list-style: disc;
          padding-left: 1.5em;
        }
        .advanced-block-editor ol {
          list-style: decimal;
          padding-left: 1.5em;
        }
      `}</style>
    </div>
  );
}
