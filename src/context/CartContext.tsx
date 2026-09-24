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

const computeSummary = (cartItems: CartItem[], existingSummary?: CartSummary | null): CartSummary => {
  const activeItems = cartItems.filter((i) => !i.savedForLater);
  const subtotal = Number(activeItems.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity || 1), 0).toFixed(2));
  const discount = existingSummary?.discount || 0;
  const taxableSubtotal = Math.max(0, subtotal - discount);
  const shippingCost = taxableSubtotal >= 49.0 || activeItems.length === 0 ? 0 : 5.99;
  const taxRate = 0.07;
  const taxAmount = Number((taxableSubtotal * taxRate).toFixed(2));
  const preGiftCardTotal = Number((taxableSubtotal + shippingCost + taxAmount).toFixed(2));
  const giftCardDeduction = existingSummary?.giftCardDeduction || 0;
  const total = activeItems.length === 0 ? 0 : Math.max(0, Number((preGiftCardTotal - giftCardDeduction).toFixed(2)));

  return {
    subtotal,
    discount,
    appliedCouponCode: existingSummary?.appliedCouponCode,
    appliedGiftCardCode: existingSummary?.appliedGiftCardCode,
    giftCardDeduction,
    shippingCost,
    shippingOptions: existingSummary?.shippingOptions || [
      { id: 'standard', name: 'Standard US Ground', description: '3-5 business days', price: shippingCost, estimatedDeliveryDays: '3-5' },
    ],
    taxAmount,
    taxRate,
    total,
    itemsCount: activeItems.reduce((acc, i) => acc + (i.quantity || 1), 0),
  };
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('hound_cart_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [summary, setSummary] = useState<CartSummary | null>(() => {
    try {
      const saved = localStorage.getItem('hound_cart_items');
      const parsed = saved ? JSON.parse(saved) : [];
      return parsed.length > 0 ? computeSummary(parsed) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Sync items to localStorage and compute fallback summary
  useEffect(() => {
    try {
      localStorage.setItem('hound_cart_items', JSON.stringify(items));
    } catch (e) {
      console.error(e);
    }
    if (items.length > 0) {
      setSummary((prev) => computeSummary(items, prev));
    } else {
      setSummary(computeSummary([], null));
    }
  }, [items]);

  const refreshCart = async () => {
    try {
      const data = await apiRequest<{ success: boolean; cart: { items: CartItem[] }; summary: CartSummary }>('/cart');
      if (data && data.cart?.items) {
        setItems(data.cart.items);
        setSummary(data.summary || computeSummary(data.cart.items));
      }
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
      if (data && data.cart?.items) {
        setItems(data.cart.items);
        setSummary(data.summary || computeSummary(data.cart.items));
      }
      setIsCartOpen(true);
    } catch (err: any) {
      console.warn('Backend cart sync note, applying local item addition:', err);
      // Optimistic addition if backend request had issues
      if (productData) {
        const newItem: CartItem = {
          productId: productData.id,
          variantId,
          title: productData.title || productData.name,
          slug: productData.slug || `item-${productData.id}`,
          image: productData.images?.[0] || productData.photoUrl || productData.image || '',
          price: Number(productData.price) || 0,
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
          let updatedList: CartItem[];
          if (idx > -1) {
            updatedList = [...prev];
            updatedList[idx].quantity += quantity;
          } else {
            updatedList = [...prev, newItem];
          }
          setSummary(computeSummary(updatedList, summary));
          return updatedList;
        });
      }
      setIsCartOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (productId: string, variantId: string | undefined, qty: number) => {
    // Optimistically update
    if (qty <= 0) {
      setItems((prev) => prev.filter((it) => !(it.productId === productId && it.variantId === variantId)));
    } else {
      setItems((prev) =>
        prev.map((it) => (it.productId === productId && it.variantId === variantId ? { ...it, quantity: qty } : it))
      );
    }

    try {
      const data = await apiRequest<{ success: boolean; cart: { items: CartItem[] }; summary: CartSummary }>('/cart/items', {
        method: 'PUT',
        body: JSON.stringify({ productId, variantId, quantity: qty }),
      });
      if (data && data.cart?.items) {
        setItems(data.cart.items);
        setSummary(data.summary || computeSummary(data.cart.items));
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const removeItem = async (productId: string, variantId?: string) => {
    // Optimistically remove
    setItems((prev) => prev.filter((it) => !(it.productId === productId && it.variantId === variantId)));

    try {
      const data = await apiRequest<{ success: boolean; cart: { items: CartItem[] }; summary: CartSummary }>('/cart/items', {
        method: 'DELETE',
        body: JSON.stringify({ productId, variantId }),
      });
      if (data && data.cart?.items) {
        setItems(data.cart.items);
        setSummary(data.summary || computeSummary(data.cart.items));
      }
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
    setSummary(data.summary || computeSummary(data.cart.items));
    return data.message;
  };

  const applyGiftCard = async (code: string): Promise<string> => {
    const data = await apiRequest<{ success: boolean; message: string; cart: { items: CartItem[] }; summary: CartSummary }>('/cart/gift-card', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
    setItems(data.cart.items);
    setSummary(data.summary || computeSummary(data.cart.items));
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
