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

const agentCapabilities = [
  { icon: Search, labelEn: 'Search Knowledge', labelZh: '搜索知识', descEn: 'Find relevant information from your knowledge base', descZh: '从你的知识库中查找相关信息' },
  { icon: PenTool, labelEn: 'Generate Draft', labelZh: '生成草稿', descEn: 'Create drafts based on your existing knowledge', descZh: '基于现有知识创建草稿' },
  { icon: Brain, labelEn: 'Summarize', labelZh: '内容总结', descEn: 'Summarize long content into key points', descZh: '将长内容总结为要点' },
  { icon: Network, labelEn: 'Find Connections', labelZh: '发现关联', descEn: 'Discover relationships between knowledge items', descZh: '发现知识之间的关联关系' },
];

const quickPrompts = [
  { en: 'What topics do I know the most about?', zh: '我掌握最多的主题是什么？' },
  { en: 'Summarize my recent knowledge entries', zh: '总结我最近的知识条目' },
  { en: 'Find connections between my notes', zh: '找出我笔记之间的关联' },
  { en: 'Help me write about a new topic', zh: '帮我写一个新主题' },
];

export default function Agent() {
  const { knowledgeList, language } = useStore();
  const { t } = useTranslation();
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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
    <div className="h-[calc(100vh-3.5rem)] flex">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border-subtle flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
              <Bot className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h1 className="text-lg font-medium">Neuron Agent</h1>
              <p className="text-xs text-text-secondary">
                {language === 'zh' ? '你的智能知识助手' : 'Your intelligent knowledge assistant'}
              </p>
            </div>
          </div>
          <button
            onClick={startNewConversation}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-border-subtle rounded-lg hover:bg-bg-secondary transition-colors"
          >
            <Plus className="w-4 h-4" />
            {language === 'zh' ? '新对话' : 'New Chat'}
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-full flex flex-col items-center justify-center"
            >
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-6">
                <Sparkles className="w-8 h-8 text-accent" />
              </div>
              <h2 className="text-2xl font-serif mb-2">
                {language === 'zh' ? '开始新对话' : 'Start a Conversation'}
              </h2>
              <p className="text-text-secondary text-center max-w-md mb-8">
                {language === 'zh'
                  ? '询问关于你知识库的任何问题，或者使用下方的快捷提示开始。'
                  : 'Ask anything about your knowledge base, or use the quick prompts below to get started.'}
              </p>

              {/* Quick Prompts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                {quickPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickPrompt(prompt)}
                    className="text-left p-3 border border-border-subtle rounded-lg hover:border-accent hover:bg-accent/5 transition-colors text-sm"
                  >
                    <MessageSquare className="w-4 h-4 text-accent mb-2" />
                    {language === 'zh' ? prompt.zh : prompt.en}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <AnimatePresence>
              {messages.map(message => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex gap-3",
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.role === 'agent' && (
                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4 text-accent" />
                    </div>
                  )}
                  <div className={cn(
                    "max-w-[70%] rounded-2xl px-4 py-3",
                    message.role === 'user'
                      ? 'bg-text-primary text-bg-primary'
                      : 'bg-bg-secondary'
                  )}>
                    <div className="text-sm whitespace-pre-wrap leading-relaxed">
                      {message.content}
                    </div>
                    {message.relatedKnowledge && message.relatedKnowledge.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-border-subtle/50">
                        <div className="text-xs text-text-secondary mb-2">
                          {language === 'zh' ? '相关知识：' : 'Related:'}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {message.relatedKnowledge.map(k => (
                            <Link
                              key={k.id}
                              to={`/note/${k.id}`}
                              className="text-xs px-2 py-1 bg-bg-primary rounded hover:bg-border-subtle transition-colors"
                            >
                              {k.title}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  {message.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-text-primary text-bg-primary flex items-center justify-center shrink-0 text-xs font-medium">
                      U
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-accent" />
              </div>
              <div className="bg-bg-secondary rounded-2xl px-4 py-3">
                <div className="flex items-center gap-1">
                  <Loader2 className="w-4 h-4 animate-spin text-accent" />
                  <span className="text-sm text-text-secondary">
                    {language === 'zh' ? '正在思考...' : 'Thinking...'}
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-border-subtle">
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={language === 'zh' ? '输入你的问题...' : 'Type your question...'}
                rows={1}
                className="w-full px-4 py-3 pr-12 bg-bg-secondary border border-border-subtle rounded-xl resize-none focus:outline-none focus:border-accent transition-colors text-sm"
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="w-12 h-12 bg-text-primary text-bg-primary rounded-xl flex items-center justify-center hover:bg-text-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      <PinnedCardsSidebar />
    </div>
  );
}
