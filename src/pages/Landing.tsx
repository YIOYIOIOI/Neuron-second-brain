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
    link: '/writing'
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

export default function Landing() {
  const { t } = useTranslation();
  const { language } = useStore();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row relative overflow-hidden bg-bg-primary text-text-primary">
      {/* Left Section - Main Content */}
      <div className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-24 py-16 lg:py-0">
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
            className="text-lg md:text-xl text-text-secondary max-w-xl mb-12 font-light leading-relaxed"
          >
            {t('landingDesc')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link
              to="/dashboard"
              className="group inline-flex items-center gap-4 text-sm uppercase tracking-widest font-medium border-b border-text-primary pb-2 hover:text-text-secondary hover:border-text-secondary transition-colors"
            >
              {t('enter')}
              <motion.span
                className="inline-block"
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <ArrowRight className="w-4 h-4" />
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
        className="absolute left-8 md:left-16 lg:left-24 top-0 w-px h-full bg-border-subtle origin-top hidden lg:block opacity-50"
      />

      {/* Footer text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay: 1.6 }}
        className="absolute left-8 md:left-16 lg:left-24 bottom-8 hidden lg:block text-xs font-mono text-text-secondary tracking-widest uppercase"
      >
        Est. 2026 — Neuron
      </motion.div>
    </div>
  );
}
