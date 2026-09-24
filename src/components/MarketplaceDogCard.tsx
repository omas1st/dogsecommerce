import React, { useState } from 'react';
import { MarketplaceDog } from '../types';
import { ShieldCheck, MapPin, Sparkles, Heart, CheckCircle2, ShoppingBag, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface MarketplaceDogCardProps {
  dog: MarketplaceDog;
  onSelect: (dog: MarketplaceDog) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (dogId: string) => void;
}

const SIZE_LABELS: Record<string, { label: string; badgeClass: string }> = {
  toy: { label: 'Toy (< 12 lbs)', badgeClass: 'bg-amber-100 text-amber-800 border-amber-200' },
  small: { label: 'Small (12-25 lbs)', badgeClass: 'bg-blue-100 text-blue-800 border-blue-200' },
  medium: { label: 'Medium (26-55 lbs)', badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  large: { label: 'Large (56-90 lbs)', badgeClass: 'bg-purple-100 text-purple-800 border-purple-200' },
  giant: { label: 'Giant (90+ lbs)', badgeClass: 'bg-rose-100 text-rose-800 border-rose-200' },
};

export const MarketplaceDogCard: React.FC<MarketplaceDogCardProps> = ({
  dog,
  onSelect,
  isFavorite = false,
  onToggleFavorite,
}) => {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  if (!dog || !dog.id) return null;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAdding(true);
    try {
      const productData = {
        id: dog.id,
        title: `Adoption: ${dog.name} (${dog.breed})`,
        slug: `adopt-${dog.id}`,
        images: [dog.photoUrl],
        price: dog.price,
        compareAtPrice: dog.comparePrice,
        brand: dog.partnerSource,
        sellerName: dog.partnerSource,
        ownerType: 'platform',
      };
      await addToCart(dog.id, undefined, 1, false, undefined, productData);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2200);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAdding(false);
    }
  };

  const sizeInfo = SIZE_LABELS[dog.size] || { label: dog.size, badgeClass: 'bg-gray-100 text-gray-800 border-gray-200' };
  const isChewy = dog.partnerSource?.toLowerCase().includes('chewy');
  const isPetco = dog.partnerSource?.toLowerCase().includes('petco');

  return (
    <div
      id={`dog-card-${dog.id}`}
      className="group relative flex flex-col justify-between rounded-2xl border border-[#E8E6DF] bg-white overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-1"
    >
      {/* Dog Photo Container */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-gray-100 cursor-pointer" onClick={() => onSelect(dog)}>
        <img
          src={dog.photoUrl}
          alt={dog.name}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          referrerPolicy="no-referrer"
        />

        {/* Favorite Floating Button */}
        {onToggleFavorite && (
          <button
            type="button"
            id={`fav-btn-${dog.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(dog.id);
            }}
            className="absolute top-3 right-3 z-10 rounded-full bg-white/90 p-2 text-gray-700 backdrop-blur-xs hover:bg-white hover:text-rose-600 transition-colors shadow-xs"
            aria-label="Add to favorites"
          >
            <Heart size={16} className={isFavorite ? 'fill-rose-500 text-rose-500' : ''} />
          </button>
        )}

        {/* Size Badge & Priority Update Badge */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
          {(dog as any).recentlyAdminEditedAt || (dog as any).isRecentlyUpdated ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#0E5E58] text-white px-2.5 py-0.5 text-[10px] font-bold shadow-xs">
              <Sparkles size={11} className="text-amber-300" />
              {(dog as any).isNewlyAdded ? 'Newly Added' : 'Just Updated'}
            </span>
          ) : null}
          <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${sizeInfo.badgeClass}`}>
            {sizeInfo.label}
          </span>
        </div>

        {/* Partner Provenance Ribbon */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10">
          <span
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold backdrop-blur-md shadow-xs ${
              isChewy
                ? 'bg-[#1289fe]/90 text-white'
                : isPetco
                ? 'bg-[#ea1b28]/90 text-white'
                : 'bg-[#0E5E58]/90 text-white'
            }`}
          >
            <ShieldCheck size={13} />
            <span className="truncate">{dog.partnerSource}</span>
          </span>
        </div>
      </div>

      {/* Canine Content & Attributes */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Header & Location */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-serif-brand text-xl font-bold text-[#1E232A] group-hover:text-[#0E5E58] transition-colors">
                {dog.name}
              </h3>
              <p className="text-xs font-medium text-gray-500">{dog.breed}</p>
            </div>
            <div className="text-right">
              <div className="flex items-baseline justify-end gap-1.5 flex-wrap">
                <span className="text-xl font-extrabold text-[#0E5E58]">
                  ${dog.price.toLocaleString()}
                </span>
                {dog.comparePrice && dog.comparePrice > dog.price && (
                  <span className="text-xs text-gray-400 line-through font-medium">
                    ${dog.comparePrice.toLocaleString()}
                  </span>
                )}
              </div>
              <span className="inline-block text-[10px] font-bold text-[#E05338] bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100 mt-0.5">
                60% OFF Online
              </span>
            </div>
          </div>

          {/* Quick Metrics (Age, Gender, Weight, City) */}
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-600 bg-[#FAF9F6] p-2.5 rounded-xl border border-[#F0EFEB]">
            <div>
              <span className="text-gray-400 block text-[10px] uppercase font-semibold">Age &amp; Sex</span>
              <span className="font-medium capitalize">
                {dog.ageYears > 0 ? `${dog.ageYears}y ` : ''}
                {dog.ageMonths}m • {dog.gender}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px] uppercase font-semibold">Weight &amp; Metro</span>
              <span className="font-medium">
                {dog.weightLbs} lbs • {dog.location}
              </span>
            </div>
          </div>

          {/* Temperament Tags */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {dog.temperament?.slice(0, 3).map((trait, idx) => (
              <span
                key={idx}
                className="rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600"
              >
                {trait}
              </span>
            ))}
            {dog.isVaccinated && (
              <span className="rounded-md bg-emerald-50 text-emerald-700 px-2 py-0.5 text-[11px] font-semibold flex items-center gap-0.5">
                <CheckCircle2 size={11} /> Vaccinated
              </span>
            )}
          </div>

          {/* Chewy & Petco Bundle Inclusion */}
          <div className="mt-3 text-[11px] text-gray-500 line-clamp-1 flex items-center gap-1">
            <Sparkles size={12} className="text-amber-500 shrink-0" />
            <span className="truncate">{dog.chewyPetcoBundle}</span>
          </div>
        </div>

        {/* Action Buttons: Add to Cart & View Profile */}
        <div className="mt-5 pt-3 border-t border-gray-100 flex items-center gap-2">
          <button
            type="button"
            id={`add-dog-cart-${dog.id}`}
            onClick={handleAddToCart}
            disabled={isAdding}
            className={`flex-1 rounded-xl py-2.5 px-3 text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 active:scale-95 ${
              isAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-[#0E5E58] text-white hover:bg-[#0B4A45]'
            }`}
          >
            {isAdded ? (
              <>
                <Check size={14} /> Added to Cart!
              </>
            ) : isAdding ? (
              <span>Adding...</span>
            ) : (
              <>
                <ShoppingBag size={14} /> Add to Cart
              </>
            )}
          </button>
          <button
            type="button"
            id={`view-dog-${dog.id}`}
            onClick={() => onSelect(dog)}
            className="rounded-xl border border-gray-200 bg-gray-50 py-2.5 px-3.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 active:scale-95 transition-all"
          >
            Details
          </button>
        </div>
      </div>
    </div>
  );
};
