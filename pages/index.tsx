import React from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import HeroSection from '@/components/Home/HeroSection';
import ProductGrid from '@/components/Product/ProductGrid';
import ProductsSection from '@/components/Products/ProductsSection';
import BlogSection from '@/components/Blog/BlogSection';
import { useFeaturedProducts } from '@/hooks/useFeaturedProducts';
import { useHomeCategories } from '@/hooks/useHomeCategories';
import { useLanguage } from '@/contexts/LanguageContext';
import { HomeSEO } from '@/components/SEO/SEOHead';
import { OrganizationSchema, WebsiteSchema, LocalBusinessSchema } from '@/components/SEO/StructuredData';
import Link from 'next/link';

const HomePage: React.FC = () => {
  const { t, currentLanguage } = useLanguage();
  const { products: featuredProducts, loading: featuredLoading } = useFeaturedProducts({
    perPage: 8,
    autoLoad: true,
  });

  const { categories: homeCategories, loading: categoriesLoading } = useHomeCategories();

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

  return (
    <>
      {/* SEO Head */}
      <HomeSEO 
        featuredProductsCount={featuredProducts?.length}
        categoriesCount={homeCategories?.length}
      />
      
      {/* Structured Data */}
      <OrganizationSchema />
      <WebsiteSchema />
      <LocalBusinessSchema />

      {/* Hero Section */}
      <HeroSection />

      {/* Featured Products Section */}
      <ProductsSection
        products={featuredProducts}
        loading={featuredLoading}
        showCategories={true}
        className="bg-gradient-to-b from-black to-gray-900"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center pb-20 bg-gradient-to-b from-gray-900 to-black"
      >
        <Link href="/products">
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="btn-primary px-8 py-4 text-lg font-semibold"
          >
            {t('products.title').toUpperCase()}
          </motion.button>
        </Link>
      </motion.div>

      {/* Categories Section */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t('common.allCategories')}
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              {t('home.categoriesSubtitle')}
            </p>
          </motion.div>

          {categoriesLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
              <p className="text-gray-400 mt-4">{t('common.loading')}</p>
            </div>
          ) : homeCategories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {homeCategories.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="bg-black border border-gray-800 rounded-lg p-6 sm:p-8 text-center group cursor-pointer"
                >
                  <Link href={category.href}>
                    <div className="text-4xl mb-4">{category.icon}</div>
                    <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-brandGold transition-colors">
                      {getCategoryName(category)}
                    </h3>
                    <p className="text-gray-400 text-sm mb-4">{category.count}+ {t('home.productsCount')}</p>
                    <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: '100%' }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                        className="h-full bg-orange-500"
                      />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400">{t('home.noCategoriesConfigured')}</p>
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t('home.whyChooseUs')}
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              {t('home.whyChooseUsSubtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                title: t('home.features.originalProducts.title'),
                description: t('home.features.originalProducts.description'),
                icon: '✓',
              },
              {
                title: t('home.features.fastDelivery.title'),
                description: t('home.features.fastDelivery.description'),
                icon: '🚚',
              },
              {
                title: t('home.features.expertAdvice.title'),
                description: t('home.features.expertAdvice.description'),
                icon: '💬',
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl">{feature.icon}</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <BlogSection />
    </>
  );
};

export default HomePage;