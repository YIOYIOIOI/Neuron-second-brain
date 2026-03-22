import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
  Grid, Clock, Network, PenTool, BookOpen, Globe,
  ChevronsLeft, ChevronsRight, Bot, Sun, Moon, Monitor
} from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { useStore } from '../store/useStore';
import { useTheme } from '../hooks/useTheme';
import { useState } from 'react';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Nav item with smooth text animation
function NavItem({
  to,
  icon: Icon,
  label,
  isActive,
  collapsed,
  highlight = false
}: {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isActive: boolean;
  collapsed: boolean;
  highlight?: boolean;
}) {
  return (
    <Link
      to={to}
      className={cn(
        "relative flex items-center py-2.5 px-3 rounded-lg transition-all duration-200 group overflow-hidden",
        isActive ? "bg-border-subtle/60" : "hover:bg-border-subtle/30 opacity-60 hover:opacity-100",
        highlight && !isActive && "bg-accent/10 opacity-100"
      )}
    >
      <Icon className={cn("w-[18px] h-[18px] shrink-0", highlight && "text-accent")} />
      <div className={cn(
        "overflow-hidden transition-all duration-300 ease-out",
        collapsed ? "w-0 opacity-0" : "w-28 opacity-100 ml-3"
      )}>
        <span className="text-xs whitespace-nowrap block">{label}</span>
      </div>
      {isActive && (
        <motion.div
          layoutId="nav-indicator"
          className="absolute left-0 top-0 w-[3px] h-full bg-current rounded-r"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
    </Link>
  );
}

// Bottom action button with smooth text animation
function ActionButton({
  onClick,
  icon: Icon,
  label,
  collapsed,
  className,
  active = false
}: {
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  collapsed: boolean;
  className?: string;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center py-2.5 px-3 rounded-lg hover:opacity-100 hover:bg-border-subtle/30 transition-all duration-200 overflow-hidden",
        active ? "opacity-100 bg-border-subtle/30" : "opacity-50",
        className
      )}
    >
      <Icon className="w-[18px] h-[18px] shrink-0" />
      <div className={cn(
        "overflow-hidden transition-all duration-300 ease-out",
        collapsed ? "w-0 opacity-0" : "w-28 opacity-100 ml-3"
      )}>
        <span className="text-xs whitespace-nowrap block">{label}</span>
      </div>
    </button>
  );
}

// Theme toggle dropdown
function ThemeToggle({ collapsed }: { collapsed: boolean }) {
  const { theme, setTheme } = useTheme();
  const { language } = useStore();
  const [showDropdown, setShowDropdown] = useState(false);

  const themeOptions = [
    { value: 'light' as const, icon: Sun, labelEn: 'Light', labelZh: '浅色' },
    { value: 'dark' as const, icon: Moon, labelEn: 'Dark', labelZh: '深色' },
    { value: 'system' as const, icon: Monitor, labelEn: 'System', labelZh: '跟随系统' },
  ];

  const currentTheme = themeOptions.find(t => t.value === theme) || themeOptions[0];

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center py-2.5 px-3 rounded-lg opacity-50 hover:opacity-100 hover:bg-border-subtle/30 transition-all duration-200 overflow-hidden w-full"
      >
        <currentTheme.icon className="w-[18px] h-[18px] shrink-0" />
        <div className={cn(
          "overflow-hidden transition-all duration-300 ease-out",
          collapsed ? "w-0 opacity-0" : "w-28 opacity-100 ml-3"
        )}>
          <span className="text-xs whitespace-nowrap block">
            {language === 'zh' ? currentTheme.labelZh : currentTheme.labelEn}
          </span>
        </div>
      </button>

      {showDropdown && !collapsed && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute bottom-full left-0 mb-2 w-full bg-bg-primary border border-border-subtle rounded-lg shadow-xl overflow-hidden z-[100]"
        >
          {themeOptions.map(option => (
            <button
              key={option.value}
              onClick={() => {
                setTheme(option.value);
                setShowDropdown(false);
              }}
              className={cn(
                "flex items-center gap-3 w-full px-3 py-2 text-xs hover:bg-bg-secondary transition-colors",
                theme === option.value && "bg-bg-secondary"
              )}
            >
              <option.icon className="w-4 h-4" />
              {language === 'zh' ? option.labelZh : option.labelEn}
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
}

export function Navbar() {
  const location = useLocation();
  const { t, language } = useTranslation();
  const { setLanguage, sidebarCollapsed, toggleSidebar } = useStore();

  const navItems = [
    { path: '/dashboard', label: t('dashboard'), icon: Grid },
    { path: '/timeline', label: t('timeline'), icon: Clock },
    { path: '/graph', label: t('graph'), icon: Network },
    { path: '/writing', label: t('writing'), icon: PenTool },
    { path: '/review', label: t('review'), icon: BookOpen },
  ];

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'zh' : 'en');
  };

  return (
    <motion.nav
      initial={false}
      animate={{ width: sidebarCollapsed ? 64 : 220 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="fixed top-0 left-0 h-full flex flex-col justify-between py-6 px-3 z-40 bg-bg-primary/90 backdrop-blur-md border-r border-border-subtle text-text-primary"
    >
      <div>
        {/* Logo */}
        <Link to="/" className="flex items-center px-3 mb-8 hover:opacity-70 transition-opacity">
          <svg width="26" height="26" viewBox="0 0 32 32" fill="none" className="shrink-0">
            <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2" />
            <circle cx="12" cy="13" r="3" fill="currentColor" />
            <circle cx="20" cy="13" r="3" fill="currentColor" />
            <circle cx="16" cy="20" r="2.5" fill="currentColor" />
            <line x1="13.5" y1="14.5" x2="15" y2="18" stroke="currentColor" strokeWidth="1.5" />
            <line x1="18.5" y1="14.5" x2="17" y2="18" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <div className={cn(
            "overflow-hidden transition-all duration-300 ease-out",
            sidebarCollapsed ? "w-0 opacity-0" : "w-24 opacity-100 ml-3"
          )}>
            <span className="font-serif text-lg tracking-tight whitespace-nowrap">Neuron</span>
          </div>
        </Link>

        {/* Nav items */}
        <div className="flex flex-col gap-1 text-sm font-medium tracking-wide uppercase">
          {navItems.map((item) => (
            <NavItem
              key={item.path}
              to={item.path}
              icon={item.icon}
              label={item.label}
              isActive={location.pathname.startsWith(item.path)}
              collapsed={sidebarCollapsed}
            />
          ))}
        </div>

        {/* Divider */}
        <div className="my-4 mx-3 border-t border-border-subtle" />

        {/* AI Agent Entry */}
        <NavItem
          to="/agent"
          icon={Bot}
          label={language === 'zh' ? 'AI 助手' : 'AI Agent'}
          isActive={location.pathname === '/agent'}
          collapsed={sidebarCollapsed}
          highlight
        />
      </div>

      <div className="flex flex-col gap-1 text-sm font-medium tracking-wide uppercase">
        {/* Theme Toggle */}
        <ThemeToggle collapsed={sidebarCollapsed} />

        {/* Collapse button */}
        <ActionButton
          onClick={toggleSidebar}
          icon={sidebarCollapsed ? ChevronsRight : ChevronsLeft}
          label={sidebarCollapsed ? t('expandTags') : t('collapseTags')}
          collapsed={sidebarCollapsed}
          className="opacity-40"
        />

        <ActionButton
          onClick={toggleLanguage}
          icon={Globe}
          label={language === 'en' ? '中文' : 'English'}
          collapsed={sidebarCollapsed}
        />
      </div>
    </motion.nav>
  );
}
