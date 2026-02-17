import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAward, FiShield, FiPhone, FiMapPin, FiChevronLeft, FiChevronRight, FiMessageCircle } from 'react-icons/fi';
import { AboutSEO } from '@/components/SEO/SEOHead';
import { OrganizationSchema, BreadcrumbSchema } from '@/components/SEO/StructuredData';
import { useLanguage } from '@/contexts/LanguageContext';

const AboutPage: React.FC = () => {
  const { t } = useLanguage();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Hero images - you can add more images to this array
  const heroImages = [
    '/assets/about-hero/hero1.jpg',
    '/assets/about-hero/hero2.jpg', 
    '/assets/about-hero/hero4.jpg',
    '/assets/about-hero/hero5.jpg',
  ].filter(Boolean); // Remove any undefined/null entries

  // Fallback to placeholder if no images are available
  const displayImages = heroImages.length > 0 ? heroImages : ['/assets/about-hero/placeholder.svg'];

  // Get the correct image path for WordPress deployment - with fallback
  const getImagePath = (imagePath: string) => {
    // Force WordPress theme path if we detect we're on strani.mk
    if (typeof window !== 'undefined' && window.location.hostname.includes('strani.mk')) {
      return 'https://fitbody.mk/wp-content/themes/fitbody-ecommerce' + imagePath;
    }
    
    if (typeof window !== 'undefined') {
      const themeUrl = (window as any).THEME_URL;
      if (themeUrl) {
        return themeUrl + imagePath;
      }
    }
    
    // Default fallback for development
    return imagePath;
  };

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlaying && displayImages.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentImageIndex((prevIndex) => 
          prevIndex === displayImages.length - 1 ? 0 : prevIndex + 1
        );
      }, 5000); // Change image every 5 seconds
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAutoPlaying, displayImages.length]);

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === displayImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? displayImages.length - 1 : prevIndex - 1
    );
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };
  
  const breadcrumbs = [
    { name: t('navigation.home'), url: '/' },
    { name: t('pages.about.title'), url: '/about' }
  ];
  
  return (
    <>
      {/* SEO */}
      <AboutSEO />
      <OrganizationSchema />
      <BreadcrumbSchema breadcrumbs={breadcrumbs} />

      <div className="min-h-screen bg-black">
        {/* Hero Section with Image Carousel */}
        <section className="relative py-20 sm:py-32 overflow-hidden">
          {/* Background Images Carousel */}
          <div className="absolute inset-0">
            {/* Fallback background */}
            <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-gray-900 via-black to-gray-800" />
            
            {/* Image Carousel */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentImageIndex}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 1, ease: "easeInOut" }}
                className="absolute inset-0 w-full h-full"
              >
                <Image
                  src={getImagePath(displayImages[currentImageIndex])}
                  alt={`Hero image ${currentImageIndex + 1}`}
                  fill
                  className="object-cover"
                  priority={currentImageIndex === 0}
                  onError={() => {
                    // Fallback to gradient background if image fails to load
                    console.warn(`Failed to load hero image: ${displayImages[currentImageIndex]}`);
                  }}
                />
              </motion.div>
            </AnimatePresence>
            
            {/* Dark overlay above images */}
            <div className="absolute inset-0 bg-black" style={{opacity: '60%'}}></div>
          </div>

          {/* Navigation Controls */}
          {displayImages.length > 1 && (
            <>
              {/* Previous/Next Buttons */}
              <button
                onClick={prevImage}
                onMouseEnter={() => setIsAutoPlaying(false)}
                onMouseLeave={() => setIsAutoPlaying(true)}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-300 backdrop-blur-sm"
              >
                <FiChevronLeft size={24} />
              </button>
              
              <button
                onClick={nextImage}
                onMouseEnter={() => setIsAutoPlaying(false)}
                onMouseLeave={() => setIsAutoPlaying(true)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-300 backdrop-blur-sm"
              >
                <FiChevronRight size={24} />
              </button>

              {/* Dots Indicator */}
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
                {displayImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToImage(index)}
                    onMouseEnter={() => setIsAutoPlaying(false)}
                    onMouseLeave={() => setIsAutoPlaying(true)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentImageIndex 
                        ? 'bg-orange-500 scale-125' 
                        : 'bg-white/50 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
                {t('pages.about.title').split(' ')[0]} <span className="text-orange-500">{t('pages.about.title').split(' ')[1]}</span>
              </h1>
              <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto">
                {t('pages.about.subtitle')}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Company Story */}
        <section className="py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-6"
              >
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-8">
                  {t('pages.about.ourStory')}
                </h2>
                <div className="space-y-4 text-gray-300 text-lg leading-relaxed">
                  <p>
                    <strong className="text-white">ОСОГОВКА ДООЕЛ</strong> {t('pages.about.companyStory')}
                  </p>
                  <p>
                    {t('pages.about.distributionHistory')}
                  </p>
                  <p>
                    {t('pages.about.focusShift')}
                  </p>
                  <p>
                    {t('pages.about.commitment')}
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="bg-gradient-to-br from-orange-500/20 to-purple-500/20 rounded-2xl p-8 backdrop-blur-sm border border-gray-800">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-brandGold mb-2">1991</div>
                      <div className="text-gray-300">{t('pages.about.foundingYear')}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-brandGold mb-2">2000м²</div>
                      <div className="text-gray-300">{t('pages.about.warehouseSpace')}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-brandGold mb-2">3000+</div>
                      <div className="text-gray-300">{t('pages.about.articles')}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-brandGold mb-2">20+</div>
                      <div className="text-gray-300">{t('pages.about.yearsProducts')}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Fit Body Section */}
        <section className="py-16 sm:py-20 bg-gray-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                {t('pages.about.fitBodyBrand')}
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-6"
              >
                <div className="space-y-4 text-gray-300 text-lg leading-relaxed">
                  <p>
                    {t('pages.about.fitBodyDescription')}
                  </p>
                  <p>
                    {t('pages.about.fitBodySubdivision')}
                  </p>
                  <p>
                    {t('pages.about.realRecipes')}
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-green-500/20 to-orange-500/20 rounded-2xl p-8 backdrop-blur-sm border border-gray-800"
              >
                <h3 className="text-2xl font-bold text-white mb-6">Gold Touch Nutrition</h3>
                <p className="text-gray-300 mb-6">
                  <strong className="text-white">GRASS FED COWS</strong> - {t('pages.about.goldTouchDescription')}
                </p>
                <div className="flex items-center space-x-2">
                  <FiShield className="text-green-400" size={20} />
                  <span className="text-green-400 font-semibold">{t('pages.about.organicCertified')}</span>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Quality Guarantee */}
        <section className="py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                {t('pages.about.qualityGuarantee')}
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                {t('pages.about.qualityDescription')}
              </p>
            </motion.div>

            <div className="text-center mb-12">
              <p className="text-lg text-gray-300 max-w-4xl mx-auto leading-relaxed">
                {t('pages.about.certificatesDescription')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { name: 'ISO 22000', desc: t('pages.about.foodSafety') },
                { name: 'GMP', desc: t('pages.about.goodPractices') },
                { name: 'HACCP', desc: t('pages.about.hazardAnalysis') },
                { name: 'EFSA', desc: t('pages.about.europeanAuthority') }
              ].map((cert, index) => (
                <motion.div
                  key={cert.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-900 rounded-lg p-6 text-center border border-gray-800 hover:border-orange-500/50 transition-colors"
                >
                  <FiAward className="text-brandGold mx-auto mb-4" size={40} />
                  <h3 className="text-xl font-bold text-white mb-2">{cert.name}</h3>
                  <p className="text-gray-400">{cert.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Certifications */}
        <section className="py-16 sm:py-20 bg-gray-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                {t('pages.about.certificates')}
              </h2>
            </motion.div>

            <div className="flex justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="bg-gray-900 rounded-lg p-6 border border-gray-800 max-w-4xl"
              >
                <div className="relative rounded-lg overflow-hidden">
                  <Image 
                    src={getImagePath('/assets/certificates.png')} 
                    alt="Certificates" 
                    width={800} 
                    height={600} 
                    className="w-full h-auto object-cover"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                {t('pages.about.ourTeam')}
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
              {/* Зоран */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-gray-900 rounded-2xl p-8 border border-gray-800 max-w-md w-full"
              >
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden">
                    <Image 
                      src={getImagePath('/assets/about/zoran_v.jpeg')} 
                      alt="Зоран Василов" 
                      width={128} 
                      height={128} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Зоран Василов</h3>
                  <p className="text-brandGold font-semibold mb-4">Fitness & Nutrition</p>
                  <p className="text-gray-300 leading-relaxed mb-4">
                    {t('pages.about.zoranQuote')}
                  </p>
                  <div className="flex justify-center">
                    <a 
                      href="https://www.instagram.com/goldtouchnutrition.mk/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 text-brandGold hover:text-orange-300 transition-colors"
                    >
                      <div className="w-5 h-5">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                      </div>
                      <span>@goldtouchnutrition.mk</span>
                    </a>
                  </div>
                </div>
              </motion.div>

              {/* Наце */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="bg-gray-900 rounded-2xl p-8 border border-gray-800 max-w-md w-full"
              >
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden">
                    <Image 
                      src={getImagePath('/assets/about/nace.jpg')} 
                      alt="Наце" 
                      width={128} 
                      height={128} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Наце</h3>
                  <p className="text-brandGold font-semibold mb-2">{t('pages.about.naceTitle')}</p>
                  <div className="text-sm text-gray-300 mb-4 text-center">
                    <p className="mb-1">{t('pages.about.naceAchievements').split('\n')[0]}</p>
                    <p className="mb-1">{t('pages.about.naceAchievements').split('\n')[1]}</p>
                    <p>{t('pages.about.naceAchievements').split('\n')[2]}</p>
                    <p>{t('pages.about.naceAchievements').split('\n')[3]}</p>
                  </div>
                  <div className="flex justify-center">
                    <a 
                      href="https://www.instagram.com/minilevnace?igsh=Y3B3ZWRod2toMGUz" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 text-brandGold hover:text-orange-300 transition-colors"
                    >
                      <div className="w-5 h-5">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                      </div>
                      <span>@minilevnace</span>
                    </a>
                  </div>
                </div>
              </motion.div>

              {/* Моња */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="bg-gray-900 rounded-2xl p-8 border border-gray-800 max-w-md w-full"
              >
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden">
                    <Image 
                      src={getImagePath('/assets/about/monja.webp')} 
                      alt="Моња" 
                      width={128} 
                      height={128} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Моња</h3>
                  <p className="text-brandGold font-semibold mb-2">{t('pages.about.monjaTitle')}</p>
                  <div className="text-sm text-gray-300 mb-4 text-center">
                    <p>{t('pages.about.monjaAchievements')}</p>
                  </div>
                  <div className="flex justify-center">
                    <a 
                      href="https://www.instagram.com/monja_mm?igsh=MXNwZDBibXhsYjZmMA==" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 text-brandGold hover:text-orange-300 transition-colors"
                    >
                      <div className="w-5 h-5">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                      </div>
                      <span>@monja_mm</span>
                    </a>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 sm:py-20 bg-gray-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                {t('pages.about.contact')}
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-gray-900 rounded-lg p-6 text-center border border-gray-800"
              >
                <FiPhone className="text-brandGold mx-auto mb-4" size={32} />
                <h3 className="text-xl font-bold text-white mb-2">{t('pages.about.phoneWhatsapp')}</h3>
                <a href="tel:075555511" className="text-brandGold hover:text-orange-300 transition-colors text-lg">
                  075 55 55 11
                </a>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.05 }}
                className="bg-gray-900 rounded-lg p-6 text-center border border-gray-800"
              >
                <FiMessageCircle className="text-brandGold mx-auto mb-4" size={32} />
                <h3 className="text-xl font-bold text-white mb-2">{t('pages.about.viberTelegram')}</h3>
                <a href="tel:070213533" className="text-brandGold hover:text-orange-300 transition-colors text-lg">
                  070 213 533
                </a>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 }}
                className="bg-gray-900 rounded-lg p-6 text-center border border-gray-800"
              >
                <FiMapPin className="text-brandGold mx-auto mb-4" size={32} />
                <h3 className="text-xl font-bold text-white mb-2">{t('pages.about.locationInfo')}</h3>
                <p className="text-gray-300">
                  Кочани, Македонија<br />
                  {t('pages.about.warehouse')}: 2000м²
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.25 }}
                className="bg-gray-900 rounded-lg p-6 text-center border border-gray-800"
              >
                <div className="text-brandGold mx-auto mb-4 flex justify-center">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{t('pages.about.facebook')}</h3>
                <a 
                  href="https://www.facebook.com/fitbody.mk" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-brandGold hover:text-orange-300 transition-colors"
                >
                  @fitbody.mk
                </a>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.35 }}
                className="bg-gray-900 rounded-lg p-6 text-center border border-gray-800"
              >
                <div className="text-brandGold mx-auto mb-4 flex justify-center">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{t('pages.about.instagram')}</h3>
                <a 
                  href="https://www.instagram.com/fitbody.mk?igsh=MW50aDlwbHkxczc0Ng==" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-brandGold hover:text-orange-300 transition-colors"
                >
                  @fitbody.mk
                </a>
              </motion.div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default AboutPage;