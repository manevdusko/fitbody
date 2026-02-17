import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import ProductGrid from '@/components/Product/ProductGrid';
import { productsApi } from '@/utils/api';
import { Product, PaginationMeta } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';

const PromotionsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();
  const [meta, setMeta] = useState<PaginationMeta>({
    total: 0,
    total_pages: 0,
    current_page: 1,
    per_page: 12,
    has_next: false,
    has_previous: false,
  });

  useEffect(() => {
    loadPromotions();
  }, []);

  const loadPromotions = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const { products: promotionProducts, meta: promotionMeta } = await productsApi.getPromotions({
        page,
        per_page: 12,
      });
      
      if (page === 1) {
        setProducts(promotionProducts);
      } else {
        setProducts(prev => [...prev, ...promotionProducts]);
      }
      
      setMeta(promotionMeta);
    } catch (err) {
      setError(t('common.loadPromotionsError'));
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (meta.current_page < meta.total_pages && !loading) {
      loadPromotions(meta.current_page + 1);
    }
  };

  return (
    <>
      <Head>
        <title>{t('promotions.title')} - FitBody.mk</title>
        <meta name="description" content={t('promotions.description')} />
      </Head>

      <div className="min-h-screen bg-black pt-8 pb-20">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t('promotions.title')}
            </h1>
            <p className="text-gray-400">
              {meta.total > 0 ? `${t('promotions.foundPromotions')} ${meta.total} ${t('promotions.promotionalProducts')}` : t('promotions.bestOffers')}
            </p>
          </motion.div>

          {/* Content */}
          {loading && products.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mb-4"></div>
              <p className="text-gray-400">{t('common.loadingPromotions')}</p>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold text-white mb-2">{t('promotions.error')}</h3>
              <p className="text-gray-400 mb-4">{error}</p>
              <button
                onClick={() => loadPromotions()}
                className="btn-primary px-6 py-3"
              >
                {t('promotions.tryAgain')}
              </button>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-8 max-w-md mx-auto">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-xl font-semibold text-white mb-2">{t('common.comingSoon')}</h3>
                <p className="text-gray-400">
                  {t('common.promotionsComingSoon')}
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Promotions Grid */}
              <ProductGrid products={products} loading={false} />

              {/* Load More Button */}
              {meta.current_page < meta.total_pages && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center mt-12"
                >
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={loadMore}
                    disabled={loading}
                    className="btn-primary px-8 py-4 text-lg font-semibold disabled:opacity-50"
                  >
                    {loading ? t('common.loadingMore') : t('common.loadMore')}
                  </motion.button>
                  <p className="text-gray-400 text-sm mt-4">
                    {t('promotions.showing')} {products.length} {t('promotions.of')} {meta.total} {t('promotions.promotionalProducts')}
                  </p>
                </motion.div>
              )}

              {/* Loading More Indicator */}
              {loading && products.length > 0 && (
                <div className="text-center mt-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default PromotionsPage;