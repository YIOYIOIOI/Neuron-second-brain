import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, Send, Loader2, Minimize2, Maximize2, Sidebar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '../store/useStore';
import { cn } from './Navbar';

interface Message {
  id: string;
  role: 'user' | 'agent';
  content: string;
}

interface AgentChatProps {
  autoOpen?: boolean;
}

export function AgentChat({ autoOpen = false }: AgentChatProps = {}) {
  const { 
    knowledgeList, 
    language, 
    isAgentOpen, 
    setAgentOpen, 
    isAgentSidebar, 
    setAgentSidebar, 
    isAgentSidebarCollapsed, 
    setAgentSidebarCollapsed 
  } = useStore();
  
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [buttonPos, setButtonPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isDraggingBtnRef = useRef(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isAgentOpen && !isMinimized && inputRef.current && !isAgentSidebarCollapsed) {
      inputRef.current.focus();
    }
  }, [isAgentOpen, isMinimized, isAgentSidebarCollapsed]);

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
    if (isAgentSidebar) return;
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
        {!isAgentOpen && (
          <motion.button
            drag
            dragMomentum={false}
            dragElastic={0}
            onDragStart={(e) => {
              e.preventDefault();
              isDraggingBtnRef.current = true;
            }}
            onDragEnd={(e, info) => {
              setButtonPos({ x: buttonPos.x + info.offset.x, y: buttonPos.y + info.offset.y });
              setTimeout(() => {
                isDraggingBtnRef.current = false;
              }, 150);
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, x: buttonPos.x, y: buttonPos.y }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => {
              if (isDraggingBtnRef.current) return;
              setPosition(buttonPos);
              setAgentOpen(true);
            }}
            className="fixed bottom-6 right-6 w-12 h-12 bg-bg-primary/80 backdrop-blur-md border border-border-subtle text-accent rounded-full shadow-lg flex items-center justify-center z-50 hover:bg-bg-secondary transition-colors cursor-move"
            style={{ touchAction: 'none' }}
          >
            <Sparkles className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isAgentOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={!isAgentSidebar ? { transform: `translate(${position.x}px, ${position.y}px)` } : {}}
            className={cn(
              "bg-bg-primary shadow-2xl flex flex-col transition-transform duration-300",
              isAgentSidebar ? "fixed right-0 top-14 bottom-0 w-[300px] z-[60] border-l border-y-0 border-r-0 border-border-subtle rounded-l-2xl" : "fixed bottom-6 right-6 w-96 rounded-2xl z-50 overflow-hidden border border-border-subtle",
              isMinimized && !isAgentSidebar && "h-14",
              !isMinimized && !isAgentSidebar && "h-[480px]",
              isAgentSidebar && isAgentSidebarCollapsed && "translate-x-full"
            )}
          >
            {/* Sidebar Toggle Button */}
            {isAgentSidebar && (
              <button
                onClick={() => setAgentSidebarCollapsed(!isAgentSidebarCollapsed)}
                className="absolute top-1/2 -translate-y-1/2 w-6 h-20 bg-bg-primary border border-border-subtle border-r-0 flex items-center justify-center hover:bg-bg-secondary transition-colors z-[70] shadow-[-4px_0_8px_rgba(0,0,0,0.05)] group"
                style={{
                  right: 'calc(100% - 1px)',
                  borderTopLeftRadius: '12px',
                  borderBottomLeftRadius: '12px',
                  borderTopRightRadius: 0,
                  borderBottomRightRadius: 0,
                }}
              >
                <motion.div animate={{ rotate: isAgentSidebarCollapsed ? 0 : 180 }} transition={{ duration: 0.2 }}>
                  <ChevronLeft className="w-4 h-4 text-text-secondary group-hover:text-text-primary transition-colors" />
                </motion.div>
              </button>
            )}

            {/* Header */}
            <div
              className={cn(
                "flex items-center justify-between px-4 py-3 border-b border-border-subtle bg-bg-secondary/30",
                !isAgentSidebar && "cursor-move",
                isAgentSidebar && "rounded-tl-2xl"
              )}
              onMouseDown={handleMouseDown}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-accent" />
                </div>
                <div className="text-sm font-medium">{language === 'zh' ? 'AI 助手' : 'AI Assistant'}</div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setAgentSidebar(!isAgentSidebar);
                    if (!isAgentSidebar) setAgentSidebarCollapsed(false);
                  }}
                  className="p-1.5 rounded-md hover:bg-bg-secondary transition-colors"
                  title={isAgentSidebar ? (language === 'zh' ? '浮窗模式' : 'Float') : (language === 'zh' ? '侧边栏模式' : 'Sidebar')}
                >
                  <Sidebar className="w-4 h-4 text-text-secondary" />
                </button>
                {!isAgentSidebar && (
                  <button onClick={() => setIsMinimized(!isMinimized)} className="p-1.5 rounded-md hover:bg-bg-secondary transition-colors">
                    {isMinimized ? <Maximize2 className="w-4 h-4 text-text-secondary" /> : <Minimize2 className="w-4 h-4 text-text-secondary" />}
                  </button>
                )}
                <button onClick={() => setAgentOpen(false)} className="p-1.5 rounded-md hover:bg-bg-secondary transition-colors">
                  <X className="w-4 h-4 text-text-secondary" />
                </button>
              </div>
            </div>

            {/* Content */}
            {!isMinimized && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center text-text-secondary">
                      <Sparkles className="w-10 h-10 mb-3 text-accent/50" />
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
                        <Loader2 className="w-4 h-4 animate-spin text-text-secondary" />
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
                      className="flex-1 px-3 py-2 border border-border-subtle rounded-lg focus:outline-none focus:border-accent text-sm bg-bg-primary"
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
