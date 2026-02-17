import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { Product } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';

interface UseFeaturedProductsOptions {
  perPage?: number;
  autoLoad?: boolean;
}

interface UseFeaturedProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useFeaturedProducts = (
  options: UseFeaturedProductsOptions = {}
): UseFeaturedProductsReturn => {
  const { perPage = 8, autoLoad = true } = options;
  const { currentLanguage } = useLanguage();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFeaturedProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const products = await api.products.getFeatured({
        per_page: perPage,
        lang: currentLanguage,
      });
      
      if (products && Array.isArray(products)) {
        setProducts(products);
      } else {
        console.error('Invalid featured products response format:', products);
        setError('Invalid response format');
      }
    } catch (err: any) {
      console.error('Error fetching featured products:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch featured products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoLoad) {
      fetchFeaturedProducts();
    }
  }, [perPage, autoLoad, currentLanguage]);

  return {
    products,
    loading,
    error,
    refetch: fetchFeaturedProducts,
  };
};