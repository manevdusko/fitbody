import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FiFacebook, FiInstagram, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';

interface FooterProps {
  showDealerSection?: boolean;
}

const Footer: React.FC<FooterProps> = ({ showDealerSection = false }) => {
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
  const socialLinks = [
    { icon: FiFacebook, href: 'https://www.facebook.com/fitbody.mk', label: 'Facebook' },
    { icon: FiInstagram, href: 'https://www.instagram.com/fitbody.mk?igsh=MW50aDlwbHkxczc0Ng==', label: 'Instagram' },
  ];

  const quickLinks = [
    { label: t('navigation.products'), href: '/products' },
    { label: t('navigation.about'), href: '/about' },
    { label: t('navigation.contact'), href: '/contact' }
  ];

  return (
    <footer className="bg-black border-t border-gray-800">
      {/* Dealer Section - Only show on home page */}
      {showDealerSection && (
        <div className="bg-gradient-to-r from-gray-900 to-black py-16">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row items-center justify-between">
              <div className="text-center lg:text-left mb-8 lg:mb-0">
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-3xl lg:text-4xl font-bold text-white mb-4"
                >
                  {t('footer.becomeDealer')}
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="text-gray-300 text-lg max-w-2xl"
                >
                  {t('footer.dealerDescription')}
                </motion.p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                >
                  <Link href="/dealer/register">
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className="btn-primary px-8 py-4 text-lg font-semibold"
                    >
                      {t('footer.applyNow')}
                    </motion.button>
                  </Link>
                </motion.div>
                
              </div>
            </div>
            
            {/* Dealer Benefits */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12"
            >
              <div className="text-center">
                <div className="bg-orange-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-orange-500 text-2xl font-bold">%</span>
                </div>
                <h3 className="text-white font-semibold mb-2">{t('footer.benefits.specialPrices')}</h3>
                <p className="text-gray-400 text-sm">{t('footer.benefits.specialPricesDesc')}</p>
              </div>
              
              <div className="text-center">
                <div className="bg-orange-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-orange-500 text-2xl font-bold">★</span>
                </div>
                <h3 className="text-white font-semibold mb-2">{t('footer.benefits.exclusiveProducts')}</h3>
                <p className="text-gray-400 text-sm">{t('footer.benefits.exclusiveProductsDesc')}</p>
              </div>
              
              <div className="text-center">
                <div className="bg-orange-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-orange-500 text-2xl font-bold">24/7</span>
                </div>
                <h3 className="text-white font-semibold mb-2">{t('footer.benefits.support')}</h3>
                <p className="text-gray-400 text-sm">{t('footer.benefits.supportDesc')}</p>
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* Main Footer Content */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <Link href="/" className="inline-block">
                <div className="relative h-10 w-auto">
                  <Image
                    src={getImagePath("/assets/logo.png")}
                    alt="FitBody.mk"
                    width={120}
                    height={40}
                    className="h-full w-auto object-contain"
                  />
                </div>
              </Link>
              <p className="text-gray-400 text-sm leading-relaxed">
                {t('footer.description')}
              </p>
              
              {/* Contact Info */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-gray-400 text-sm">
                  <FiPhone size={14} />
                  <span>075 55 55 11</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-400 text-sm">
                  <FiMail size={14} />
                  <span>fitbody.mk@icloud.com</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-400 text-sm">
                  <FiMapPin size={14} />
                  <span>Кочани, Македонија</span>
                </div>
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="text-white font-semibold mb-4">{t('footer.quickLinks')}</h3>
              <ul className="space-y-2">
                {quickLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Language Switcher */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-white font-semibold mb-4">{t('common.language')}</h3>
              <LanguageSwitcher variant="footer" />
            </motion.div>

            {/* Empty column for spacing */}
            <div></div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-gray-400 text-sm mb-4 md:mb-0 space-y-1"
            >
              <p>© {new Date().getFullYear()} FitBody.mk. {t('footer.allRightsReserved')}</p>
              <p className="text-xs text-gray-500">
                {t('footer.developedBy')}{' '}
                <a 
                  href="https://strani.mk" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-brandGold hover:text-orange-300 transition-colors"
                >
                  strani.mk
                </a>
              </p>
            </motion.div>
            
            {/* Social Links */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="flex items-center space-x-4"
            >
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    whileHover={{ scale: 1.2, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                    className="text-gray-400 hover:text-orange-500 transition-colors"
                    aria-label={social.label}
                  >
                    <Icon size={18} />
                  </motion.a>
                );
              })}
            </motion.div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;