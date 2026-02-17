import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import ProductGrid from '@/components/Product/ProductGrid';
import ProductFilters from '@/components/Product/ProductFilters';
import { useProducts } from '@/hooks/useProducts';
import { productsApi } from '@/utils/api';
import { ProductCategory } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';

const ProductsPage: React.FC = () => {
  const router = useRouter();
  const { t, currentLanguage } = useLanguage();
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [initialFiltersSet, setInitialFiltersSet] = useState(false);
  const [routerReady, setRouterReady] = useState(false);

  // Parse URL parameters to get initial filters
  const getInitialFilters = () => {
    if (!router.isReady) {
      return {
        categories: [],
        priceRange: [0, 10000] as [number, number],
        goals: [],
        search: '',
      };
    }

    const { category, search, min_price, max_price } = router.query;
    
    const initialFilters = {
      categories: category ? [parseInt(category as string)] : [],
      priceRange: [
        min_price ? parseInt(min_price as string) : 0,
        max_price ? parseInt(max_price as string) : 10000
      ] as [number, number],
      goals: [],
      search: search ? (search as string) : '',
    };

    return initialFilters;
  };

  const { products, loading, filters, updateFilters, loadMore, hasMore, meta, refresh } = useProducts({
    initialFilters: {
      categories: [],
      priceRange: [0, 10000],
      goals: [],
      search: '',
    },
    autoLoad: false, // We'll load manually after setting up filters
  });

  // Helper function to get translated category name
  const getCategoryName = (category: ProductCategory) => {
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

  const loadCategories = async () => {
    try {
      const cats = await productsApi.getCategories(currentLanguage);
      setCategories(cats);
    } catch (error) {
      // Failed to load categories
    }
  };

  useEffect(() => {
    loadCategories();
  }, [currentLanguage]); // Reload categories when language changes

  // Handle router ready state
  useEffect(() => {
    if (router.isReady && !routerReady) {
      setRouterReady(true);
    }
  }, [router.isReady, routerReady]);

  // Set initial filters when router is ready
  useEffect(() => {
    if (routerReady && !initialFiltersSet) {
      const initialFilters = getInitialFilters();
      
      // If we have category filters from URL, apply them
      if (initialFilters.categories.length > 0 || initialFilters.search) {
        updateFilters(initialFilters);
      } else {
        // No filters, just load all products
        refresh();
      }
      
      setInitialFiltersSet(true);
    }
  }, [routerReady, initialFiltersSet, updateFilters, refresh]);

  // Handle language changes - refresh products when language changes
  useEffect(() => {
    if (initialFiltersSet) {
      // Refresh products with current filters when language changes
      if (filters.categories.length > 0 || filters.search) {
        updateFilters(filters);
      } else {
        refresh();
      }
    }
  }, [currentLanguage, initialFiltersSet]);

  // Get the active category name for the page title
  const getActiveCategoryName = () => {
    if (filters.categories.length > 0 && categories.length > 0) {
      const activeCategory = categories.find(cat => cat.id === filters.categories[0]);
      return activeCategory ? getCategoryName(activeCategory) : null;
    }
    return null;
  };

  const activeCategoryName = getActiveCategoryName();
  const pageTitle = activeCategoryName ? `${activeCategoryName} - FitBody.mk` : `${t('products.title')} - FitBody.mk`;
  const pageHeading = activeCategoryName ? activeCategoryName : t('products.allProducts');

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={t('products.recommendedSubtitle')} />
      </Head>

      <div className="min-h-screen bg-black pt-8 pb-20">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          {activeCategoryName && (
            <motion.nav
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <span 
                  onClick={() => router.push('/')}
                  className="hover:text-white cursor-pointer"
                >
                  {t('navigation.home')}
                </span>
                <span>/</span>
                <span 
                  onClick={() => router.push('/products')}
                  className="hover:text-white cursor-pointer"
                >
                  {t('navigation.products')}
                </span>
                <span>/</span>
                <span className="text-white">{activeCategoryName}</span>
              </div>
            </motion.nav>
          )}

          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {pageHeading}
            </h1>
            <p className="text-gray-400">
              {t('products.found')} {meta.total} {t('products.productsFound')}
              {activeCategoryName && ` ${t('products.inCategory')} ${activeCategoryName}`}
            </p>
          </motion.div>

          {/* Main Content */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <div className="lg:w-64 flex-shrink-0">
              <ProductFilters
                filters={filters}
                onFiltersChange={updateFilters}
                categories={categories}
                isOpen={isFilterOpen}
                onToggle={() => setIsFilterOpen(!isFilterOpen)}
              />
            </div>

            {/* Products Grid */}
            <div className="flex-1">
              <ProductGrid products={products} loading={loading} />

              {/* Load More Button */}
              {hasMore && !loading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center mt-12"
                >
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={loadMore}
                    className="btn-primary px-8 py-4 text-lg font-semibold"
                  >
                    {t('products.loadMore')}
                  </motion.button>
                  <p className="text-gray-400 text-sm mt-4">
                    {t('products.showingProducts')} {products.length} {t('products.of')} {meta.total} {t('products.products')}
                  </p>
                </motion.div>
              )}

              {/* Loading More Indicator */}
              {loading && products.length > 0 && (
                <div className="text-center mt-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductsPage;