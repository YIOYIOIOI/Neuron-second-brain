import { useEditor, EditorContent, ReactRenderer } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import { useEffect, useRef } from 'react';
import { SlashMenu } from './SlashMenu';
import tippy, { Instance as TippyInstance } from 'tippy.js';
import { Heading1, Heading2, Heading3, Type, List, Code } from 'lucide-react';
import 'tippy.js/dist/tippy.css';

const lowlight = createLowlight(common);

interface BlockEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function BlockEditor({ content, onChange, placeholder = 'Type / for commands' }: BlockEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[400px]',
      },
      handleKeyDown: (view, event) => {
        const { state } = view;
        const { selection } = state;
        const { $from } = selection;

        // Backspace at start of block - merge with previous
        if (event.key === 'Backspace' && $from.parentOffset === 0) {
          const canMerge = $from.depth > 1;
          if (canMerge) {
            return false; // Let TipTap handle it
          }
        }

        // Delete at end of block - merge with next
        if (event.key === 'Delete') {
          const isAtEnd = $from.parentOffset === $from.parent.content.size;
          if (isAtEnd) {
            return false; // Let TipTap handle it
          }
        }

        return false;
      },
    },
  });

  // Slash command extension
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

      // Check if user typed "/"
      if (text === '/') {
        const coords = editor.view.coordsAtPos($from.pos);

        if (!component) {
          component = new ReactRenderer(SlashMenu, {
            props: {
              items: slashCommands,
              command: (item: any) => {
                // Delete the "/" character
                editor.chain().focus().deleteRange({ from: $from.pos - 1, to: $from.pos }).run();
                // Execute command
                item.command();
                // Close menu
                if (popup) {
                  popup[0]?.hide();
                }
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
      } else if (component && text !== '/') {
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

      // Check for markdown patterns
      if (text.match(/^#\s$/)) {
        editor.chain().focus().deleteRange({ from: $from.pos - 2, to: $from.pos }).toggleHeading({ level: 1 }).run();
      } else if (text.match(/^##\s$/)) {
        editor.chain().focus().deleteRange({ from: $from.pos - 3, to: $from.pos }).toggleHeading({ level: 2 }).run();
      } else if (text.match(/^###\s$/)) {
        editor.chain().focus().deleteRange({ from: $from.pos - 4, to: $from.pos }).toggleHeading({ level: 3 }).run();
      } else if (text.match(/^-\s$/)) {
        editor.chain().focus().deleteRange({ from: $from.pos - 2, to: $from.pos }).toggleBulletList().run();
      } else if (text.match(/^```$/)) {
        editor.chain().focus().deleteRange({ from: $from.pos - 3, to: $from.pos }).toggleCodeBlock().run();
      }
    };

    editor.on('update', handleUpdate);

    return () => {
      editor.off('update', handleUpdate);
    };
  }, [editor]);

  return (
    <div ref={editorRef} className="block-editor">
      <EditorContent editor={editor} />
    </div>
  );
}
