import { useState, DragEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, FileText, File, Archive, FileSpreadsheet, Globe, FileCode, BookOpen } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ImportModal({ isOpen, onClose }: ImportModalProps) {
  const [isDragging, setIsDragging] = useState(false);
  const { addKnowledge } = useStore();
  const navigate = useNavigate();
  const { language } = useTranslation();

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    files.forEach(processFile);
  };

  const handleFileSelect = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '.md,.markdown,.txt,.pdf,.csv,.zip';
    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      files.forEach(processFile);
    };
    input.click();
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const newId = Date.now().toString() + Math.random();
      const fileExt = file.name.split('.').pop()?.toLowerCase();

      const newItem = {
        id: newId,
        title: file.name.replace(/\.[^/.]+$/, ''),
        content,
        summary: content.substring(0, 100) + '...',
        tags: [fileExt || 'imported'],
        createdAt: new Date().toISOString(),
        relatedIds: [],
      };

      addKnowledge(newItem);
    };
    reader.readAsText(file);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            className="absolute inset-0 bg-black/40"
            initial={{ backdropFilter: "blur(0px)" }}
            animate={{ backdropFilter: "blur(8px)" }}
            exit={{ backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar bg-bg-primary backdrop-blur-xl rounded-2xl shadow-2xl border border-border-subtle"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-border-subtle/50 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-8">
              <h2 className="text-2xl font-serif mb-2">
                {language === 'zh' ? '导入文件' : 'Import Files'}
              </h2>
              <p className="text-sm text-text-secondary mb-6">
                {language === 'zh' ? '支持多种格式，拖放或点击选择文件' : 'Support multiple formats, drag & drop or click to select'}
              </p>

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleFileSelect}
                className={`
                  relative border-2 border-dashed rounded-xl p-12 transition-all duration-300 cursor-pointer
                  ${isDragging
                    ? 'border-accent bg-accent/5 scale-[1.02]'
                    : 'border-border-subtle hover:border-text-secondary hover:bg-bg-secondary/30'
                  }
                `}
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 rounded-full bg-bg-secondary">
                    <Upload className={`w-8 h-8 transition-colors ${isDragging ? 'text-accent' : 'text-text-secondary'}`} />
                  </div>

                  <div className="text-center">
                    <p className="text-lg font-medium mb-1">
                      {language === 'zh' ? '拖放文件到此处' : 'Drag & drop files here'}
                    </p>
                    <p className="text-sm text-text-secondary">
                      {language === 'zh' ? '或点击选择文件' : 'or click to browse'}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3 justify-center mt-2">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-secondary rounded-full text-xs">
                      <FileText className="w-3.5 h-3.5" />
                      <span>Markdown</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-secondary rounded-full text-xs">
                      <File className="w-3.5 h-3.5" />
                      <span>Text</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-secondary rounded-full text-xs">
                      <File className="w-3.5 h-3.5" />
                      <span>PDF</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-secondary rounded-full text-xs">
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>CSV</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-secondary rounded-full text-xs">
                      <Archive className="w-3.5 h-3.5" />
                      <span>ZIP</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* File-based Import Section */}
              <div className="mt-6 pt-6 border-t border-border-subtle">
                <h3 className="text-sm font-medium mb-4">
                  {language === 'zh' ? '基于文件导入' : 'File-based Import'}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <button className="flex items-center gap-3 p-3 rounded-lg border border-border-subtle hover:border-text-secondary hover:bg-bg-secondary/30 transition-all text-left group">
                    <FileSpreadsheet className="w-5 h-5 text-text-secondary group-hover:text-text-primary transition-colors" />
                    <div>
                      <div className="text-sm font-medium">CSV</div>
                      <div className="text-xs text-text-secondary">{language === 'zh' ? '导入结构化数据' : 'Import structured data'}</div>
                    </div>
                  </button>
                  <button className="flex items-center gap-3 p-3 rounded-lg border border-border-subtle hover:border-text-secondary hover:bg-bg-secondary/30 transition-all text-left group">
                    <File className="w-5 h-5 text-text-secondary group-hover:text-text-primary transition-colors" />
                    <div>
                      <div className="text-sm font-medium">PDF</div>
                      <div className="text-xs text-text-secondary">{language === 'zh' ? '提取PDF内容' : 'Extract PDF content'}</div>
                    </div>
                  </button>
                  <button className="flex items-center gap-3 p-3 rounded-lg border border-border-subtle hover:border-text-secondary hover:bg-bg-secondary/30 transition-all text-left group">
                    <FileText className="w-5 h-5 text-text-secondary group-hover:text-text-primary transition-colors" />
                    <div>
                      <div className="text-sm font-medium">{language === 'zh' ? '文本与Markdown' : 'Text & Markdown'}</div>
                      <div className="text-xs text-text-secondary">{language === 'zh' ? '导入纯文本和格式化笔记' : 'Import plain text and formatted notes'}</div>
                    </div>
                  </button>
                  <button className="flex items-center gap-3 p-3 rounded-lg border border-border-subtle hover:border-text-secondary hover:bg-bg-secondary/30 transition-all text-left group">
                    <Globe className="w-5 h-5 text-text-secondary group-hover:text-text-primary transition-colors" />
                    <div>
                      <div className="text-sm font-medium">HTML</div>
                      <div className="text-xs text-text-secondary">{language === 'zh' ? '导入网页内容' : 'Import web content'}</div>
                    </div>
                  </button>
                  <button className="flex items-center gap-3 p-3 rounded-lg border border-border-subtle hover:border-text-secondary hover:bg-bg-secondary/30 transition-all text-left group">
                    <FileCode className="w-5 h-5 text-text-secondary group-hover:text-text-primary transition-colors" />
                    <div>
                      <div className="text-sm font-medium">Word</div>
                      <div className="text-xs text-text-secondary">{language === 'zh' ? '导入Word文档' : 'Import Word documents'}</div>
                    </div>
                  </button>
                  <button className="flex items-center gap-3 p-3 rounded-lg border border-border-subtle hover:border-text-secondary hover:bg-bg-secondary/30 transition-all text-left group">
                    <BookOpen className="w-5 h-5 text-text-secondary group-hover:text-text-primary transition-colors" />
                    <div>
                      <div className="text-sm font-medium">EPUB</div>
                      <div className="text-xs text-text-secondary">{language === 'zh' ? '导入电子书' : 'Import ebooks'}</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Third-party Import Section */}
              <div className="mt-6 pt-6 border-t border-border-subtle">
                <h3 className="text-sm font-medium mb-4">
                  {language === 'zh' ? '第三方导入' : 'Third-party Import'}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <button className="flex items-center gap-3 p-3 rounded-lg border border-border-subtle hover:border-text-secondary hover:bg-bg-secondary/30 transition-all text-left group">
                    <div className="w-5 h-5 rounded bg-text-secondary/20 flex items-center justify-center text-xs font-bold">A</div>
                    <div>
                      <div className="text-sm font-medium">Asana</div>
                      <div className="text-xs text-text-secondary">{language === 'zh' ? '迁移项目和任务' : 'Migrate projects and tasks'}</div>
                    </div>
                  </button>
                  <button className="flex items-center gap-3 p-3 rounded-lg border border-border-subtle hover:border-text-secondary hover:bg-bg-secondary/30 transition-all text-left group">
                    <div className="w-5 h-5 rounded bg-text-secondary/20 flex items-center justify-center text-xs font-bold">C</div>
                    <div>
                      <div className="text-sm font-medium">Confluence</div>
                      <div className="text-xs text-text-secondary">{language === 'zh' ? '传输团队文件' : 'Transfer team files'}</div>
                    </div>
                  </button>
                  <button className="flex items-center gap-3 p-3 rounded-lg border border-border-subtle hover:border-text-secondary hover:bg-bg-secondary/30 transition-all text-left group">
                    <div className="w-5 h-5 rounded bg-text-secondary/20 flex items-center justify-center text-xs font-bold">T</div>
                    <div>
                      <div className="text-sm font-medium">Trello</div>
                      <div className="text-xs text-text-secondary">{language === 'zh' ? '移动看板和卡片' : 'Move boards and cards'}</div>
                    </div>
                  </button>
                  <button className="flex items-center gap-3 p-3 rounded-lg border border-border-subtle hover:border-text-secondary hover:bg-bg-secondary/30 transition-all text-left group">
                    <div className="w-5 h-5 rounded bg-text-secondary/20 flex items-center justify-center text-xs font-bold">W</div>
                    <div>
                      <div className="text-sm font-medium">Workflowy</div>
                      <div className="text-xs text-text-secondary">{language === 'zh' ? '导入大纲和列表' : 'Import outlines and lists'}</div>
                    </div>
                  </button>
                  <button className="flex items-center gap-3 p-3 rounded-lg border border-border-subtle hover:border-text-secondary hover:bg-bg-secondary/30 transition-all text-left group">
                    <div className="w-5 h-5 rounded bg-text-secondary/20 flex items-center justify-center text-xs font-bold">E</div>
                    <div>
                      <div className="text-sm font-medium">Evernote</div>
                      <div className="text-xs text-text-secondary">{language === 'zh' ? '引入笔记和笔记本' : 'Import notes and notebooks'}</div>
                    </div>
                  </button>
                  <button className="flex items-center gap-3 p-3 rounded-lg border border-border-subtle hover:border-text-secondary hover:bg-bg-secondary/30 transition-all text-left group">
                    <div className="w-5 h-5 rounded bg-text-secondary/20 flex items-center justify-center text-xs font-bold">J</div>
                    <div>
                      <div className="text-sm font-medium">Jira</div>
                      <div className="text-xs text-text-secondary">{language === 'zh' ? '导入问题和项目' : 'Import issues and projects'}</div>
                    </div>
                  </button>
                  <button className="flex items-center gap-3 p-3 rounded-lg border border-border-subtle hover:border-text-secondary hover:bg-bg-secondary/30 transition-all text-left group">
                    <div className="w-5 h-5 rounded bg-text-secondary/20 flex items-center justify-center text-xs font-bold">M</div>
                    <div>
                      <div className="text-sm font-medium">Monday.com</div>
                      <div className="text-xs text-text-secondary">{language === 'zh' ? '迁移工作空间和任务' : 'Migrate workspaces and tasks'}</div>
                    </div>
                  </button>
                  <button className="flex items-center gap-3 p-3 rounded-lg border border-border-subtle hover:border-text-secondary hover:bg-bg-secondary/30 transition-all text-left group">
                    <div className="w-5 h-5 rounded bg-text-secondary/20 flex items-center justify-center text-xs font-bold">Q</div>
                    <div>
                      <div className="text-sm font-medium">Quip</div>
                      <div className="text-xs text-text-secondary">{language === 'zh' ? '导入协作文档' : 'Import collaborative docs'}</div>
                    </div>
                  </button>
                  <button className="flex items-center gap-3 p-3 rounded-lg border border-border-subtle hover:border-text-secondary hover:bg-bg-secondary/30 transition-all text-left group">
                    <div className="w-5 h-5 rounded bg-text-secondary/20 flex items-center justify-center text-xs font-bold">G</div>
                    <div>
                      <div className="text-sm font-medium">Google Docs</div>
                      <div className="text-xs text-text-secondary">{language === 'zh' ? '无缝导入文档' : 'Seamless document import'}</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
