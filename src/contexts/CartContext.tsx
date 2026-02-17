import React, { createContext, useContext } from 'react';
import { useCartState } from '@/hooks/useCart';
import { Cart } from '@/types';

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

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: React.ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const cartState = useCartState();

  return (
    <CartContext.Provider value={cartState}>
      {children}
    </CartContext.Provider>
  );
};