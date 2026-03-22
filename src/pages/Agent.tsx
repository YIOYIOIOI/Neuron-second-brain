import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../store/useStore';
import { useTranslation } from '../hooks/useTranslation';
import {
  Send, Bot, Sparkles, Search, BookOpen, PenTool,
  Brain, Network, Loader2, Plus, MessageSquare
} from 'lucide-react';
import { cn } from '../components/Navbar';
import { Link } from 'react-router-dom';
import { PinnedCardsSidebar } from '../components/PinnedCardsSidebar';

interface AgentMessage {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
  relatedKnowledge?: { id: string; title: string }[];
}

const quickPrompts = [
  { en: 'What topics do I know the most about?', zh: '我掌握最多的主题是什么？' },
  { en: 'Summarize my recent knowledge entries', zh: '总结我最近的知识条目' },
  { en: 'Find connections between my notes', zh: '找出我笔记之间的关联' },
  { en: 'Help me write about a new topic', zh: '帮我写一个新主题' },
];

export default function Agent() {
  const { knowledgeList, language, setAgentOpen, setAgentSidebar } = useStore();
  const { t } = useTranslation();
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 200) + 'px';
    }
  }, [input]);

  useEffect(() => {
    // Hide the floating agent and its sidebar when entering the full-screen Agent page
    setAgentOpen(false);
    setAgentSidebar(false);
  }, [setAgentOpen, setAgentSidebar]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Simulate AI response
  const generateResponse = async (userMessage: string) => {
    setIsTyping(true);

    // Simulate search through knowledge base
    const relevantKnowledge = knowledgeList
      .filter(item =>
        item.title.toLowerCase().includes(userMessage.toLowerCase()) ||
        item.content.toLowerCase().includes(userMessage.toLowerCase()) ||
        item.summary.toLowerCase().includes(userMessage.toLowerCase())
      )
      .slice(0, 3);

    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    let response = '';

    if (userMessage.toLowerCase().includes('topic') || userMessage.toLowerCase().includes('主题')) {      
      const tagCounts: Record<string, number> = {};
      knowledgeList.forEach(item => item.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      }));
      const topTags = Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([tag, count]) => `${tag} (${count})`)
        .join(', ');

      response = language === 'zh'
        ? `根据分析，你的知识库主要集中在以下主题：${topTags || '暂无足够数据'}。你总共有 ${knowledgeList.length} 条知识。`
        : `Based on my analysis, your knowledge base focuses on: ${topTags || 'Not enough data'}. You have ${knowledgeList.length} knowledge items in total.`;
    } else if (userMessage.toLowerCase().includes('summarize') || userMessage.toLowerCase().includes('总结')) {
      const recent = knowledgeList.slice(0, 5);
      response = language === 'zh'
        ? `以下是你最近的知识条目总结：\n\n${recent.map((item, i) => `${i + 1}. **${item.title}**: ${item.summary}`).join('\n\n')}`
        : `Here's a summary of your recent knowledge entries:\n\n${recent.map((item, i) => `${i + 1}. **${item.title}**: ${item.summary}`).join('\n\n')}`;
    } else if (userMessage.toLowerCase().includes('connection') || userMessage.toLowerCase().includes('关联')) {
      const withConnections = knowledgeList.filter(item => item.relatedIds && item.relatedIds.length > 0);
      response = language === 'zh'
        ? `你的知识库中有 ${withConnections.length} 条知识具有关联。最紧密连接的主题可以在知识图谱中查看。建议使用知识图谱功能来可视化这些连接。`
        : `Your knowledge base has ${withConnections.length} items with connections. The most connected topics can be viewed in the Graph. I recommend using the Graph feature to visualize these connections.`;    
    } else if (relevantKnowledge.length > 0) {
      response = language === 'zh'
        ? `我找到了 ${relevantKnowledge.length} 条相关知识：\n\n${relevantKnowledge.map(item => `• **${item.title}**: ${item.summary}`).join('\n\n')}\n\n需要我详细解释其中某一条吗？`
        : `I found ${relevantKnowledge.length} relevant knowledge items:\n\n${relevantKnowledge.map(item => `• **${item.title}**: ${item.summary}`).join('\n\n')}\n\nWould you like me to elaborate on any of these?`;
    } else {
      response = language === 'zh'
        ? `我理解你想了解「${userMessage}」。在你的知识库中没有找到直接相关的内容。你可以：\n\n1. 创建新的知识条目记录这个主题\n2. 尝试用不同的关键词搜索\n3. 使用写作模式来整理相关想法`
        : `I understand you're asking about "${userMessage}". I couldn't find directly related content in your knowledge base. You could:\n\n1. Create a new knowledge entry about this topic\n2. Try searching with different keywords\n3. Use the Writing mode to organize related thoughts`;
    }

    setIsTyping(false);

    const agentMessage: AgentMessage = {
      id: Date.now().toString(),
      role: 'agent',
      content: response,
      timestamp: new Date(),
      relatedKnowledge: relevantKnowledge.map(k => ({ id: k.id, title: k.title }))
    };

    setMessages(prev => [...prev, agentMessage]);
  };

  const handleSend = () => {
    if (!input.trim() || isTyping) return;

    const userMessage: AgentMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    generateResponse(input.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickPrompt = (prompt: { en: string; zh: string }) => {
    const text = language === 'zh' ? prompt.zh : prompt.en;
    const userMessage: AgentMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    generateResponse(text);
  };

  const startNewConversation = () => {
    setMessages([]);
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] flex bg-bg-primary">
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Header */}
        <div className="p-4 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
            <h1 className="font-medium text-sm text-text-secondary flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-accent" />
              Neuron Agent
            </h1>
          </div>
          <button
            onClick={startNewConversation}
            className="flex items-center gap-2 px-3 py-1.5 text-xs bg-bg-secondary text-text-secondary hover:text-text-primary rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            {language === 'zh' ? '新对话' : 'New Chat'}
          </button>
        </div>

        {/* Content & Input Stack */}
        <div className={cn("w-full max-w-3xl mx-auto px-4 flex flex-col", messages.length === 0 ? "flex-1 justify-center" : "flex-1 overflow-hidden")}>
          
          <div className={cn(
            "w-full overflow-y-auto scroll-smooth flex flex-col",
            messages.length === 0 ? "hidden" : "flex-1 pt-4 pb-4 space-y-8"
          )}>
            <AnimatePresence>
              {messages.map(message => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex gap-4 w-full",
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.role === 'agent' && (
                    <div className="w-8 h-8 rounded-full border border-border-subtle flex items-center justify-center shrink-0 mt-1 bg-bg-primary">
                      <Sparkles className="w-4 h-4 text-accent" />
                    </div>
                  )}
                  <div className={cn(
                    "max-w-[85%] sm:max-w-[75%] px-5 py-3.5",
                    message.role === 'user'
                      ? 'bg-bg-secondary rounded-2xl rounded-tr-sm'
                      : 'bg-transparent rounded-2xl px-0 py-1'
                  )}>
                    <div className={cn("text-[15px] whitespace-pre-wrap leading-relaxed", message.role === 'user' ? 'text-text-primary' : 'text-text-primary')}>
                      {message.content}
                    </div>
                    {message.relatedKnowledge && message.relatedKnowledge.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-border-subtle/50">
                        <div className="text-xs text-text-secondary mb-2">
                          {language === 'zh' ? '相关知识：' : 'Related sources:'}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {message.relatedKnowledge.map(k => (
                            <Link
                              key={k.id}
                              to={`/note/${k.id}`}
                              className="text-xs px-2.5 py-1.5 border border-border-subtle rounded-md hover:bg-bg-secondary transition-colors flex items-center gap-1.5 bg-bg-primary"
                            >
                              <BookOpen className="w-3 h-3 text-text-secondary" />
                              {k.title}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-4 w-full"
              >
                <div className="w-8 h-8 rounded-full border border-border-subtle flex items-center justify-center shrink-0 mt-1 bg-bg-primary">
                  <Sparkles className="w-4 h-4 text-accent" />
                </div>
                <div className="py-1">
                  <div className="flex items-center gap-2 h-8">
                    <Loader2 className="w-4 h-4 animate-spin text-accent" />
                    <span className="text-[15px] text-text-secondary">
                      {language === 'zh' ? '正在思考...' : 'Thinking...'}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} className="h-4" />
          </div>

          <motion.div 
            layout 
            className={cn("w-full shrink-0 z-10", messages.length === 0 ? "flex flex-col items-center pb-32" : "pb-6 pt-4 bg-bg-primary")}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
          >
            {messages.length === 0 && (
              <motion.div layout className="flex flex-col items-center mb-8">
                <div className="w-16 h-16 rounded-full border border-border-subtle flex items-center justify-center mb-6 shadow-sm">
                  <Sparkles className="w-8 h-8 text-accent" />
                </div>
                <h2 className="text-2xl font-serif text-center">
                  {language === 'zh' ? '今天需要什么帮助？' : 'How can I help you today?'}
                </h2>
              </motion.div>
            )}

            <div className="relative flex items-end w-full gap-2 bg-bg-secondary border border-border-subtle rounded-2xl p-2 shadow-sm focus-within:border-accent focus-within:ring-1 focus-within:ring-accent/20 transition-all">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={language === 'zh' ? '给 Neuron Agent 发送消息...' : 'Message Neuron Agent...'}
                rows={1}
                className="flex-1 px-3 py-2.5 bg-transparent border-none resize-none focus:outline-none text-[15px] leading-relaxed overflow-y-auto"
                style={{ minHeight: '44px', maxHeight: '200px' }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="w-10 h-10 mb-0.5 rounded-xl flex items-center justify-center bg-text-primary text-bg-primary hover:bg-text-secondary transition-colors disabled:opacity-30 disabled:hover:bg-text-primary shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            <AnimatePresence mode="popLayout">
              {messages.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mt-6"
                >
                  {quickPrompts.map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickPrompt(prompt)}
                      className="text-left p-3.5 border border-border-subtle rounded-xl hover:border-accent hover:bg-accent/5 transition-all text-[13px] group bg-bg-primary"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-accent mb-2.5 opacity-50 group-hover:opacity-100 transition-opacity" />
                      <div className="font-medium text-text-primary group-hover:text-accent transition-colors">
                        {language === 'zh' ? prompt.zh : prompt.en}
                      </div>
                    </button>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center mt-3"
                >
                  <p className="text-[11px] text-text-secondary opacity-70">
                    {language === 'zh' ? 'Agent 可能会犯错，请核实重要信息。' : 'Agent can make mistakes. Consider verifying important information.'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

        </div>
      </div>
      <PinnedCardsSidebar />
    </div>
  );
}