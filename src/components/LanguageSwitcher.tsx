import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown } from 'react-icons/fi';
import { useLanguage, Language } from '@/contexts/LanguageContext';

interface LanguageSwitcherProps {
  className?: string;
  variant?: 'header' | 'footer' | 'mobile';
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ 
  className = '', 
  variant = 'header' 
}) => {
  const { currentLanguage, setLanguage, languages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle mounting state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Get the correct image path for WordPress deployment - with fallback
  const getImagePath = (imagePath: string) => {
    // Only run on client side
    if (!mounted || typeof window === 'undefined') {
      // For WordPress deployment, use theme path even during SSR
      if (process.env.NODE_ENV === 'production') {
        return 'https://fitbody.mk/wp-content/themes/fitbody-ecommerce' + imagePath;
      }
      return imagePath; // Fallback for development SSR
    }
    
    // Force WordPress theme path if we detect we're on strani.mk
    if (window.location.hostname.includes('strani.mk')) {
      return 'https://fitbody.mk/wp-content/themes/fitbody-ecommerce' + imagePath;
    }
    
    const themeUrl = (window as any).THEME_URL;
    if (themeUrl) {
      return themeUrl + imagePath;
    }
    
    // Default fallback for development
    return imagePath;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (language: Language) => {
    setLanguage(language);
    setIsOpen(false);
  };

  const currentLang = languages[currentLanguage];

  // Different styles for different variants
  const getVariantStyles = () => {
    switch (variant) {
      case 'footer':
        return {
          button: 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-600',
          dropdown: 'bg-gray-800 border-gray-600',
          item: 'hover:bg-gray-700 text-white'
        };
      case 'mobile':
        return {
          button: 'bg-gray-900 hover:bg-gray-800 text-white border border-gray-700',
          dropdown: 'bg-gray-900 border-gray-700',
          item: 'hover:bg-gray-800 text-white'
        };
      default: // header
        return {
          button: 'bg-gray-900/80 hover:bg-gray-800/80 text-white border border-gray-700/50 backdrop-blur-sm',
          dropdown: 'bg-gray-900/95 border-gray-700/50 backdrop-blur-md',
          item: 'hover:bg-gray-800/80 text-white'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Current Language Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center space-x-2 px-2 sm:px-3 py-2 rounded-lg transition-all duration-200 min-w-[44px] min-h-[44px] justify-center sm:justify-start
          ${styles.button}
          ${isOpen ? 'ring-2 ring-orange-500/50' : ''}
        `}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="w-6 h-4 relative flex-shrink-0 rounded-sm overflow-hidden bg-gray-700 flex items-center justify-center border border-gray-600">
          <Image
            src={getImagePath(currentLang.flag)}
            alt={`${currentLang.name} flag`}
            fill
            className="object-cover"
            sizes="24px"
            onError={(e) => {
              // Hide the image and show fallback text
              e.currentTarget.style.display = 'none';
              const parent = e.currentTarget.parentElement;
              if (parent && !parent.querySelector('.flag-fallback')) {
                const fallback = document.createElement('span');
                fallback.className = 'flag-fallback text-xs font-bold text-white';
                fallback.textContent = currentLang.code.toUpperCase();
                parent.appendChild(fallback);
              }
            }}
          />
        </div>
        <span className="text-sm font-medium">
          {variant === 'mobile' ? currentLang.nativeName : (
            <>
              <span className="hidden sm:inline">{currentLang.code.toUpperCase()}</span>
            </>
          )}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <FiChevronDown size={14} />
        </motion.div>
      </motion.button>

      {/* Language Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`
              absolute top-full mt-2 right-0 min-w-[160px] rounded-lg border shadow-xl z-50
              ${styles.dropdown}
              ${variant === 'footer' ? 'bottom-full top-auto mb-2' : ''}
            `}
          >
            <div className="py-2">
              {Object.values(languages).map((lang) => (
                <motion.button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`
                    w-full flex items-center space-x-3 px-4 py-2 text-left transition-colors
                    ${styles.item}
                    ${currentLanguage === lang.code ? 'bg-orange-500/20 text-brandGold' : ''}
                  `}
                  whileHover={{ x: 4 }}
                  disabled={currentLanguage === lang.code}
                >
                  <div className="w-6 h-4 relative flex-shrink-0 rounded-sm overflow-hidden bg-gray-700 flex items-center justify-center border border-gray-600">
                    <Image
                      src={getImagePath(lang.flag)}
                      alt={`${lang.name} flag`}
                      fill
                      className="object-cover"
                      sizes="24px"
                      onError={(e) => {
                        // Hide the image and show fallback text
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent && !parent.querySelector('.flag-fallback')) {
                          const fallback = document.createElement('span');
                          fallback.className = 'flag-fallback text-xs font-bold text-white';
                          fallback.textContent = lang.code.toUpperCase();
                          parent.appendChild(fallback);
                        }
                      }}
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{lang.nativeName}</span>
                    <span className="text-xs opacity-70">{lang.name}</span>
                  </div>
                  {currentLanguage === lang.code && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-auto w-2 h-2 bg-orange-500 rounded-full"
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSwitcher;