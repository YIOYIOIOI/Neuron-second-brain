import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Heading1, Heading2, Heading3, Type, List, Code } from 'lucide-react';
import { cn } from '../Navbar';

interface SlashCommand {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  command: () => void;
}

interface SlashMenuProps {
  items: SlashCommand[];
  command: (item: SlashCommand) => void;
}

export const SlashMenu = forwardRef<{ onKeyDown: (props: { event: KeyboardEvent }) => boolean }, SlashMenuProps>(
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
      return null;
    }

    return (
      <div className="bg-bg-primary border border-border-subtle rounded-lg shadow-xl overflow-hidden min-w-[280px]">
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={item.title}
              onClick={() => command(item)}
              className={cn(
                'w-full text-left px-3 py-2 flex items-center gap-3 transition-colors',
                index === selectedIndex ? 'bg-bg-secondary' : 'hover:bg-bg-secondary/50'
              )}
            >
              <Icon className="w-4 h-4 text-text-secondary" />
              <div className="flex-1">
                <div className="text-sm font-medium text-text-primary">{item.title}</div>
                <div className="text-xs text-text-secondary">{item.description}</div>
              </div>
            </button>
          );
        })}
      </div>
    );
  }
);

SlashMenu.displayName = 'SlashMenu';
