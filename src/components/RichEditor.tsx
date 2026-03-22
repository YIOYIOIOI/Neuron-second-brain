import { useEditor, EditorContent, ReactRenderer } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import Mention from '@tiptap/extension-mention';
import { useEffect, useState, forwardRef, useImperativeHandle, useCallback, useRef } from 'react';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Code, Minus,
  AlignLeft, AlignCenter, AlignRight,
  Highlighter, Undo, Redo, Link2
} from 'lucide-react';
import { cn } from './Navbar';
import { useStore } from '../store/useStore';
import tippy, { Instance as TippyInstance } from 'tippy.js';
import 'tippy.js/dist/tippy.css';

interface RichEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

function ToolbarButton({
  onClick,
  active = false,
  children,
  title,
}: {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        'p-1.5 rounded transition-colors',
        active ? 'bg-text-primary text-bg-primary' : 'text-text-secondary hover:text-text-primary hover:bg-border-subtle'
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-5 bg-border-subtle mx-1" />;
}

// Wiki Link Suggestion List Component
interface WikiLinkListProps {
  items: { id: string; title: string }[];
  command: (item: { id: string; title: string }) => void;
  selectedIndex: number;
}

const WikiLinkList = forwardRef<{ onKeyDown: (props: { event: KeyboardEvent }) => boolean }, WikiLinkListProps>(
  ({ items, command, selectedIndex }, ref) => {
    const [selected, setSelected] = useState(selectedIndex);

    useEffect(() => {
      setSelected(selectedIndex);
    }, [selectedIndex]);

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }: { event: KeyboardEvent }) => {
        if (event.key === 'ArrowUp') {
          setSelected((prev) => (prev - 1 + items.length) % items.length);
          return true;
        }
        if (event.key === 'ArrowDown') {
          setSelected((prev) => (prev + 1) % items.length);
          return true;
        }
        if (event.key === 'Enter') {
          if (items[selected]) {
            command(items[selected]);
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
              index === selected ? 'bg-bg-secondary' : 'hover:bg-bg-secondary/50'
            )}
          >
            <div className="font-medium truncate">{item.title}</div>
          </button>
        ))}
      </div>
    );
  }
);

WikiLinkList.displayName = 'WikiLinkList';

export function RichEditor({ content, onChange, placeholder = 'Start writing...', className }: RichEditorProps) {
  const { knowledgeList, language } = useStore();
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const linkInputRef = useRef<HTMLInputElement>(null);
  const [bubbleMenu, setBubbleMenu] = useState<{ show: boolean; x: number; y: number }>({ show: false, x: 0, y: 0 });

  // Create suggestion for wiki links
  const suggestion = {
    char: '[[',
    items: ({ query }: { query: string }) => {
      return knowledgeList
        .filter(item =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.summary.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 8)
        .map(item => ({ id: item.id, title: item.title }));
    },
    render: () => {
      let component: ReactRenderer | null = null;
      let popup: TippyInstance[] | null = null;
      let selectedIndex = 0;

      return {
        onStart: (props: any) => {
          selectedIndex = 0;
          component = new ReactRenderer(WikiLinkList, {
            props: { ...props, selectedIndex },
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
        onUpdate: (props: any) => {
          if (component) {
            component.updateProps({ ...props, selectedIndex });
          }

          if (popup && popup[0] && props.clientRect) {
            popup[0].setProps({
              getReferenceClientRect: props.clientRect,
            });
          }
        },
        onKeyDown: (props: any) => {
          if (props.event.key === 'Escape') {
            popup?.[0]?.hide();
            return true;
          }

          if (props.event.key === 'ArrowUp') {
            selectedIndex = (selectedIndex - 1 + props.items.length) % props.items.length;
            component?.updateProps({ ...props, selectedIndex });
            return true;
          }

          if (props.event.key === 'ArrowDown') {
            selectedIndex = (selectedIndex + 1) % props.items.length;
            component?.updateProps({ ...props, selectedIndex });
            return true;
          }

          if (props.event.key === 'Enter') {
            if (props.items[selectedIndex]) {
              props.command(props.items[selectedIndex]);
            }
            return true;
          }

          return false;
        },
        onExit: () => {
          popup?.[0]?.destroy();
          component?.destroy();
        },
      };
    },
    command: ({ editor, range, props }: any) => {
      const nodeAfter = editor.view.state.selection.$to.nodeAfter;
      const overrideSpace = nodeAfter?.text?.startsWith(' ');

      if (overrideSpace) {
        range.to += 1;
      }

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
          {
            type: 'text',
            text: ' ',
          },
        ])
        .run();

      window.getSelection()?.collapseToEnd();
    },
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({ placeholder }),
      Underline,
      Highlight.configure({ multicolor: false }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          class: 'text-blue-500 underline hover:text-blue-600 cursor-pointer',
        },
      }),
      Mention.configure({
        HTMLAttributes: {
          class: 'wiki-link bg-bg-secondary px-1.5 py-0.5 rounded text-text-primary font-medium cursor-pointer hover:bg-border-subtle transition-colors',
        },
        suggestion,
        renderLabel({ node }) {
          return `[[${node.attrs.label}]]`;
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection;
      if (from !== to) {
        const { view } = editor;
        const start = view.coordsAtPos(from);
        const end = view.coordsAtPos(to);
        const x = (start.left + end.left) / 2;
        const y = start.top - 10;
        setBubbleMenu({ show: true, x, y });
      } else {
        setBubbleMenu({ show: false, x: 0, y: 0 });
      }
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[300px] font-light leading-relaxed text-text-primary',
      },
      handleClick(view, pos, event) {
        // Handle wiki link clicks
        const target = event.target as HTMLElement;
        if (target.classList.contains('wiki-link')) {
          const mention = target.getAttribute('data-id');
          if (mention) {
            window.location.href = `/note/${mention}`;
            return true;
          }
        }
        return false;
      },
    },
  });

  // Sync external content changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [content]);

  // Focus link input when shown
  useEffect(() => {
    if (showLinkInput && linkInputRef.current) {
      linkInputRef.current.focus();
    }
  }, [showLinkInput]);

  const setLink = useCallback(() => {
    if (!editor) return;

    if (linkUrl === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      const url = linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`;
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }

    setShowLinkInput(false);
    setLinkUrl('');
  }, [editor, linkUrl]);

  if (!editor) return null;

  const iconSize = 15;

  return (
    <div className={cn('border border-border-subtle rounded-md overflow-hidden', className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-border-subtle bg-bg-secondary/30 sticky top-0 z-10">
        {/* Undo / Redo */}
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Undo">
          <Undo size={iconSize} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Redo">
          <Redo size={iconSize} />
        </ToolbarButton>

        <Divider />

        {/* Headings */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive('heading', { level: 1 })}
          title="Heading 1"
        >
          <Heading1 size={iconSize} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          <Heading2 size={iconSize} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })}
          title="Heading 3"
        >
          <Heading3 size={iconSize} />
        </ToolbarButton>

        <Divider />

        {/* Inline formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="Bold"
        >
          <Bold size={iconSize} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="Italic"
        >
          <Italic size={iconSize} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive('underline')}
          title="Underline"
        >
          <UnderlineIcon size={iconSize} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive('strike')}
          title="Strikethrough"
        >
          <Strikethrough size={iconSize} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          active={editor.isActive('highlight')}
          title="Highlight"
        >
          <Highlighter size={iconSize} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive('code')}
          title="Inline Code"
        >
          <Code size={iconSize} />
        </ToolbarButton>

        <Divider />

        {/* Link */}
        <div className="relative">
          <ToolbarButton
            onClick={() => {
              const previousUrl = editor.getAttributes('link').href || '';
              setLinkUrl(previousUrl);
              setShowLinkInput(!showLinkInput);
            }}
            active={editor.isActive('link')}
            title="Link"
          >
            <Link2 size={iconSize} />
          </ToolbarButton>
          {showLinkInput && (
            <div className="absolute top-full left-0 mt-1 bg-bg-primary border border-border-subtle rounded-md shadow-lg p-2 z-20 flex gap-2">
              <input
                ref={linkInputRef}
                type="text"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setLink();
                  } else if (e.key === 'Escape') {
                    setShowLinkInput(false);
                  }
                }}
                placeholder="https://..."
                className="px-2 py-1 text-sm bg-bg-secondary border border-border-subtle rounded focus:outline-none focus:border-text-secondary w-48"
              />
              <button
                onClick={setLink}
                className="px-2 py-1 text-xs bg-text-primary text-bg-primary rounded hover:bg-text-secondary transition-colors"
              >
                {language === 'zh' ? '确定' : 'Set'}
              </button>
            </div>
          )}
        </div>

        <Divider />

        {/* Lists & blocks */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="Bullet List"
        >
          <List size={iconSize} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="Ordered List"
        >
          <ListOrdered size={iconSize} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          title="Blockquote"
        >
          <Quote size={iconSize} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Divider"
        >
          <Minus size={iconSize} />
        </ToolbarButton>

        <Divider />

        {/* Alignment */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          active={editor.isActive({ textAlign: 'left' })}
          title="Align Left"
        >
          <AlignLeft size={iconSize} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          active={editor.isActive({ textAlign: 'center' })}
          title="Align Center"
        >
          <AlignCenter size={iconSize} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          active={editor.isActive({ textAlign: 'right' })}
          title="Align Right"
        >
          <AlignRight size={iconSize} />
        </ToolbarButton>

        {/* Wiki link hint */}
        <div className="ml-auto text-[10px] text-text-secondary font-mono hidden sm:block">
          {language === 'zh' ? '输入 [[ 引用知识' : 'Type [[ to link'}
        </div>
      </div>

      {/* Editor content */}
      <EditorContent editor={editor} className="p-4 md:p-6" />

      {/* Bubble Menu */}
      {bubbleMenu.show && (
        <div
          className="fixed bg-bg-primary border border-border-subtle rounded-lg shadow-2xl flex items-center gap-1 p-1.5 backdrop-blur-sm z-50 animate-in fade-in duration-150"
          style={{
            left: `${bubbleMenu.x}px`,
            top: `${bubbleMenu.y}px`,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleBold().run()}
            active={editor?.isActive('bold')}
            title="Bold"
          >
            <Bold size={16} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            active={editor?.isActive('italic')}
            title="Italic"
          >
            <Italic size={16} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
            active={editor?.isActive('underline')}
            title="Underline"
          >
            <UnderlineIcon size={16} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleStrike().run()}
            active={editor?.isActive('strike')}
            title="Strikethrough"
          >
            <Strikethrough size={16} />
          </ToolbarButton>
          <Divider />
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
            active={editor?.isActive('heading', { level: 1 })}
            title="Heading 1"
          >
            <Heading1 size={16} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor?.isActive('heading', { level: 2 })}
            title="Heading 2"
          >
            <Heading2 size={16} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
            active={editor?.isActive('heading', { level: 3 })}
            title="Heading 3"
          >
            <Heading3 size={16} />
          </ToolbarButton>
          <Divider />
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleHighlight().run()}
            active={editor?.isActive('highlight')}
            title="Highlight"
          >
            <Highlighter size={16} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleCode().run()}
            active={editor?.isActive('code')}
            title="Code"
          >
            <Code size={16} />
          </ToolbarButton>
        </div>
      )}
    </div>
  );
}
