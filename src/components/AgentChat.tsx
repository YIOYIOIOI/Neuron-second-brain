import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, X, Send, Loader2, Minimize2, Maximize2, Sidebar } from 'lucide-react';
import { useStore } from '../store/useStore';
import { cn } from './Navbar';

interface Message {
  id: string;
  role: 'user' | 'agent';
  content: string;
}

export function AgentChat() {
  const { knowledgeList, language } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isSidebar, setIsSidebar] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number } | null>(null);
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

  const generateResponse = async (userMessage: string) => {
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 1200));

    const response = language === 'zh'
      ? `关于「${userMessage}」的回答：\n\n这是一个模拟的AI助手回复。在实际应用中，这里会连接到真实的AI服务。`
      : `Response to "${userMessage}":\n\nThis is a simulated AI assistant response. In production, this would connect to a real AI service.`;

    setIsTyping(false);
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'agent', content: response }]);
  };

  const handleSend = () => {
    if (!input.trim() || isTyping) return;
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: input.trim() }]);
    const userInput = input.trim();
    setInput('');
    generateResponse(userInput);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isSidebar) return;
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !dragRef.current) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      setPosition({ x: dragRef.current.initialX + dx, y: dragRef.current.initialY + dy });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      dragRef.current = null;
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            drag
            dragMomentum={false}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 w-14 h-14 bg-accent text-white rounded-full shadow-lg flex items-center justify-center z-50 hover:bg-accent/90 transition-colors cursor-move"
          >
            <Bot className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={!isSidebar ? { transform: `translate(${position.x}px, ${position.y}px)` } : {}}
            className={cn(
              "bg-bg-primary border border-border-subtle shadow-2xl overflow-hidden z-50 flex flex-col",
              isSidebar ? "fixed right-0 top-16 h-[calc(100vh-4rem)] w-80" : "fixed bottom-6 right-6 w-96 rounded-2xl",
              isMinimized && !isSidebar && "h-14",
              !isMinimized && !isSidebar && "h-[480px]"
            )}
          >
            {/* Header */}
            <div
              className={cn("flex items-center justify-between px-4 py-3 border-b border-border-subtle bg-bg-secondary/30", !isSidebar && "cursor-move")}
              onMouseDown={handleMouseDown}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-accent" />
                </div>
                <div className="text-sm font-medium">{language === 'zh' ? 'AI 助手' : 'AI Assistant'}</div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsSidebar(!isSidebar)}
                  className="p-1.5 rounded-md hover:bg-bg-secondary transition-colors"
                  title={isSidebar ? (language === 'zh' ? '浮窗模式' : 'Float') : (language === 'zh' ? '侧边栏模式' : 'Sidebar')}
                >
                  <Sidebar className="w-4 h-4" />
                </button>
                {!isSidebar && (
                  <button onClick={() => setIsMinimized(!isMinimized)} className="p-1.5 rounded-md hover:bg-bg-secondary transition-colors">
                    {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                  </button>
                )}
                <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-md hover:bg-bg-secondary transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            {!isMinimized && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center text-text-secondary">
                      <Bot className="w-10 h-10 mb-3 text-accent/50" />
                      <p className="text-sm">{language === 'zh' ? '向AI助手提问' : 'Ask AI Assistant'}</p>
                    </div>
                  ) : (
                    messages.map(msg => (
                      <div key={msg.id} className={cn("flex", msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                        <div className={cn("max-w-[80%] px-3 py-2 rounded-lg text-sm", msg.role === 'user' ? 'bg-accent text-white' : 'bg-bg-secondary')}>
                          {msg.content}
                        </div>
                      </div>
                    ))
                  )}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-bg-secondary px-3 py-2 rounded-lg">
                        <Loader2 className="w-4 h-4 animate-spin" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-4 border-t border-border-subtle">
                  <div className="flex gap-2">
                    <input
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      placeholder={language === 'zh' ? '输入消息...' : 'Type a message...'}
                      className="flex-1 px-3 py-2 border border-border-subtle rounded-lg focus:outline-none focus:border-accent text-sm"
                    />
                    <button onClick={handleSend} disabled={!input.trim() || isTyping} className="px-3 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50">
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
