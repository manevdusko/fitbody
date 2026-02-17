import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { FiArrowRight } from 'react-icons/fi';
import { useLanguage } from '@/contexts/LanguageContext';

const HeroSection = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { t } = useLanguage();

  // Get the correct video path for WordPress deployment - with fallback
  const getVideoPath = () => {
    // Force WordPress theme path if we detect we're on strani.mk
    if (typeof window !== 'undefined' && window.location.hostname.includes('strani.mk')) {
      return 'https://fitbody.mk/wp-content/themes/fitbody-ecommerce/images/hero.mp4';
    }
    
    if (typeof window !== 'undefined') {
      const themeUrl = (window as any).THEME_URL;
      if (themeUrl) {
        return themeUrl + '/images/hero.mp4';
      }
    }
    
    // Default fallback for development
    return '/images/hero.mp4';
  };

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.onloadeddata = () => {
        // Video loaded successfully
      };
      video.oncanplay = () => {
        // Video can play
      };
      video.onerror = (e) => {
        // Video error occurred
      };
    }
  }, []);

  return (
    <section 
      className="relative flex items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8" 
      style={{ height: '45vh', minHeight: '400px' }}
    >
      {/* Background */}
      <div className="absolute inset-0 w-full h-full z-0">
        {/* Fallback background */}
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-gray-900 via-black to-gray-800" />
        
        {/* Video */}
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-10"
          style={{ display: 'block' }}
        >
          <source src={getVideoPath()} type="video/mp4" />
        </video>
        
        {/* Dark overlay above video */}
        <div 
          className="absolute inset-0 w-full h-full z-20" 
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
        />
      </div>

      {/* Content */}
      <div className="relative z-30 text-center text-white w-full max-w-4xl mx-auto">
        <h1 
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 sm:mb-4 leading-tight px-2" 
          style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.9)' }}
          dangerouslySetInnerHTML={{ 
            __html: t('hero.title').replace('ПОТЕНЦИЈАЛ', '<span class="text-brandGold">ПОТЕНЦИЈАЛ</span>').replace('POTENTIAL', '<span class="text-brandGold">POTENTIAL</span>').replace('POTENCIAL', '<span class="text-brandGold">POTENCIAL</span>').replace('POTENCIALIN', '<span class="text-brandGold">POTENCIALIN</span>')
          }}
        />
        
        <p 
          className="text-sm sm:text-base md:text-lg lg:text-xl mb-4 sm:mb-6 max-w-2xl mx-auto leading-relaxed px-2" 
          style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.9)' }}
        >
          {t('hero.subtitle')}
        </p>

        <div className="mb-6 sm:mb-8">
          <Link href="/products">
            <button 
              className="text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-semibold flex items-center mx-auto transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg sm:w-auto max-w-xs sm:max-w-none"
              style={{ 
                backgroundColor: '#D4962E',
                border: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#dd6b20';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#D4962E';
              }}
            >
              <span>{t('hero.cta')}</span>
              <FiArrowRight size={18} className="sm:w-5 sm:h-5" />
            </button>
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-6 max-w-lg sm:max-w-2xl mx-auto px-2">
          <div className="text-center">
            <div className="text-lg sm:text-2xl md:text-3xl font-bold text-brandGold mb-1 sm:mb-2">30+</div>
            <div className="text-gray-300 text-xs sm:text-sm">{t('hero.stats.years')}</div>
          </div>
          <div className="text-center">
            <div className="text-lg sm:text-2xl md:text-3xl font-bold text-brandGold mb-1 sm:mb-2">10K+</div>
            <div className="text-gray-300 text-xs sm:text-sm">{t('hero.stats.customers')}</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;