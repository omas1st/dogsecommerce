import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, CartSummary } from '../types';
import { apiRequest } from '../services/api';
import { useAuth } from './AuthContext';

interface CartContextType {
  items: CartItem[];
  summary: CartSummary | null;
  isLoading: boolean;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (productId: string, variantId?: string, quantity?: number, isSub?: boolean, freq?: string, productData?: any) => Promise<void>;
  updateQuantity: (productId: string, variantId: string | undefined, qty: number) => Promise<void>;
  removeItem: (productId: string, variantId?: string) => Promise<void>;
  applyCoupon: (code: string) => Promise<string>;
  applyGiftCard: (code: string) => Promise<string>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [summary, setSummary] = useState<CartSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  const refreshCart = async () => {
    try {
      const data = await apiRequest<{ success: boolean; cart: { items: CartItem[] }; summary: CartSummary }>('/cart');
      setItems(data.cart?.items || []);
      setSummary(data.summary);
    } catch (err) {
      console.error('Failed to load cart', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
  }, [user]);

  const addToCart = async (
    productId: string,
    variantId?: string,
    quantity: number = 1,
    isSub: boolean = false,
    freq?: string,
    productData?: any
  ) => {
    setIsLoading(true);
    try {
      const data = await apiRequest<{ success: boolean; cart: { items: CartItem[] }; summary: CartSummary }>('/cart/items', {
        method: 'POST',
        body: JSON.stringify({
          productId,
          variantId,
          quantity,
          isSubscription: isSub,
          subscriptionFrequency: freq,
          productData,
        }),
      });
      setItems(data.cart.items);
      setSummary(data.summary);
      setIsCartOpen(true);
    } catch (err: any) {
      console.warn('Backend cart sync note, applying local item addition:', err);
      // Optimistic addition if backend request had issues
      if (productData) {
        const newItem: CartItem = {
          productId: productData.id,
          variantId,
          title: productData.title,
          slug: productData.slug,
          image: productData.images?.[0] || '',
          price: productData.price,
          originalPrice: productData.compareAtPrice || productData.price,
          quantity,
          sellerName: productData.brand || 'Hound & Harbor',
          ownerType: 'platform',
          isSubscription: isSub,
          subscriptionFrequency: freq,
          savedForLater: false,
        };
        setItems((prev) => {
          const idx = prev.findIndex((it) => it.productId === productId && it.variantId === variantId);
          if (idx > -1) {
            const copy = [...prev];
            copy[idx].quantity += quantity;
            return copy;
          }
          return [...prev, newItem];
        });
      }
      setIsCartOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (productId: string, variantId: string | undefined, qty: number) => {
    try {
      const data = await apiRequest<{ success: boolean; cart: { items: CartItem[] }; summary: CartSummary }>('/cart/items', {
        method: 'PUT',
        body: JSON.stringify({ productId, variantId, quantity: qty }),
      });
      setItems(data.cart.items);
      setSummary(data.summary);
    } catch (err: any) {
      console.error(err);
    }
  };

  const removeItem = async (productId: string, variantId?: string) => {
    try {
      const data = await apiRequest<{ success: boolean; cart: { items: CartItem[] }; summary: CartSummary }>('/cart/items', {
        method: 'DELETE',
        body: JSON.stringify({ productId, variantId }),
      });
      setItems(data.cart.items);
      setSummary(data.summary);
    } catch (err: any) {
      console.error(err);
    }
  };

  const applyCoupon = async (code: string): Promise<string> => {
    const data = await apiRequest<{ success: boolean; message: string; cart: { items: CartItem[] }; summary: CartSummary }>('/cart/coupon', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
    setItems(data.cart.items);
    setSummary(data.summary);
    return data.message;
  };

  const applyGiftCard = async (code: string): Promise<string> => {
    const data = await apiRequest<{ success: boolean; message: string; cart: { items: CartItem[] }; summary: CartSummary }>('/cart/gift-card', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
    setItems(data.cart.items);
    setSummary(data.summary);
    return data.message;
  };

  return (
    <CartContext.Provider
      value={{
        items,
        summary,
        isLoading,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateQuantity,
        removeItem,
        applyCoupon,
        applyGiftCard,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
