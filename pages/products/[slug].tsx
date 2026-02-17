import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiMinus, FiPlus } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useProduct } from '@/hooks/useProducts';
import { useNotifications } from '@/components/Notifications/NotificationSystem';
import { ProductSEO } from '@/components/SEO/SEOHead';
import { ProductSchema, BreadcrumbSchema, FAQSchema } from '@/components/SEO/StructuredData';
import { generateBreadcrumbs, generateProductFAQ } from '@/utils/seoUtils';
import { useLanguage } from '@/contexts/LanguageContext';

const ProductDetailPage: React.FC = () => {
  const router = useRouter();
  const { slug } = router.query;
  const { t, currentLanguage } = useLanguage();
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariation, setSelectedVariation] = useState<number | null>(null);
  const [selectedAttributes, setSelectedAttributes] = useState<{ [key: string]: string }>({});
  
  // Fetch product data using the slug
  const { product, loading, error } = useProduct(undefined, slug as string);

  // Auto-select first variation when product loads
  useEffect(() => {
    if (product && product.type === 'variable' && product.variations && product.variations.length > 0) {
      const firstVariation = product.variations[0];
      
      // Set the first variation as selected
      setSelectedVariation(firstVariation.id);
      
      // Set the attributes for the first variation
      const firstVariationAttributes: { [key: string]: string } = {};
      
      // Map variation attributes to the format expected by the UI
      if (firstVariation.attributes && product.attributes) {
        // For each product attribute that is used for variations
        product.attributes.forEach(productAttribute => {
          if (productAttribute.variation) {            
            // Try different possible keys for the variation attribute
            const possibleKeys = [
              productAttribute.slug,
              productAttribute.name.toLowerCase(),
              `attribute_${productAttribute.slug}`,
              `pa_${productAttribute.slug}`,
              `attribute_pa_${productAttribute.slug}`
            ];
            
            let variationValue = null;
            
            // Try to find the value using different key formats
            for (const key of possibleKeys) {
              if (firstVariation.attributes[key]) {
                variationValue = firstVariation.attributes[key];
                break;
              }
            }
            
            // If we still don't have a value, try to match by value
            if (!variationValue) {
              const variationValues = Object.values(firstVariation.attributes);
              // Find the first option that matches any variation value
              variationValue = productAttribute.options.find(option => 
                variationValues.some(value => 
                  value.toLowerCase() === option.toLowerCase() ||
                  value === option
                )
              );
            }
            
            if (variationValue) {
              firstVariationAttributes[productAttribute.name] = variationValue;
            } else {
              console.log(`✗ Could not find value for "${productAttribute.name}"`);
            }
          }
        });
      }
      
      setSelectedAttributes(firstVariationAttributes);
      
      // Update image if the first variation has its own image
      if (firstVariation.image) {
        const productImages = getProductImages();
        const variationImageIndex = productImages.findIndex(img => img.id === firstVariation.image?.id);
        if (variationImageIndex !== -1) {
          setSelectedImageIndex(variationImageIndex);
        }
      }
      
      // Force a re-render to update the button state
      setTimeout(() => {
        // re render
      }, 100);
    }
  }, [product]);

  // Fallback: If we have a selected variation but no attributes, try to enable the button anyway
  useEffect(() => {
    if (selectedVariation && product && product.type === 'variable') {
      const variation = product.variations?.find(v => v.id === selectedVariation);
      if (variation && Object.keys(selectedAttributes).length === 0) {
        // If we have a variation selected but no attributes, try to set them
        const fallbackAttributes: { [key: string]: string } = {};
        
        if (product.attributes) {
          product.attributes.forEach(attr => {
            if (attr.variation && attr.options.length > 0) {
              // Just use the first option as a fallback
              fallbackAttributes[attr.name] = attr.options[0];
            }
          });
        }
        
        if (Object.keys(fallbackAttributes).length > 0) {
          setSelectedAttributes(fallbackAttributes);
        }
      }
    }
  }, [selectedVariation, product, selectedAttributes]);
  
  const { user } = useAuth();
  const { addToCart, isLoading } = useCart();
  const { showCartSuccess, showError, clearAllNotifications } = useNotifications();

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

  // Function to process description content for proper line breaks
  const processDescriptionContent = (content: string) => {
    if (!content) return '';
    
    // Since WordPress API already processes content with wpautop(),
    // we just need to return it as-is for proper HTML rendering
    return content;
  };

  // Check if product is variable
  const isVariable = product?.type === 'variable';
  const hasVariations = product?.variations && product.variations.length > 0;

  // Ensure we have at least one image, including variation images
  const getProductImages = () => {
    if (!product) return [];
    
    let images = product.images && product.images.length > 0 ? [...product.images] : [];
    
    // Add variation images if they exist and aren't already included
    if (hasVariations) {
      product.variations?.forEach(variation => {
        if (variation.image && !images.find(img => img.id === variation.image?.id)) {
          images.push(variation.image);
        }
      });
    }
    
    // Fallback to placeholder if no images
    if (images.length === 0) {
      images = [{
        id: 1,
        src: '/images/products/placeholder.png',
        alt: product?.name || 'Product',
      }];
    }
    
    return images;
  };
  
  // Get current variation if selected
  const currentVariation = selectedVariation 
    ? product?.variations?.find(v => v.id === selectedVariation)
    : null;

  // Show loading state
  if (loading || !slug) {
    return (
      <div className="min-h-screen bg-black pt-16 sm:pt-20 pb-20 flex items-center justify-center">
        <div className="text-white text-lg">{t('common.loadingProduct')}</div>
      </div>
    );
  }

  // Show error state
  if (error || !product) {
    return (
      <div className="min-h-screen bg-black pt-16 sm:pt-20 pb-20 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-lg mb-4">{t('common.productNotFound')}</div>
          <button 
            onClick={() => router.push('/products')}
            className="text-brandGold hover:text-orange-300 underline"
          >
            {t('common.backToProducts')}
          </button>
        </div>
      </div>
    );
  }

  // Get pricing based on variation or main product
  const getCurrentPrice = () => {
    if (currentVariation) {
      // For variations, check if user is dealer and variation has dealer price
      if (user?.is_dealer && currentVariation.dealer_price) {
        return currentVariation.dealer_price;
      }
      // Otherwise use variation price or fallback to main product dealer price
      return currentVariation.price || 
             (user?.is_dealer && product.dealer_price ? product.dealer_price : product.price);
    }
    
    return user?.is_dealer && product.dealer_price 
      ? product.dealer_price 
      : (product.is_promotion && product.promotion_price ? product.promotion_price : product.price);
  };

  const getOriginalPrice = () => {
    if (currentVariation) {
      // For variations, show regular price unless dealer has special pricing
      if (user?.is_dealer && currentVariation.dealer_price) {
        return currentVariation.regular_price;
      }
      return currentVariation.regular_price || product.regular_price;
    }
    
    return user?.is_dealer && product.dealer_price 
      ? product.regular_price 
      : (product.is_promotion && product.promotion_price ? product.price : (product.sale_price ? product.regular_price : null));
  };

  const displayPrice = getCurrentPrice();
  const originalPrice = getOriginalPrice();

  const isOnSale = product.sale_price && product.sale_price !== product.regular_price;
  const isOnPromotion = product.is_promotion && product.promotion_price;
  
  const discountPercentage = isOnSale 
    ? Math.round(((parseFloat(product.regular_price) - parseFloat(product.sale_price)) / parseFloat(product.regular_price)) * 100)
    : 0;
    
  const promotionDiscountPercentage = isOnPromotion && product.promotion_price
    ? Math.round(((parseFloat(product.price) - parseFloat(product.promotion_price)) / parseFloat(product.price)) * 100)
    : 0;

  const handleAttributeChange = (attributeName: string, value: string) => {
    const newAttributes = { ...selectedAttributes, [attributeName]: value };
    setSelectedAttributes(newAttributes);
    
    // Find matching variation
    if (hasVariations) {
      const matchingVariation = product.variations?.find(variation => {       
        // Check if this variation matches the selected value
        const variationValues = Object.values(variation.attributes);
        const hasMatchingValue = variationValues.includes(value);
        
        return hasMatchingValue;
      });
            
      if (matchingVariation) {
        setSelectedVariation(matchingVariation.id);
        // Update image if variation has its own image
        if (matchingVariation.image) {
          const variationImageIndex = productImages.findIndex(img => img.id === matchingVariation.image?.id);
          if (variationImageIndex !== -1) {
            setSelectedImageIndex(variationImageIndex);
          }
        }
      } else {
        setSelectedVariation(null);
      }
    }
  };

  const isVariationSelected = () => {
    if (!isVariable || !hasVariations) return true;
    
    // If we have a selected variation ID, that's the primary indicator
    if (selectedVariation !== null) {
      // Check if all required attributes are selected
      const allSelected = product.attributes?.every(attr => {
        if (attr.variation) {
          const isSelected = selectedAttributes[attr.name] !== undefined && selectedAttributes[attr.name] !== '';

          return isSelected;
        }
        return true;
      }) || false;
      
      return allSelected;
    }
    
    return false;
  };

  const getStockStatus = () => {
    if (currentVariation) {
      return {
        status: currentVariation.stock_status,
        quantity: currentVariation.stock_quantity
      };
    }
    return {
      status: product.stock_status,
      quantity: product.stock_quantity
    };
  };

  const handleAddToCart = async () => {
    try {
      // For simple products, don't require variations
      if (!isVariable || !hasVariations) {
        await addToCart(product.id, quantity);
        
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
        return;
      }
      
      // Check if variation is required but not selected
      if (isVariable && !isVariationSelected()) {
        showError(t('common.error'), t('common.selectAllOptions'));
        return;
      }

      // Prepare variation data for variable products
      const variationData = isVariable && selectedVariation ? selectedAttributes : undefined;
      
      await addToCart(
        product.id, 
        quantity, 
        selectedVariation || undefined, 
        variationData
      );
      
      const productName = isVariable && currentVariation 
        ? `${product.name} - ${Object.values(selectedAttributes).join(', ')}`
        : product.name;
      
      showCartSuccess(productName, {
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
      console.error('Failed to add to cart:', error);
      showError(t('common.error'), t('common.cartError'));
    }
  };

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    const stockStatus = getStockStatus();
    // If no stock quantity is specified, allow reasonable quantities (up to 99)
    const maxQuantity = stockStatus.quantity && stockStatus.quantity > 0 ? stockStatus.quantity : 99;
    if (newQuantity >= 1 && newQuantity <= maxQuantity) {
      setQuantity(newQuantity);
    }
  };

  const productImages = getProductImages();
  
  // Generate breadcrumbs and FAQ data for SEO
  const breadcrumbs = generateBreadcrumbs(
    router.asPath,
    product.name,
    product.categories?.[0]?.name
  );
  
  const faqData = generateProductFAQ(
    product.name,
    product.categories?.[0]?.name || t('products.categories.healthSupplements')
  );

  return (
    <>
      {/* Enhanced SEO Head */}
      <ProductSEO 
        product={product}
        category={product.categories?.[0]?.name}
      />
      
      {/* Structured Data */}
      <ProductSchema product={product} />
      <BreadcrumbSchema breadcrumbs={breadcrumbs} />
      <FAQSchema faqs={faqData} />

      <div className="min-h-screen bg-black pt-16 sm:pt-20 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <motion.nav
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 sm:mb-8"
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
              <span className="text-white truncate">{product.name}</span>
            </div>
          </motion.nav>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* Product Images - Left Side */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              {/* Main Image */}
              <div className="aspect-square bg-gray-900 rounded-xl overflow-hidden shadow-2xl">
                <Image
                  src={productImages[selectedImageIndex].src}
                  alt={productImages[selectedImageIndex].alt}
                  width={600}
                  height={600}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Thumbnail Images */}
              {productImages.length > 1 && (
                <div className="flex space-x-3 justify-center md:justify-start">
                  {productImages.map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 flex-shrink-0 ${
                        selectedImageIndex === index 
                          ? 'border-orange-500 ring-2 ring-orange-500/30 scale-105' 
                          : 'border-gray-700 hover:border-gray-500'
                      }`}
                    >
                      <Image
                        src={image.src}
                        alt={image.alt}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Product Info - Right Side */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* Category & Badges */}
              <div className="flex flex-wrap items-center gap-3">
                {product.categories && product.categories.length > 0 && (
                  <span className="text-brandGold text-sm font-semibold uppercase tracking-wider">
                    {getCategoryName(product.categories[0])}
                  </span>
                )}
                {isOnPromotion && (
                  <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                    {product.promotion_label || `${t('products.promotion').toUpperCase()} -${promotionDiscountPercentage}%`}
                  </span>
                )}
                {!isOnPromotion && isOnSale && (
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                    -{discountPercentage}% {t('products.discount').toUpperCase()}
                  </span>
                )}
                {(user?.is_dealer && (product.dealer_price || (currentVariation?.dealer_price))) && (
                  <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                    {t('products.specialPrice').toUpperCase()}
                  </span>
                )}
              </div>

              {/* Product Name */}
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight">
                {product.name}
              </h1>

              {/* Short Description */}
              {product.short_description && (
                <div className="text-gray-300 text-base leading-relaxed">
                  <div 
                    className="product-description prose prose-invert prose-sm max-w-none [&>p]:mb-3 [&>div]:mb-3 [&>br]:leading-relaxed [&>ul]:mb-3 [&>ol]:mb-3 [&>li]:mb-1 [&>p:last-child]:mb-0 [&>div:last-child]:mb-0 [&>div:empty]:hidden"
                    dangerouslySetInnerHTML={{ __html: product.short_description }} 
                  />
                </div>
              )}

              {/* Price */}
              <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
                  <span className="text-3xl lg:text-4xl font-bold text-white">
                    MKD {parseFloat(displayPrice || '0').toLocaleString()}
                  </span>
                  {originalPrice && (
                    <span className="text-xl text-gray-500 line-through">
                      MKD {parseFloat(originalPrice).toLocaleString()}
                    </span>
                  )}
                </div>
                {(isOnSale || isOnPromotion) && (
                  <p className="text-green-400 text-sm font-medium mt-2">
                    {t('products.youSave')} MKD {isOnPromotion && product.promotion_price
                      ? (parseFloat(product.price) - parseFloat(product.promotion_price)).toLocaleString()
                      : (parseFloat(product.regular_price) - parseFloat(product.sale_price || '0')).toLocaleString()
                    }
                  </p>
                )}
              </div>

              {/* Product Variations */}
              {isVariable && hasVariations && product.attributes && (
                <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800 space-y-4">
                  <h3 className="text-white font-semibold text-lg">{t('products.selectOptions')}:</h3>
                  {product.attributes.map((attribute) => {
                    if (!attribute.variation) return null;
                    
                    return (
                      <div key={attribute.name} className="space-y-3">
                        <label className="text-white font-medium">
                          {attribute.name}:
                        </label>
                        <div className="flex flex-wrap gap-3">
                          {attribute.options.map((option) => (
                            <button
                              key={option}
                              onClick={() => handleAttributeChange(attribute.name, option)}
                              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-200 ${
                                selectedAttributes[attribute.name] === option
                                  ? 'bg-orange-500 border-orange-500 text-white shadow-lg transform scale-105'
                                  : 'bg-gray-800 border-gray-600 text-gray-300 hover:border-gray-500 hover:text-white hover:bg-gray-700'
                              }`}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Show selected variation info */}
                  {currentVariation && (
                    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                      <div className="text-sm text-gray-300">
                        <span className="font-medium text-white">{t('products.selected')}: </span>
                        {Object.entries(selectedAttributes).map(([attr, value], index) => (
                          <span key={attr}>
                            {value}
                            {index < Object.entries(selectedAttributes).length - 1 && ', '}
                          </span>
                        ))}
                      </div>
                      {currentVariation.stock_quantity && (
                        <div className="text-xs text-gray-400 mt-1">
                          {t('products.available')}: {currentVariation.stock_quantity} {t('products.pieces')}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Stock Status */}
              <div className="flex items-center space-x-3 bg-gray-900/50 rounded-xl p-4 border border-gray-800">
                <div className={`w-3 h-3 rounded-full ${
                  getStockStatus().status === 'instock' ? 'bg-green-400' : 'bg-red-400'
                }`}></div>
                <span className={`text-sm font-medium ${
                  getStockStatus().status === 'instock' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {getStockStatus().status === 'instock' 
                    ? `${t('products.inStock')} ${getStockStatus().quantity ? `(${getStockStatus().quantity} ${t('products.pieces')})` : ''}`
                    : t('products.outOfStock')
                  }
                </span>
              </div>

              {/* Quantity & Add to Cart */}
              {getStockStatus().status === 'instock' && (
                <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800 space-y-6">
                  <div className="space-y-3">
                    <span className="text-white font-semibold text-lg">{t('products.quantity')}:</span>
                    <div className="flex items-center justify-center sm:justify-start border border-gray-600 rounded-lg w-fit bg-gray-800">
                      <button
                        onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= 1}
                        className="p-3 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed min-w-[48px] min-h-[48px] flex items-center justify-center hover:bg-gray-700 transition-colors rounded-l-lg"
                      >
                        <FiMinus size={18} />
                      </button>
                      <span className="px-6 py-3 text-white font-semibold min-w-[80px] text-center text-lg">
                        {quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(1)}
                        disabled={quantity >= (getStockStatus().quantity && getStockStatus().quantity > 0 ? getStockStatus().quantity : 99)}
                        className="p-3 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed min-w-[48px] min-h-[48px] flex items-center justify-center hover:bg-gray-700 transition-colors rounded-r-lg"
                      >
                        <FiPlus size={18} />
                      </button>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddToCart}
                    disabled={isLoading || !isVariationSelected()}
                    className="w-full text-white py-4 text-lg font-bold flex items-center justify-center space-x-3 disabled:opacity-50 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                    style={{ 
                      backgroundColor: isVariationSelected() ? '#D4962E' : '#6b7280',
                      border: 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (!isLoading && isVariationSelected()) e.currentTarget.style.backgroundColor = '#dd6b20';
                    }}
                    onMouseLeave={(e) => {
                      if (!isLoading && isVariationSelected()) e.currentTarget.style.backgroundColor = '#D4962E';
                    }}
                  >
                    <FiShoppingCart size={20} />
                    <span>
                      {isLoading 
                        ? t('products.addingToCart')
                        : !isVariationSelected() 
                          ? t('products.selectOptions')
                          : t('products.addToCart')
                      }
                    </span>
                  </motion.button>
                </div>
              )}
            </motion.div>
          </div>

          {/* Product Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12 sm:mt-16"
          >
            <div className="bg-gray-900 rounded-lg p-4 sm:p-6 lg:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">{t('products.productDetails')}</h2>
              <div 
                className="product-description text-gray-300 text-sm sm:text-base [&>p]:mb-3 [&>div]:mb-3 [&>br]:leading-relaxed [&>ul]:mb-3 [&>ol]:mb-3 [&>li]:mb-1 [&>p:last-child]:mb-0 [&>div:last-child]:mb-0 [&>div:empty]:hidden"
                dangerouslySetInnerHTML={{ __html: processDescriptionContent(product.description || product.short_description || t('products.noDetailsAvailable')) }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default ProductDetailPage;