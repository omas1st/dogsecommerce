import React, { useState, useEffect } from 'react';
import { Product, Review } from '../types';
import { Rating } from '../components/Rating';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { usePets } from '../context/PetContext';
import { apiRequest } from '../services/api';
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  Repeat,
  Sparkles,
  CheckCircle2,
  Share2,
  Heart,
  Store,
  ChevronRight,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
} from 'lucide-react';

interface ProductDetailPageProps {
  product?: Product | null;
  onNavigate: (route: string, params?: any) => void;
  onProceedToCheckout: () => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  onNavigate,
  onProceedToCheckout,
}) => {
  const { user } = useAuth();
  const { pets, activePet } = usePets();
  const { addToCart, isLoading: isCartLoading } = useCart();

  const [selectedImage, setSelectedImage] = useState<string>(product?.images?.[0] || '');
  const [selectedVariant, setSelectedVariant] = useState(product?.variants?.[0] || null);
  const [purchaseMode, setPurchaseMode] = useState<'one_time' | 'subscription'>(
    product?.isSubscriptionEligible ? 'subscription' : 'one_time'
  );
  const [subscriptionFrequency, setSubscriptionFrequency] = useState('monthly');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'ingredients' | 'specs' | 'guarantee'>('description');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Review Form
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewContent, setReviewContent] = useState('');
  const [selectedPetForReview, setSelectedPetForReview] = useState<string>(activePet?.id || '');

  useEffect(() => {
    if (product) {
      if (product.images?.[0]) setSelectedImage(product.images[0]);
      if (product.variants?.[0]) setSelectedVariant(product.variants[0]);
      setPurchaseMode(product.isSubscriptionEligible ? 'subscription' : 'one_time');
    }
  }, [product]);

  useEffect(() => {
    async function loadReviews() {
      if (!product?.slug) return;
      try {
        const data = await apiRequest<{ success: boolean; reviews: Review[] }>(`/products/${product.slug}`);
        setReviews(data.reviews || []);
      } catch (err) {
        console.error(err);
      }
    }
    loadReviews();
  }, [product?.slug]);

  if (!product) {
    return (
      <div className="min-h-[60vh] bg-[#FAF9F6] py-16 flex flex-col items-center justify-center text-center px-4">
        <div className="max-w-md space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#E8F3F1] text-[#0E5E58] mx-auto flex items-center justify-center font-bold text-lg">
            🐾
          </div>
          <h2 className="font-serif-brand text-2xl font-bold text-[#1E232A]">
            Product Details Loading or Not Found
          </h2>
          <p className="text-xs text-[#525B67]">
            The product information is loading or may have been updated in our canine catalog.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('home')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-gray-300 bg-white text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-2xs"
            >
              ← Back to Homepage
            </button>
            <button
              onClick={() => onNavigate('shop')}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#0E5E58] text-xs font-bold text-white hover:bg-[#0B4A45] shadow-2xs"
            >
              Browse All Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentCompareAt = selectedVariant?.compareAtPrice || product.compareAtPrice;
  const subDiscountPercent = product.subscriptionDiscountPercentage || 10;
  const subscriptionPrice = Number((currentPrice * (1 - subDiscountPercent / 100)).toFixed(2));
  const effectivePrice = purchaseMode === 'subscription' ? subscriptionPrice : currentPrice;

  const handleAddToCart = async () => {
    await addToCart(
      product.id,
      selectedVariant?.id,
      quantity,
      purchaseMode === 'subscription',
      purchaseMode === 'subscription' ? subscriptionFrequency : undefined
    );
  };

  const handleBuyNow = async () => {
    await addToCart(
      product.id,
      selectedVariant?.id,
      quantity,
      purchaseMode === 'subscription',
      purchaseMode === 'subscription' ? subscriptionFrequency : undefined
    );
    onProceedToCheckout();
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewTitle.trim() || !reviewContent.trim()) return;

    try {
      const pet = pets.find((p) => p?.id === selectedPetForReview);
      await apiRequest('/reviews', {
        method: 'POST',
        body: JSON.stringify({
          productId: product.id,
          rating: reviewRating,
          title: reviewTitle,
          content: reviewContent,
          petContext: pet ? { petName: pet.name, breed: pet.breed, age: `${pet.ageYears} yrs` } : undefined,
        }),
      });

      setShowReviewModal(false);
      setReviewTitle('');
      setReviewContent('');
      // Reload reviews
      const updated = await apiRequest<{ success: boolean; reviews: Review[] }>(`/products/${product.slug}`);
      setReviews(updated.reviews || []);
      alert('Thank you! Your verified review has been submitted.');
    } catch (err: any) {
      alert(err.message || 'Could not submit review.');
    }
  };

  const isResale = product.ownerType === 'resale_platform';
  const isSeller = product.ownerType === 'seller';

  return (
    <div className="min-h-screen bg-[#FAF9F6] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-gray-500">
          <button onClick={() => onNavigate('home')} className="hover:underline">Home</button>
          <ChevronRight size={12} />
          <button onClick={() => onNavigate('shop')} className="hover:underline">Shop Dogs</button>
          <ChevronRight size={12} />
          <span className="text-gray-800 font-medium truncate max-w-xs">{product.title}</span>
        </nav>

        {/* Top Product Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Gallery Column */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-white border border-[#E8E6DF] shadow-xs">
              <img
                src={selectedImage || product.images[0]}
                alt={product.title}
                className="h-full w-full object-cover object-center"
              />
              <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
                {isResale && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-[#0E5E58] px-3 py-1 text-xs font-bold text-white shadow-sm">
                    <ShieldCheck size={14} /> Certified Pre-Owned Gear
                  </span>
                )}
                {isSeller && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-[#24303E] px-3 py-1 text-xs font-semibold text-white shadow-sm">
                    Sold by {product.sellerName || 'Artisan Partner'}
                  </span>
                )}
                {!isResale && !isSeller && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-white/90 backdrop-blur-xs border border-gray-200 px-3 py-1 text-xs font-semibold text-[#1E232A]">
                    Sold by Hound &amp; Harbor Signature
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail Selectors */}
            {product.images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`h-20 w-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                      selectedImage === img ? 'border-[#0E5E58] shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Canine Suitability & Tailored Match Card */}
            <div className="rounded-2xl border border-[#E2EFEB] bg-[#F4F8F7] p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0E5E58]">
                <Sparkles size={16} />
                <span>Canine Suitability Profile</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-white p-3 rounded-xl border border-[#D4E8E4]">
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Recommended Breeds</span>
                  <span className="font-semibold text-gray-800">
                    {product.suitability.breedRecommendations?.join(', ') || 'All Dog Breeds'}
                  </span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-[#D4E8E4]">
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Life Stages</span>
                  <span className="font-semibold text-gray-800 capitalize">
                    {product.suitability.lifeStages.join(', ').replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-[#D4E8E4]">
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Allergen Safety</span>
                  <span className="font-semibold text-[#0E5E58]">
                    {product.suitability.allergenFree?.join(', ') || 'Standard Balanced'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Details & Purchase Column */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-gray-400">
                {product.brand} • SKU: {product.sku}
              </div>
              <h1 className="mt-1 font-serif-brand text-2xl sm:text-3xl font-bold text-[#1E232A] leading-snug">
                {product.title}
              </h1>

              {/* Rating row */}
              <div className="mt-3 flex items-center gap-3">
                <Rating value={product.rating} count={product.reviewsCount} size={18} />
                <span className="text-xs text-gray-400">|</span>
                <span className="text-xs font-semibold text-[#0E5E58]">100% Canine Tail-Wag Guarantee</span>
              </div>
            </div>

            {/* Price Box */}
            <div className="p-4 rounded-xl bg-white border border-[#E8E6DF] space-y-3">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-[#1E232A]">
                  ${effectivePrice.toFixed(2)}
                </span>
                {currentCompareAt && currentCompareAt > effectivePrice && (
                  <span className="text-sm text-gray-400 line-through">
                    ${currentCompareAt.toFixed(2)}
                  </span>
                )}
                {purchaseMode === 'subscription' && (
                  <span className="rounded-full bg-[#E8F3F1] px-2.5 py-0.5 text-xs font-bold text-[#0E5E58]">
                    Save {subDiscountPercent}% with Autoship
                  </span>
                )}
              </div>

              {/* Purchase Mode Options (One-Time vs Subscribe & Save) */}
              {product.isSubscriptionEligible && (
                <div className="pt-2 space-y-2">
                  <label
                    onClick={() => setPurchaseMode('subscription')}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      purchaseMode === 'subscription'
                        ? 'border-[#0E5E58] bg-[#F4F8F7]'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="purchaseMode"
                      checked={purchaseMode === 'subscription'}
                      onChange={() => setPurchaseMode('subscription')}
                      className="mt-1 text-[#0E5E58] focus:ring-[#0E5E58]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#1E232A]">Subscribe &amp; Save {subDiscountPercent}%</span>
                        <span className="text-xs font-bold text-[#0E5E58]">${subscriptionPrice.toFixed(2)}</span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Never run out. Delivered automatically. Cancel, pause, or skip anytime.
                      </p>

                      {purchaseMode === 'subscription' && (
                        <div className="mt-3 flex items-center gap-2">
                          <span className="text-[11px] font-semibold text-gray-700">Deliver every:</span>
                          <select
                            value={subscriptionFrequency}
                            onChange={(e) => setSubscriptionFrequency(e.target.value)}
                            className="rounded-lg border border-gray-300 bg-white py-1 px-2 text-xs font-medium text-gray-800"
                          >
                            <option value="biweekly">2 Weeks</option>
                            <option value="monthly">4 Weeks (Recommended)</option>
                            <option value="every_6_weeks">6 Weeks</option>
                            <option value="every_8_weeks">8 Weeks</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </label>

                  <label
                    onClick={() => setPurchaseMode('one_time')}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      purchaseMode === 'one_time'
                        ? 'border-[#0E5E58] bg-[#F4F8F7]'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="purchaseMode"
                      checked={purchaseMode === 'one_time'}
                      onChange={() => setPurchaseMode('one_time')}
                      className="mt-1 text-[#0E5E58] focus:ring-[#0E5E58]"
                    />
                    <div className="flex-1 flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#1E232A]">One-time delivery</span>
                      <span className="text-xs font-bold text-gray-800">${currentPrice.toFixed(2)}</span>
                    </div>
                  </label>
                </div>
              )}

              {/* Variants Selector (Size / Attributes) */}
              {product.variants && product.variants.length > 1 && (
                <div className="pt-2">
                  <label className="text-xs font-bold text-gray-700 block mb-2">
                    Select Option / Size:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {product.variants.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariant(v)}
                        className={`rounded-xl border p-2.5 text-xs text-left transition-all ${
                          selectedVariant?.id === v.id
                            ? 'border-[#0E5E58] bg-[#E8F3F1] font-bold text-[#0E5E58]'
                            : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <div>{v.name}</div>
                        <div className="text-[11px] text-gray-500 font-normal">${v.price.toFixed(2)}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity & CTA buttons */}
              <div className="pt-3 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center rounded-xl border border-gray-300 bg-white">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 text-gray-600 hover:text-black"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-[#1E232A]">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2 text-gray-600 hover:text-black"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <button
                    id="pdp-add-to-cart-btn"
                    onClick={handleAddToCart}
                    disabled={isCartLoading || product.stock <= 0}
                    className="flex-1 rounded-xl bg-[#1E232A] py-3 text-xs font-bold text-white shadow-md hover:bg-[#0E5E58] active:scale-98 transition-all flex items-center justify-center gap-2"
                  >
                    <ShoppingBag size={16} />
                    <span>{product.stock <= 0 ? 'Sold Out' : 'Add to Cart'}</span>
                  </button>
                </div>

                <button
                  id="pdp-buy-now-btn"
                  onClick={handleBuyNow}
                  disabled={isCartLoading || product.stock <= 0}
                  className="w-full rounded-xl bg-[#0E5E58] py-3 text-xs font-bold text-white shadow-md hover:bg-[#0B4A45] active:scale-98 transition-all flex items-center justify-center gap-2"
                >
                  <span>Instant Checkout</span>
                  <ArrowRight size={16} />
                </button>
              </div>

              {/* Value propositions */}
              <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-2 text-[11px] text-gray-600">
                <div className="flex items-center gap-1.5">
                  <Truck size={14} className="text-[#0E5E58]" />
                  <span>Free US Ground on $49+</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <RotateCcw size={14} className="text-[#0E5E58]" />
                  <span>30-Day Money-Back Guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed In-Depth Information */}
        <div className="mt-14 rounded-2xl border border-[#E8E6DF] bg-white p-6 sm:p-8 shadow-xs">
          <div className="flex border-b border-gray-200 gap-6 overflow-x-auto">
            <button
              onClick={() => setActiveTab('description')}
              className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors ${
                activeTab === 'description'
                  ? 'border-b-2 border-[#0E5E58] text-[#0E5E58]'
                  : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              Description &amp; Highlights
            </button>
            {product.ingredients && (
              <button
                onClick={() => setActiveTab('ingredients')}
                className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors ${
                  activeTab === 'ingredients'
                    ? 'border-b-2 border-[#0E5E58] text-[#0E5E58]'
                    : 'text-gray-400 hover:text-gray-700'
                }`}
              >
                Ingredients &amp; Nutritional Analysis
              </button>
            )}
            <button
              onClick={() => setActiveTab('specs')}
              className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors ${
                activeTab === 'specs'
                  ? 'border-b-2 border-[#0E5E58] text-[#0E5E58]'
                  : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              Specifications &amp; Sizing
            </button>
            <button
              onClick={() => setActiveTab('guarantee')}
              className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors ${
                activeTab === 'guarantee'
                  ? 'border-b-2 border-[#0E5E58] text-[#0E5E58]'
                  : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              Hound &amp; Harbor Certified Standard
            </button>
          </div>

          <div className="pt-6 text-sm text-[#525B67] leading-relaxed">
            {activeTab === 'description' && (
              <div className="space-y-4">
                <p>{product.description}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="text-[#0E5E58] shrink-0 mt-0.5" />
                    <span>Single-protein clean formulations to prevent inflammatory skin allergic reactions.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="text-[#0E5E58] shrink-0 mt-0.5" />
                    <span>Free of corn, wheat, soy, artificial food dyes, and chemical stabilizers.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="text-[#0E5E58] shrink-0 mt-0.5" />
                    <span>Produced in audited USA facilities following strict human-grade sanitation standards.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="text-[#0E5E58] shrink-0 mt-0.5" />
                    <span>Smart depletion enabled: integrated with your pet's feeding schedule.</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ingredients' && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                  Complete Ingredients List
                </h4>
                <div className="flex flex-wrap gap-2">
                  {product.ingredients?.map((ing, i) => (
                    <span key={i} className="rounded-lg bg-[#FAF9F6] border border-gray-200 px-3 py-1 text-xs font-medium text-gray-800">
                      {ing}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {product.specifications ? (
                  Object.entries(product.specifications).map(([key, val]) => (
                    <div key={key} className="flex justify-between p-3 rounded-lg bg-[#FAF9F6] border border-gray-100 text-xs">
                      <span className="font-semibold text-gray-500">{key}</span>
                      <span className="font-bold text-[#1E232A]">{val}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500">Standard canine accessory specifications apply.</p>
                )}
              </div>
            )}

            {activeTab === 'guarantee' && (
              <div className="space-y-3">
                <h4 className="font-serif-brand text-lg font-bold text-[#1E232A]">
                  Our Tail-Wag 30-Day Guarantee &amp; Quality Commitment
                </h4>
                <p>
                  At Hound &amp; Harbor, our standard is unconditional canine contentment. If your dog refuses the food recipe, if the size isn’t a flawless fit, or if a piece of walking gear does not meet your expectations, we will replace it or process a full refund within 30 days of delivery.
                </p>
                <p>
                  For Certified Pre-Owned items, our 18-point inspection guarantees functional integrity, sanitized surfaces, and verified locking mechanisms.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Verified Reviews Section */}
        <div className="mt-14 rounded-2xl border border-[#E8E6DF] bg-white p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
            <div>
              <h2 className="font-serif-brand text-2xl font-bold text-[#1E232A]">
                Customer &amp; Pet Reviews
              </h2>
              <div className="mt-1 flex items-center gap-2">
                <Rating value={product.rating} count={product.reviewsCount} size={18} />
                <span className="text-xs text-gray-400">| Based on verified pet parent purchases</span>
              </div>
            </div>

            <button
              onClick={() => {
                if (!user) {
                  alert('Please sign in or create an account to leave a review.');
                  return;
                }
                setShowReviewModal(true);
              }}
              className="rounded-xl bg-[#0E5E58] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#0B4A45]"
            >
              Write a Verified Review
            </button>
          </div>

          {/* Reviews List */}
          <div className="mt-6 space-y-6">
            {reviews.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-500">
                Be the first to review this product for the Hound &amp; Harbor pack!
              </div>
            ) : (
              reviews.map((rev) => (
                <div key={rev.id} className="border-b border-gray-100 pb-6 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Rating value={rev.rating} showNumber={false} size={14} />
                      <span className="text-xs font-bold text-[#1E232A]">{rev.title}</span>
                    </div>
                    <span className="text-[11px] text-gray-400">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-xs text-[#525B67] leading-relaxed">
                    {rev.content}
                  </p>

                  <div className="flex items-center gap-3 text-[11px] pt-1">
                    <span className="font-semibold text-gray-800">{rev.userName}</span>
                    {rev.petContext && (
                      <span className="rounded-full bg-[#E8F3F1] px-2.5 py-0.5 text-[#0E5E58] font-medium">
                        🐾 {rev.petContext.petName} ({rev.petContext.breed}, {rev.petContext.age})
                      </span>
                    )}
                    {rev.isVerifiedPurchase && (
                      <span className="text-emerald-600 font-semibold flex items-center gap-1">
                        <CheckCircle2 size={12} /> Verified Buyer
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-gray-200">
            <h3 className="font-serif-brand text-xl font-bold text-[#1E232A]">
              Write a Review for {product.title}
            </h3>

            <form onSubmit={handleSubmitReview} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className={`text-xl ${star <= reviewRating ? 'text-[#D97706]' : 'text-gray-300'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              {pets.length > 0 && (
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Reviewed for which pet?</label>
                  <select
                    value={selectedPetForReview}
                    onChange={(e) => setSelectedPetForReview(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white p-2 text-xs"
                  >
                    <option value="">General Review</option>
                    {pets.filter((p) => p && p.id).map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.breed})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Review Headline</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Remarkable change in coat and digestion"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-2 text-xs focus:border-[#0E5E58] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Your Detailed Experience</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Tell other pet parents about how your dog liked it, packaging, sizing..."
                  value={reviewContent}
                  onChange={(e) => setReviewContent(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-2 text-xs focus:border-[#0E5E58] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#0E5E58] px-5 py-2 text-xs font-bold text-white hover:bg-[#0B4A45]"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
