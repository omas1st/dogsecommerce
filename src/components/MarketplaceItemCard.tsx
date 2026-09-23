import React, { useState } from 'react';
import { MarketplaceItem } from '../data/marketplaceCatalog';
import { useCart } from '../context/CartContext';
import { Star, ShoppingBag, Eye, Check, Sparkles } from 'lucide-react';

interface MarketplaceItemCardProps {
  item: MarketplaceItem;
  onQuickView: (item: MarketplaceItem) => void;
  onSelectProduct?: (product: any) => void;
}

export const MarketplaceItemCard: React.FC<MarketplaceItemCardProps> = ({
  item,
  onQuickView,
}) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const handleAdd = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAdding(true);
    try {
      await addToCart(item.id, item.variants?.[0]?.id, quantity, false, undefined, item);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2200);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAdding(false);
    }
  };

  const discountPercent =
    item.compareAtPrice && item.compareAtPrice > item.price
      ? Math.round(((item.compareAtPrice - item.price) / item.compareAtPrice) * 100)
      : null;

  return (
    <div
      id={`marketplace-item-${item.id}`}
      onClick={() => onQuickView(item)}
      className="group relative flex flex-col bg-white rounded-2xl border border-[#E8E6DF] overflow-hidden hover:shadow-xl hover:border-[#0E5E58]/40 transition-all duration-300 cursor-pointer"
    >
      {/* Product Image Container */}
      <div className="relative aspect-4/3 w-full bg-[#F4F4F0] overflow-hidden">
        <img
          src={item.images[0]}
          alt={item.title}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80';
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1 pointer-events-none">
          {/* Modeled on dog badge */}
          <span className="inline-flex items-center gap-1 rounded-md bg-white/95 px-2 py-0.5 text-[10px] font-bold text-[#1E232A] shadow-xs backdrop-blur-xs border border-gray-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Modeled on Dog
          </span>

          <span className="rounded-md bg-[#E05338] px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
            60% OFF Online
          </span>
        </div>

        {/* Quick View Button Hover Overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3.5 py-1.5 text-xs font-bold text-gray-900 shadow-md backdrop-blur-xs">
            <Eye size={14} /> Quick View
          </span>
        </div>
      </div>

      {/* Petco-style Choices Indicator */}
      <div className="px-4 py-1.5 flex items-center justify-between text-[11px] text-gray-500 font-medium bg-gray-50/70 border-b border-gray-100">
        <span className="text-[#0E5E58] font-bold">+ More Choices Available</span>
        <span className="text-[10px] text-gray-500 font-medium">Shape: {item.shape}</span>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        {/* Type Badge & Category */}
        <div className="flex items-center justify-between gap-2 mb-1.5 text-[11px]">
          <span className="inline-block font-semibold text-[#0E5E58] bg-[#F4F8F7] px-2 py-0.5 rounded-md truncate max-w-[70%]">
            Type: {item.itemType}
          </span>
          <span className="text-gray-600 font-medium text-[10px] shrink-0">
            {item.dimensions || 'Standard'}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-sm text-[#1E232A] line-clamp-2 min-h-[2.5rem] group-hover:text-[#0E5E58] transition-colors leading-snug">
          {item.title}
        </h3>

        {/* Rating and Reviews */}
        <div className="flex items-center gap-1.5 my-2">
          <div className="flex items-center text-amber-500">
            <Star size={13} fill="currentColor" />
          </div>
          <span className="text-xs font-bold text-gray-800">{item.rating}</span>
          <span className="text-[11px] text-gray-600">({item.reviewsCount})</span>
        </div>

        {/* Price & Quantity & Add To Cart */}
        <div className="mt-auto pt-3 border-t border-gray-100">
          <div className="flex items-baseline justify-between mb-3">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-base font-extrabold text-[#0E5E58]">
                ${item.price.toFixed(2)}
              </span>
              {item.compareAtPrice && item.compareAtPrice > item.price && (
                <span className="text-xs text-gray-400 line-through font-medium">
                  ${item.compareAtPrice.toFixed(2)}
                </span>
              )}
              <span className="text-[10px] font-bold text-[#E05338] bg-rose-50 px-1.5 py-0.5 rounded">
                -60%
              </span>
            </div>
            <span className="text-[11px] font-semibold text-emerald-800">
              In Stock
            </span>
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-2">
            {/* Quantity control */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center rounded-lg border border-gray-200 bg-gray-50 text-xs"
            >
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-2 py-1.5 text-gray-600 hover:text-black font-bold disabled:opacity-30"
                disabled={quantity <= 1}
              >
                -
              </button>
              <span className="px-1.5 font-bold text-gray-800 min-w-[1.2rem] text-center">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="px-2 py-1.5 text-gray-600 hover:text-black font-bold"
              >
                +
              </button>
            </div>

            {/* Add to Cart Button */}
            <button
              id={`add-btn-${item.id}`}
              type="button"
              onClick={handleAdd}
              disabled={isAdding}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 px-3 text-xs font-bold transition-all shadow-xs active:scale-95 ${
                isAdded
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#0E5E58] text-white hover:bg-[#0B4A45]'
              }`}
            >
              {isAdded ? (
                <>
                  <Check size={14} /> Added!
                </>
              ) : isAdding ? (
                <span>Adding...</span>
              ) : (
                <>
                  <ShoppingBag size={14} /> Add to Cart
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
