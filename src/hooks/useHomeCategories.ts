import { useState, useEffect } from 'react';
import { HomeCategory } from '@/types';
import { productsApi } from '@/utils/api';
import { useLanguage } from '@/contexts/LanguageContext';

export const useHomeCategories = () => {
  const [categories, setCategories] = useState<HomeCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentLanguage } = useLanguage();

  useEffect(() => {
    loadCategories();
  }, [currentLanguage]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const homeCategories = await productsApi.getHomeCategories(currentLanguage);
      setCategories(homeCategories);
    } catch (err) {
      setError('Failed to load categories');
      console.error('Error loading home categories:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    categories,
    loading,
    error,
    refresh: loadCategories,
  };
};