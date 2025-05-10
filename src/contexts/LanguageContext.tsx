import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Language, translate as i18nTranslate, TranslationKey, getAvailableLanguages } from '../i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  translate: <T extends TranslationKey>(key: T, nestedKey: any) => string;
  availableLanguages: { code: Language; name: string }[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// LocalStorage key
const LANGUAGE_STORAGE_KEY = 'expense-tracker-language';

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Daha önce kaydedilmiş dil varsa kullan, yoksa varsayılan olarak 'en'
  const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language;
  const [language, setLanguage] = useState<Language>(savedLanguage || 'en');
  
  // Kullanılabilir dilleri al
  const availableLanguages = getAvailableLanguages();
  
  // Dil ayarı değiştiğinde localStorage'a kaydet
  useEffect(() => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  }, [language]);
  
  // Çeviri fonksiyonu
  const translate = <T extends TranslationKey>(key: T, nestedKey: any): string => {
    return i18nTranslate(language, key, nestedKey);
  };
  
  const value = {
    language,
    setLanguage,
    translate,
    availableLanguages,
  };
  
  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// Kullanım kolaylığı için hook
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Kısaltma: t fonksiyonu
export const useTranslation = () => {
  const { translate } = useLanguage();
  return { t: translate };
};

export default LanguageProvider; 