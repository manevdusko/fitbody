import { useState, useEffect } from 'react';
import { Cart } from '@/types';
import { cartApi } from '@/utils/api';

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  addToCart: (productId: number, quantity?: number, variationId?: number, variationData?: { [key: string]: string }) => Promise<void>;
  updateCartItem: (key: string, quantity: number) => Promise<void>;
  removeFromCart: (key: string) => Promise<void>;
  clearCart: () => void;
  refreshCart: () => Promise<void>;
  isLoading: boolean;
}

// Helper function to calculate shipping locally as fallback
const calculateLocalShipping = (subtotal: number) => {
  const numericSubtotal = typeof subtotal === 'string' ? parseFloat(subtotal) : subtotal;
  const validSubtotal = isNaN(numericSubtotal) ? 0 : numericSubtotal;
  
  const result = {
    cost: validSubtotal < 3000 ? 150 : 0,
    label: validSubtotal < 3000 ? 'Стандардна достава' : 'Бесплатна достава',
    description: validSubtotal < 3000 ? 
      'Достава 150 ден. Бесплатна достава за нарачки над 3.000 ден.' : 
      'Бесплатна достава за нарачки над 3.000 ден.'
  };
  
  return result;
};

export const useCartState = () => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const cartData = await cartApi.getCart();
      
      // Always calculate shipping locally using the cart data we just received
      const subtotal = parseFloat(cartData.totals?.subtotal || '0');
      const localShipping = calculateLocalShipping(subtotal);
      
      // Try to get shipping info from API, but use local calculation as primary
      let shippingData = { shipping: localShipping };
      try {
        const apiShippingData = await cartApi.getShipping();
        // Only use API data if it seems valid (has a reasonable subtotal)
        if (apiShippingData.subtotal && apiShippingData.subtotal > 0) {
          shippingData = apiShippingData;
        }
      } catch (shippingError) {
        console.warn('Failed to load shipping info, using local calculation:', shippingError);
      }
      
      setCart({
        ...cartData,
        shipping: shippingData.shipping
      });
    } catch (error) {
      console.error('Failed to load cart:', error);
      // Initialize empty cart if API fails
      setCart({
        items: [],
        totals: {
          subtotal: '0',
          total: '0',
          currency: 'MKD',
        },
        shipping: calculateLocalShipping(0)
      });
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: number, quantity: number = 1, variationId?: number, variationData?: { [key: string]: string }) => {
    try {
      setIsLoading(true);
      const updatedCart = await cartApi.addToCart({ productId, quantity, variationId, variationData });
      
      // Always calculate shipping locally using the updated cart data
      const subtotal = parseFloat(updatedCart.totals?.subtotal || '0');
      const localShipping = calculateLocalShipping(subtotal);
      
      setCart({
        ...updatedCart,
        shipping: localShipping
      });
      
      // Show success notification
      if (typeof window !== 'undefined') {
        // You can integrate with a toast library here
      }
    } catch (error) {
      console.error('Failed to add to cart:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateCartItem = async (key: string, quantity: number) => {
    try {
      setIsLoading(true);
      const updatedCart = await cartApi.updateCartItem(key, quantity);
      
      // Always calculate shipping locally using the updated cart data
      const subtotal = parseFloat(updatedCart.totals?.subtotal || '0');
      const localShipping = calculateLocalShipping(subtotal);
      
      setCart({
        ...updatedCart,
        shipping: localShipping
      });
    } catch (error) {
      console.error('Failed to update cart item:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (key: string) => {
    try {
      setIsLoading(true);
      const updatedCart = await cartApi.removeFromCart(key);
      
      // Always calculate shipping locally using the updated cart data
      const subtotal = parseFloat(updatedCart.totals?.subtotal || '0');
      const localShipping = calculateLocalShipping(subtotal);
      
      setCart({
        ...updatedCart,
        shipping: localShipping
      });
    } catch (error) {
      console.error('Failed to remove from cart:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = () => {
    setCart({
      items: [],
      totals: {
        subtotal: '0',
        total: '0',
        currency: 'MKD',
      },
    });
  };

  const refreshCart = async () => {
    try {
      const cartData = await cartApi.getCart();
      
      // Always calculate shipping locally using the cart data
      const subtotal = parseFloat(cartData.totals?.subtotal || '0');
      const localShipping = calculateLocalShipping(subtotal);
      
      setCart({
        ...cartData,
        shipping: localShipping
      });
    } catch (error) {
      console.error('Failed to refresh cart:', error);
      // Initialize empty cart if API fails
      setCart({
        items: [],
        totals: {
          subtotal: '0',
          total: '0',
          currency: 'MKD',
        },
        shipping: calculateLocalShipping(0)
      });
    }
  };

  return {
    cart,
    loading,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    refreshCart,
    isLoading,
  };
};