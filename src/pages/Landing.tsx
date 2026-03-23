import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight, Brain, Network, Sparkles, BookOpen, X } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { useStore } from '../store/useStore';

const features = [
  {
    icon: Brain,
    labelEn: 'Capture',
    labelZh: '记录',
    descEn: 'Fleeting thoughts',
    descZh: '灵感闪现',
    detailEn: 'Quickly capture your fleeting thoughts before they disappear. Our intelligent capture system helps you record ideas, quotes, and insights with minimal friction. Whether it\'s a sudden inspiration or a profound realization, preserve it in your second brain.',
    detailZh: '在灵感消逝之前快速捕捉你的思绪。智能记录系统帮助你以最小的阻力记录想法、引用和洞见。无论是突然的灵感还是深刻的领悟，都能保存在你的第二大脑中。',
    link: '/capture'
  },
  {
    icon: Network,
    labelEn: 'Connect',
    labelZh: '连接',
    descEn: 'Knowledge graph',
    descZh: '知识图谱',
    detailEn: 'Visualize the connections between your ideas through an interactive knowledge graph. Discover hidden relationships, identify patterns, and build a web of interconnected thoughts. Your knowledge becomes more valuable as connections grow.',
    detailZh: '通过交互式知识图谱可视化你的想法之间的联系。发现隐藏的关系，识别模式，构建相互连接的思想网络。随着连接的增长，你的知识变得更有价值。',
    link: '/graph'
  },
  {
    icon: Sparkles,
    labelEn: 'Synthesize',
    labelZh: '整合',
    descEn: 'AI-powered',
    descZh: 'AI 驱动',
    detailEn: 'Leverage AI to synthesize your knowledge into new ideas and insights. Generate drafts, find relevant connections, and create new content by combining your existing knowledge. Transform scattered notes into coherent narratives.',
    detailZh: '利用 AI 将你的知识整合成新的想法和洞见。生成草稿，找到相关联系，通过组合现有知识创造新内容。将零散的笔记转化为连贯的叙述。',
    link: '/capture?mode=create'
  },
  {
    icon: BookOpen,
    labelEn: 'Review',
    labelZh: '复习',
    descEn: 'Spaced repetition',
    descZh: '间隔重复',
    detailEn: 'Never forget what you\'ve learned with our spaced repetition system. Review your knowledge at optimal intervals to strengthen long-term memory. Transform your second brain into a powerful learning companion.',
    detailZh: '通过间隔重复系统，永远不会忘记你学到的知识。以最佳间隔复习你的知识，以加强长期记忆。将你的第二大脑转变为强大的学习伙伴。',
    link: '/review'
  },
];

const contentBlocks = [
  {
    titleZh: '想法从寂静中浮现',
    titleEn: 'Ideas Emerge from Silence',
    contentZh: '在一切结构与逻辑形成之前，思考往往诞生于最安静的时刻。那些尚未成型的念头，以零散、模糊甚至略显混乱的状态出现，它们没有明确的归属，也没有清晰的边界，却蕴含着最原始的创造力。\n\n你不会在一开始就拥有答案，你只是在记录一些片段——一句话、一个灵感、一个尚未完成的推论。\n\n个人知识库的意义，正是在这一刻开始显现：它不是为了整理已经清晰的内容，而是为了承接那些尚未被理解的想法，让它们不被遗忘，并等待被进一步发展。',
    contentEn: 'Before structure and logic take shape, thinking often emerges in the quietest moments. Unformed thoughts appear scattered, vague, even chaotic—without clear boundaries or belonging, yet containing the most primitive creativity.\n\nYou won\'t have answers at first. You\'re just recording fragments—a sentence, an inspiration, an incomplete inference.\n\nThis is where a personal knowledge base begins to matter: not to organize what\'s already clear, but to catch ideas not yet understood, keeping them from being forgotten while they wait to develop further.'
  },
  {
    titleZh: '连接自然形成',
    titleEn: 'Connections Form Naturally',
    contentZh: '当记录逐渐积累，原本孤立的内容开始产生联系。不同时间、不同语境下产生的想法，在回顾中彼此呼应，形成隐约可见的结构。\n\n你会开始发现：一些观点其实来源于同一个问题，一些笔记之间存在潜在的关联，而某些看似无关的内容，正在逐渐指向同一个方向。\n\n这种连接并不是刻意构建的结果，而是在持续记录与回看中自然浮现的关系网络。\n\n知识不再是孤立的片段，而开始形成脉络。而知识库的价值，也从"记录工具"转变为关系的发现系统。',
    contentEn: 'As records accumulate, isolated content begins to connect. Ideas from different times and contexts echo each other in review, forming dimly visible structures.\n\nYou start discovering: some views stem from the same question, some notes share hidden links, and seemingly unrelated content gradually points in the same direction.\n\nThese connections aren\'t deliberately constructed—they\'re relationship networks naturally emerging through continuous recording and review.\n\nKnowledge is no longer isolated fragments but begins forming threads. The knowledge base transforms from a "recording tool" into a system for discovering relationships.'
  },
  {
    titleZh: '知识开始流动',
    titleEn: 'Knowledge Begins to Flow',
    contentZh: '当连接足够多，结构逐渐清晰，知识便不再停留在静态的记录之中，而开始在不同节点之间流动。\n\n你可以从一个想法出发，跳转到相关的记录，再从中延伸出新的理解，形成连续的思考路径。\n\n这种流动，让思考不再是线性的，而是网状的、可回溯的、可延展的。\n\n每一次浏览与回顾，都可能重新组合已有的信息，产生新的理解。\n\n此时的知识库，不再只是"存储"，而成为一个持续运转的思考系统。',
    contentEn: 'When connections multiply and structure clarifies, knowledge no longer stays in static records but flows between nodes.\n\nYou can start from one idea, jump to related records, extend into new understanding, forming continuous thought paths.\n\nThis flow makes thinking non-linear—networked, traceable, expandable.\n\nEach browse and review might recombine existing information, generating new understanding.\n\nThe knowledge base is no longer just "storage" but becomes a continuously operating thinking system.'
  },
  {
    titleZh: '产出思维结晶',
    titleEn: 'Crystallizing Thought',
    contentZh: '当信息被不断连接、重组与验证，原本零散的想法开始沉淀为相对稳定的认知成果。\n\n这些成果可能是一段完整的观点、一篇文章，或是一种你可以反复使用的思考方式。\n\n它们不再是偶然出现的灵感，而是经过多次推演与整理之后形成的"结晶"。\n\n在这一阶段，知识库帮助你完成的，不只是记录与连接，而是将思考转化为可表达、可复用、可传播的内容。\n\n这也是从"收集信息"走向"创造价值"的关键一步。',
    contentEn: 'As information connects, reorganizes, and validates, scattered ideas settle into relatively stable cognitive outcomes.\n\nThese might be complete viewpoints, articles, or reusable thinking methods.\n\nNo longer accidental inspirations, they\'re "crystals" formed through repeated deduction and organization.\n\nAt this stage, the knowledge base does more than record and connect—it transforms thinking into expressible, reusable, shareable content.\n\nThis is the crucial step from "collecting information" to "creating value."'
  },
  {
    titleZh: '理解不断深化',
    titleEn: 'Understanding Deepens',
    contentZh: '真正的理解，并不是一次完成的。\n\n随着时间推移，你会不断回到过去的记录，在新的经验与认知基础上，对旧的内容进行修正、补充与重构。\n\n一些曾经模糊的概念逐渐清晰，一些曾经确定的结论也可能被推翻。\n\n知识在反复的迭代中不断被打磨，思维的深度，也在这一过程中逐渐建立。\n\n个人知识库的最终意义，并不只是"存储过去"，而是帮助你在持续回看与重构中，形成更稳定、更深刻的认知体系。',
    contentEn: 'True understanding isn\'t achieved in one go.\n\nOver time, you\'ll return to past records, revising, supplementing, and reconstructing old content based on new experience and cognition.\n\nOnce-vague concepts gradually clarify; once-certain conclusions might be overturned.\n\nKnowledge is refined through repeated iteration, and depth of thinking gradually builds in this process.\n\nThe ultimate meaning of a personal knowledge base isn\'t just "storing the past," but helping you form a more stable, profound cognitive system through continuous review and reconstruction.'
  }
];

export default function Landing() {
  const { t } = useTranslation();
  const { language } = useStore();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <div className="bg-bg-primary text-text-primary">
      {/* Hero Section */}
      <div className="min-h-screen flex flex-col lg:flex-row relative overflow-hidden">
        {/* Left Section - Main Content */}
        <div className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:pl-48 lg:pr-24 py-16 lg:py-0">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="max-w-2xl z-10"
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-xs font-mono text-text-secondary tracking-widest uppercase mb-8"
          >
            Personal Knowledge System
          </motion.div>

          <motion.h1
            initial={{ letterSpacing: '0.1em', opacity: 0 }}
            animate={{ letterSpacing: '-0.02em', opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl md:text-7xl lg:text-8xl font-serif leading-[0.9] tracking-tighter mb-8"
          >
            {t('landingTitle')}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg md:text-xl text-text-secondary max-w-xl mb-16 font-light leading-relaxed"
          >
            {t('landingDesc')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex justify-center"
          >
            <Link
              to="/dashboard"
              className="group relative inline-flex items-center justify-center gap-2 px-8 py-3 text-xs uppercase tracking-widest font-medium border-2 border-text-primary rounded-full transition-all duration-300 hover:bg-text-primary hover:text-bg-primary hover:scale-105"
            >
              <span>{t('enter')}</span>
              <motion.span
                animate={{ x: [0, 3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </motion.span>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Right Section - Features */}
      <div className="lg:w-[45%] flex flex-col justify-center px-8 md:px-16 lg:px-24 py-16 lg:py-0 border-t lg:border-t-0 lg:border-l border-border-subtle">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="space-y-4"
        >
          <div className="text-xs font-mono text-text-secondary tracking-widest uppercase mb-8">
            {language === 'zh' ? '核心功能' : 'Core Features'}
          </div>

          {features.map((feature, index) => (
            <motion.div
              key={feature.labelEn}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.8 + index * 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              <motion.div
                layout
                onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                className="group py-5 border-b border-border-subtle hover:border-text-secondary transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-6">
                  <motion.div
                    layout="position"
                    className="flex-shrink-0 w-12 h-12 flex items-center justify-center border border-border-subtle group-hover:border-text-secondary group-hover:bg-text-primary group-hover:text-bg-primary transition-all"
                  >
                    <feature.icon className="w-5 h-5" />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-lg font-medium mb-1 group-hover:text-text-primary transition-colors">
                          {language === 'zh' ? feature.labelZh : feature.labelEn}
                        </div>
                        <div className="text-sm text-text-secondary font-light">
                          {language === 'zh' ? feature.descZh : feature.descEn}
                        </div>
                      </div>
                      <motion.div
                        className="text-2xl font-serif text-text-secondary opacity-30 group-hover:opacity-100 transition-opacity"
                        whileHover={{ scale: 1.1 }}
                      >
                        {String(index + 1).padStart(2, '0')}
                      </motion.div>
                    </div>
                  </div>
                </div>

                {/* Expanded content */}
                <AnimatePresence>
                  {expandedIndex === index && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="pt-6 pl-[72px]">
                        <p className="text-sm text-text-secondary leading-relaxed mb-4">
                          {language === 'zh' ? feature.detailZh : feature.detailEn}
                        </p>
                        <Link
                          to={feature.link}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-medium text-text-primary hover:text-text-secondary transition-colors"
                        >
                          {language === 'zh' ? '立即体验' : 'Try Now'}
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4 }}
          className="mt-12 pt-8 border-t border-border-subtle"
        >
          <div className="grid grid-cols-3 gap-8">
            <div>
              <div className="text-3xl font-serif mb-1">∞</div>
              <div className="text-xs text-text-secondary font-mono uppercase tracking-wider">
                {language === 'zh' ? '无限知识' : 'Unlimited'}
              </div>
            </div>
            <div>
              <div className="text-3xl font-serif mb-1">AI</div>
              <div className="text-xs text-text-secondary font-mono uppercase tracking-wider">
                {language === 'zh' ? '智能增强' : 'Powered'}
              </div>
            </div>
            <div>
              <div className="text-3xl font-serif mb-1">24/7</div>
              <div className="text-xs text-text-secondary font-mono uppercase tracking-wider">
                {language === 'zh' ? '随时可用' : 'Available'}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Decorative vertical line */}
      <motion.div
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        className="absolute left-8 md:left-16 lg:left-32 top-0 w-px h-full bg-border-subtle origin-top hidden lg:block opacity-30"
      />

      {/* Footer text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay: 1.6 }}
        className="absolute left-8 md:left-16 lg:left-32 bottom-8 hidden lg:block text-xs font-mono text-text-secondary tracking-widest uppercase"
      >
        Est. 2026 — Neuron
      </motion.div>
    </div>

    {/* Content Blocks Section */}
    <div className="py-24 px-8 md:px-16">
      {contentBlocks.map((block, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className={`max-w-7xl mx-auto mb-32 grid lg:grid-cols-2 gap-16 items-center ${
            index % 2 === 0 ? '' : 'lg:grid-flow-dense'
          }`}
        >
          {/* Title Block */}
          <div className={index % 2 === 0 ? '' : 'lg:col-start-2'}>
            <h2 className="text-5xl md:text-7xl font-serif leading-tight">
              {language === 'zh' ? block.titleZh : block.titleEn}
            </h2>
          </div>

          {/* Content Block */}
          <div className={index % 2 === 0 ? '' : 'lg:col-start-1 lg:row-start-1'}>
            <p className="text-lg text-text-secondary leading-relaxed whitespace-pre-line">
              {language === 'zh' ? block.contentZh : block.contentEn}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
  );
}
