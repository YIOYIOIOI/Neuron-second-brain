import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { FileText, Palette, Sparkles } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useTranslation } from '../hooks/useTranslation';

export default function Notes() {
  const navigate = useNavigate();
  const { addKnowledge } = useStore();
  const { language } = useTranslation();

  const handleNewNote = () => {
    const newId = Date.now().toString();
    const newItem = {
      id: newId,
      title: language === 'zh' ? '无标题' : 'Untitled',
      content: '',
      summary: language === 'zh' ? '新建笔记' : 'New note',
      tags: [],
      createdAt: new Date().toISOString(),
      relatedIds: [],
    };
    addKnowledge(newItem);
    navigate(`/note/${newId}?edit=true`);
  };

  const handleNewCanvas = () => {
    const newId = Date.now().toString();
    navigate(`/note/canvas/${newId}`);
  };

  const options = [
    {
      icon: FileText,
      titleZh: '空白笔记',
      titleEn: 'Blank Note',
      descZh: '从零开始记录想法',
      descEn: 'Start from scratch',
      action: handleNewNote,
    },
    {
      icon: Palette,
      titleZh: '自由画布',
      titleEn: 'Canvas',
      descZh: '可视化思维导图',
      descEn: 'Visual mind mapping',
      action: handleNewCanvas,
    },
    {
      icon: Sparkles,
      titleZh: 'AI 对话',
      titleEn: 'AI Chat',
      descZh: '与 AI 共同创作',
      descEn: 'Co-create with AI',
      action: () => navigate('/agent'),
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-8">
      <div className="max-w-5xl w-full">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-6xl font-serif text-center mb-16"
        >
          {language === 'zh' ? '开始创作' : 'Start Creating'}
        </motion.h1>

        <div className="grid md:grid-cols-3 gap-8">
          {options.map((option, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={option.action}
              className="group relative p-8 bg-bg-primary border border-border-subtle rounded-2xl hover:border-text-primary transition-all duration-300 hover:shadow-2xl hover:-translate-y-2"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-bg-secondary flex items-center justify-center group-hover:bg-text-primary group-hover:text-bg-primary transition-all duration-300">
                  <option.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-serif">
                  {language === 'zh' ? option.titleZh : option.titleEn}
                </h3>
                <p className="text-sm text-text-secondary">
                  {language === 'zh' ? option.descZh : option.descEn}
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
