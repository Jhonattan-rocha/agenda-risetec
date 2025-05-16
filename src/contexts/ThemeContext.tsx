// src/contexts/ThemeContext.tsx
import React, { createContext, useState, useContext, type ReactNode, useEffect } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { lightTheme, darkTheme, type Theme } from '../styles/theme';
import { GlobalStyles } from '../styles/globalStyles';

interface ThemeContextType {
  currentTheme: Theme;
  themeName: 'light' | 'dark';
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeName, setThemeName] = useState<'light' | 'dark'>(() => {
    // Tenta carregar o tema do localStorage ou define como 'light' por padrão
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark' ? 'dark' : 'light';
  });

  const currentTheme = themeName === 'light' ? lightTheme : darkTheme;

  useEffect(() => {
    // Salva o tema no localStorage sempre que ele muda
    localStorage.setItem('theme', themeName);
  }, [themeName]);

  const toggleTheme = () => {
    setThemeName(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, themeName, toggleTheme }}>
      <StyledThemeProvider theme={currentTheme}>
        <GlobalStyles /> {/* GlobalStyles precisa estar dentro do ThemeProvider */}
        {children}
      </StyledThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};