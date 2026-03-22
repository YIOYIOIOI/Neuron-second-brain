import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../store/useStore';
import { useTranslation } from '../hooks/useTranslation';
import {
  User, Mail, Calendar, BookOpen, Brain, TrendingUp,
  Globe, Download, Upload, FileJson, FileText, Trash2, AlertTriangle
} from 'lucide-react';
import { cn } from '../components/Navbar';
import { KnowledgeItem } from '../types';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, knowledgeList, language, setLanguage, importKnowledge, clearAllKnowledge } = useStore();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'overview' | 'settings' | 'data'>('overview');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate stats
  const totalKnowledge = knowledgeList.length;
  const totalTags = [...new Set(knowledgeList.flatMap(k => k.tags))].length;
  const totalConnections = knowledgeList.reduce((acc, item) => acc + (item.relatedIds?.length || 0), 0);
  const joinDate = '2026-01-15'; // Mock data

  const stats = [
    { label: language === 'zh' ? '知识条目' : 'Knowledge Items', value: totalKnowledge, icon: BookOpen },
    { label: language === 'zh' ? '标签数量' : 'Tags', value: totalTags, icon: Brain },
    { label: language === 'zh' ? '知识连接' : 'Connections', value: totalConnections, icon: TrendingUp },
  ];

  // Export to JSON
  const handleExportJSON = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      version: '1.0',
      knowledgeList: knowledgeList
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neuron-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(language === 'zh' ? '导出成功！' : 'Export successful!');
  };

  // Export to Markdown
  const handleExportMarkdown = () => {
    let markdown = `# Neuron Knowledge Base Export\n\n`;
    markdown += `> Exported on ${new Date().toLocaleDateString()}\n\n`;
    markdown += `---\n\n`;

    knowledgeList.forEach(item => {
      markdown += `## ${item.title}\n\n`;
      markdown += `**Created:** ${new Date(item.createdAt).toLocaleDateString()}\n\n`;
      if (item.tags.length > 0) {
        markdown += `**Tags:** ${item.tags.join(', ')}\n\n`;
      }
      markdown += `### Summary\n\n${item.summary}\n\n`;
      markdown += `### Content\n\n`;
      // Strip HTML tags for markdown
      const plainContent = item.content.replace(/<[^>]*>/g, '').trim();
      markdown += `${plainContent}\n\n`;
      markdown += `---\n\n`;
    });

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neuron-export-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(language === 'zh' ? '导出成功！' : 'Export successful!');
  };

  // Import from JSON
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);

        let items: KnowledgeItem[] = [];

        // Handle different formats
        if (data.knowledgeList && Array.isArray(data.knowledgeList)) {
          items = data.knowledgeList;
        } else if (Array.isArray(data)) {
          items = data;
        } else {
          throw new Error('Invalid format');
        }

        // Validate items
        const validItems = items.filter(item =>
          item.id && item.title && item.content !== undefined
        );

        if (validItems.length === 0) {
          toast.error(language === 'zh' ? '未找到有效的知识条目' : 'No valid knowledge items found');
          return;
        }

        importKnowledge(validItems);
        toast.success(
          language === 'zh'
            ? `成功导入 ${validItems.length} 条知识`
            : `Successfully imported ${validItems.length} items`
        );
      } catch (err) {
        toast.error(language === 'zh' ? '导入失败，请检查文件格式' : 'Import failed, please check file format');
      }
    };
    reader.readAsText(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Clear all data
  const handleClearAll = () => {
    clearAllKnowledge();
    setShowClearConfirm(false);
    toast.success(language === 'zh' ? '已清除所有数据' : 'All data cleared');
  };

  return (
    <div className="px-8 md:px-16 lg:px-24 py-8 min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-text-primary text-bg-primary flex items-center justify-center text-4xl font-serif">
            {user?.charAt(0).toUpperCase() || 'U'}
          </div>

          {/* User Info */}
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-serif tracking-tighter mb-2">{user}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
              <span className="flex items-center gap-1.5">
                <Mail className="w-4 h-4" />
                {user?.toLowerCase()}@example.com
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {language === 'zh' ? '加入于' : 'Joined'} {joinDate}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border-subtle">
          {(['overview', 'data', 'settings'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 py-2.5 text-sm font-medium transition-colors relative",
                activeTab === tab ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'
              )}
            >
              {tab === 'overview' && (language === 'zh' ? '概览' : 'Overview')}
              {tab === 'data' && (language === 'zh' ? '数据' : 'Data')}
              {tab === 'settings' && (language === 'zh' ? '设置' : 'Settings')}
              {activeTab === tab && (
                <motion.div
                  layoutId="profile-tab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-text-primary"
                />
              )}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 border border-border-subtle rounded-xl hover:border-text-secondary/30 transition-colors group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <stat.icon className="w-5 h-5 text-text-secondary group-hover:text-text-primary transition-colors" />
                    <span className="text-3xl font-serif">{stat.value}</span>
                  </div>
                  <div className="text-sm text-text-secondary">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="border border-border-subtle rounded-xl p-6">
              <h3 className="text-lg font-medium mb-4">
                {language === 'zh' ? '最近活动' : 'Recent Activity'}
              </h3>
              <div className="space-y-4">
                {knowledgeList.slice(0, 5).map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-4 py-3 border-b border-border-subtle/50 last:border-0"
                  >
                    <div className="w-2 h-2 rounded-full bg-accent" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{item.title}</div>
                      <div className="text-xs text-text-secondary">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {item.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="text-xs px-2 py-0.5 bg-border-subtle rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'data' && (
          <div className="space-y-6 max-w-2xl">
            {/* Export Section */}
            <div className="border border-border-subtle rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Download className="w-5 h-5 text-text-secondary" />
                <h3 className="font-medium">{language === 'zh' ? '导出数据' : 'Export Data'}</h3>
              </div>
              <p className="text-sm text-text-secondary mb-4">
                {language === 'zh'
                  ? '将你的知识库导出为 JSON 或 Markdown 格式，方便备份或迁移。'
                  : 'Export your knowledge base as JSON or Markdown for backup or migration.'}
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleExportJSON}
                  className="flex items-center gap-2 px-4 py-2.5 border border-border-subtle rounded-lg text-sm hover:border-text-secondary hover:bg-bg-secondary/50 transition-colors"
                >
                  <FileJson className="w-4 h-4" />
                  {language === 'zh' ? '导出 JSON' : 'Export JSON'}
                </button>
                <button
                  onClick={handleExportMarkdown}
                  className="flex items-center gap-2 px-4 py-2.5 border border-border-subtle rounded-lg text-sm hover:border-text-secondary hover:bg-bg-secondary/50 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  {language === 'zh' ? '导出 Markdown' : 'Export Markdown'}
                </button>
              </div>
              <div className="mt-4 text-xs text-text-secondary">
                {language === 'zh'
                  ? `当前共有 ${knowledgeList.length} 条知识`
                  : `Currently ${knowledgeList.length} knowledge items`}
              </div>
            </div>

            {/* Import Section */}
            <div className="border border-border-subtle rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Upload className="w-5 h-5 text-text-secondary" />
                <h3 className="font-medium">{language === 'zh' ? '导入数据' : 'Import Data'}</h3>
              </div>
              <p className="text-sm text-text-secondary mb-4">
                {language === 'zh'
                  ? '从 JSON 文件导入知识。支持 Neuron 导出的格式。'
                  : 'Import knowledge from a JSON file. Supports Neuron export format.'}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2.5 bg-text-primary text-bg-primary rounded-lg text-sm hover:bg-text-secondary transition-colors"
              >
                <Upload className="w-4 h-4" />
                {language === 'zh' ? '选择文件导入' : 'Choose File to Import'}
              </button>
            </div>

            {/* Danger Zone */}
            <div className="border border-red-200 rounded-xl p-6 bg-red-50/30">
              <div className="flex items-center gap-3 mb-4">
                <Trash2 className="w-5 h-5 text-red-500" />
                <h3 className="font-medium text-red-600">
                  {language === 'zh' ? '危险操作' : 'Danger Zone'}
                </h3>
              </div>
              <p className="text-sm text-text-secondary mb-4">
                {language === 'zh'
                  ? '清除所有知识数据。此操作不可撤销，请先导出备份。'
                  : 'Clear all knowledge data. This action cannot be undone. Please export a backup first.'}
              </p>
              <button
                onClick={() => setShowClearConfirm(true)}
                className="px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm hover:bg-red-100 transition-colors"
              >
                {language === 'zh' ? '清除所有数据' : 'Clear All Data'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6 max-w-2xl">
            {/* Language Setting */}
            <div className="border border-border-subtle rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Globe className="w-5 h-5 text-text-secondary" />
                <h3 className="font-medium">{language === 'zh' ? '语言设置' : 'Language'}</h3>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setLanguage('en')}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                    language === 'en'
                      ? 'bg-text-primary text-bg-primary'
                      : 'border border-border-subtle hover:border-text-secondary'
                  )}
                >
                  English
                </button>
                <button
                  onClick={() => setLanguage('zh')}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                    language === 'zh'
                      ? 'bg-text-primary text-bg-primary'
                      : 'border border-border-subtle hover:border-text-secondary'
                  )}
                >
                  中文
                </button>
              </div>
            </div>

            {/* Account Info */}
            <div className="border border-border-subtle rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <User className="w-5 h-5 text-text-secondary" />
                <h3 className="font-medium">{language === 'zh' ? '账户信息' : 'Account'}</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-text-secondary uppercase tracking-wider">
                    {language === 'zh' ? '用户名' : 'Username'}
                  </label>
                  <div className="mt-1 px-3 py-2 border border-border-subtle rounded-lg text-sm">
                    {user}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-text-secondary uppercase tracking-wider">
                    {language === 'zh' ? '邮箱' : 'Email'}
                  </label>
                  <div className="mt-1 px-3 py-2 border border-border-subtle rounded-lg text-sm">
                    {user?.toLowerCase()}@example.com
                  </div>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="border border-red-200 rounded-xl p-6 bg-red-50/30">
              <h3 className="font-medium text-red-600 mb-2">
                {language === 'zh' ? '危险区域' : 'Danger Zone'}
              </h3>
              <p className="text-sm text-text-secondary mb-4">
                {language === 'zh'
                  ? '删除账户后，所有数据将无法恢复。'
                  : 'Once you delete your account, there is no going back.'}
              </p>
              <button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm hover:bg-red-100 transition-colors">
                {language === 'zh' ? '删除账户' : 'Delete Account'}
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Clear confirmation modal */}
      <AnimatePresence>
        {showClearConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowClearConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-bg-primary rounded-xl p-6 max-w-md w-full border border-border-subtle"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <h3 className="text-lg font-medium">
                  {language === 'zh' ? '确认清除' : 'Confirm Clear'}
                </h3>
              </div>
              <p className="text-text-secondary mb-6">
                {language === 'zh'
                  ? `你确定要清除所有 ${knowledgeList.length} 条知识吗？此操作无法撤销。`
                  : `Are you sure you want to clear all ${knowledgeList.length} knowledge items? This cannot be undone.`}
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="px-4 py-2 border border-border-subtle rounded-lg text-sm hover:bg-bg-secondary transition-colors"
                >
                  {language === 'zh' ? '取消' : 'Cancel'}
                </button>
                <button
                  onClick={handleClearAll}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors"
                >
                  {language === 'zh' ? '确认清除' : 'Yes, Clear All'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
