'use client';

import { useTheme } from './ThemeProvider';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="rounded-full w-9 h-9 flex items-center justify-center transition-colors"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <Moon className="h-5 w-5 text-gray-700 hover:text-gray-900 transition-colors" />
      ) : (
        <Sun className="h-5 w-5 text-yellow-200 hover:text-yellow-300 transition-colors" />
      )}
    </Button>
  );
}