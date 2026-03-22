import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { TopBar } from './TopBar';
import { CustomCursor } from './CustomCursor';
import { AgentChat } from './AgentChat';
import { useStore } from '../store/useStore';
import { useTheme } from '../hooks/useTheme';
import { Toaster } from 'react-hot-toast';

export function Layout() {
  const location = useLocation();
  const { user, sidebarCollapsed } = useStore();

  // Initialize theme
  useTheme();

  if (!user && location.pathname !== '/login') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary selection:bg-text-primary selection:text-bg-primary md:cursor-none">
      <CustomCursor />
      {user && <Navbar />}
      {user && <TopBar />}
      <main
        key={location.pathname}
        className="min-h-screen pt-14 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{
          marginLeft: user ? (sidebarCollapsed ? '64px' : '220px') : '0',
          width: user ? (sidebarCollapsed ? 'calc(100% - 64px)' : 'calc(100% - 220px)') : '100%'
        }}
      >
        <Outlet />
      </main>
      <AgentChat />
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
