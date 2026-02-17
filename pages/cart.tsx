import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiArrowLeft } from 'react-icons/fi';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';

const CartPage: React.FC = () => {
  const { cart, loading, updateCartItem, removeFromCart, isLoading } = useCart();
  const { t } = useLanguage();

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-16 sm:pt-20 pb-20 flex items-center justify-center">
        <div className="text-white text-lg">{t('common.loadingCart')}</div>
      </div>
    );
  }

  const cartItems = cart?.items || [];
  const isEmpty = cartItems.length === 0;

  const handleQuantityChange = async (key: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    try {
      await updateCartItem(key, newQuantity);
    } catch (error) {
      alert('Настана грешка при ажурирањето на количината. Обидете се повторно.');
    }
  };

  const handleRemoveItem = async (key: string) => {
    try {
      await removeFromCart(key);
    } catch (error) {
      // Failed to remove item
    }
  };

  return (
    <>
      <Head>
        <title>Кошничка - FitBody.mk</title>
        <meta name="description" content="Прегледајте ги производите во вашата кошничка и продолжете со нарачката." />
      </Head>

      <div className="min-h-screen bg-black pt-16 sm:pt-20 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center space-x-4 mb-6">
              <Link href="/products" className="text-brandGold hover:text-orange-300 flex items-center space-x-2">
                <FiArrowLeft size={20} />
                <span>{t('pages.cart.backToProducts')}</span>
              </Link>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t('pages.cart.title')}
            </h1>
            {!isEmpty && (
              <p className="text-gray-400">
                {cartItems.length} {t('pages.cart.itemsInCart')}
              </p>
            )}
          </motion.div>

          {isEmpty ? (
            /* Empty Cart */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <FiShoppingBag size={80} className="text-gray-600 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-white mb-4">{t('pages.cart.emptyTitle')}</h2>
              <p className="text-gray-400 mb-8">{t('pages.cart.emptyDescription')}</p>
              <Link href="/products">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-primary px-8 py-4 text-lg font-semibold"
                >
                  {t('pages.cart.browseProducts')}
                </motion.button>
              </Link>
            </motion.div>
          ) : (
            /* Cart Items */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items List */}
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item, index) => (
                  <motion.div
                    key={item.key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-900 rounded-lg p-4 sm:p-6 border border-gray-800"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                      {/* Product Image */}
                      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-800 rounded-lg flex-shrink-0 overflow-hidden">
                        {item.image?.src ? (
                          <Image
                            src={item.image.src}
                            alt={item.image.alt}
                            width={96}
                            height={96}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-700 rounded-lg flex items-center justify-center">
                            <span className="text-gray-500 text-xs">IMG</span>
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-white mb-2 truncate">
                          {item.name}
                        </h3>
                        {/* Variation subtitle */}
                        {item.variation && Object.keys(item.variation).length > 0 && (
                          <p className="text-sm text-gray-400 mb-2">
                            {Object.entries(item.variation).map(([key, value]) => value).join(', ')}
                          </p>
                        )}
                        <p className="text-brandGold font-semibold">
                          MKD {parseFloat(item.price || '0').toLocaleString()}
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-3">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleQuantityChange(item.key, item.quantity - 1)}
                          disabled={isLoading || item.quantity <= 1}
                          className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed border border-gray-700 rounded-lg hover:border-gray-600 hover:bg-gray-800 transition-all duration-200"
                        >
                          <FiMinus size={16} />
                        </motion.button>
                        <span className="text-white font-semibold min-w-[3rem] text-center bg-gray-800 px-3 py-2 rounded-lg border border-gray-700">
                          {item.quantity}
                        </span>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleQuantityChange(item.key, item.quantity + 1)}
                          disabled={isLoading}
                          className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed border border-gray-700 rounded-lg hover:border-gray-600 hover:bg-gray-800 transition-all duration-200"
                        >
                          <FiPlus size={16} />
                        </motion.button>
                      </div>

                      {/* Total & Remove */}
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-white font-bold">
                            MKD {parseFloat(item.total || '0').toLocaleString()}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.key)}
                          disabled={isLoading}
                          className="p-2 text-red-400 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Order Summary */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gray-900 rounded-lg p-6 border border-gray-800 h-fit sticky top-24"
              >
                <h3 className="text-xl font-bold text-white mb-6">{t('pages.cart.orderSummary')}</h3>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-300">
                    <span>{t('pages.cart.delivery')}:</span>
                    <span>
                      {cart?.shipping ? (
                        cart.shipping.cost > 0 ? 
                          `MKD ${cart.shipping.cost.toLocaleString()}` : 
                          t('pages.cart.free')
                      ) : (
                        t('pages.cart.calculating')
                      )}
                    </span>
                  </div>
                  {cart?.shipping?.description && (
                    <div className="text-xs text-gray-400 border-t border-gray-700 pt-2">
                      {cart.shipping.description}
                    </div>
                  )}
                  <div className="border-t border-gray-700 pt-4">
                    <div className="flex justify-between text-xl font-bold text-white">
                      <span>{t('pages.cart.total')}:</span>
                      <span>
                        MKD {(
                          parseFloat(cart?.totals?.subtotal || '0') + 
                          (cart?.shipping?.cost || 0)
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <Link href="/checkout">
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full btn-primary py-4 text-lg font-semibold mb-4"
                    disabled={isLoading}
                  >
                    {t('pages.cart.proceedToCheckout')}
                  </motion.button>
                </Link>

                <Link href="/products" className="block">
                  <button className="w-full text-brandGold hover:text-orange-300 py-2 text-center transition-colors">
                    {t('pages.cart.continueShopping')}
                  </button>
                </Link>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartPage;