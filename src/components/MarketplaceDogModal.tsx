import React, { useState } from 'react';
import { MarketplaceDog } from '../types';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Sparkles,
  Heart,
  Calendar,
  Award,
  Package,
  Activity,
  AlertCircle,
  PhoneCall,
  Check,
  ShoppingBag,
} from 'lucide-react';
import { useCart } from '../context/CartContext';

interface MarketplaceDogModalProps {
  dog: MarketplaceDog | null;
  onClose: () => void;
  onReserveSuccess?: (dog: MarketplaceDog) => void;
}

export const MarketplaceDogModal: React.FC<MarketplaceDogModalProps> = ({
  dog,
  onClose,
  onReserveSuccess,
}) => {
  const { addToCart } = useCart();
  const [isReserved, setIsReserved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [selectedCareOption, setSelectedCareOption] = useState<'standard' | 'bundle'>('bundle');
  const [adopterNote, setAdopterNote] = useState('');

  if (!dog) return null;

  const isChewy = dog.partnerSource?.toLowerCase().includes('chewy');
  const isPetco = dog.partnerSource?.toLowerCase().includes('petco');

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
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
      setIsAddedToCart(true);
      setTimeout(() => {
        setIsAddedToCart(false);
        onClose();
      }, 1000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleReserve = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsReserved(true);
      if (onReserveSuccess) {
        onReserveSuccess(dog);
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        id="dog-detail-modal"
        className="relative w-full max-w-3xl rounded-3xl bg-white shadow-2xl overflow-hidden my-8 border border-gray-100 flex flex-col max-h-[90vh]"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 rounded-full bg-white/80 p-2 text-gray-700 hover:bg-white hover:text-black transition-colors shadow-md backdrop-blur-xs"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        <div className="overflow-y-auto flex-1">
          {/* Header Image with Badges */}
          <div className="relative aspect-16/9 sm:aspect-21/9 w-full bg-gray-100">
            <img
              src={dog.photoUrl}
              alt={dog.name}
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

            <div className="absolute bottom-4 left-6 right-6 flex flex-wrap items-end justify-between gap-4 text-white">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="rounded-full bg-white/20 px-3 py-0.5 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                    {dog.size.toUpperCase()} CANINE
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-0.5 text-xs font-bold backdrop-blur-md ${
                      isChewy ? 'bg-[#1289fe]' : isPetco ? 'bg-[#ea1b28]' : 'bg-[#0E5E58]'
                    }`}
                  >
                    <ShieldCheck size={13} />
                    {dog.partnerSource}
                  </span>
                </div>
                <h2 className="font-serif-brand text-3xl sm:text-4xl font-bold">{dog.name}</h2>
                <p className="text-sm text-gray-200">{dog.breed} • {dog.location}</p>
              </div>

              <div className="text-right">
                <span className="text-xs uppercase tracking-wider text-gray-300 block">Adoption Placement</span>
                <div className="flex items-baseline justify-end gap-2 flex-wrap">
                  <span className="text-3xl font-extrabold text-white">${dog.price.toLocaleString()}</span>
                  {dog.comparePrice && dog.comparePrice > dog.price && (
                    <span className="text-base text-gray-300 line-through font-medium">
                      ${dog.comparePrice.toLocaleString()}
                    </span>
                  )}
                </div>
                {dog.comparePrice && dog.comparePrice > dog.price && (
                  <span className="inline-block mt-1 text-xs font-bold text-amber-300 bg-black/40 px-2 py-0.5 rounded border border-amber-300/40">
                    60% OFF Online Price
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-6 sm:p-8 space-y-6">
            {isReserved ? (
              <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-6 text-center space-y-3">
                <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Check size={28} />
                </div>
                <h3 className="text-xl font-bold text-emerald-900">
                  Canine Reservation Initiated for {dog.name}!
                </h3>
                <p className="text-sm text-emerald-800 max-w-md mx-auto">
                  A verification specialist from {dog.partnerSource} and Hound &amp; Harbor has reserved {dog.name}. You will receive transport schedule and veterinary verification details via email shortly.
                </p>
                <div className="pt-2">
                  <button
                    onClick={onClose}
                    className="rounded-xl bg-[#0E5E58] text-white px-6 py-2.5 text-xs font-bold hover:bg-[#0B4A45] transition-colors"
                  >
                    Back to Canine Marketplace
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Canine Key Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="rounded-2xl bg-[#FAF9F6] border border-[#F0EFEB] p-3 text-center">
                    <span className="text-[11px] uppercase font-bold text-gray-400 block">Weight</span>
                    <span className="text-base font-bold text-[#1E232A]">{dog.weightLbs} lbs</span>
                    <span className="text-[10px] text-gray-500 block capitalize">{dog.size} Breed</span>
                  </div>

                  <div className="rounded-2xl bg-[#FAF9F6] border border-[#F0EFEB] p-3 text-center">
                    <span className="text-[11px] uppercase font-bold text-gray-400 block">Age</span>
                    <span className="text-base font-bold text-[#1E232A]">
                      {dog.ageYears > 0 ? `${dog.ageYears} yr ` : ''}
                      {dog.ageMonths} mo
                    </span>
                    <span className="text-[10px] text-gray-500 block capitalize">{dog.gender}</span>
                  </div>

                  <div className="rounded-2xl bg-[#FAF9F6] border border-[#F0EFEB] p-3 text-center">
                    <span className="text-[11px] uppercase font-bold text-gray-400 block">Energy Level</span>
                    <span className="text-base font-bold text-[#1E232A] capitalize">{dog.energyLevel}</span>
                    <span className="text-[10px] text-gray-500 block">Exercise Fit</span>
                  </div>

                  <div className="rounded-2xl bg-[#FAF9F6] border border-[#F0EFEB] p-3 text-center">
                    <span className="text-[11px] uppercase font-bold text-gray-400 block">Provenance</span>
                    <span className="text-base font-bold text-[#1E232A]">Certified</span>
                    <span className="text-[10px] text-gray-500 block truncate">{dog.partnerSource}</span>
                  </div>
                </div>

                {/* Canine Bio / Description */}
                <div>
                  <h4 className="text-xs uppercase font-bold tracking-wider text-gray-400 mb-2">
                    About {dog.name}
                  </h4>
                  <p className="text-sm text-[#4A5568] leading-relaxed">
                    {dog.description}
                  </p>
                </div>

                {/* Temperament & Social Badges */}
                <div>
                  <h4 className="text-xs uppercase font-bold tracking-wider text-gray-400 mb-2">
                    Temperament &amp; Personality
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {dog.temperament?.map((trait, idx) => (
                      <span
                        key={idx}
                        className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Veterinary & Health Verifications */}
                <div className="rounded-2xl bg-emerald-50/60 border border-emerald-100 p-4 space-y-2.5">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                    <ShieldCheck size={18} className="text-emerald-700" />
                    <span>Health &amp; Medical Guarantee</span>
                  </div>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    {dog.healthGuarantee}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                    <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-medium">
                      <CheckCircle2 size={14} className="text-emerald-600" />
                      <span>{dog.isVaccinated ? 'Fully Vaccinated' : 'Vaccine Plan'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-medium">
                      <CheckCircle2 size={14} className="text-emerald-600" />
                      <span>{dog.isMicrochipped ? 'AVID Microchipped' : 'Microchipping Included'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-medium">
                      <CheckCircle2 size={14} className="text-emerald-600" />
                      <span>{dog.isNeuteredOrSpayed ? 'Neutered / Spayed' : 'Alteration Scheduled'}</span>
                    </div>
                  </div>
                </div>

                {/* Chewy & Petco Included Nutrition & Gear Bundle */}
                <div className="rounded-2xl bg-amber-50/70 border border-amber-200/80 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-amber-950 font-bold text-sm">
                      <Sparkles size={16} className="text-amber-600" />
                      <span>Partner Nutrition &amp; Care Bundle</span>
                    </div>
                    <span className="rounded-full bg-amber-200/80 px-2.5 py-0.5 text-[11px] font-bold text-amber-900">
                      Chewy &amp; Petco Network
                    </span>
                  </div>
                  <p className="text-xs text-amber-900 leading-relaxed font-medium">
                    {dog.chewyPetcoBundle}
                  </p>
                  <p className="text-[11px] text-amber-800/80">
                    Includes tailored kibble formula, chew toys, microchip registration, and first month of autoship delivery to your door.
                  </p>
                </div>

                {/* Inquire & Reserve Section */}
                <div className="pt-2 border-t border-gray-100 space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">
                      Note to Placement Specialist (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. We have a fenced backyard and another gentle dog..."
                      value={adopterNote}
                      onChange={(e) => setAdopterNote(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 px-3.5 py-2 text-xs focus:border-[#0E5E58] focus:outline-hidden"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      type="button"
                      id={`modal-add-cart-${dog.id}`}
                      disabled={isAddingToCart}
                      onClick={handleAddToCart}
                      className={`flex-1 rounded-xl py-3.5 px-6 text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 active:scale-95 ${
                        isAddedToCart
                          ? 'bg-emerald-600 text-white'
                          : 'bg-[#0E5E58] text-white hover:bg-[#0B4A45]'
                      }`}
                    >
                      {isAddedToCart ? (
                        <>
                          <Check size={16} />
                          <span>Added to Cart!</span>
                        </>
                      ) : isAddingToCart ? (
                        <span>Adding to Cart...</span>
                      ) : (
                        <>
                          <ShoppingBag size={16} />
                          <span>Add to Cart (${dog.price.toLocaleString()})</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleReserve}
                      className="rounded-xl border border-[#0E5E58] bg-[#0E5E58]/10 py-3.5 px-5 text-xs font-bold text-[#0E5E58] hover:bg-[#0E5E58]/20 active:scale-[0.99] transition-all flex items-center justify-center gap-1.5"
                    >
                      <ShieldCheck size={16} />
                      <span>{isSubmitting ? 'Reserving...' : 'Direct Reserve'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-xl border border-gray-300 py-3.5 px-5 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
