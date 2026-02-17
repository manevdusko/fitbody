import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiEye } from 'react-icons/fi';
import { Product } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNotifications } from '@/components/Notifications/NotificationSystem';

interface ProductCardProps {
  product: Product;
  index?: number;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, index = 0 }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { user } = useAuth();
  const { addToCart, isLoading } = useCart();
  const { t, currentLanguage } = useLanguage();
  const { showCartSuccess, showError, clearAllNotifications } = useNotifications();

  // Helper function to get translated category name
  const getCategoryName = (category: any) => {
    // First try to use the translations from the API response
    if (category.translations && category.translations[currentLanguage]) {
      return category.translations[currentLanguage];
    }
    
    // Fallback to translation keys for common categories
    const categoryKey = category.slug || category.name.toLowerCase().replace(/\s+/g, '');
    const translationKey = `common.categories.${categoryKey}`;
    const translatedName = t(translationKey);
    
    // If translation exists and is different from the key, use it
    if (translatedName !== translationKey) {
      return translatedName;
    }
    
    // Final fallback to the original name
    return category.name;
  };

  // Function to get price range for variable products
  const getPriceDisplay = () => {
    const isVariable = product.type === 'variable' && product.variations && product.variations.length > 0;
    
    if (isVariable) {
      // Get all valid prices from variations
      const prices = product.variations!
        .map(variation => {
          if (user?.is_dealer && variation.dealer_price) {
            return parseFloat(variation.dealer_price);
          }
          return parseFloat(variation.price || '0');
        })
        .filter(price => !isNaN(price) && price > 0);
      
      if (prices.length === 0) {
        // Fallback to main product price if no variation prices
        const fallbackPrice = user?.is_dealer && product.dealer_price 
          ? product.dealer_price 
          : (product.is_promotion && product.promotion_price ? product.promotion_price : product.price);
        return {
          display: `${t('common.currency')} ${parseFloat(fallbackPrice).toLocaleString()}`,
          isRange: false
        };
      }
      
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      
      if (minPrice === maxPrice) {
        // All variations have the same price
        return {
          display: `${t('common.currency')} ${minPrice.toLocaleString()}`,
          isRange: false
        };
      } else {
        // Show price range
        return {
          display: `${t('common.currency')} ${minPrice.toLocaleString()} - ${maxPrice.toLocaleString()}`,
          isRange: true
        };
      }
    } else {
      // Simple product - use existing logic
      const displayPrice = user?.is_dealer && product.dealer_price 
        ? product.dealer_price 
        : (product.is_promotion && product.promotion_price ? product.promotion_price : product.price);
      
      return {
        display: `${t('common.currency')} ${parseFloat(displayPrice).toLocaleString()}`,
        isRange: false
      };
    }
  };

  // Function to get original price for comparison (for sale/promotion indicators)
  const getOriginalPrice = () => {
    const isVariable = product.type === 'variable' && product.variations && product.variations.length > 0;
    
    if (isVariable) {
      // For variable products, check if any variation has a different regular price
      const regularPrices = product.variations!
        .map(variation => parseFloat(variation.regular_price || '0'))
        .filter(price => !isNaN(price) && price > 0);
      
      const currentPrices = product.variations!
        .map(variation => {
          if (user?.is_dealer && variation.dealer_price) {
            return parseFloat(variation.dealer_price);
          }
          return parseFloat(variation.price || '0');
        })
        .filter(price => !isNaN(price) && price > 0);
      
      if (regularPrices.length > 0 && currentPrices.length > 0) {
        const minRegular = Math.min(...regularPrices);
        const maxRegular = Math.max(...regularPrices);
        const minCurrent = Math.min(...currentPrices);
        
        // Show original price if there's a discount
        if (minCurrent < minRegular) {
          if (minRegular === maxRegular) {
            return `${t('common.currency')} ${minRegular.toLocaleString()}`;
          } else {
            return `${t('common.currency')} ${minRegular.toLocaleString()} - ${maxRegular.toLocaleString()}`;
          }
        }
      }
      return null;
    } else {
      // Simple product - use existing logic
      return user?.is_dealer && product.dealer_price 
        ? product.regular_price 
        : (product.is_promotion && product.promotion_price ? product.price : (product.sale_price ? product.regular_price : null));
    }
  };

  const priceDisplay = getPriceDisplay();
  const originalPrice = getOriginalPrice();

  const isOnSale = product.sale_price && product.sale_price !== product.regular_price;
  const isOnPromotion = product.is_promotion && product.promotion_price;
  
  const discountPercentage = isOnSale 
    ? Math.round(((parseFloat(product.regular_price) - parseFloat(product.sale_price)) / parseFloat(product.regular_price)) * 100)
    : 0;
    
  const promotionDiscountPercentage = isOnPromotion && product.promotion_price
    ? Math.round(((parseFloat(product.price) - parseFloat(product.promotion_price)) / parseFloat(product.price)) * 100)
    : 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // For variable products, redirect to product page instead of adding to cart
    if (product.type === 'variable' && product.variations && product.variations.length > 0) {
      window.location.href = `/products/${product.slug}`;
      return;
    }
    
    try {
      await addToCart(product.id, 1);
      showCartSuccess(product.name, {
        label: t('cart.title'),
        onClick: () => {
          // Clear the notification immediately
          clearAllNotifications();
          // This will be handled by the cart slider in header
          const cartButton = document.querySelector('[data-cart-button]') as HTMLButtonElement;
          if (cartButton) {
            cartButton.click();
          }
        }
      });
    } catch (error) {
      console.error('Failed to add to cart:', error);
      showError(t('common.error'), t('common.cartError'));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      whileHover={{ y: -8 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="product-card group cursor-pointer"
    >
      <Link href={`/products/${product.slug}`}>
        <div className="relative overflow-hidden">
          {/* Promotion Badge */}
          {isOnPromotion && (
            <motion.div
              initial={{ scale: 0, rotate: -12 }}
              animate={{ scale: 1, rotate: -12 }}
              className="absolute top-3 left-3 z-10 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded text-xs font-bold"
            >
              {product.promotion_label || `${t('common.discount').toUpperCase()} -${promotionDiscountPercentage}%`}
            </motion.div>
          )}

          {/* Sale Badge */}
          {!isOnPromotion && isOnSale && (
            <motion.div
              initial={{ scale: 0, rotate: -12 }}
              animate={{ scale: 1, rotate: -12 }}
              className="absolute top-3 left-3 z-10 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold"
            >
              -{discountPercentage}%
            </motion.div>
          )}

          {/* Dealer Badge */}
          {user?.is_dealer && product.dealer_price && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-3 right-3 z-10 bg-orange-500 text-white px-2 py-1 rounded text-xs font-bold"
            >
              {t('dealer.title').toUpperCase()}
            </motion.div>
          )}

          {/* Product Image */}
          <div className="relative aspect-square bg-gray-900">
            {product.images && product.images.length > 0 && (
              <>
                <Image
                  src={product.images[0].src}
                  alt={product.images[0].alt || product.name}
                  fill
                  className={`object-cover transition-all duration-700 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  } ${isHovered ? 'scale-110' : 'scale-100'}`}
                  onLoad={() => setImageLoaded(true)}
                />
                
                {/* Secondary Image on Hover */}
                {product.images.length > 1 && (
                  <Image
                    src={product.images[1].src}
                    alt={product.images[1].alt || product.name}
                    fill
                    className={`object-cover transition-all duration-700 ${
                      isHovered ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                )}
              </>
            )}

            {/* Overlay Actions */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              className="absolute inset-0 bg-black/40 flex items-center justify-center space-x-3"
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-colors backdrop-blur-sm"
              >
                <FiEye size={18} />
              </motion.button>
            </motion.div>
          </div>

          {/* Product Info */}
          <div className="p-4">
            <div className="mb-2">
              {product.categories && product.categories.length > 0 && (
                <span className="text-xs text-brandGold font-medium uppercase tracking-wide">
                  {getCategoryName(product.categories[0])}
                </span>
              )}
            </div>
            
            <h3 className="text-white font-bold text-lg mb-2 line-clamp-2 group-hover:text-brandGold transition-colors">
              {product.name}
            </h3>
            
            {product.short_description && (
              <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                {product.short_description.replace(/<[^>]*>/g, '')}
              </p>
            )}

            {/* Price */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col space-y-1">
                <span className={`text-white font-bold ${priceDisplay.isRange ? 'text-base' : 'text-lg'}`}>
                  {priceDisplay.display}
                </span>
                {originalPrice && (
                  <span className="text-gray-500 line-through text-sm">
                    {originalPrice}
                  </span>
                )}
              </div>
              
              {/* Stock Status */}
              <div className="text-xs">
                {product.stock_status === 'instock' ? (
                  <span className="text-green-400">{t('products.inStock')}</span>
                ) : product.stock_status === 'outofstock' ? (
                  <span className="text-red-400">{t('products.outOfStock')}</span>
                ) : (
                  <span className="text-yellow-400">{t('products.onOrder')}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;