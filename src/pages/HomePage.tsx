import React, { useState, useEffect } from 'react';
import { Product, Pet } from '../types';
import { ProductCard } from '../components/ProductCard';
import { apiRequest } from '../services/api';
import { usePets } from '../context/PetContext';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Repeat,
  RotateCcw,
  CheckCircle2,
  Award,
  Truck,
  Heart,
  Store,
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (route: string, params?: any) => void;
  onSelectProduct: (product: Product) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onSelectProduct }) => {
  const { activePet } = usePets();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<{ product: Product; reason: string }[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const prodData = await apiRequest<{ success: boolean; products: Product[] }>('/products?limit=8');
        setFeaturedProducts(prodData.products || []);

        if (activePet && activePet.id) {
          const recData = await apiRequest<{
            success: boolean;
            recommendations: any[];
            recommendationReasons?: Record<string, string>;
          }>(`/pets/${activePet.id}/dashboard`);

          if (recData?.recommendations && Array.isArray(recData.recommendations)) {
            const formatted = recData.recommendations
              .map((item: any) => {
                const prod = item?.product || item;
                const reason =
                  item?.reason ||
                  recData.recommendationReasons?.[prod?.id] ||
                  `Tailored for ${activePet.breed || 'Canine Health'}`;
                return { product: prod, reason };
              })
              .filter((entry) => entry.product && entry.product.id);

            setRecommendedProducts(formatted.slice(0, 4));
          }
        }
      } catch (err) {
        console.error('Home data load error', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadHomeData();
  }, [activePet]);

  const categories = [
    {
      id: 'dog-food',
      name: 'Dog Food & Nutrition',
      description: 'Single-protein, grain-free & freeze-dried recipes',
      image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=600&q=80',
      badge: 'Veterinary Formulated',
    },
    {
      id: 'beds-furniture',
      name: 'Orthopedic Beds',
      description: 'Memory foam joint support for every sleeping style',
      image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80',
      badge: '3-Year Warranty',
    },
    {
      id: 'health-supplements',
      name: 'Mobility & Wellness',
      description: 'Glucosamine, omega-3, and digestive daily chews',
      image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=600&q=80',
      badge: 'Cold-Pressed',
    },
    {
      id: 'collars-leashes',
      name: 'Artisan Walking Gear',
      description: 'Handcrafted biothane & saddle leather leashes',
      image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=600&q=80',
      badge: 'Artisan Marketplace',
    },
    {
      id: 'crates-travel',
      name: 'Certified Resale Crates',
      description: 'Pre-owned aluminum crates inspected for safety',
      image: 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=600&q=80',
      badge: 'Up to 50% Off Retail',
    },
    {
      id: 'dog-treats',
      name: 'Single-Ingredient Treats',
      description: 'Freeze-dried beef liver & pure elk antlers',
      image: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=600&q=80',
      badge: 'Pure Nutrition',
    },
  ];

  return (
    <div className="bg-[#FAF9F6] min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#1E232A] text-white">
        {/* Subtle background overlay */}
        <div className="absolute inset-0 z-0 opacity-25 bg-[radial-gradient(#34D399_1px,transparent_1px)] [background-size:24px_24px]" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#0E5E58]/60 border border-[#34D399]/30 px-3.5 py-1.5 text-xs font-semibold text-[#34D399]">
                <Sparkles size={14} />
                <span>Intelligent Canine Commerce &amp; Care</span>
              </div>

              <h1 className="font-serif-brand text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.15]">
                Everything Your Dog Needs. <br />
                <span className="text-[#34D399] italic font-normal">
                  Tailored to Their Life.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-gray-300 max-w-xl font-normal leading-relaxed">
                Personalized nutrition formulas, smart reorder depletion tracking, handcrafted marketplace gear, and certified pre-owned crates backed by an 18-point safety protocol.
              </p>

              {/* Action CTAs */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  id="hero-shop-all-btn"
                  onClick={() => onNavigate('shop')}
                  className="rounded-xl bg-[#0E5E58] px-6 py-3.5 text-sm font-semibold text-white shadow-lg hover:bg-[#0B4A45] active:scale-98 transition-all flex items-center gap-2"
                >
                  <span>Explore Canine Catalog</span>
                  <ArrowRight size={16} />
                </button>

                <button
                  id="hero-pet-quiz-btn"
                  onClick={() => onNavigate('pet-intro')}
                  className="rounded-xl border border-gray-600 bg-white/5 backdrop-blur-xs px-6 py-3.5 text-sm font-semibold text-white hover:bg-white/10 hover:border-gray-400 transition-all flex items-center gap-2"
                >
                  <span>Build Pet Profile</span>
                  <Sparkles size={16} className="text-[#34D399]" />
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-gray-800 text-xs text-gray-300">
                <div className="flex items-center gap-2">
                  <Truck size={16} className="text-[#34D399] shrink-0" />
                  <span>Free Ground $49+</span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw size={16} className="text-[#34D399] shrink-0" />
                  <span>30-Day Guarantee</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-[#34D399] shrink-0" />
                  <span>18-Pt Certified Resale</span>
                </div>
              </div>
            </div>

            {/* Right Visual / Pet Showcase Card */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md rounded-2xl bg-white p-3 shadow-2xl border border-gray-700/50">
                <div className="relative aspect-4/3 overflow-hidden rounded-xl bg-gray-100">
                  <img
                    src="https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80"
                    alt="Golden Retriever enjoying outdoor healthy life"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute top-3 right-3 rounded-full bg-black/60 backdrop-blur-xs px-3 py-1 text-xs font-semibold text-white">
                    Golden Retriever • 3 yrs
                  </div>
                </div>

                <div className="p-4 bg-[#FAF9F6] rounded-xl mt-3 border border-[#E8E6DF]">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#0E5E58] tracking-wider">
                        Tailored Recommendation
                      </span>
                      <h4 className="text-sm font-bold text-[#1E232A]">Wild Salmon &amp; Sweet Potato Recipe</h4>
                    </div>
                    <span className="text-xs font-bold text-[#0E5E58] bg-[#E8F3F1] px-2 py-1 rounded">
                      100% Match
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs text-[#525B67]">
                    Formulated for large-breed joint mobility, seasonal itch relief, and chicken-free digestive calm.
                  </p>
                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-gray-200">
                    <span className="text-xs text-gray-500">Subscribe &amp; Save 10%</span>
                    <button
                      onClick={() => onNavigate('shop', { category: 'dog-food' })}
                      className="text-xs font-bold text-[#0E5E58] hover:underline flex items-center gap-1"
                    >
                      View Recipe <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Personalized Section for Active Pet (if available) */}
      {activePet && (
        <section className="bg-[#F4F8F7] border-b border-[#D8ECE7] py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <img
                  src={activePet.photoUrl || 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=200&q=80'}
                  alt={activePet.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-[#0E5E58]"
                />
                <div>
                  <h2 className="font-serif-brand text-2xl font-bold text-[#1E232A]">
                    Recommended for {activePet.name}
                  </h2>
                  <p className="text-xs text-[#525B67]">
                    Personalized for a {activePet.ageYears} yr old {activePet.breed} ({activePet.weightLbs} lbs) • Allergies:{' '}
                    {activePet.allergies.length > 0 ? activePet.allergies.join(', ') : 'None'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => onNavigate('pet-dashboard', { petId: activePet?.id })}
                className="rounded-lg bg-white border border-[#0E5E58] px-4 py-2 text-xs font-bold text-[#0E5E58] hover:bg-[#0E5E58] hover:text-white transition-colors"
              >
                View {activePet.name}’s Dashboard &amp; Health Profile
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {(recommendedProducts.length > 0
                ? recommendedProducts
                : featuredProducts.slice(0, 4).map((p) => ({
                    product: p,
                    reason: `Tailored for ${activePet?.breed || 'Canine Health'}`,
                  }))
              )
                .filter((item) => item?.product && item.product.id)
                .map(({ product, reason }) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    recommendationReason={reason}
                    onSelect={onSelectProduct}
                  />
                ))}
            </div>
          </div>
        </section>
      )}

      {/* Shop By Canine Category Grid */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#0E5E58]">
              Curated Collections
            </span>
            <h2 className="font-serif-brand text-3xl font-bold text-[#1E232A] mt-1">
              Explore Canine Essentials
            </h2>
          </div>
          <button
            onClick={() => onNavigate('categories')}
            className="text-xs font-semibold text-[#0E5E58] hover:underline flex items-center gap-1"
          >
            All Categories <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onNavigate('shop', { category: cat.id })}
              className="group relative overflow-hidden rounded-2xl bg-white border border-[#E8E6DF] p-6 shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[260px]"
            >
              {/* Background Accent / Image */}
              <div className="absolute inset-0 z-0">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="h-full w-full object-cover opacity-20 group-hover:opacity-30 group-hover:scale-105 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-linear-to-t from-white via-white/80 to-transparent" />
              </div>

              {/* Card Content */}
              <div className="relative z-10">
                <span className="inline-block rounded-md bg-[#0E5E58] px-2.5 py-1 text-[11px] font-bold text-white shadow-xs">
                  {cat.badge}
                </span>
                <h3 className="mt-4 font-serif-brand text-xl font-bold text-[#1E232A] group-hover:text-[#0E5E58] transition-colors">
                  {cat.name}
                </h3>
                <p className="mt-1 text-xs text-[#525B67] leading-relaxed max-w-xs">
                  {cat.description}
                </p>
              </div>

              <div className="relative z-10 pt-4 flex items-center gap-2 text-xs font-bold text-[#0E5E58]">
                <span>Shop Category</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products & Bestsellers */}
      <section className="py-14 bg-white border-y border-[#E8E6DF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#0E5E58]">
                Popular In The Pack
              </span>
              <h2 className="font-serif-brand text-3xl font-bold text-[#1E232A] mt-1">
                Featured &amp; Best-Selling Gear
              </h2>
            </div>
            <button
              onClick={() => onNavigate('shop')}
              className="text-xs font-semibold text-[#0E5E58] hover:underline flex items-center gap-1"
            >
              Browse Full Catalog <ArrowRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.slice(0, 8).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={onSelectProduct}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 3 Core Pillars: Smart Reorder, Artisan Marketplace, Certified Resale */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#0E5E58]">
            The Hound &amp; Harbor Ecosystem
          </span>
          <h2 className="font-serif-brand text-3xl font-bold text-[#1E232A] mt-1">
            Reimagining How You Care For Your Dog
          </h2>
          <p className="mt-2 text-sm text-[#525B67]">
            More than an online store — a thoughtful platform designed for convenience, sustainability, and artisan craftsmanship.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Pillar 1: Smart Reorder */}
          <div className="rounded-2xl border border-[#E8E6DF] bg-white p-6 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#E8F3F1] text-[#0E5E58] flex items-center justify-center mb-4">
                <Repeat size={24} />
              </div>
              <h3 className="font-serif-brand text-xl font-bold text-[#1E232A]">Smart Reorder &amp; Autoship</h3>
              <p className="mt-2 text-xs text-[#525B67] leading-relaxed">
                Based on your dog’s weight, feeding cup measurements, and past order intervals, we calculate exactly when your kibble is running low and prompt 1-click replenishment with 10% savings.
              </p>
            </div>
            <div className="pt-6 border-t border-gray-100 mt-6">
              <button
                onClick={() => onNavigate('smart-reorder')}
                className="text-xs font-bold text-[#0E5E58] hover:underline flex items-center gap-1"
              >
                Learn About Smart Reorder <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Pillar 2: Artisan Marketplace */}
          <div className="rounded-2xl border border-[#E8E6DF] bg-white p-6 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#F4F2EB] text-[#24303E] flex items-center justify-center mb-4">
                <Store size={24} />
              </div>
              <h3 className="font-serif-brand text-xl font-bold text-[#1E232A]">Curated Artisan Marketplace</h3>
              <p className="mt-2 text-xs text-[#525B67] leading-relaxed">
                Discover independent makers across North America handcrafting waterproof biothane leashes, natural elk antler chews, and slow-baked organic training rewards.
              </p>
            </div>
            <div className="pt-6 border-t border-gray-100 mt-6">
              <button
                onClick={() => onNavigate('marketplace')}
                className="text-xs font-bold text-[#0E5E58] hover:underline flex items-center gap-1"
              >
                Explore Artisan Marketplace <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Pillar 3: Certified Resale & Buyback */}
          <div className="rounded-2xl border border-[#E8E6DF] bg-white p-6 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#E8F3F1] text-[#0E5E58] flex items-center justify-center mb-4">
                <ShieldCheck size={24} />
              </div>
              <h3 className="font-serif-brand text-xl font-bold text-[#1E232A]">Certified Resale &amp; Buyback</h3>
              <p className="mt-2 text-xs text-[#525B67] leading-relaxed">
                Did your puppy outgrow their heavy-duty aluminum crate or vehicle ramp? Hound &amp; Harbor buys back quality gear for instant cash or credit, then sanitizes and certifies it for a new home.
              </p>
            </div>
            <div className="pt-6 border-t border-gray-100 mt-6">
              <button
                onClick={() => onNavigate('resale')}
                className="text-xs font-bold text-[#0E5E58] hover:underline flex items-center gap-1"
              >
                Browse Resale &amp; Get Buyback Quote <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Verified Pet Parent Testimonials */}
      <section className="py-16 bg-[#1E232A] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#34D399]">
              Verified Reviews
            </span>
            <h2 className="font-serif-brand text-3xl font-bold text-white mt-1">
              Trusted by 15,000+ Dog Parents
            </h2>
            <p className="mt-2 text-xs text-gray-400">
              Read how tailored nutrition and durable equipment make a daily difference.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl bg-[#293442] p-6 border border-gray-700 flex flex-col justify-between">
              <div>
                <div className="flex text-[#F59E0B] gap-1 mb-3">
                  {'★★★★★'}
                </div>
                <h4 className="font-bold text-sm text-white">“Max hasn’t scratched once this season!”</h4>
                <p className="mt-2 text-xs text-gray-300 leading-relaxed">
                  The personalized pet profile immediately flagged chicken as a common Golden Retriever allergen and recommended the Wild Alaskan Salmon Kibble. His coat is noticeably glossier within three weeks.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-700 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#0E5E58] text-white flex items-center justify-center text-xs font-bold">
                  SJ
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Sarah Jenkins</div>
                  <div className="text-[10px] text-[#34D399]">Parent to Max (Golden Retriever, 3 yrs)</div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-[#293442] p-6 border border-gray-700 flex flex-col justify-between">
              <div>
                <div className="flex text-[#F59E0B] gap-1 mb-3">
                  {'★★★★★'}
                </div>
                <h4 className="font-bold text-sm text-white">“Saved $300 on a certified aluminum crate”</h4>
                <p className="mt-2 text-xs text-gray-300 leading-relaxed">
                  I was skeptical about pre-owned pet gear, but Hound &amp; Harbor’s certified resale inspection was flawless. The crate arrived fully sterilized with zero functional flaws. Plus, I can sell it back when needed!
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-700 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#0E5E58] text-white flex items-center justify-center text-xs font-bold">
                  MR
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Michael Reynolds</div>
                  <div className="text-[10px] text-[#34D399]">Parent to Duke (German Shepherd, 4 yrs)</div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-[#293442] p-6 border border-gray-700 flex flex-col justify-between">
              <div>
                <div className="flex text-[#F59E0B] gap-1 mb-3">
                  {'★★★★★'}
                </div>
                <h4 className="font-bold text-sm text-white">“Smart reorder saved our road trip”</h4>
                <p className="mt-2 text-xs text-gray-300 leading-relaxed">
                  We received a gentle email reminder right before our food ran out. No frantic grocery store runs on Sunday nights. The autoship discount and free 2-day delivery make this an absolute no-brainer.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-700 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#0E5E58] text-white flex items-center justify-center text-xs font-bold">
                  EW
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Elena Walsh</div>
                  <div className="text-[10px] text-[#34D399]">Parent to Chloe (French Bulldog, 2 yrs)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action Strip */}
      <section className="py-16 bg-[#0E5E58] text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="font-serif-brand text-3xl sm:text-4xl font-bold">
            Ready to give your dog the care they deserve?
          </h2>
          <p className="mt-3 text-sm text-emerald-100 max-w-xl mx-auto">
            Build their personalized nutrition &amp; wellness profile in under 2 minutes. Receive customized recommendations and smart reorder timing.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => onNavigate('pet-intro')}
              className="rounded-xl bg-white px-6 py-3.5 text-xs font-bold text-[#0E5E58] shadow-lg hover:bg-gray-100 active:scale-98 transition-all"
            >
              Get Started with Pet Profile
            </button>
            <button
              onClick={() => onNavigate('shop')}
              className="rounded-xl border border-white/40 px-6 py-3.5 text-xs font-bold text-white hover:bg-white/10 transition-all"
            >
              Browse All Products
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
