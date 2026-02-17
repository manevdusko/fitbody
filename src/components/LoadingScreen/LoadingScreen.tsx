import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

interface LoadingScreenProps {
  progress?: number;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ progress = 0 }) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [opacity, setOpacity] = useState(1);
  const [mounted, setMounted] = useState(false);
  const { t } = useLanguage();

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

  useEffect(() => {
    let animationFrameId: number;
    const startTime = Date.now();
    const duration = 800;

    const animate = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      const animProgress = Math.min(elapsed / duration, 1);

      const smoothEase =
        animProgress < 0.4
          ? animProgress * 2.5
          : 1 + (animProgress - 0.4) * 0.83;

      setZoomLevel(1 + smoothEase * 0.8);

      if (animProgress > 0.75) {
        setOpacity(1 - (animProgress - 0.75) * 4);
      }

      if (animProgress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black"
      style={{
        opacity: opacity,
        transition: 'opacity 0.15s ease-out',
        zIndex: 9999,
      }}
      aria-hidden="true"
    >
      <div
        style={{
          width: '80%',
          maxWidth: '450px',
          transform: `scale(${zoomLevel})`,
          transition: 'transform 0.01s linear',
        }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center"
        >
          {/* Logo Image */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex justify-center mb-4"
            >
              <Image
                src={getImagePath("/assets/logo.png")}
                alt="FitBody.mk"
                width={200}
                height={80}
                className="h-16 w-auto object-contain"
                priority
              />
            </motion.div>
          </div>

          {/* Progress bar with percentage */}
          <div className="w-64 mb-4">
            <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-orange-500 to-orange-600"
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            </div>
            {progress > 0 && (
              <motion.p
                className="text-center text-gray-500 text-sm mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {Math.round(progress)}%
              </motion.p>
            )}
          </div>

          {/* Animated dots */}
          <div className="flex space-x-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-orange-500 rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>

          {/* Loading text */}
          <motion.p
            className="text-gray-500 text-sm mt-6 tracking-wide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {t('loading.tagline')}
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoadingScreen;
