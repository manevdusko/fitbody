import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'mk' | 'en' | 'es' | 'sq';

export interface LanguageConfig {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
  dir: 'ltr' | 'rtl';
}

export const LANGUAGES: Record<Language, LanguageConfig> = {
  mk: {
    code: 'mk',
    name: 'Macedonian',
    nativeName: 'Македонски',
    flag: '/assets/flags/mk.png',
    dir: 'ltr'
  },
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '/assets/flags/en.jpg',
    dir: 'ltr'
  },
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '/assets/flags/es.png',
    dir: 'ltr'
  },
  sq: {
    code: 'sq',
    name: 'Albanian',
    nativeName: 'Shqip',
    flag: '/assets/flags/al.webp',
    dir: 'ltr'
  }
};

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  languages: Record<Language, LanguageConfig>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('mk');
  const [translations, setTranslations] = useState<Record<string, any>>({});

  // Load translations
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        const translationModule = await import(`../translations/${currentLanguage}.json`);
        setTranslations(translationModule.default);
      } catch (error) {
        console.warn(`Failed to load translations for ${currentLanguage}:`, error);
        // Fallback to Macedonian if translation fails
        if (currentLanguage !== 'mk') {
          try {
            const fallbackModule = await import('../translations/mk.json');
            setTranslations(fallbackModule.default);
          } catch (fallbackError) {
            console.error('Failed to load fallback translations:', fallbackError);
          }
        }
      }
    };

    loadTranslations();
  }, [currentLanguage]);

  // Load saved language from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('fitbody-language') as Language;
    if (savedLanguage && LANGUAGES[savedLanguage]) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  // Save language to localStorage
  const setLanguage = (language: Language) => {
    setCurrentLanguage(language);
    localStorage.setItem('fitbody-language', language);
    
    // Update document language and direction
    document.documentElement.lang = language;
    document.documentElement.dir = LANGUAGES[language].dir;
  };

  // Translation function with parameter substitution
  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key} for language: ${currentLanguage}`);
        return key; // Return key if translation not found
      }
    }
    
    let result = typeof value === 'string' ? value : key;
    
    // Replace parameters
    if (params) {
      Object.entries(params).forEach(([param, val]) => {
        result = result.replace(new RegExp(`{{${param}}}`, 'g'), String(val));
      });
    }
    
    return result;
  };

  const value: LanguageContextType = {
    currentLanguage,
    setLanguage,
    t,
    languages: LANGUAGES
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};