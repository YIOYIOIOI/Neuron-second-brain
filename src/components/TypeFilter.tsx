import { useStore } from '../store/useStore';
import { useTranslation } from '../hooks/useTranslation';
import { FileText, Lightbulb, Grid3x3 } from 'lucide-react';

export function TypeFilter() {
  const { knowledgeTypeFilter, setKnowledgeTypeFilter } = useStore();
  const { language } = useTranslation();

  const options = [
    { value: 'all' as const, icon: Grid3x3, labelEn: 'All', labelZh: '全部' },
    { value: 'note' as const, icon: FileText, labelEn: 'Notes', labelZh: '笔记' },
    { value: 'concept' as const, icon: Lightbulb, labelEn: 'Concepts', labelZh: '知识点' },
  ];

  return (
    <div className="flex gap-2 mt-2">
      {options.map(option => (
        <button
          key={option.value}
          onClick={() => setKnowledgeTypeFilter(option.value)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-colors ${
            knowledgeTypeFilter === option.value
              ? 'bg-text-primary text-bg-primary'
              : 'bg-bg-secondary text-text-secondary hover:bg-border-subtle'
          }`}
        >
          <option.icon className="w-3.5 h-3.5" />
          {language === 'zh' ? option.labelZh : option.labelEn}
        </button>
      ))}
    </div>
  );
}
