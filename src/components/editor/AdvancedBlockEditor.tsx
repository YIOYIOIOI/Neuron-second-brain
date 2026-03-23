import { useEditor, EditorContent, ReactRenderer } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Mention from '@tiptap/extension-mention';
import UnderlineExtension from '@tiptap/extension-underline';
import HighlightExtension from '@tiptap/extension-highlight';
import { common, createLowlight } from 'lowlight';
import { useEffect, useRef, forwardRef, useImperativeHandle, useState } from 'react';
import { SlashMenu } from './SlashMenu';
import tippy, { Instance as TippyInstance } from 'tippy.js';
import { Heading1, Heading2, Heading3, Type, List, Code } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { cn } from '../Navbar';
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
            <div className="font-medium truncate">{item.title}</div>
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
          return component?.ref?.onKeyDown(props) || false;
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
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'code-block',
        },
      }),
      UnderlineExtension,
      HighlightExtension,
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
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[400px] px-4 py-2',
      },
    },
  });

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
    <div ref={editorRef} className="advanced-block-editor">
      <EditorContent editor={editor} />
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
        }
        .advanced-block-editor .ProseMirror > *:hover {
          background-color: var(--theme-bg-secondary);
          border-color: var(--theme-border-subtle);
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
