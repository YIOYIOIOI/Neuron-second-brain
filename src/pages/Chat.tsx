import { useState, useRef, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Sparkles, User, Link as LinkIcon } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useTranslation } from '../hooks/useTranslation';
import { Link } from 'react-router-dom';
import { PinnedCardsSidebar } from '../components/PinnedCardsSidebar';

export default function Chat() {
  const { chatMessages, addChatMessage, updateLastChatMessage, knowledgeList } = useStore();
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isTyping]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg = input.trim();
    setInput('');
    
    addChatMessage({
      id: Date.now().toString(),
      role: 'user',
      content: userMsg,
    });

    setIsTyping(true);

    // Simulate RAG process delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simple keyword matching for mock RAG
    const keywords = userMsg.toLowerCase().split(' ').filter(w => w.length > 3);
    const relevantItems = knowledgeList.filter(item => 
      keywords.some(kw => 
        item.title.toLowerCase().includes(kw) || 
        item.content.toLowerCase().includes(kw) ||
        item.tags.some(t => t.toLowerCase().includes(kw))
      )
    ).slice(0, 3); // Top 3 relevant items

    let aiResponse = '';
    if (relevantItems.length > 0) {
      aiResponse = `Based on your knowledge base, I found some relevant information. `;
      aiResponse += `Specifically, regarding "${relevantItems[0].title}", it seems that ${relevantItems[0].summary.toLowerCase()} `;
      if (relevantItems.length > 1) {
        aiResponse += `This also connects to "${relevantItems[1].title}". `;
      }
      aiResponse += `\n\nHow else can I help you explore these concepts?`;
    } else {
      aiResponse = `I couldn't find specific information about that in your current knowledge base. Would you like me to help you capture a new thought about it?`;
    }

    addChatMessage({
      id: (Date.now() + 1).toString(),
      role: 'ai',
      content: '',
      relatedKnowledgeIds: relevantItems.map(item => item.id)
    });

    // Simulate typing effect
    const words = aiResponse.split(' ');
    let currentText = '';
    
    for (let i = 0; i < words.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 50));
      currentText += (i === 0 ? '' : ' ') + words[i];
      updateLastChatMessage(currentText);
    }

    setIsTyping(false);
  };

  return (
    <div className="px-8 md:px-24 lg:px-48 py-12 min-h-screen max-w-5xl mx-auto flex flex-col">
      <header className="mb-16 border-b border-border-subtle pb-8">
        <h1 className="text-5xl md:text-7xl font-serif tracking-tighter mb-4">{t('assistantTitle')}</h1>
        <p className="text-text-secondary text-lg font-light max-w-md leading-relaxed">
          {t('assistantDesc')}
        </p>
      </header>

      <div className="flex-grow overflow-y-auto mb-8 pr-4 no-scrollbar flex flex-col gap-8">
        {chatMessages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-text-secondary h-full">
            <Sparkles className="w-12 h-12 mb-6 opacity-50" />
            <h2 className="text-2xl font-serif mb-2">{t('assistantTitle')}</h2>
            <p className="font-light text-center max-w-sm">{t('assistantDesc')}</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {chatMessages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className={`flex gap-6 max-w-3xl ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'ai' ? 'bg-bg-secondary text-text-primary' : 'bg-text-primary text-bg-primary'}`}>
                  {msg.role === 'ai' ? <Sparkles className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>
                <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <span className="text-xs uppercase tracking-widest font-mono text-text-secondary mb-2">
                    {msg.role === 'ai' ? 'Assistant' : 'You'}
                  </span>
                  <div className={`p-6 rounded-2xl text-lg font-light leading-relaxed whitespace-pre-wrap ${msg.role === 'user' ? 'bg-text-primary text-bg-primary rounded-tr-none' : 'bg-bg-secondary rounded-tl-none'}`}>
                    {msg.content}
                  </div>
                  {msg.role === 'ai' && msg.relatedKnowledgeIds && msg.relatedKnowledgeIds.length > 0 && (
                    <div className="mt-4 flex flex-col gap-2 w-full">
                      <span className="text-xs uppercase tracking-widest font-mono text-text-secondary flex items-center gap-2">
                        <LinkIcon className="w-3 h-3" /> {t('references')}
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {msg.relatedKnowledgeIds.map(id => {
                          const item = knowledgeList.find(k => k.id === id);
                          if (!item) return null;
                          return (
                            <Link 
                              key={id} 
                              to={`/note/${id}`}
                              className="text-xs font-serif bg-bg-primary border border-border-subtle px-3 py-1.5 rounded-sm hover:border-text-primary transition-colors"
                            >
                              {item.title}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-6 max-w-3xl"
              >
                <div className="w-10 h-10 rounded-full bg-bg-secondary text-text-primary flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-xs uppercase tracking-widest font-mono text-text-secondary mb-2">Assistant</span>
                  <div className="p-6 rounded-2xl bg-bg-secondary rounded-tl-none flex gap-2 items-center h-[72px]">
                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }} className="w-2 h-2 bg-text-secondary rounded-full" />
                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2, ease: "easeInOut" }} className="w-2 h-2 bg-text-secondary rounded-full" />
                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4, ease: "easeInOut" }} className="w-2 h-2 bg-text-secondary rounded-full" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="relative mt-auto">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('askQuestion')}
          className="w-full bg-transparent border-b border-border-subtle pb-4 pt-4 pr-12 text-xl font-light focus:outline-none focus:border-text-primary transition-colors placeholder:text-text-secondary/50"
          disabled={isTyping}
        />
        <button
          type="submit"
          disabled={!input.trim() || isTyping}
          className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-text-secondary hover:text-text-primary disabled:opacity-50 transition-colors"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
      <PinnedCardsSidebar />
    </div>
  );
}
