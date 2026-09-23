import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { ProductCard } from '../components/ProductCard';
import { apiRequest } from '../services/api';
import {
  Filter,
  SlidersHorizontal,
  Search,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Check,
} from 'lucide-react';

interface ShopPageProps {
  initialCategory?: string;
  initialSearch?: string;
  onSelectProduct: (product: Product) => void;
  onNavigate: (route: string, params?: any) => void;
}

export const ShopPage: React.FC<ShopPageProps> = ({
  initialCategory,
  initialSearch,
  onSelectProduct,
  onNavigate,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState(initialSearch || '');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'all');
  const [selectedOwnerType, setSelectedOwnerType] = useState('all'); // all, platform, seller, resale_platform
  const [selectedLifeStage, setSelectedLifeStage] = useState('all'); // puppy, adult, senior, all
  const [selectedCondition, setSelectedCondition] = useState('all'); // new, like_new
  const [allergenFreeOnly, setAllergenFreeOnly] = useState(false);
  const [subEligibleOnly, setSubEligibleOnly] = useState(false);
  const [sortBy, setSortBy] = useState('featured'); // featured, price_asc, price_desc, rating

  useEffect(() => {
    async function fetchCatalog() {
      setIsLoading(true);
      try {
        const data = await apiRequest<{ success: boolean; products: Product[] }>('/products');
        setProducts(data.products || []);
      } catch (err) {
        console.error('Failed to load products', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCatalog();
  }, []);

  useEffect(() => {
    if (initialCategory) setSelectedCategory(initialCategory);
    if (initialSearch !== undefined) setSearchQuery(initialSearch);
  }, [initialCategory, initialSearch]);

  // Apply Client Filters
  useEffect(() => {
    let result = [...products];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (selectedCategory && selectedCategory !== 'all') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Owner type filter
    if (selectedOwnerType !== 'all') {
      result = result.filter((p) => p.ownerType === selectedOwnerType);
    }

    // Life stage filter
    if (selectedLifeStage !== 'all') {
      result = result.filter((p) =>
        p.suitability.lifeStages.includes(selectedLifeStage as any) ||
        p.suitability.lifeStages.includes('all_stages')
      );
    }

    // Condition filter
    if (selectedCondition !== 'all') {
      result = result.filter((p) => p.condition === selectedCondition);
    }

    // Allergen Free
    if (allergenFreeOnly) {
      result = result.filter((p) => (p.suitability?.allergenFree?.length || 0) > 0);
    }

    // Subscription Eligible
    if (subEligibleOnly) {
      result = result.filter((p) => p.isSubscriptionEligible);
    }

    // Sorting
    if (sortBy === 'price_asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    }

    setFilteredProducts(result);
  }, [
    products,
    searchQuery,
    selectedCategory,
    selectedOwnerType,
    selectedLifeStage,
    selectedCondition,
    allergenFreeOnly,
    subEligibleOnly,
    sortBy,
  ]);

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedOwnerType('all');
    setSelectedLifeStage('all');
    setSelectedCondition('all');
    setAllergenFreeOnly(false);
    setSubEligibleOnly(false);
    setSortBy('featured');
  };

  const categories = [
    { id: 'all', name: 'All Collections' },
    { id: 'dog-food', name: 'Dog Food & Nutrition' },
    { id: 'beds-furniture', name: 'Orthopedic Beds' },
    { id: 'health-supplements', name: 'Joint & Wellness Chews' },
    { id: 'collars-leashes', name: 'Collars & Tactical Leashes' },
    { id: 'crates-travel', name: 'Crates & Travel Ramps' },
    { id: 'toys', name: 'Interactive Enrichment Toys' },
    { id: 'dog-treats', name: 'Single-Ingredient Treats' },
    { id: 'grooming', name: 'Grooming & Coat Care' },
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Title & Breadcrumb */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="text-xs text-gray-500 font-medium">
              <button onClick={() => onNavigate('home')} className="hover:underline">Home</button> / <span>Shop Canine</span>
            </div>
            <h1 className="font-serif-brand text-3xl font-bold text-[#1E232A] mt-1">
              Canine Essentials &amp; Gear
            </h1>
            <p className="text-xs text-[#525B67] mt-1">
              Showing {filteredProducts.length} curated products for dogs of all breeds and ages.
            </p>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white py-2 px-3 text-xs font-semibold text-[#1E232A] focus:border-[#0E5E58] focus:outline-none shadow-2xs"
            >
              <option value="featured">Featured &amp; Recommended</option>
              <option value="rating">Highest Rated</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Layout Grid (Filters Sidebar + Products Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Filters Sidebar */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="rounded-xl border border-[#E8E6DF] bg-white p-5 shadow-2xs space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <span className="flex items-center gap-2 text-xs font-bold text-[#1E232A] uppercase tracking-wider">
                  <Filter size={14} className="text-[#0E5E58]" /> Filter Results
                </span>
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-[#0E5E58] hover:underline font-semibold flex items-center gap-1"
                >
                  <RotateCcw size={12} /> Reset
                </button>
              </div>

              {/* Keyword Search in Filter */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1.5">Search Catalog</label>
                <div className="relative">
                  <Search size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search keywords..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-[#FAF9F6] py-1.5 pl-8 pr-3 text-xs focus:border-[#0E5E58] focus:outline-none"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-2">Category</label>
                <div className="space-y-1">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`w-full text-left text-xs py-1.5 px-2 rounded-lg flex items-center justify-between transition-colors ${
                        selectedCategory === cat.id
                          ? 'bg-[#E8F3F1] text-[#0E5E58] font-bold'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span>{cat.name}</span>
                      {selectedCategory === cat.id && <Check size={12} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Source / Ownership Filter */}
              <div className="pt-3 border-t border-gray-100">
                <label className="text-xs font-bold text-gray-700 block mb-2">Product Origin</label>
                <div className="space-y-1.5 text-xs text-gray-600">
                  <button
                    onClick={() => setSelectedOwnerType('all')}
                    className={`w-full text-left py-1 px-2 rounded-lg ${selectedOwnerType === 'all' ? 'bg-[#E8F3F1] text-[#0E5E58] font-bold' : 'hover:bg-gray-50'}`}
                  >
                    All Origins
                  </button>
                  <button
                    onClick={() => setSelectedOwnerType('platform')}
                    className={`w-full text-left py-1 px-2 rounded-lg ${selectedOwnerType === 'platform' ? 'bg-[#E8F3F1] text-[#0E5E58] font-bold' : 'hover:bg-gray-50'}`}
                  >
                    Hound &amp; Harbor Signature
                  </button>
                  <button
                    onClick={() => setSelectedOwnerType('seller')}
                    className={`w-full text-left py-1 px-2 rounded-lg ${selectedOwnerType === 'seller' ? 'bg-[#E8F3F1] text-[#0E5E58] font-bold' : 'hover:bg-gray-50'}`}
                  >
                    Artisan Marketplace
                  </button>
                  <button
                    onClick={() => setSelectedOwnerType('resale_platform')}
                    className={`w-full text-left py-1 px-2 rounded-lg flex items-center justify-between ${selectedOwnerType === 'resale_platform' ? 'bg-[#E8F3F1] text-[#0E5E58] font-bold' : 'hover:bg-gray-50'}`}
                  >
                    <span>Certified Pre-Owned</span>
                    <ShieldCheck size={12} className="text-[#0E5E58]" />
                  </button>
                </div>
              </div>

              {/* Life Stage Filter */}
              <div className="pt-3 border-t border-gray-100">
                <label className="text-xs font-bold text-gray-700 block mb-2">Life Stage</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {['all', 'puppy', 'adult', 'senior'].map((stage) => (
                    <button
                      key={stage}
                      onClick={() => setSelectedLifeStage(stage)}
                      className={`text-xs capitalize py-1 px-2 rounded-md border text-center ${
                        selectedLifeStage === stage
                          ? 'border-[#0E5E58] bg-[#E8F3F1] text-[#0E5E58] font-bold'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {stage}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles: Hypoallergenic & Subscribe */}
              <div className="pt-3 border-t border-gray-100 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700">
                  <input
                    type="checkbox"
                    checked={allergenFreeOnly}
                    onChange={(e) => setAllergenFreeOnly(e.target.checked)}
                    className="rounded text-[#0E5E58] focus:ring-[#0E5E58]"
                  />
                  <span>Hypoallergenic / Grain-Free</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700">
                  <input
                    type="checkbox"
                    checked={subEligibleOnly}
                    onChange={(e) => setSubEligibleOnly(e.target.checked)}
                    className="rounded text-[#0E5E58] focus:ring-[#0E5E58]"
                  />
                  <span>Subscribe &amp; Save Eligible</span>
                </label>
              </div>
            </div>
          </aside>

          {/* Right Product Grid */}
          <main className="lg:col-span-9">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="h-80 rounded-xl bg-gray-200" />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="rounded-2xl border border-[#E8E6DF] bg-white p-12 text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-[#F4F2EB] flex items-center justify-center text-gray-400 mb-4">
                  <Search size={28} />
                </div>
                <h3 className="font-serif-brand text-xl font-bold text-[#1E232A]">
                  No matching products found
                </h3>
                <p className="mt-1 text-xs text-gray-500 max-w-sm mx-auto">
                  Try clearing some of your filters or searching for broader terms like "kibble", "bed", or "chew".
                </p>
                <button
                  onClick={clearAllFilters}
                  className="mt-5 rounded-lg bg-[#0E5E58] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#0B4A45]"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelect={onSelectProduct}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
