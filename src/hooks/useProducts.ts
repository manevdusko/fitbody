import { useState, useEffect } from 'react';
import axios from 'axios';
import { Product, FilterState, PaginationMeta } from '@/types';
import { productsApi } from '@/utils/api';
import { useLanguage } from '@/contexts/LanguageContext';

interface UseProductsOptions {
  initialFilters?: Partial<FilterState>;
  autoLoad?: boolean;
}

export const useProducts = (options: UseProductsOptions = {}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentLanguage } = useLanguage();
  const [meta, setMeta] = useState<PaginationMeta>({
    total: 0,
    total_pages: 0,
    current_page: 1,
    per_page: 12,
    has_next: false,
    has_previous: false,
  });

  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    priceRange: [0, 10000],
    goals: [],
    search: '',
    ...options.initialFilters,
  });

  const loadProducts = async (page: number = 1, newFilters?: FilterState) => {
    try {
      setLoading(true);
      setError(null);

      const currentFilters = newFilters || filters;
      
      const params: any = {
        page,
        per_page: meta.per_page,
        lang: currentLanguage,
      };

      // Add filters to params
      if (currentFilters.categories.length > 0) {
        params.category = currentFilters.categories.join(',');
      }

      if (currentFilters.search) {
        params.search = currentFilters.search;
      }

      if (currentFilters.priceRange[0] > 0) {
        params.min_price = currentFilters.priceRange[0];
      }

      if (currentFilters.priceRange[1] < 10000) {
        params.max_price = currentFilters.priceRange[1];
      }

      const { products: newProducts, meta: newMeta } = await productsApi.getAll(params);
      
      if (page === 1) {
        setProducts(newProducts);
      } else {
        setProducts(prev => [...prev, ...newProducts]);
      }
      
      setMeta(newMeta);
    } catch (err) {
      setError('Failed to load products');
      console.error('Error loading products:', err);
      
      // Set empty products array on error
      setProducts([]);
      setMeta({
        total: 0,
        total_pages: 0,
        current_page: 1,
        per_page: 12,
        has_next: false,
        has_previous: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const updateFilters = (newFilters: FilterState) => {
    setFilters(newFilters);
    loadProducts(1, newFilters);
  };

  const loadMore = () => {
    if (meta.current_page < meta.total_pages && !loading) {
      loadProducts(meta.current_page + 1);
    }
  };

  const refresh = () => {
    loadProducts(1);
  };

  useEffect(() => {
    if (options.autoLoad !== false) {
      loadProducts();
    }
  }, [currentLanguage]); // Add currentLanguage as dependency

  return {
    products,
    loading,
    error,
    meta,
    filters,
    updateFilters,
    loadMore,
    refresh,
    hasMore: meta.current_page < meta.total_pages,
  };
};

export const useProduct = (id?: number, slug?: string) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentLanguage } = useLanguage();

  const loadProduct = async () => {
    if (!id && !slug) {
      console.log('useProduct: No id or slug provided, skipping API call');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('useProduct: Loading product with', { id, slug, currentLanguage });

      const productData = id 
        ? await productsApi.getById(id, currentLanguage)
        : await productsApi.getBySlug(slug!, currentLanguage);
      
      console.log('useProduct: Product loaded successfully', productData);
      setProduct(productData);
    } catch (err) {
      setError('Failed to load product');
      console.error('useProduct: Error loading product:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProduct();
  }, [id, slug, currentLanguage]);

  return {
    product,
    loading,
    error,
    refresh: loadProduct,
  };
};