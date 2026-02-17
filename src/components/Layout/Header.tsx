import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiShoppingCart, FiUser, FiMenu, FiX } from 'react-icons/fi';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import CartSlider from '@/components/Cart/CartSlider';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { cart } = useCart();
  const { user, logout } = useAuth();
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

  const navigationItems = [
    { label: t('navigation.products'), href: '/products' },
    { label: t('navigation.promotions'), href: '/promotions' },
    { label: t('navigation.blog'), href: '/blog' },
    { label: t('navigation.about'), href: '/about' },
    { label: t('navigation.contact'), href: '/contact' },
  ];

  const cartItemsCount = cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black bg-opacity-95 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="relative h-11 w-auto sm:h-11 lg:h-11">
              <Image
                src={getImagePath("/assets/logo.png")}
                alt="FitBody.mk"
                width={160}
                height={64}
                className="h-full w-auto object-contain hover:scale-105 transition-transform"
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4 lg:space-x-8">
            {navigationItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href} 
                className="text-gray-300 hover:text-white transition-colors font-medium text-sm lg:text-base px-2 py-1 rounded hover:bg-gray-800"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Language Switcher */}
            <LanguageSwitcher variant="header" className="" />

            {/* Cart */}
            <button 
              onClick={() => setIsCartOpen(true)}
              data-cart-button
              className="relative p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
            >
              <FiShoppingCart size={18} className="sm:w-5 sm:h-5" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-medium rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center animate-pulse">
                  {cartItemsCount}
                </span>
              )}
            </button>

            {/* User */}
            {user ? (
              <div className="hidden md:flex items-center space-x-1 sm:space-x-2">
                <span className="text-xs sm:text-sm text-gray-300 hidden lg:block max-w-20 truncate">
                  {user.first_name || user.username}
                  {user.is_dealer && (
                    <span className="ml-1 text-xs bg-orange-500 px-1 py-0.5 rounded">СОРАБОТНИК</span>
                  )}
                </span>
                <Link
                  href={user.is_dealer ? "/dealer/dashboard" : "/profile"}
                  className="p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
                >
                  <FiUser size={18} className="sm:w-5 sm:h-5" />
                </Link>
              </div>
            ) : (
              <Link href="/dealer/login" className="hidden md:block p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all">
                <FiUser size={18} className="sm:w-5 sm:h-5" />
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 sm:p-3 text-white rounded-lg transition-all transform hover:scale-105 min-w-[44px] min-h-[44px] flex items-center justify-center"
              style={{ backgroundColor: '#f97316' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#ea580c';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f97316';
              }}
            >
              {isMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-gray-900 border-t border-gray-800 rounded-b-lg shadow-lg">
            <nav className="py-4 space-y-1">
              {navigationItems.map((item) => (
                <Link 
                  key={item.href} 
                  href={item.href}
                  className="block px-4 py-3 text-white hover:bg-gray-800 transition-all font-medium border-l-4 border-transparent hover:border-orange-500 hover:translate-x-1"
                  onClick={closeMenu}
                >
                  {item.label}
                </Link>
              ))}
              
              {/* Mobile Login Link */}
              {!user && (
                <div className="border-t border-gray-800 pt-4 mt-4">
                  <Link 
                    href="/dealer/login"
                    className="block px-4 py-3 text-brandGold hover:text-orange-300 hover:bg-gray-800 transition-all font-semibold"
                    onClick={closeMenu}
                  >
                    {t('navigation.login')} / {t('dealer.register')}
                  </Link>
                </div>
              )}
              
              {/* Mobile User Info */}
              {user && (
                <div className="border-t border-gray-800 pt-4 mt-4 px-4">
                  <div className="text-sm text-gray-300 mb-3">
                    {t('navigation.login')}: <span className="text-white font-medium">{user.first_name || user.username}</span>
                    {user.is_dealer && (
                      <span className="ml-2 text-xs bg-orange-500 px-2 py-1 rounded">{t('dealer.title').toUpperCase()}</span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Link
                      href={user.is_dealer ? "/dealer/dashboard" : "/profile"}
                      className="block text-sm text-brandGold hover:text-orange-300 transition-colors"
                      onClick={closeMenu}
                    >
                      {user.is_dealer ? t('dealer.dashboard') : t('navigation.account')}
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        closeMenu();
                      }}
                      className="block text-sm text-red-400 hover:text-red-300 transition-colors"
                    >
                      {t('navigation.logout')}
                    </button>
                  </div>
                </div>
              )}

              {/* Mobile Language Switcher */}
              <div className="border-t border-gray-800 pt-4 mt-4 px-4">
                <div className="text-sm text-gray-300 mb-2">{t('common.language')}</div>
                <LanguageSwitcher variant="mobile" />
              </div>
            </nav>
          </div>
        )}
      </div>

      {/* Cart Slider */}
      <CartSlider isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  );
};

export default Header;