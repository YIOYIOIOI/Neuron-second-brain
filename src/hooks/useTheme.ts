import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { ThemeMode } from '../types';

export function useTheme() {
  const { theme, setTheme } = useStore();

  useEffect(() => {
    const applyTheme = (mode: ThemeMode) => {
      let effectiveTheme: 'light' | 'dark' = 'light';

      if (mode === 'system') {
        effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      } else {
        effectiveTheme = mode;
      }

      document.documentElement.setAttribute('data-theme', effectiveTheme);
    };

    applyTheme(theme);

    // Listen for system theme changes
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => applyTheme('system');
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, [theme]);

  return { theme, setTheme };
}
