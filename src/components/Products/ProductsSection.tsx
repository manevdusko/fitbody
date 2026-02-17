import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Product } from '@/types';
import ProductCard from '../Product/ProductCard';

interface ProductsSectionProps {
  products: Product[];
  loading?: boolean;
  title?: string;
  subtitle?: string;
  showCategories?: boolean;
  className?: string;
}

const ProductsSection: React.FC<ProductsSectionProps> = ({
  products,
  loading = false,
  title,
  subtitle,
  showCategories = false,
  className = ''
}) => {
  const { t } = useLanguage();

  const categories = [
    { key: 'proteins', icon: '🥤' },
    { key: 'creatine', icon: '💪' },
    { key: 'vitamins', icon: '💊' },
    { key: 'preworkout', icon: '⚡' },
    { key: 'postworkout', icon: '🔋' },
    { key: 'fatburners', icon: '🔥' },
    { key: 'massGainers', icon: '📈' },
    { key: 'aminoAcids', icon: '🧬' },
    { key: 'healthSupplements', icon: '🌿' },
    { key: 'sportsDrinks', icon: '🥤' }
  ];

  return (
    <section className={`py-16 ${className}`}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl lg:text-4xl font-bold text-white mb-4"
          >
            {title || t('products.recommendedTitle')}
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-300 text-lg max-w-3xl mx-auto leading-relaxed"
          >
            {subtitle || t('products.recommendedSubtitle')}
          </motion.p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="bg-gray-800 rounded-lg overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-700"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-700 rounded mb-2"></div>
                  <div className="h-6 bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 bg-gray-700 rounded w-2/3 mb-4"></div>
                  <div className="h-8 bg-gray-700 rounded"></div>
                </div>
              </div>
            ))
          ) : products.length > 0 ? (
            products.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                index={index}
              />
            ))
          ) : (
            // Empty state
            <div className="col-span-full text-center py-16">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {t('products.title')}
              </h3>
              <p className="text-gray-400">
                {t('common.loading')}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;