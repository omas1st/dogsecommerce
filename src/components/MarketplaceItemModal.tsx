import React, { useState } from 'react';
import { MarketplaceItem } from '../data/marketplaceCatalog';
import { useCart } from '../context/CartContext';
import { X, Star, ShoppingBag, ShieldCheck, Truck, RotateCcw, Check, Sparkles, Layers, Box } from 'lucide-react';

interface MarketplaceItemModalProps {
  item: MarketplaceItem | null;
  onClose: () => void;
}

export const MarketplaceItemModal: React.FC<MarketplaceItemModalProps> = ({ item, onClose }) => {
  if (!item) return null;

  const { addToCart } = useCart();
  const [selectedVariantId, setSelectedVariantId] = useState<string>(item.variants?.[0]?.id || '');
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const currentVariant = item.variants?.find((v) => v.id === selectedVariantId) || item.variants?.[0];
  const activePrice = currentVariant ? currentVariant.price : item.price;

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      await addToCart(item.id, selectedVariantId, quantity, false, undefined, {
        ...item,
        price: activePrice,
      });
      setIsAdded(true);
      setTimeout(() => {
        setIsAdded(false);
        onClose();
      }, 1200);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden my-8 border border-gray-200 animate-scaleUp">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 text-gray-700 hover:bg-gray-100 hover:text-black transition-colors shadow-md"
        >
          <X size={20} />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left Column: Product Photo & Visual Tags */}
          <div className="relative bg-[#F7F7F4] flex flex-col justify-center p-6 border-b md:border-b-0 md:border-r border-gray-100">
            <div className="aspect-square w-full rounded-xl overflow-hidden bg-white shadow-sm border border-gray-200">
              <img
                src={item.images[0]}
                alt={item.title}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80';
                }}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Modeled on Real Dog Indicator */}
            <div className="mt-2.5 flex items-center justify-between text-xs text-gray-700 bg-white px-3 py-1.5 rounded-lg border border-gray-200">
              <span className="flex items-center gap-1.5 font-bold text-emerald-700">
                <Check size={14} className="text-emerald-600" /> Modeled on Real Dog
              </span>
              <span className="text-[11px] text-gray-500 font-medium">True-to-Scale Fit</span>
            </div>

            {/* Shape & Type Pills */}
            <div className="mt-4 flex flex-wrap gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#0E5E58]/20 text-[#0E5E58] text-xs font-bold shadow-2xs">
                <Box size={14} />
                <span>Shape: {item.shape}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-800 text-xs font-bold shadow-2xs">
                <Layers size={14} />
                <span>Type: {item.itemType}</span>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 gap-2 text-[11px] text-gray-700">
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-[#0E5E58]" />
                <span>Canine Safe Certified</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Truck size={14} className="text-[#0E5E58]" />
                <span>Fast 2-3 Day US Shipping</span>
              </div>
              <div className="flex items-center gap-1.5">
                <RotateCcw size={14} className="text-[#0E5E58]" />
                <span>30-Day Happiness Guarantee</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-500" />
                <span>Veterinarian Approved</span>
              </div>
            </div>
          </div>

          {/* Right Column: Information & Add to Cart Controls */}
          <div className="p-6 flex flex-col justify-between">
            <div>
              {/* Category & SKU */}
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span className="font-semibold text-[#0E5E58]">{item.categoryName}</span>
                <span>SKU: {item.sku}</span>
              </div>

              {/* Title */}
              <h2 className="text-xl font-bold text-[#1E232A] leading-tight mb-2">
                {item.title}
              </h2>

              {/* Reviews & Stock */}
              <div className="flex items-center gap-3 mb-4 text-xs">
                <div className="flex items-center gap-1 text-amber-500 font-bold">
                  <Star size={14} fill="currentColor" />
                  <span>{item.rating}</span>
                </div>
                <span className="text-gray-400">•</span>
                <span className="text-gray-600">{item.reviewsCount} Customer Reviews</span>
                <span className="text-gray-400">•</span>
                <span className="text-emerald-700 font-semibold">In Stock ({item.stock} available)</span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-2 mb-4 pb-4 border-b border-gray-100 flex-wrap">
                <span className="text-3xl font-extrabold text-[#0E5E58]">
                  ${activePrice.toFixed(2)}
                </span>
                {item.compareAtPrice && item.compareAtPrice > activePrice && (
                  <span className="text-base text-gray-400 line-through font-medium">
                    ${item.compareAtPrice.toFixed(2)}
                  </span>
                )}
                {item.compareAtPrice && item.compareAtPrice > activePrice && (
                  <span className="ml-auto text-xs font-bold text-[#E05338] bg-rose-50 px-2.5 py-1 rounded-md border border-rose-100">
                    60% OFF • Save ${(item.compareAtPrice - activePrice).toFixed(2)}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-xs text-gray-600 leading-relaxed mb-4">
                {item.description}
              </p>

              {/* Shape and Material details */}
              <div className="bg-[#FAF9F6] p-3 rounded-xl border border-[#E8E6DF] mb-4 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-gray-500">Shape Configuration:</span>
                  <span className="font-semibold text-[#1E232A]">{item.shape}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Design Type:</span>
                  <span className="font-semibold text-[#1E232A]">{item.itemType}</span>
                </div>
                {item.dimensions && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Dimensions:</span>
                    <span className="font-semibold text-[#1E232A]">{item.dimensions}</span>
                  </div>
                )}
                {item.material && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Primary Material:</span>
                    <span className="font-semibold text-[#1E232A]">{item.material}</span>
                  </div>
                )}
              </div>

              {/* Variant Selector if present */}
              {item.variants && item.variants.length > 1 && (
                <div className="mb-4">
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Select Edition / Size:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {item.variants.map((variant) => (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => setSelectedVariantId(variant.id)}
                        className={`p-2 text-left rounded-lg border text-xs transition-all ${
                          selectedVariantId === variant.id
                            ? 'border-[#0E5E58] bg-[#F4F8F7] font-bold text-[#0E5E58]'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        <div className="font-semibold">{variant.name}</div>
                        <div className="text-[11px] text-gray-500">${variant.price.toFixed(2)}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Controls: Quantity + Add to Cart */}
            <div className="pt-3 border-t border-gray-100 flex items-center gap-3">
              {/* Quantity */}
              <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50 p-1">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white text-gray-700 font-bold"
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="w-8 text-center font-bold text-sm text-[#1E232A]">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white text-gray-700 font-bold"
                >
                  +
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                id={`modal-add-btn-${item.id}`}
                type="button"
                onClick={handleAddToCart}
                disabled={isAdding}
                className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 px-6 font-bold text-sm transition-all shadow-md active:scale-98 ${
                  isAdded
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#0E5E58] text-white hover:bg-[#0B4A45]'
                }`}
              >
                {isAdded ? (
                  <>
                    <Check size={18} /> Added to Cart!
                  </>
                ) : isAdding ? (
                  <span>Adding to Cart...</span>
                ) : (
                  <>
                    <ShoppingBag size={18} /> Add {quantity > 1 ? `(${quantity}) ` : ''}to Cart • ${(activePrice * quantity).toFixed(2)}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
