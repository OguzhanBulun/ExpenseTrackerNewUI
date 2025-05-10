import React, { ReactNode } from 'react';
import ThemeProvider from './ThemeContext';
import LanguageProvider from './LanguageContext';

interface AppProviderProps {
  children: ReactNode;
}

const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  return (
    <LanguageProvider>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </LanguageProvider>
  );
};

export default AppProvider; 