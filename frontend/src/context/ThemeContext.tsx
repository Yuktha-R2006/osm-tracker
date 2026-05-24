import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({} as ThemeContextType);

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, updateSettings } = useAuth();
  
  // Initialize from localStorage or default to dark
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    return savedTheme || 'dark';
  });

  // Sync theme state with user preference or localStorage
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        setTheme('dark');
      } else if (user.darkMode !== undefined) {
        setTheme(user.darkMode ? 'dark' : 'light');
      }
    } else {
      const savedTheme = localStorage.getItem('theme') as Theme;
      if (savedTheme) {
        setTheme(savedTheme);
      }
    }
  }, [user]);

  // Apply theme class to document element
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = async () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);

    if (user && user.role !== 'admin') {
      try {
        await updateSettings({ darkMode: nextTheme === 'dark' });
      } catch (error) {
        console.error('Failed to update dark mode setting', error);
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
