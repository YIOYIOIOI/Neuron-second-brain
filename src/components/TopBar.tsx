import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { User, Settings, LogOut, ChevronDown, Plus } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useTranslation } from '../hooks/useTranslation';
import { cn } from './Navbar';

export function TopBar() {
  const { user, logout, sidebarCollapsed, addKnowledge } = useStore();
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return t('dashboard');
    if (path.includes('/timeline')) return t('timeline');
    if (path.includes('/graph')) return t('graph');
    if (path.includes('/writing')) return t('writingMode');
    if (path.includes('/review')) return t('reviewTitle');
    if (path.includes('/capture')) return t('captureTitle');
    if (path.includes('/chat')) return t('assistantTitle');
    if (path.includes('/note/')) return language === 'zh' ? '知识详情' : 'Knowledge Detail';
    if (path.includes('/profile')) return language === 'zh' ? '个人中心' : 'Profile';
    return '';
  };

  const handleNewKnowledge = () => {
    const newId = Date.now().toString();
    const newItem = {
      id: newId,
      title: language === 'zh' ? '无标题' : 'Untitled',
      content: '',
      summary: language === 'zh' ? '新建知识' : 'New knowledge item',
      tags: [],
      createdAt: new Date().toISOString(),
      relatedIds: [],
    };
    addKnowledge(newItem);
    navigate(`/note/${newId}?edit=true`);
  };

  return (
    <header
      className="fixed top-0 h-14 z-30 bg-bg-primary/70 backdrop-blur-md border-b border-border-subtle/50 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
      style={{
        left: sidebarCollapsed ? '64px' : '220px',
        width: sidebarCollapsed ? 'calc(100% - 64px)' : 'calc(100% - 220px)'
      }}
    >
      <div className="h-full flex items-center justify-between px-6">
        {/* Left side - New button & Page title */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleNewKnowledge}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-text-primary text-bg-primary rounded-md text-xs font-medium hover:bg-text-secondary transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('newKnowledge')}</span>
          </button>
          <div className="w-px h-5 bg-border-subtle hidden sm:block" />
          <motion.span
            key={location.pathname}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm font-medium text-text-secondary"
          >
            {getPageTitle()}
          </motion.span>
        </div>

        {/* Right side - User menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200",
              "hover:bg-border-subtle/50",
              showUserMenu && "bg-border-subtle/50"
            )}
          >
            <div className="w-7 h-7 rounded-full bg-text-primary text-bg-primary flex items-center justify-center text-xs font-medium uppercase">
              {user?.charAt(0) || 'U'}
            </div>
            <span className="text-sm font-medium hidden sm:inline">{user}</span>
            <ChevronDown className={cn(
              "w-4 h-4 text-text-secondary transition-transform duration-200",
              showUserMenu && "rotate-180"
            )} />
          </button>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="absolute right-0 top-full mt-2 w-64 bg-bg-primary border border-border-subtle rounded-lg shadow-xl overflow-hidden z-[70]"
              >
                {/* User Info Card */}
                <div className="p-4 border-b border-border-subtle bg-bg-secondary/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-text-primary text-bg-primary flex items-center justify-center text-lg font-medium uppercase">
                      {user?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{user}</div>
                      <div className="text-xs text-text-secondary">
                        {language === 'zh' ? '个人账户' : 'Personal Account'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="p-2">
                  <Link
                    to="/profile"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm hover:bg-border-subtle/50 transition-colors group"
                  >
                    <User className="w-4 h-4 text-text-secondary group-hover:text-text-primary transition-colors" />
                    <span>{language === 'zh' ? '个人中心' : 'Profile'}</span>
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm hover:bg-border-subtle/50 transition-colors group"
                  >
                    <Settings className="w-4 h-4 text-text-secondary group-hover:text-text-primary transition-colors" />
                    <span>{language === 'zh' ? '设置' : 'Settings'}</span>
                  </Link>
                </div>

                {/* Logout */}
                <div className="p-2 border-t border-border-subtle">
                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm hover:bg-red-50 hover:text-red-600 transition-colors group w-full"
                  >
                    <LogOut className="w-4 h-4 text-text-secondary group-hover:text-red-500 transition-colors" />
                    <span>{t('logout')}</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
