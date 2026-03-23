import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { TopBar } from './TopBar';
import { CustomCursor } from './CustomCursor';
import { AgentChat } from './AgentChat';
import { SplitView } from './SplitView';
import { useStore } from '../store/useStore';
import { useTheme } from '../hooks/useTheme';
import { Toaster } from 'react-hot-toast';

export function Layout() {
  const location = useLocation();
  const { user, sidebarCollapsed, isAgentOpen, isAgentSidebar, isAgentSidebarCollapsed, agentSidebarWidth, splitViewOpen, splitViewWidth } = useStore();

  // Initialize theme
  useTheme();

  if (!user && location.pathname !== '/login') {
    return <Navigate to="/login" replace />;
  }

  const leftWidth = user ? (sidebarCollapsed ? 64 : 220) : 0;
  const rightWidth = user && isAgentOpen && isAgentSidebar && !isAgentSidebarCollapsed ? agentSidebarWidth : 0;
  const splitWidth = user && splitViewOpen ? splitViewWidth : 0;

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary selection:bg-text-primary selection:text-bg-primary md:cursor-none">
      <CustomCursor />
      {user && <Navbar />}
      {user && <TopBar />}
      <main
        key={location.pathname}
        className="min-h-screen pt-14 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{
          marginLeft: `${leftWidth}px`,
          width: `calc(100% - ${leftWidth + rightWidth + splitWidth}px)`
        }}
      >        <Outlet />
      </main>
      <AgentChat />
      <SplitView />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'var(--theme-text-primary)',
            color: 'var(--theme-bg-primary)',
            borderRadius: '8px',
            border: '1px solid var(--theme-border-subtle)',
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
          },
        }}
      />
    </div>
  );
}
