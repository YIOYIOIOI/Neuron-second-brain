import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useTranslation } from '../hooks/useTranslation';
import { Plus, Search } from 'lucide-react';
import { RichEditor } from '../components/RichEditor';
import toast from 'react-hot-toast';

export default function Writing() {
  const { knowledgeList, editorState, setEditorState, addKnowledge, setAgentOpen, setAgentSidebar, language } = useStore();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [insertedReferences, setInsertedReferences] = useState<{id: string, title: string}[]>([]);        
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setAgentOpen(true);
    setAgentSidebar(true);
    const timer = setTimeout(() => {
      setIsLoading(false);    }, 150);
    return () => clearTimeout(timer);
  }, []);

  const filteredKnowledge = useMemo(() => {
    return knowledgeList.filter(item =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [knowledgeList, searchQuery]);

  const insertKnowledge = (item: { id: string, title: string, content: string }) => {
    let newReferences = [...insertedReferences];
    let refIndex = newReferences.findIndex(ref => ref.id === item.id);

    if (refIndex === -1) {
      newReferences.push({ id: item.id, title: item.title });
      refIndex = newReferences.length - 1;
      setInsertedReferences(newReferences);
    }

    const citation = `<sup>[${refIndex + 1}]</sup>`;
    setEditorState(editorState + `<p>${item.content}${citation}</p>`);
    toast.success(t('insert') + ' successful');
  };

  const handleSave = () => {
    if (!editorState.trim()) {
      toast.error('Content cannot be empty');
      return;
    }

    const newId = Date.now().toString();
    const finalTitle = title.trim() || (language === 'zh' ? '无标题草稿' : 'Untitled Draft');

    const newItem = {
      id: newId,
      title: finalTitle,
      content: editorState,
      summary: editorState.replace(/<[^>]*>/g, '').substring(0, 100) + '...',
      tags: ['draft'],
      createdAt: new Date().toISOString(),
      relatedIds: [],
      references: insertedReferences.map(r => r.id)
    };

    addKnowledge(newItem);
    setEditorState('');
    setTitle('');
    setInsertedReferences([]);
    toast.success(t('saveSuccess'));
    navigate(`/note/${newId}`);
  };

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Left Panel: Knowledge Base */}
      <div className="w-[300px] border-r border-border-subtle bg-bg-secondary/30 flex flex-col h-full">
        <div className="p-6 border-b border-border-subtle">
          <h2 className="text-xs uppercase tracking-widest font-mono text-text-secondary mb-4">{t('knowledgeBase')}</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-bg-primary border border-border-subtle rounded-sm py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-text-primary transition-colors"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 custom-scrollbar">
          {isLoading ? (
            [1, 2, 3].map(i => (
              <div key={i} className="p-4 border border-border-subtle rounded-sm bg-bg-primary animate-pulse">
                <div className="h-5 bg-border-subtle rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-border-subtle rounded w-full mb-1"></div>
                <div className="h-3 bg-border-subtle rounded w-5/6 mb-4"></div>
                <div className="h-3 bg-border-subtle rounded w-16"></div>
              </div>
            ))
          ) : filteredKnowledge.length === 0 ? (
            <div className="text-center text-text-secondary text-sm py-8">
              {t('noResults')}
            </div>
          ) : (
            filteredKnowledge.map(item => (
              <div key={item.id} className="p-4 border border-border-subtle rounded-sm bg-bg-primary hover:border-text-primary transition-colors group">
                <h3 className="font-serif text-lg mb-2">{item.title}</h3>
                <p className="text-xs text-text-secondary line-clamp-2 mb-4">{item.summary}</p>
                <button
                  onClick={() => insertKnowledge(item)}
                  className="flex items-center gap-2 text-xs uppercase tracking-widest font-medium text-text-secondary group-hover:text-text-primary transition-colors"
                >
                  <Plus className="w-3 h-3" /> {t('insert')}
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Middle Panel: Editor */}
      <div className="flex-1 flex flex-col h-full bg-bg-primary relative">
        <div className="p-6 border-b border-border-subtle flex items-center justify-between">
          <h1 className="text-2xl font-serif tracking-tighter">{t('writingMode')}</h1>
          <button
            onClick={handleSave}
            className="text-xs uppercase tracking-widest font-medium px-4 py-2 bg-text-primary text-bg-primary rounded-sm hover:bg-text-secondary transition-colors"
          >
            {t('saveAsKnowledge')}
          </button>
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Title input */}
          <div className="px-8 md:px-12 pt-8">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('title') || 'Title'}
              className="w-full text-3xl md:text-4xl font-serif tracking-tighter bg-transparent focus:outline-none border-b border-border-subtle pb-4 mb-6 placeholder:text-text-secondary/30"
            />
          </div>
          {/* Advanced Block Editor */}
          <div className="flex-1 overflow-y-auto px-8 md:px-12 pb-8 custom-scrollbar">
            <RichEditor
              content={editorState}
              onChange={setEditorState}
              placeholder={t('startWriting') || 'Start writing...'}
            />
          </div>
          {insertedReferences.length > 0 && (
            <div className="p-6 border-t border-border-subtle bg-bg-secondary/10">
              <h3 className="text-xs uppercase tracking-widest font-mono text-text-secondary mb-4">{t('references')}</h3>
              <ol className="list-decimal list-inside text-sm font-serif text-text-secondary flex flex-col gap-2">
                {insertedReferences.map((ref) => (
                  <li key={ref.id}>
                    <span className="hover:text-text-primary cursor-pointer transition-colors">
                      {ref.title}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
