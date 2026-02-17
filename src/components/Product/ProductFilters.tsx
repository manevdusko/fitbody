import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown, FiX, FiFilter } from 'react-icons/fi';
import { FilterState, ProductCategory } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';

interface ProductFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  categories: ProductCategory[];
  isOpen: boolean;
  onToggle: () => void;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
  filters,
  onFiltersChange,
  categories,
  isOpen,
  onToggle,
}) => {
  const { t, currentLanguage } = useLanguage();
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    price: true,
    goals: true,
  });
  
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const [mounted, setMounted] = useState(false);

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

  // Handle responsive behavior after component mounts
  useEffect(() => {
    setMounted(true);
    
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const goals = [
    { key: 'muscleGain', label: t('products.goals.muscleGain') },
    { key: 'weightLoss', label: t('products.goals.weightLoss') },
    { key: 'endurance', label: t('products.goals.endurance') },
    { key: 'strength', label: t('products.goals.strength') },
    { key: 'recreation', label: t('products.goals.recreation') },
  ];

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleCategoryChange = (categoryId: number) => {
    const newCategories = filters.categories.includes(categoryId)
      ? filters.categories.filter(id => id !== categoryId)
      : [...filters.categories, categoryId];
    
    onFiltersChange({
      ...filters,
      categories: newCategories,
    });
  };

  const handleGoalChange = (goalKey: string) => {
    const newGoals = filters.goals.includes(goalKey)
      ? filters.goals.filter(g => g !== goalKey)
      : [...filters.goals, goalKey];
    
    onFiltersChange({
      ...filters,
      goals: newGoals,
    });
  };

  const handlePriceChange = (min: number, max: number) => {
    onFiltersChange({
      ...filters,
      priceRange: [min, max],
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      categories: [],
      priceRange: [0, 10000],
      goals: [],
      search: '',
    });
  };

  const activeFiltersCount = 
    filters.categories.length + 
    filters.goals.length + 
    (filters.search ? 1 : 0) +
    (filters.priceRange[0] > 0 || filters.priceRange[1] < 10000 ? 1 : 0);

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="lg:hidden mb-6">
        <div className="flex items-center justify-between w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white">
          <div className="flex items-center space-x-2">
            <FiFilter size={18} />
            <span>{t('products.filters')}</span>
          </div>
          <FiChevronDown size={18} />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden mb-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onToggle}
          className="flex items-center justify-between w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white"
        >
          <div className="flex items-center space-x-2">
            <FiFilter size={18} />
            <span>{t('products.filters')}</span>
            {activeFiltersCount > 0 && (
              <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </div>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <FiChevronDown size={18} />
          </motion.div>
        </motion.button>
      </div>

      {/* Filter Sidebar */}
      <AnimatePresence>
        {(isOpen || isLargeScreen) && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-gray-900 border border-gray-800 rounded-lg p-6 sticky top-24"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">{t('products.filters')}</h3>
              <div className="flex items-center space-x-2">
                {activeFiltersCount > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={clearAllFilters}
                    className="text-brandGold hover:text-orange-300 text-sm font-medium"
                  >
                    {t('products.clearAll')}
                  </motion.button>
                )}
                <button
                  onClick={onToggle}
                  className="lg:hidden text-gray-400 hover:text-white"
                >
                  <FiX size={20} />
                </button>
              </div>
            </div>

            {/* Categories */}
            <div className="mb-6">
              <button
                onClick={() => toggleSection('categories')}
                className="flex items-center justify-between w-full text-left mb-3"
              >
                <span className="font-medium text-white">{t('products.categorie')}</span>
                <motion.div
                  animate={{ rotate: expandedSections.categories ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <FiChevronDown size={16} className="text-gray-400" />
                </motion.div>
              </button>
              
              <AnimatePresence>
                {expandedSections.categories && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-2 overflow-hidden"
                  >
                    {categories.map((category) => (
                      <label
                        key={category.id}
                        className="flex items-center space-x-2 cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          checked={filters.categories.includes(category.id)}
                          onChange={() => handleCategoryChange(category.id)}
                          className="w-4 h-4 text-orange-500 bg-gray-800 border-gray-600 rounded focus:ring-orange-500 focus:ring-2"
                        />
                        <span className="text-gray-300 group-hover:text-white transition-colors text-sm">
                          {getCategoryName(category)}
                        </span>
                      </label>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProductFilters;