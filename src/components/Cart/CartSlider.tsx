import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiShoppingBag, FiMinus, FiPlus, FiTrash2 } from 'react-icons/fi';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNotifications } from '@/components/Notifications/NotificationSystem';

interface CartSliderProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartSlider: React.FC<CartSliderProps> = ({ isOpen, onClose }) => {
  const { cart, updateCartItem, removeFromCart, isLoading } = useCart();
  const { t } = useLanguage();
  const { clearAllNotifications } = useNotifications();
  
  const cartItems = cart?.items || [];

  // Handle Escape key to close cart
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when cart is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      // Restore body scroll when cart is closed
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleQuantityChange = async (key: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    try {
      await updateCartItem(key, newQuantity);
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  };

  const handleRemoveItem = async (key: string) => {
    try {
      await removeFromCart(key);
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  const handleViewCart = () => {
    // Clear all notifications (including "Додадено во кошничка!" dialog)
    clearAllNotifications();
    
    // Close the cart slider and navigate
    onClose();
  };

  // Don't render anything on server side
  if (typeof window === 'undefined') {
    return null;
  }

  const cartSliderContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop/Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
            style={{ backdropFilter: 'blur(4px)' }}
          />
          
          {/* Cart Slider */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-gray-900 shadow-2xl z-[9999] flex flex-col border-l border-gray-700"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the slider
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-800 flex-shrink-0">
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <FiShoppingBag size={20} />
                <span>{t('cart.title')} ({cartItems.length})</span>
              </h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <FiX size={20} />
              </motion.button>
            </div>

            {/* Cart Content */}
            <div className="flex-grow overflow-y-auto p-3 min-h-[300px] bg-gray-800">
              {isLoading ? (
                /* Loading State */
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mb-4"></div>
                  <p className="text-gray-400">{t('common.loading')}</p>
                </div>
              ) : cartItems.length === 0 ? (
                /* Empty Cart */
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <FiShoppingBag size={48} className="text-gray-600 mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">{t('cart.empty')}</h3>
                  <p className="text-gray-400 mb-6">{t('common.addProductsToStart')}</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    {t('cart.continueShopping')}
                  </motion.button>
                </div>
              ) : (
                /* Cart Items */
                <div className="space-y-3">
                  {cartItems.map((item, index) => (
                    <motion.div
                      key={item.key}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gray-700 rounded-lg p-3 border border-gray-600 hover:bg-gray-650 transition-colors"
                    >
                      <div className="flex items-start space-x-3">
                        {/* Product Image */}
                        <div className="w-12 h-12 bg-gray-600 rounded-lg flex-shrink-0 overflow-hidden">
                          {item.image?.src ? (
                            <Image
                              src={item.image.src}
                              alt={item.image.alt}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-500 flex items-center justify-center">
                              <span className="text-gray-400 text-xs">IMG</span>
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-medium text-sm truncate mb-1">
                            {item.name}
                          </h4>
                          {/* Variation subtitle */}
                          {item.variation && Object.keys(item.variation).length > 0 && (
                            <p className="text-gray-400 text-xs truncate mb-1">
                              {Object.entries(item.variation).map(([key, value]) => value).join(', ')}
                            </p>
                          )}
                          <p className="text-brandGold font-semibold text-sm">
                            {t('common.currency')} {parseFloat(String(item.price || '0')).toLocaleString()}
                          </p>
                          
                          {/* Quantity Controls */}
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center space-x-1">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleQuantityChange(item.key, item.quantity - 1)}
                                disabled={isLoading || item.quantity <= 1}
                                className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed border border-gray-500 rounded hover:border-gray-400 text-xs bg-gray-600 hover:bg-gray-500"
                              >
                                <FiMinus size={10} />
                              </motion.button>
                              <span className="text-white font-medium text-sm min-w-[1.5rem] text-center">
                                {item.quantity}
                              </span>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleQuantityChange(item.key, item.quantity + 1)}
                                disabled={isLoading}
                                className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed border border-gray-500 rounded hover:border-gray-400 text-xs bg-gray-600 hover:bg-gray-500"
                              >
                                <FiPlus size={10} />
                              </motion.button>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <span className="text-white font-semibold text-sm">
                                {t('common.currency')} {parseFloat(String(item.total || '0')).toLocaleString()}
                              </span>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleRemoveItem(item.key)}
                                disabled={isLoading}
                                className="p-1 text-red-400 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <FiTrash2 size={12} />
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="border-t border-gray-800 p-4 space-y-3 bg-gray-800 flex-shrink-0">
                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-300">{t('common.shipping')}:</span>
                    <span className="text-white">
                      {cart?.shipping ? (
                        cart.shipping.cost > 0 ? 
                          `${t('common.currency')} ${cart.shipping.cost.toLocaleString()}` : 
                          t('common.free')
                      ) : (
                        t('common.calculating')
                      )}
                    </span>
                  </div>
                  <div className="border-t border-gray-700 pt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-white">{t('common.total')}:</span>
                      <span className="text-xl font-bold text-brandGold">
                        {t('common.currency')} {(
                          parseFloat(cart?.totals?.subtotal || '0') + 
                          (cart?.shipping?.cost || 0)
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Link href="/cart">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleViewCart}
                      className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2.5 rounded-lg font-semibold transition-colors text-sm"
                    >
                      {t('cart.title')}
                    </motion.button>
                  </Link>
                  
                  <Link href="/checkout" onClick={onClose}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-lg font-semibold transition-colors text-sm"
                    >
                      {t('cart.checkout')}
                    </motion.button>
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  // Use portal to render at document body level
  return createPortal(cartSliderContent, document.body);
};

export default CartSlider;