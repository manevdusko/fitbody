import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiSearch, FiFilter, FiGrid, FiList, FiStar, FiEye, FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useNotifications } from '@/components/Notifications/NotificationSystem';
import { dealerApi } from '@/utils/api';
import { Product } from '@/types';
import ProductCard from '@/components/Product/ProductCard';
import { useRouter } from 'next/router';
import { useLanguage } from '@/contexts/LanguageContext';

const DealerProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showDealerOnly, setShowDealerOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const { user } = useAuth();
  const { addToCart, isLoading: cartLoading } = useCart();
  const { showCartSuccess, showError, clearAllNotifications } = useNotifications();
  const router = useRouter();
  const { t } = useLanguage();

  // Check if user is approved dealer
  useEffect(() => {
    if (!user) {
      router.push('/dealer/login');
      return;
    }
    
    if (!user.is_dealer || user.dealer_status !== 'approved') {
      router.push('/dealer/login');
      return;
    }
  }, [user, router]);

  // Load products
  useEffect(() => {
    loadProducts();
  }, [currentPage, searchTerm, selectedCategory, showDealerOnly]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await dealerApi.getProducts({
        page: currentPage,
        per_page: 12,
        search: searchTerm || undefined,
        category: selectedCategory ? parseInt(selectedCategory) : undefined,
        dealer_only: showDealerOnly,
      });
      
      setProducts(response.products);
      setTotalPages(response.meta.total_pages);
    } catch (error) {
      console.error('Error loading dealer products:', error);
      showError(t('common.error'), t('common.loadProductsError'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product: Product) => {
    try {
      await addToCart(product.id, 1);
      showCartSuccess(product.name, {
        label: t('common.viewCart'),
        onClick: () => {
          // Clear the notification immediately
          clearAllNotifications();
          const cartButton = document.querySelector('[data-cart-button]') as HTMLButtonElement;
          if (cartButton) {
            cartButton.click();
          }
        }
      });
    } catch (error) {
      showError(t('common.error'), t('common.cartError'));
    }
  };

  if (!user || !user.is_dealer || user.dealer_status !== 'approved') {
    return (
      <div className="min-h-screen bg-black pt-16 sm:pt-20 pb-20 flex items-center justify-center">
        <div className="text-white text-lg">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{t('products.title')} - FitBody.mk</title>
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
              <Link href="/dealer/dashboard">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
                >
                  <FiArrowLeft size={20} />
                  <span>{t('common.backToDashboard')}</span>
                </motion.button>
              </Link>
            </div>
            
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {t('common.productsForDealers')}
                </h1>
                <p className="text-gray-300">
                  {t('common.dealerWelcome')}, {user.first_name}! {t('common.dealerWelcomeProducts')}
                </p>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <FiStar className="text-blue-400" />
                  <span className="text-blue-400 font-semibold">{t('common.approvedDealer')}</span>
                </div>
                <p className="text-gray-400 text-sm mt-1">{user.dealer_company}</p>
              </div>
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-900 rounded-lg p-6 border border-gray-800 mb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              {/* Search */}
              <div>
                <label className="block text-white font-medium mb-2">{t('common.search')}</label>
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={t('common.searchProducts')}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-white font-medium mb-2">{t('common.category')}</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">{t('common.allCategories')}</option>
                  <option value="1">{t('products.categories.proteins')}</option>
                  <option value="2">{t('products.categories.creatine')}</option>
                  <option value="3">{t('products.categories.vitamins')}</option>
                  <option value="4">{t('products.categories.aminoAcids')}</option>
                </select>
              </div>

              {/* Dealer Only Toggle */}
              <div>
                <label className="block text-white font-medium mb-2">{t('common.filterLabel')}</label>
                <label className="flex items-center space-x-3 bg-gray-800 border border-gray-600 rounded-lg px-4 py-3">
                  <input
                    type="checkbox"
                    checked={showDealerOnly}
                    onChange={(e) => setShowDealerOnly(e.target.checked)}
                    className="w-4 h-4 text-blue-500 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-white">{t('common.exclusiveOnly')}</span>
                </label>
              </div>

              {/* View Mode */}
              <div>
                <label className="block text-white font-medium mb-2">{t('common.display')}</label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-3 rounded-lg border transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-blue-500 border-blue-500 text-white'
                        : 'bg-gray-800 border-gray-600 text-gray-400 hover:text-white'
                    }`}
                  >
                    <FiGrid size={20} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-3 rounded-lg border transition-colors ${
                      viewMode === 'list'
                        ? 'bg-blue-500 border-blue-500 text-white'
                        : 'bg-gray-800 border-gray-600 text-gray-400 hover:text-white'
                    }`}
                  >
                    <FiList size={20} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Products */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : products.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <FiFilter className="mx-auto text-gray-600 mb-4" size={64} />
              <h3 className="text-xl font-semibold text-white mb-2">{t('common.noProductsFound')}</h3>
              <p className="text-gray-400">{t('common.tryDifferentFiltersShort')}</p>
            </motion.div>
          ) : (
            <>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden hover:border-blue-500/50 transition-all duration-300"
                    >
                      <Link 
                        href={`/products/${encodeURIComponent(product.slug)}`}
                      >
                        <div className="relative w-full h-64 bg-gray-800 overflow-hidden">
                          {product.images && product.images.length > 0 ? (
                            <img
                              src={product.images[0].src}
                              alt={product.images[0].alt || product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              No Image
                            </div>
                          )}
                          {product.is_dealer_only && (
                            <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold">
                              {t('dealer.title').toUpperCase()}
                            </div>
                          )}
                        </div>
                      </Link>
                      <div className="p-4">
                        <Link href={`/products/${encodeURIComponent(product.slug)}`}>
                          <h3 className="text-white font-semibold mb-2 line-clamp-2 hover:text-blue-400 transition-colors cursor-pointer">
                            {product.name}
                          </h3>
                        </Link>
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            {product.dealer_price ? (
                              <div>
                                <span className="text-blue-400 font-bold text-lg">
                                  MKD {parseFloat(product.dealer_price).toLocaleString()}
                                </span>
                                <span className="text-gray-500 line-through text-sm ml-2">
                                  MKD {parseFloat(product.regular_price).toLocaleString()}
                                </span>
                              </div>
                            ) : (
                              <span className="text-white font-bold text-lg">
                                MKD {parseFloat(product.price).toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Link href={`/products/${encodeURIComponent(product.slug)}`} className="flex-1">
                            <button className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2">
                              <FiEye size={16} />
                              <span>{t('common.details')}</span>
                            </button>
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {products.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gray-900 rounded-lg border border-gray-800 p-6 hover:border-blue-500/50 transition-all duration-300"
                    >
                      <div className="flex items-start space-x-6">
                        <Link href={`/products/${encodeURIComponent(product.slug)}`}>
                          <div className="w-24 h-24 bg-gray-800 rounded-lg overflow-hidden cursor-pointer group">
                            {product.images && product.images.length > 0 ? (
                              <img
                                src={product.images[0].src}
                                alt={product.images[0].alt || product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                No Image
                              </div>
                            )}
                          </div>
                        </Link>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <Link href={`/products/${encodeURIComponent(product.slug)}`}>
                                <h3 className="text-white font-semibold text-lg mb-2 hover:text-blue-400 transition-colors cursor-pointer">
                                  {product.name}
                                </h3>
                              </Link>
                              {product.short_description && (
                                <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                                  {product.short_description.replace(/<[^>]*>/g, '')}
                                </p>
                              )}
                              <div className="flex items-center space-x-4">
                                {product.dealer_price ? (
                                  <div>
                                    <span className="text-blue-400 font-bold text-xl">
                                      MKD {parseFloat(product.dealer_price).toLocaleString()}
                                    </span>
                                    <span className="text-gray-500 line-through text-sm ml-2">
                                      MKD {parseFloat(product.regular_price).toLocaleString()}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-white font-bold text-xl">
                                    MKD {parseFloat(product.price).toLocaleString()}
                                  </span>
                                )}
                                {product.is_dealer_only && (
                                  <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold">
                                    {t('dealer.title').toUpperCase()}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Link href={`/products/${encodeURIComponent(product.slug)}`}>
                                <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2">
                                  <FiEye size={16} />
                                  <span>{t('common.details')}</span>
                                </button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-center mt-12"
                >
                  <div className="flex space-x-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                          currentPage === page
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default DealerProductsPage;