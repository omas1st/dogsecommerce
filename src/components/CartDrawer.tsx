import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { X, Plus, Minus, Trash2, Tag, Gift, ArrowRight, ShieldCheck, ShoppingBag } from 'lucide-react';

interface CartDrawerProps {
  onProceedToCheckout: () => void;
  onNavigateHome?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  onProceedToCheckout,
  onNavigateHome,
  isOpen: propIsOpen,
  onClose: propOnClose,
}) => {
  const { items, summary, isCartOpen, setIsCartOpen, updateQuantity, removeItem, applyCoupon, applyGiftCard, isLoading } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [giftCardCode, setGiftCardCode] = useState('');
  const [couponMsg, setCouponMsg] = useState<{ text: string; isError?: boolean } | null>(null);
  const [giftMsg, setGiftMsg] = useState<{ text: string; isError?: boolean } | null>(null);

  const activeIsOpen = propIsOpen !== undefined ? propIsOpen : isCartOpen;
  const handleClose = () => {
    if (propOnClose) propOnClose();
    setIsCartOpen(false);
  };

  if (!activeIsOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    try {
      const msg = await applyCoupon(couponCode.trim());
      setCouponMsg({ text: msg, isError: false });
      setCouponCode('');
    } catch (err: any) {
      setCouponMsg({ text: err.message || 'Invalid coupon.', isError: true });
    }
  };

  const handleApplyGiftCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!giftCardCode.trim()) return;
    try {
      const msg = await applyGiftCard(giftCardCode.trim());
      setGiftMsg({ text: msg, isError: false });
      setGiftCardCode('');
    } catch (err: any) {
      setGiftMsg({ text: err.message || 'Invalid gift card.', isError: true });
    }
  };

  const freeShippingThreshold = 49.0;
  const currentSubtotal = summary?.subtotal || 0;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - currentSubtotal);
  const freeShippingPercent = Math.min(100, Math.round((currentSubtotal / freeShippingThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={handleClose}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-[#FAF9F6] shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-5 border-b border-[#E8E6DF] bg-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag size={20} className="text-[#0E5E58]" />
              <h2 className="text-lg font-bold text-[#1E232A]">Your Shopping Cart</h2>
              <span className="rounded-full bg-[#F4F2EB] px-2 py-0.5 text-xs font-semibold text-[#525B67]">
                {summary?.itemsCount || 0}
              </span>
            </div>
            <button
              onClick={handleClose}
              className="rounded-lg p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Free Shipping Progress */}
          <div className="bg-[#F4F8F7] px-5 py-3 border-b border-[#E2EFEB]">
            <div className="flex items-center justify-between text-xs font-medium text-[#1E232A]">
              {remainingForFreeShipping > 0 ? (
                <span>
                  Add <strong className="text-[#0E5E58]">${remainingForFreeShipping.toFixed(2)}</strong> more for <strong>FREE US Delivery</strong>
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[#0E5E58] font-bold">
                  <ShieldCheck size={14} /> You unlocked Free US Ground Shipping!
                </span>
              )}
              <span className="text-gray-500 font-semibold">{freeShippingPercent}%</span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#D4E8E4]">
              <div
                className="h-full bg-[#0E5E58] transition-all duration-300 rounded-full"
                style={{ width: `${freeShippingPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Items Scrollable List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16">
                <div className="mx-auto w-16 h-16 rounded-full bg-[#F0EFEA] flex items-center justify-center text-gray-400 mb-3">
                  <ShoppingBag size={28} />
                </div>
                <h3 className="font-serif-brand text-lg font-semibold text-[#1E232A]">Your cart is empty</h3>
                <p className="mt-1 text-sm text-[#6B7280] max-w-xs mx-auto">
                  Explore veterinarian-grade nutrition, orthopedic beds, and certified pre-owned gear for your dog.
                </p>
                <button
                  onClick={() => {
                    handleClose();
                    if (onNavigateHome) onNavigateHome();
                  }}
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#0E5E58] px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#0B4A45] transition-colors"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={`${item.productId}-${item.variantId || 'base'}`}
                  className="flex gap-3 rounded-xl border border-[#E8E6DF] bg-white p-3.5 shadow-xs"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80';
                    }}
                    className="h-20 w-20 rounded-lg object-cover bg-gray-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="text-xs font-semibold text-[#1E232A] line-clamp-2 leading-snug">
                          {item.title}
                        </h4>
                        <button
                          onClick={() => removeItem(item.productId, item.variantId)}
                          className="text-gray-400 hover:text-[#E05338] transition-colors p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {item.sellerName && item.ownerType === 'seller' && (
                        <span className="text-[10px] text-gray-500 font-medium">
                          Sold by {item.sellerName}
                        </span>
                      )}
                      {item.ownerType === 'resale_platform' && (
                        <span className="text-[10px] text-[#0E5E58] font-bold">
                          Certified Pre-Owned
                        </span>
                      )}
                      {item.isSubscription && (
                        <span className="inline-block text-[10px] bg-[#E8F3F1] text-[#0E5E58] font-semibold px-1.5 py-0.5 rounded mt-0.5">
                          Autoship ({item.subscriptionFrequency || 'monthly'})
                        </span>
                      )}
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      {/* Quantity Controls */}
                      <div className="flex items-center rounded-lg border border-gray-200 bg-[#FAF9F6]">
                        <button
                          onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                          className="p-1 text-gray-500 hover:text-gray-800"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-7 text-center text-xs font-semibold text-gray-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                          className="p-1 text-gray-500 hover:text-gray-800"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      {/* Total */}
                      <span className="text-xs font-bold text-[#1E232A]">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Coupons & Gift Card Inputs */}
            {items.length > 0 && (
              <div className="pt-2 space-y-3">
                {/* Coupon form */}
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Promo code (e.g. WELCOME15)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-8 pr-3 text-xs uppercase tracking-wider focus:border-[#0E5E58] focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="rounded-lg bg-[#24303E] px-3.5 py-2 text-xs font-semibold text-white hover:bg-black transition-colors"
                  >
                    Apply
                  </button>
                </form>
                {couponMsg && (
                  <p className={`text-[11px] ${couponMsg.isError ? 'text-red-600' : 'text-[#0E5E58] font-medium'}`}>
                    {couponMsg.text}
                  </p>
                )}

                {/* Gift card form */}
                <form onSubmit={handleApplyGiftCard} className="flex gap-2">
                  <div className="relative flex-1">
                    <Gift size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Gift card (e.g. HND-GIFT-50)"
                      value={giftCardCode}
                      onChange={(e) => setGiftCardCode(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-8 pr-3 text-xs uppercase tracking-wider focus:border-[#0E5E58] focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="rounded-lg bg-gray-200 px-3.5 py-2 text-xs font-semibold text-[#1E232A] hover:bg-gray-300 transition-colors"
                  >
                    Redeem
                  </button>
                </form>
                {giftMsg && (
                  <p className={`text-[11px] ${giftMsg.isError ? 'text-red-600' : 'text-[#0E5E58] font-medium'}`}>
                    {giftMsg.text}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Drawer Footer with Calculation */}
          {items.length > 0 && summary && (
            <div className="border-t border-[#E8E6DF] bg-white p-5 space-y-3">
              <div className="space-y-1.5 text-xs text-[#525B67]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#1E232A]">${summary.subtotal.toFixed(2)}</span>
                </div>
                {summary.discount > 0 && (
                  <div className="flex justify-between text-[#0E5E58]">
                    <span>Promotional Discount ({summary.appliedCouponCode})</span>
                    <span>-${summary.discount.toFixed(2)}</span>
                  </div>
                )}
                {summary.giftCardDeduction > 0 && (
                  <div className="flex justify-between text-[#0E5E58]">
                    <span>Gift Card Credit ({summary.appliedGiftCardCode})</span>
                    <span>-${summary.giftCardDeduction.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Estimated Shipping</span>
                  <span>{summary.shippingCost === 0 ? <strong className="text-[#0E5E58]">FREE</strong> : `$${summary.shippingCost.toFixed(2)}`}</span>
                </div>
                <div className="pt-2 border-t border-gray-100 flex justify-between text-sm font-bold text-[#1E232A]">
                  <span>Estimated Total</span>
                  <span className="text-base text-[#0E5E58]">${summary.total.toFixed(2)}</span>
                </div>
              </div>

              <button
                id="checkout-cta-btn"
                onClick={() => {
                  setIsCartOpen(false);
                  onProceedToCheckout();
                }}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#0E5E58] py-3 text-sm font-semibold text-white shadow-md hover:bg-[#0B4A45] active:scale-98 transition-all"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={16} />
              </button>

              <p className="text-[11px] text-center text-gray-500 flex items-center justify-center gap-1.5">
                <ShieldCheck size={14} className="text-[#0E5E58]" />
                Guest checkout supported. No account registration required.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
