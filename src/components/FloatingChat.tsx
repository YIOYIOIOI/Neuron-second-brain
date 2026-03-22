import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, X, Send, Loader2, Minimize2, Maximize2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { cn } from './Navbar';

interface FloatingChatProps {
  contextKnowledge?: {
    id: string;
    title: string;
    content: string;
    summary: string;
  };
}

interface Message {
  id: string;
  role: 'user' | 'agent';
  content: string;
}

export function FloatingChat({ contextKnowledge }: FloatingChatProps) {
  const { knowledgeList, language } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  // Reset messages when context changes
  useEffect(() => {
    if (contextKnowledge) {
      setMessages([]);
    }
  }, [contextKnowledge?.id]);

  const generateResponse = async (userMessage: string) => {
    setIsTyping(true);

    await new Promise(resolve => setTimeout(resolve, 1200));

    let response = '';
    const context = contextKnowledge;

    if (!context) {
      response = language === 'zh' ? '没有找到上下文知识。' : 'No context knowledge found.';
    } else if (userMessage.toLowerCase().includes('summarize') || userMessage.toLowerCase().includes('总结')) {
      response = language === 'zh'
        ? `**「${context.title}」摘要：**\n\n${context.summary}\n\n这篇知识主要讲述了相关的核心概念。你想深入了解哪个方面？`
        : `**Summary of "${context.title}":**\n\n${context.summary}\n\nThis knowledge covers the core concepts. Which aspect would you like to explore further?`;
    } else if (userMessage.toLowerCase().includes('explain') || userMessage.toLowerCase().includes('解释')) {
      response = language === 'zh'
        ? `让我为你解释「${context.title}」：\n\n${context.summary}\n\n简而言之，这是一个重要的概念，它涉及到...你还有什么想了解的吗？`
        : `Let me explain "${context.title}":\n\n${context.summary}\n\nIn short, this is an important concept that relates to... Do you have any other questions?`;
    } else if (userMessage.toLowerCase().includes('related') || userMessage.toLowerCase().includes('相关')) {
      const related = knowledgeList
        .filter(k => k.id !== context.id && k.tags.some(t => context.tags?.includes(t)))
        .slice(0, 3);

      if (related.length > 0) {
        response = language === 'zh'
          ? `与「${context.title}」相关的知识：\n\n${related.map(r => `• **${r.title}**: ${r.summary}`).join('\n\n')}`
          : `Knowledge related to "${context.title}":\n\n${related.map(r => `• **${r.title}**: ${r.summary}`).join('\n\n')}`;
      } else {
        response = language === 'zh'
          ? `暂时没有找到与「${context.title}」直接相关的其他知识。你可以通过添加更多标签来建立关联。`
          : `No directly related knowledge found for "${context.title}". You can establish connections by adding more tags.`;
      }
    } else {
      response = language === 'zh'
        ? `关于「${context.title}」，你问的是「${userMessage}」。\n\n基于这篇知识的内容：${context.summary}\n\n我可以帮你：\n• 总结核心要点\n• 解释具体概念\n• 查找相关知识\n\n请告诉我你想了解什么？`
        : `Regarding "${context.title}", you asked about "${userMessage}".\n\nBased on this knowledge: ${context.summary}\n\nI can help you:\n• Summarize key points\n• Explain specific concepts\n• Find related knowledge\n\nWhat would you like to know?`;
    }

    setIsTyping(false);

    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'agent',
      content: response
    }]);
  };

  const handleSend = () => {
    if (!input.trim() || isTyping) return;

    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim()
    }]);

    const userInput = input.trim();
    setInput('');
    generateResponse(userInput);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 w-14 h-14 bg-accent text-white rounded-full shadow-lg flex items-center justify-center z-50 hover:bg-accent/90 transition-colors"
          >
            <Bot className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              height: isMinimized ? 56 : 480
            }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 w-96 bg-bg-primary border border-border-subtle rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle bg-bg-secondary/30">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <div className="text-sm font-medium">
                    {language === 'zh' ? 'AI 助手' : 'AI Assistant'}
                  </div>
                  {contextKnowledge && !isMinimized && (
                    <div className="text-[10px] text-text-secondary truncate max-w-[200px]">
                      {language === 'zh' ? '上下文：' : 'Context: '}{contextKnowledge.title}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1.5 rounded-md hover:bg-bg-secondary transition-colors"
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-md hover:bg-bg-secondary transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center text-text-secondary">
                      <Bot className="w-10 h-10 mb-3 text-accent/50" />
                      <p className="text-sm mb-2">
                        {language === 'zh'
                          ? `询问关于「${contextKnowledge?.title || '当前知识'}」的任何问题`
                          : `Ask anything about "${contextKnowledge?.title || 'current knowledge'}"`}
                      </p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {[
                          { en: 'Summarize', zh: '总结' },
                          { en: 'Explain', zh: '解释' },
                          { en: 'Related', zh: '相关' }
                        ].map(prompt => (
                          <button
                            key={prompt.en}
                            onClick={() => setInput(language === 'zh' ? prompt.zh : prompt.en)}
                            className="text-xs px-2 py-1 bg-bg-secondary rounded-md hover:bg-border-subtle transition-colors"
                          >
                            {language === 'zh' ? prompt.zh : prompt.en}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <>
                      {messages.map(msg => (
                        <div
                          key={msg.id}
                          className={cn(
                            "flex gap-2",
                            msg.role === 'user' ? 'justify-end' : 'justify-start'
                          )}
                        >
                          {msg.role === 'agent' && (
                            <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                              <Bot className="w-3 h-3 text-accent" />
                            </div>
                          )}
                          <div className={cn(
                            "max-w-[80%] rounded-xl px-3 py-2 text-sm",
                            msg.role === 'user'
                              ? 'bg-text-primary text-bg-primary'
                              : 'bg-bg-secondary'
                          )}>
                            <div className="whitespace-pre-wrap leading-relaxed">
                              {msg.content}
                            </div>
                          </div>
                        </div>
                      ))}

                      {isTyping && (
                        <div className="flex gap-2">
                          <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                            <Bot className="w-3 h-3 text-accent" />
                          </div>
                          <div className="bg-bg-secondary rounded-xl px-3 py-2">
                            <Loader2 className="w-4 h-4 animate-spin text-accent" />
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-3 border-t border-border-subtle">
                  <div className="flex items-center gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={language === 'zh' ? '输入问题...' : 'Ask a question...'}
                      className="flex-1 px-3 py-2 bg-bg-secondary border border-border-subtle rounded-lg text-sm focus:outline-none focus:border-accent transition-colors"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!input.trim() || isTyping}
                      className="w-9 h-9 bg-text-primary text-bg-primary rounded-lg flex items-center justify-center hover:bg-text-secondary transition-colors disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
