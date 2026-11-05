import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../utils/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('chalchitra_lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('chalchitra_lang', language);
  }, [language]);

  const changeLanguage = (langCode) => {
    if (translations[langCode]) {
      setLanguage(langCode);
    }
  };

  const t = (key) => {
    const dict = translations[language] || translations.en;
    return dict[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
