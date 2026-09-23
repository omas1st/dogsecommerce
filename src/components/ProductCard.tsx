import React from 'react';
import { Product } from '../types';
import { Rating } from './Rating';
import { useCart } from '../context/CartContext';
import { ShoppingBag, Sparkles, ShieldCheck, Repeat } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelect?: (product: Product) => void;
  recommendationReason?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect, recommendationReason }) => {
  const { addToCart, isLoading } = useCart();

  if (!product || !product.id) {
    return null;
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product.id, product.variants?.[0]?.id, 1);
  };

  const isResale = product.ownerType === 'resale_platform';
  const isSeller = product.ownerType === 'seller';
  const discountPercent = product.compareAtPrice && product.compareAtPrice > product.price
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  return (
    <div
      id={`product-card-${product.id}`}
      onClick={() => onSelect && onSelect(product)}
      className="group flex flex-col justify-between rounded-xl bg-white border border-[#E8E6DF] overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-[#0E5E58]/30 cursor-pointer"
    >
      {/* Top Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-[#F4F2EB]">
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80'}
          alt={product.title}
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Ownership / Origin Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {isResale && (
            <span className="inline-flex items-center gap-1 rounded-md bg-[#0E5E58] px-2 py-0.5 text-[11px] font-semibold text-white shadow-sm">
              <ShieldCheck size={12} /> Certified Pre-Owned
            </span>
          )}
          {isSeller && (
            <span className="inline-flex items-center gap-1 rounded-md bg-[#24303E] px-2 py-0.5 text-[11px] font-medium text-white shadow-sm">
              Sold by {product.sellerName || 'Partner Artisan'}
            </span>
          )}
          {!isResale && !isSeller && (
            <span className="inline-flex items-center gap-1 rounded-md bg-white/90 backdrop-blur-xs border border-gray-200 px-2 py-0.5 text-[11px] font-medium text-[#1E232A] shadow-xs">
              Sold by Hound & Harbor
            </span>
          )}
          {discountPercent > 0 && (
            <span className="inline-flex items-center rounded-md bg-[#E05338] px-2 py-0.5 text-[11px] font-bold text-white shadow-sm">
              Save {discountPercent}%
            </span>
          )}
        </div>

        {/* Subscription perk badge */}
        {product.isSubscriptionEligible && (
          <div className="absolute bottom-2.5 left-2.5 z-10">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-[#0E5E58] shadow-sm border border-[#0E5E58]/20">
              <Repeat size={12} /> Subscribe & Save {product.subscriptionDiscountPercentage || 10}%
            </span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="flex flex-col flex-1 p-4">
        {/* Recommendation reason if present */}
        {recommendationReason && (
          <div className="mb-2 flex items-center gap-1 text-[11px] font-medium text-[#0E5E58] bg-[#E8F3F1] px-2 py-1 rounded-md">
            <Sparkles size={12} className="shrink-0 text-[#0E5E58]" />
            <span className="truncate">{recommendationReason}</span>
          </div>
        )}

        {/* Brand & Category */}
        <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">
          {product.brand}
        </div>

        {/* Title */}
        <h3 className="mt-1 font-sans text-sm font-semibold text-[#1E232A] line-clamp-2 leading-snug group-hover:text-[#0E5E58] transition-colors">
          {product.title}
        </h3>

        {/* Rating */}
        <div className="mt-2">
          <Rating value={product.rating} count={product.reviewsCount} />
        </div>

        {/* Suitability Pills */}
        <div className="mt-2.5 flex flex-wrap gap-1">
          {product.suitability.lifeStages.slice(0, 2).map((st) => (
            <span key={st} className="rounded bg-[#F4F3EE] px-1.5 py-0.5 text-[10px] font-medium text-[#525B67] capitalize">
              {st.replace('_', ' ')}
            </span>
          ))}
          {product.tags.slice(0, 1).map((t) => (
            <span key={t} className="rounded bg-[#F4F3EE] px-1.5 py-0.5 text-[10px] font-medium text-[#525B67]">
              {t}
            </span>
          ))}
        </div>

        {/* Price & Add to Cart Footer */}
        <div className="mt-4 pt-3 border-t border-[#F0EFEA] flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-[#1E232A]">
                ${product.price.toFixed(2)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-xs text-gray-400 line-through">
                  ${product.compareAtPrice.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          <button
            id={`add-to-cart-btn-${product.id}`}
            type="button"
            onClick={handleAddToCart}
            disabled={isLoading || product.stock <= 0}
            className="flex items-center gap-1.5 rounded-lg bg-[#1E232A] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#0E5E58] active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <ShoppingBag size={14} />
            <span>{product.stock <= 0 ? 'Sold Out' : 'Add'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
