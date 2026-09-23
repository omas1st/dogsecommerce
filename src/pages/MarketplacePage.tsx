import React, { useState, useEffect, useMemo } from 'react';
import {
  MARKETPLACE_CATEGORIES,
  ALL_MARKETPLACE_ITEMS,
  MarketplaceItem,
} from '../data/marketplaceCatalog';
import { MarketplaceItemCard } from '../components/MarketplaceItemCard';
import { MarketplaceItemModal } from '../components/MarketplaceItemModal';
import { MarketplaceDog } from '../types';
import { MarketplaceDogCard } from '../components/MarketplaceDogCard';
import { MarketplaceDogModal } from '../components/MarketplaceDogModal';
import { apiRequest } from '../services/api';
import {
  ShieldCheck,
  Search,
  SlidersHorizontal,
  Sparkles,
  Dog,
  CheckCircle2,
  Box,
  Layers,
  ShoppingBag,
  ArrowUpDown,
  Tag,
  Truck,
  Heart,
  RotateCcw,
} from 'lucide-react';

interface MarketplacePageProps {
  onNavigate: (route: string, params?: any) => void;
  onSelectProduct?: (product: any) => void;
  initialSearch?: string;
}

export const MarketplacePage: React.FC<MarketplacePageProps> = ({
  onNavigate,
  onSelectProduct,
  initialSearch = '',
}) => {
  // Main view mode: 'supplies' (the 12 categories with >50 items each) or 'dogs' (the 100 canines)
  const [viewMode, setViewMode] = useState<'supplies' | 'dogs'>('supplies');

  // Supplies State
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedShape, setSelectedShape] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<string>('all');
  const [suppliesSearch, setSuppliesSearch] = useState<string>(initialSearch);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(null);

  // Dogs State (100 dogs)
  const [dogs, setDogs] = useState<MarketplaceDog[]>([]);
  const [isLoadingDogs, setIsLoadingDogs] = useState(false);
  const [activeDogSize, setActiveDogSize] = useState<string>('all');
  const [dogSearch, setDogSearch] = useState<string>('');
  const [selectedDogPartner, setSelectedDogPartner] = useState<string>('all');
  const [selectedDog, setSelectedDog] = useState<MarketplaceDog | null>(null);
  const [dogSortBy, setDogSortBy] = useState<string>('featured');
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('hound_dog_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [reservationNotice, setReservationNotice] = useState<string | null>(null);

  // Load Dogs when needed
  useEffect(() => {
    if (viewMode === 'dogs' && dogs.length === 0) {
      setIsLoadingDogs(true);
      apiRequest<{ success: boolean; total: number; dogs: MarketplaceDog[] }>('/marketplace/dogs')
        .then((res) => {
          if (res && res.dogs) setDogs(res.dogs);
        })
        .catch(console.error)
        .finally(() => setIsLoadingDogs(false));
    }
  }, [viewMode, dogs.length]);

  const toggleFavorite = (dogId: string) => {
    setFavorites((prev) => {
      const updated = prev.includes(dogId) ? prev.filter((id) => id !== dogId) : [...prev, dogId];
      try {
        localStorage.setItem('hound_dog_favorites', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  // Extract available shapes and types dynamically based on selected category
  const categoryItems = useMemo(() => {
    if (selectedCategory === 'all') return ALL_MARKETPLACE_ITEMS;
    return ALL_MARKETPLACE_ITEMS.filter((item) => item.category === selectedCategory);
  }, [selectedCategory]);

  const availableShapes = useMemo(() => {
    const set = new Set<string>();
    categoryItems.forEach((item) => {
      if (item.shape) set.add(item.shape);
    });
    return Array.from(set).sort();
  }, [categoryItems]);

  const availableTypes = useMemo(() => {
    const set = new Set<string>();
    categoryItems.forEach((item) => {
      if (item.itemType) set.add(item.itemType);
    });
    return Array.from(set).sort();
  }, [categoryItems]);

  // Filtered & Sorted Supplies Items
  const filteredSupplies = useMemo(() => {
    return categoryItems.filter((item) => {
      // Shape Filter
      if (selectedShape !== 'all' && item.shape !== selectedShape) {
        return false;
      }

      // Type Filter
      if (selectedType !== 'all' && item.itemType !== selectedType) {
        return false;
      }

      // Price Range Filter
      if (priceRange !== 'all') {
        if (priceRange === 'under-10' && item.price >= 10) return false;
        if (priceRange === '10-20' && (item.price < 10 || item.price > 20)) return false;
        if (priceRange === '20-30' && (item.price < 20 || item.price > 30)) return false;
        if (priceRange === '30-plus' && item.price < 30) return false;
        if (priceRange === 'under-25' && item.price >= 25) return false;
        if (priceRange === '25-50' && (item.price < 25 || item.price > 50)) return false;
      }

      // Search
      if (suppliesSearch.trim()) {
        const q = suppliesSearch.toLowerCase().trim();
        const inTitle = item.title.toLowerCase().includes(q);
        const inDesc = item.description.toLowerCase().includes(q);
        const inShape = item.shape?.toLowerCase().includes(q);
        const inType = item.itemType?.toLowerCase().includes(q);
        const inCat = item.categoryName?.toLowerCase().includes(q);
        if (!inTitle && !inDesc && !inShape && !inType && !inCat) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      return 0; // featured default
    });
  }, [categoryItems, selectedShape, selectedType, priceRange, suppliesSearch, sortBy]);

  // Filtered Dogs
  const filteredDogs = useMemo(() => {
    return dogs.filter((dog) => {
      if (showOnlyFavorites && !favorites.includes(dog.id)) return false;
      if (activeDogSize !== 'all' && dog.size.toLowerCase() !== activeDogSize.toLowerCase()) return false;
      if (selectedDogPartner !== 'all') {
        const pLower = dog.partnerSource?.toLowerCase() || '';
        if (selectedDogPartner === 'chewy' && !pLower.includes('chewy')) return false;
        if (selectedDogPartner === 'petco' && !pLower.includes('petco')) return false;
      }
      if (dogSearch.trim()) {
        const q = dogSearch.toLowerCase().trim();
        const matchesName = dog.name?.toLowerCase().includes(q);
        const matchesBreed = dog.breed?.toLowerCase().includes(q);
        const matchesLoc = dog.location?.toLowerCase().includes(q);
        if (!matchesName && !matchesBreed && !matchesLoc) return false;
      }
      return true;
    }).sort((a, b) => {
      if (dogSortBy === 'price-low') return a.price - b.price;
      if (dogSortBy === 'price-high') return b.price - a.price;
      if (dogSortBy === 'weight-low') return a.weightLbs - b.weightLbs;
      if (dogSortBy === 'weight-high') return b.weightLbs - a.weightLbs;
      return 0;
    });
  }, [dogs, showOnlyFavorites, favorites, activeDogSize, selectedDogPartner, dogSearch, dogSortBy]);

  const activeCategoryDef = MARKETPLACE_CATEGORIES.find((c) => c.id === selectedCategory);

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-24 text-[#1E232A]">
      {/* Reservation Toast */}
      {reservationNotice && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl bg-[#0E5E58] px-5 py-3.5 text-white shadow-2xl animate-bounce">
          <CheckCircle2 size={20} className="text-emerald-300 shrink-0" />
          <div className="text-xs font-semibold">{reservationNotice}</div>
          <button
            onClick={() => setReservationNotice(null)}
            className="ml-2 text-white/80 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Hero Header */}
      <section className="relative overflow-hidden bg-[#1E232A] text-white border-b border-gray-800">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#0E5E58_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0E5E58]/40 border border-[#0E5E58] text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
                <ShieldCheck size={14} /> Canine Only Marketplace
              </div>
              <h1 className="font-serif-brand text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-1">
                The All-Canine Marketplace
              </h1>
            </div>

            {/* Toggle Between Supplies and Dogs for Adoption */}
            <div className="flex rounded-xl bg-white/10 p-1.5 border border-white/10 text-xs font-semibold self-start md:self-auto">
              <button
                type="button"
                onClick={() => setViewMode('supplies')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all ${
                  viewMode === 'supplies'
                    ? 'bg-[#0E5E58] text-white shadow-md'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                <ShoppingBag size={15} />
                <span>Dog Supplies</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('dogs')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all ${
                  viewMode === 'dogs'
                    ? 'bg-[#0E5E58] text-white shadow-md'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                <Dog size={15} />
                <span>Dogs for Adoption</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {viewMode === 'supplies' ? (
          <div>
            {/* 12 Departments Scrollable Filter Bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Select Dog Department ({MARKETPLACE_CATEGORIES.length} Categories):
                </span>
                <span className="text-xs font-medium text-[#0E5E58]">
                  {selectedCategory === 'all' ? 'Showing All 624 Items' : `${activeCategoryDef?.name} (52 Items)`}
                </span>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedShape('all');
                    setSelectedType('all');
                  }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                    selectedCategory === 'all'
                      ? 'bg-[#0E5E58] text-white border-[#0E5E58] shadow-sm'
                      : 'bg-white text-gray-700 border-[#E8E6DF] hover:border-[#0E5E58]/40 hover:bg-[#F4F8F7]'
                  }`}
                >
                  <span>🐾 All Departments</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${selectedCategory === 'all' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>
                    624
                  </span>
                </button>

                {MARKETPLACE_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setSelectedShape('all');
                      setSelectedType('all');
                    }}
                    className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                      selectedCategory === cat.id
                        ? 'bg-[#0E5E58] text-white border-[#0E5E58] shadow-sm'
                        : 'bg-white text-gray-700 border-[#E8E6DF] hover:border-[#0E5E58]/40 hover:bg-[#F4F8F7]'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${selectedCategory === cat.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>
                      {cat.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Department Info Banner if specific category selected */}
            {activeCategoryDef && selectedCategory !== 'all' && (
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E8E6DF] mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
                <div>
                  <h2 className="font-serif-brand text-xl font-bold text-[#1E232A] mb-1">
                    {activeCategoryDef.name}
                  </h2>
                  <p className="text-xs text-gray-600 max-w-3xl">
                    {activeCategoryDef.description}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F4F8F7] text-[#0E5E58] text-xs font-bold border border-[#0E5E58]/20">
                    <CheckCircle2 size={14} /> 52 Verified Products
                  </span>
                </div>
              </div>
            )}

            {/* Controls Bar: Search, Shape Filter, Type Filter, Price, Sort */}
            <div className="bg-white rounded-2xl p-4 border border-[#E8E6DF] mb-6 shadow-2xs space-y-3">
              {/* Row 1: Search & Sorting */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3.5 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by title, shape (round, rectangular), type (orthopedic, waterproof)..."
                    value={suppliesSearch}
                    onChange={(e) => setSuppliesSearch(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-[#FAF9F6] py-2.5 pl-10 pr-4 text-xs text-[#1E232A] focus:border-[#0E5E58] focus:bg-white focus:outline-none transition-all"
                  />
                  {suppliesSearch && (
                    <button
                      onClick={() => setSuppliesSearch('')}
                      className="absolute right-3 top-2.5 text-xs text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Price Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-500 whitespace-nowrap">Price:</span>
                  <select
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="rounded-xl border border-gray-200 bg-[#FAF9F6] px-3 py-2 text-xs font-semibold text-gray-700 focus:border-[#0E5E58] focus:outline-none"
                  >
                    <option value="all">All Prices</option>
                    <option value="under-10">Under $10</option>
                    <option value="10-20">$10 - $20</option>
                    <option value="20-30">$20 - $30</option>
                    <option value="30-plus">$30 &amp; Above</option>
                  </select>
                </div>

                {/* Sort selector */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-500 whitespace-nowrap">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="rounded-xl border border-gray-200 bg-[#FAF9F6] px-3 py-2 text-xs font-semibold text-gray-700 focus:border-[#0E5E58] focus:outline-none"
                  >
                    <option value="featured">Featured First</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                    <option value="title">Alphabetical (A-Z)</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Specialized Shape & Type Filters */}
              <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center gap-4 text-xs">
                {/* Shape Filter Pills */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-gray-500 flex items-center gap-1">
                    <Box size={13} /> Shape:
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedShape('all')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      selectedShape === 'all'
                        ? 'bg-[#0E5E58] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All Shapes
                  </button>
                  {availableShapes.slice(0, 8).map((shape) => (
                    <button
                      key={shape}
                      type="button"
                      onClick={() => setSelectedShape(shape)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                        selectedShape === shape
                          ? 'bg-[#0E5E58] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {shape}
                    </button>
                  ))}
                </div>

                {/* Type Filter Pills */}
                {availableTypes.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-gray-500 flex items-center gap-1">
                      <Layers size={13} /> Type:
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedType('all')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                        selectedType === 'all'
                          ? 'bg-[#0E5E58] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      All Types
                    </button>
                    {availableTypes.slice(0, 6).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setSelectedType(type)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors truncate max-w-[150px] ${
                          selectedType === type
                            ? 'bg-[#0E5E58] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Results Count & Reset Bar */}
            <div className="flex items-center justify-between mb-4 text-xs text-gray-600">
              <div>
                Showing <strong className="text-gray-900">{filteredSupplies.length}</strong> items of{' '}
                <strong>{categoryItems.length}</strong> in{' '}
                <span className="font-semibold text-[#0E5E58]">
                  {selectedCategory === 'all' ? 'All 12 Categories' : activeCategoryDef?.name}
                </span>
                {(selectedShape !== 'all' || selectedType !== 'all' || priceRange !== 'all' || suppliesSearch) && (
                  <span className="ml-2 text-amber-700 font-medium">
                    (Filtered)
                  </span>
                )}
              </div>

              {(selectedShape !== 'all' || selectedType !== 'all' || priceRange !== 'all' || suppliesSearch) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedShape('all');
                    setSelectedType('all');
                    setPriceRange('all');
                    setSuppliesSearch('');
                  }}
                  className="text-[#0E5E58] hover:underline font-bold"
                >
                  Reset Filters
                </button>
              )}
            </div>

            {/* Product Cards Grid */}
            {filteredSupplies.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-[#E8E6DF]">
                <div className="text-3xl mb-3">🔍</div>
                <h3 className="font-serif-brand text-lg font-bold text-gray-900 mb-1">
                  No matching items found
                </h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto mb-4">
                  Try adjusting your shape or type filter, or reset your search query.
                </p>
                <button
                  onClick={() => {
                    setSelectedShape('all');
                    setSelectedType('all');
                    setPriceRange('all');
                    setSuppliesSearch('');
                    setSelectedCategory('all');
                  }}
                  className="rounded-xl bg-[#0E5E58] px-4 py-2 text-xs font-bold text-white hover:bg-[#0B4A45]"
                >
                  Show All 624 Items
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredSupplies.map((item) => (
                  <MarketplaceItemCard
                    key={item.id}
                    item={item}
                    onQuickView={(it) => setSelectedItem(it)}
                    onSelectProduct={onSelectProduct}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* 100 Verified Dogs View */
          <div>
            <div className="bg-white rounded-2xl p-4 border border-[#E8E6DF] mb-6 shadow-2xs space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif-brand text-xl font-bold text-[#1E232A]">
                    Verified Canines for Adoption &amp; Reservation
                  </h2>
                  <p className="text-xs text-gray-500">
                    Over 100 health-screened dogs of all sizes from Chewy, Petco &amp; Reserve partners.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    showOnlyFavorites
                      ? 'bg-rose-50 text-rose-600 border border-rose-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Heart size={14} fill={showOnlyFavorites ? 'currentColor' : 'none'} />
                  <span>Favorites ({favorites.length})</span>
                </button>
              </div>

              {/* Dog Filters */}
              <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-100">
                <div className="relative flex-1 min-w-[200px]">
                  <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by dog name, breed, location..."
                    value={dogSearch}
                    onChange={(e) => setDogSearch(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 py-1.5 pl-9 pr-3 text-xs"
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-gray-500">Size:</span>
                  <select
                    value={activeDogSize}
                    onChange={(e) => setActiveDogSize(e.target.value)}
                    className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold"
                  >
                    <option value="all">All Sizes (100 Dogs)</option>
                    <option value="toy">Toy (&lt; 12 lbs)</option>
                    <option value="small">Small (12-25 lbs)</option>
                    <option value="medium">Medium (26-55 lbs)</option>
                    <option value="large">Large (56-90 lbs)</option>
                    <option value="giant">Giant (90+ lbs)</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-gray-500">Source:</span>
                  <select
                    value={selectedDogPartner}
                    onChange={(e) => setSelectedDogPartner(e.target.value)}
                    className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold"
                  >
                    <option value="all">All Partners</option>
                    <option value="chewy">Chewy Partner Network</option>
                    <option value="petco">Petco Love Partner</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-gray-500">Sort:</span>
                  <select
                    value={dogSortBy}
                    onChange={(e) => setDogSortBy(e.target.value)}
                    className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold"
                  >
                    <option value="featured">Featured</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="weight-low">Weight: Lightest</option>
                    <option value="weight-high">Weight: Heaviest</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Dog Cards Grid */}
            {isLoadingDogs ? (
              <div className="py-20 text-center text-xs font-bold text-gray-500">
                Loading 100 marketplace dogs...
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredDogs.map((dog) => (
                  <MarketplaceDogCard
                    key={dog.id}
                    dog={dog}
                    isFavorite={favorites.includes(dog.id)}
                    onToggleFavorite={toggleFavorite}
                    onSelect={(d) => setSelectedDog(d)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Item Modal (Quick View & Direct Add to Cart) */}
      <MarketplaceItemModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />

      {/* Dog Modal */}
      <MarketplaceDogModal
        dog={selectedDog}
        onClose={() => setSelectedDog(null)}
        onReserveSuccess={(dogName) => {
          setReservationNotice(`Reservation confirmed for ${dogName}! Partner coordinator will reach out.`);
          setTimeout(() => setReservationNotice(null), 6000);
        }}
      />
    </div>
  );
};
