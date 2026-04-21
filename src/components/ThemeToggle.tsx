'use client';

import { useTheme } from '@/lib/context/ThemeContext';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent rendering until mounted on client
  if (!mounted) {
    return <div className="p-2 w-9 h-9 rounded-lg" />;
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg transition-colors duration-200 hover:bg-neutral-200 dark:hover:bg-neutral-800"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5 text-neutral-600" />
      ) : (
        <Sun className="w-5 h-5 text-neutral-300" />
      )}
    </button>
  );
}
