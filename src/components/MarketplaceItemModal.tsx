import React, { useState, useEffect } from 'react';
import { MarketplaceItem } from '../data/marketplaceCatalog';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import {
  X,
  Star,
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  Sparkles,
  Layers,
  Box,
  MessageSquare,
  Send,
  Loader2,
  CheckCircle,
  ThumbsUp,
  Tag,
} from 'lucide-react';

interface ReviewItem {
  id: string;
  productId: string;
  userName: string;
  petContext?: {
    petName: string;
    breed: string;
    age: string;
  };
  rating: number;
  title: string;
  content: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
}

interface MarketplaceItemModalProps {
  item: MarketplaceItem | null;
  onClose: () => void;
}

export const MarketplaceItemModal: React.FC<MarketplaceItemModalProps> = ({ item, onClose }) => {
  if (!item) return null;

  const { addToCart } = useCart();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'reviews'>('overview');
  const [selectedVariantId, setSelectedVariantId] = useState<string>(item.variants?.[0]?.id || '');
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  // Reviews State
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  // Review Form Fields
  const [formRating, setFormRating] = useState<number>(5);
  const [formHoverRating, setFormHoverRating] = useState<number>(0);
  const [formAuthorName, setFormAuthorName] = useState<string>(
    user ? `${user.firstName} ${user.lastName ? user.lastName[0] + '.' : ''}` : ''
  );
  const [formPetName, setFormPetName] = useState<string>('');
  const [formPetBreed, setFormPetBreed] = useState<string>('');
  const [formTitle, setFormTitle] = useState<string>('');
  const [formComment, setFormComment] = useState<string>('');
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Active Price
  const currentVariant = item.variants?.find((v) => v.id === selectedVariantId) || item.variants?.[0];
  const activePrice = currentVariant ? currentVariant.price : item.price;
  const comparePrice = item.compareAtPrice || Number((activePrice * 1.6).toFixed(2));
  const savings = Math.max(0, comparePrice - activePrice);

  // Load Reviews for this item
  useEffect(() => {
    if (!item?.id) return;
    setIsLoadingReviews(true);
    apiRequest<{ success: boolean; reviews: ReviewItem[] }>(`/reviews/${item.id}`)
      .then((res) => {
        if (res && res.reviews) {
          setReviews(res.reviews);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoadingReviews(false));
  }, [item?.id]);

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

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formComment.trim()) {
      setReviewError('Please write your review comment.');
      return;
    }

    setIsSubmittingReview(true);
    setReviewError(null);

    try {
      const payload = {
        productId: item.id,
        rating: formRating,
        title: formTitle.trim() || 'Verified Customer Review',
        content: formComment.trim(),
        authorName: formAuthorName.trim() || 'Verified Dog Parent',
        petContext: {
          petName: formPetName.trim() || 'My Dog',
          breed: formPetBreed.trim() || 'Canine Companion',
          age: 'Adult',
        },
      };

      const res = await apiRequest<{ success: boolean; review: ReviewItem; error?: string }>('/reviews', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res && res.success && res.review) {
        setReviews((prev) => [res.review, ...prev]);
        setReviewSuccess(true);
        setFormComment('');
        setFormTitle('');
        setTimeout(() => {
          setReviewSuccess(false);
          setIsFormOpen(false);
        }, 2000);
      } else {
        throw new Error(res?.error || 'Failed to submit review.');
      }
    } catch (err: any) {
      setReviewError(err.message || 'Could not submit review.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const avgStars = reviews.length > 0
    ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1))
    : item.rating || 4.9;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden my-6 border border-gray-200 animate-scaleUp max-h-[92vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/90 text-gray-700 hover:bg-gray-100 hover:text-black transition-colors shadow-md cursor-pointer"
          title="Close Modal"
        >
          <X size={20} />
        </button>

        {/* Top Navigation Tabs */}
        <div className="flex items-center px-6 pt-4 pb-2 border-b border-gray-200 bg-[#FAF9F6] gap-4 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`pb-2 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'overview'
                ? 'border-[#0E5E58] text-[#0E5E58]'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            Product Overview & Specifications
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            className={`pb-2 text-sm font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'reviews'
                ? 'border-[#0E5E58] text-[#0E5E58]'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <MessageSquare size={15} />
            <span>Customer Reviews & Comments</span>
            <span className="px-1.5 py-0.5 rounded-full text-[11px] bg-gray-200 text-gray-700 font-bold">
              {reviews.length || item.reviewsCount}
            </span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto flex-1">
          {activeTab === 'overview' ? (
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Left Column: Product Photo & Visual Tags */}
              <div className="relative bg-[#F7F7F4] flex flex-col justify-between p-6 border-b md:border-b-0 md:border-r border-gray-100">
                <div>
                  <div className="aspect-square w-full rounded-xl overflow-hidden bg-white shadow-sm border border-gray-200">
                    <img
                      src={item.images?.[0] || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80'}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.src =
                          'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80';
                      }}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Modeled on Real Dog Indicator */}
                  <div className="mt-3 flex items-center justify-between text-xs text-gray-700 bg-white px-3 py-2 rounded-lg border border-gray-200">
                    <span className="flex items-center gap-1.5 font-bold text-emerald-700">
                      <Check size={14} className="text-emerald-600" /> Modeled on Real Dog
                    </span>
                    <span className="text-[11px] text-gray-500 font-medium">True-to-Scale Fit</span>
                  </div>

                  {/* Shape & Type Badges */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-[#0E5E58]/20 text-[#0E5E58] text-xs font-bold shadow-2xs">
                      <Box size={13} />
                      <span>Shape: {item.shape || 'Ergonomic'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-gray-800 text-xs font-bold shadow-2xs">
                      <Layers size={13} />
                      <span>Type: {item.itemType || 'Canine Supply'}</span>
                    </div>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="mt-6 pt-4 border-t border-gray-200 grid grid-cols-2 gap-2.5 text-[11px] text-gray-700">
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
                  {/* Category, Brand & SKU */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1 flex-wrap gap-2">
                    <span className="font-bold text-[#0E5E58] uppercase tracking-wide">
                      {item.categoryName || item.category}
                    </span>
                    <span className="font-mono text-gray-400">SKU: {item.sku || `HH-${item.id}`}</span>
                  </div>

                  {/* Title */}
                  <h2 className="text-xl font-bold text-[#1E232A] leading-tight mb-2">
                    {item.title}
                  </h2>

                  {/* Brand if provided */}
                  {item.brand && (
                    <div className="text-xs text-gray-500 mb-2">
                      Brand: <span className="font-semibold text-gray-800">{item.brand}</span>
                    </div>
                  )}

                  {/* Reviews & Stock */}
                  <div className="flex items-center gap-3 mb-4 text-xs">
                    <button
                      type="button"
                      onClick={() => setActiveTab('reviews')}
                      className="flex items-center gap-1 text-amber-500 font-bold hover:underline cursor-pointer"
                    >
                      <Star size={14} fill="currentColor" />
                      <span>{avgStars}</span>
                      <span className="text-gray-500 font-normal">
                        ({reviews.length || item.reviewsCount} reviews)
                      </span>
                    </button>
                    <span className="text-gray-300">•</span>
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle size={13} /> In Stock ({item.stock ?? 50} available)
                    </span>
                  </div>

                  {/* Price Banner */}
                  <div className="flex items-baseline gap-2 mb-4 pb-4 border-b border-gray-100 flex-wrap">
                    <span className="text-3xl font-extrabold text-[#0E5E58]">
                      ${activePrice.toFixed(2)}
                    </span>
                    {comparePrice > activePrice && (
                      <span className="text-base text-gray-400 line-through font-medium">
                        ${comparePrice.toFixed(2)}
                      </span>
                    )}
                    {savings > 0 && (
                      <span className="ml-auto text-xs font-bold text-[#E05338] bg-rose-50 px-2.5 py-1 rounded-md border border-rose-100">
                        Save ${savings.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <div className="mb-4">
                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Product Description
                    </h4>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Shape, Dimensions, Material specifications */}
                  <div className="bg-[#FAF9F6] p-3.5 rounded-xl border border-[#E8E6DF] mb-4 text-xs space-y-2">
                    <div className="font-bold text-gray-800 text-[11px] uppercase tracking-wider border-b border-gray-200 pb-1">
                      Canine Engineering Specs
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Shape Configuration:</span>
                      <span className="font-semibold text-[#1E232A]">{item.shape || 'Ergonomic'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Design Type:</span>
                      <span className="font-semibold text-[#1E232A]">{item.itemType || 'Daily Gear'}</span>
                    </div>
                    {item.dimensions && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Dimensions / Sizing:</span>
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
                            className={`p-2 text-left rounded-lg border text-xs transition-all cursor-pointer ${
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
                  <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50 p-1">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white text-gray-700 font-bold cursor-pointer"
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
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white text-gray-700 font-bold cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  <button
                    id={`modal-add-btn-${item.id}`}
                    type="button"
                    onClick={handleAddToCart}
                    disabled={isAdding}
                    className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 px-6 font-bold text-sm transition-all shadow-md active:scale-98 cursor-pointer ${
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
          ) : (
            /* TAB 2: PUBLIC CUSTOMER REVIEWS & COMMENTS SECTION */
            <div className="p-6">
              {/* Header Rating Summary */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-[#F9FAF8] rounded-2xl border border-gray-200 mb-6 gap-4">
                <div className="flex items-center gap-4">
                  <div className="text-center sm:text-left">
                    <div className="text-4xl font-extrabold text-[#0E5E58]">{avgStars}</div>
                    <div className="flex items-center gap-1 text-amber-500 mt-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={16}
                          fill={s <= Math.round(avgStars) ? 'currentColor' : 'none'}
                          className={s <= Math.round(avgStars) ? 'text-amber-500' : 'text-gray-300'}
                        />
                      ))}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Based on {reviews.length} canine parent reviews
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsFormOpen(!isFormOpen)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0E5E58] hover:bg-[#0B4A45] text-white font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  <MessageSquare size={14} />
                  <span>{isFormOpen ? 'Cancel Review' : 'Drop a Comment & Review'}</span>
                </button>
              </div>

              {/* Collapsible Review & Comment Submission Form */}
              {isFormOpen && (
                <form
                  onSubmit={handleReviewSubmit}
                  className="mb-8 p-5 bg-white border-2 border-[#0E5E58]/30 rounded-2xl shadow-sm space-y-4 animate-fadeIn"
                >
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <h3 className="text-sm font-bold text-[#1E232A] flex items-center gap-2">
                      <Sparkles size={16} className="text-[#0E5E58]" />
                      Write Your Review & Drop a Comment
                    </h3>
                    <span className="text-xs text-gray-500">Public verified review</span>
                  </div>

                  {/* Star Rating Selector */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Your Rating *
                    </label>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onMouseEnter={() => setFormHoverRating(s)}
                          onMouseLeave={() => setFormHoverRating(0)}
                          onClick={() => setFormRating(s)}
                          className="p-1 text-amber-500 focus:outline-none transition-transform hover:scale-110 cursor-pointer"
                        >
                          <Star
                            size={24}
                            fill={(formHoverRating || formRating) >= s ? 'currentColor' : 'none'}
                            className={(formHoverRating || formRating) >= s ? 'text-amber-500' : 'text-gray-300'}
                          />
                        </button>
                      ))}
                      <span className="ml-2 text-xs font-bold text-gray-700">
                        {formRating === 5 ? '5 Stars • Excellent' : `${formRating} Stars`}
                      </span>
                    </div>
                  </div>

                  {/* Name and Pet Context */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Sarah M."
                        value={formAuthorName}
                        onChange={(e) => setFormAuthorName(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-gray-200 focus:border-[#0E5E58] rounded-xl outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Pet Name (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Cooper"
                        value={formPetName}
                        onChange={(e) => setFormPetName(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-gray-200 focus:border-[#0E5E58] rounded-xl outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Dog Breed (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Golden Retriever"
                        value={formPetBreed}
                        onChange={(e) => setFormPetBreed(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-gray-200 focus:border-[#0E5E58] rounded-xl outline-none"
                      />
                    </div>
                  </div>

                  {/* Review Headline */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Review Headline
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Best investment for our dog's daily routine!"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-gray-200 focus:border-[#0E5E58] rounded-xl outline-none"
                    />
                  </div>

                  {/* Comment / Review Content */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Your Comment & Experience *
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Share details about the quality, sizing, material, and how your dog reacted to it..."
                      value={formComment}
                      onChange={(e) => setFormComment(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-gray-200 focus:border-[#0E5E58] rounded-xl outline-none"
                    />
                  </div>

                  {reviewError && (
                    <p className="text-xs text-rose-600 font-medium">{reviewError}</p>
                  )}

                  {reviewSuccess && (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                      <CheckCircle size={14} />
                      <span>Thank you! Your review and comment have been posted.</span>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingReview}
                      className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#0E5E58] hover:bg-[#0B4A45] text-white font-bold text-xs rounded-xl transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isSubmittingReview ? (
                        <>
                          <Loader2 size={13} className="animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <Send size={13} />
                          <span>Post Review & Comment</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* Public Reviews List */}
              {isLoadingReviews ? (
                <div className="flex items-center justify-center py-12 text-[#0E5E58]">
                  <Loader2 size={24} className="animate-spin" />
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-gray-200 rounded-2xl">
                  <MessageSquare size={32} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-sm font-semibold text-gray-700">No reviews yet for this product</p>
                  <p className="text-xs text-gray-500 mt-1">Be the first verified canine parent to leave a review!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-4 bg-white border border-gray-200 rounded-xl shadow-2xs space-y-2 hover:border-[#0E5E58]/30 transition-colors"
                    >
                      {/* Review Header: User Name + Rating + Verified Badge */}
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-gray-900">{rev.userName}</span>
                          {rev.isVerifiedPurchase && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle size={10} /> Verified Buyer
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 text-amber-500">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              size={13}
                              fill={s <= rev.rating ? 'currentColor' : 'none'}
                              className={s <= rev.rating ? 'text-amber-500' : 'text-gray-300'}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Pet Context */}
                      {rev.petContext && (rev.petContext.petName || rev.petContext.breed) && (
                        <div className="text-[11px] text-[#0E5E58] font-medium flex items-center gap-1">
                          <Tag size={11} />
                          <span>
                            Parent of {rev.petContext.petName || 'Dog'} ({rev.petContext.breed || 'Canine Companion'})
                          </span>
                        </div>
                      )}

                      {/* Review Title */}
                      <h4 className="font-bold text-xs text-gray-900">{rev.title}</h4>

                      {/* Review Content / Comment */}
                      <p className="text-xs text-gray-600 leading-relaxed">{rev.content}</p>

                      {/* Review Date & Social Thumbs */}
                      <div className="flex items-center justify-between pt-1 border-t border-gray-100 text-[10px] text-gray-400">
                        <span>
                          {new Date(rev.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        <div className="flex items-center gap-1 text-gray-500">
                          <ThumbsUp size={11} />
                          <span>Helpful review</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
