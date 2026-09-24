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

  // Live supplies with newly added / edited items persisted
  const [allSupplies, setAllSupplies] = useState<MarketplaceItem[]>(() => {
    try {
      const custom = localStorage.getItem('hound_marketplace_custom_supplies');
      const customList: any[] = custom ? JSON.parse(custom) : [];
      if (customList.length === 0) return ALL_MARKETPLACE_ITEMS;

      const map = new Map<string, any>();
      customList.forEach((it) => {
        map.set(it.id, it);
        if (it.slug) map.set(it.slug, it);
      });
      ALL_MARKETPLACE_ITEMS.forEach((it) => {
        if (!map.has(it.id) && !map.has(it.slug)) {
          map.set(it.id, it);
        }
      });
      return Array.from(map.values());
    } catch {
      return ALL_MARKETPLACE_ITEMS;
    }
  });

  // Sync with backend products to get latest additions and edits
  useEffect(() => {
    apiRequest<{ success: boolean; products: any[] }>('/admin/products')
      .then((res) => {
        if (res && res.products && res.products.length > 0) {
          const map = new Map<string, any>();
          res.products.forEach((p) => {
            map.set(p.id, p);
            if (p.slug) map.set(p.slug, p);
          });
          ALL_MARKETPLACE_ITEMS.forEach((it) => {
            if (!map.has(it.id) && !map.has(it.slug)) {
              map.set(it.id, it);
            }
          });
          setAllSupplies(Array.from(map.values()));
        }
      })
      .catch(() => {});
  }, []);

  // Dogs State (100 dogs)
  const [dogs, setDogs] = useState<MarketplaceDog[]>(() => {
    try {
      const custom = localStorage.getItem('hound_marketplace_custom_dogs');
      return custom ? JSON.parse(custom) : [];
    } catch {
      return [];
    }
  });
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
    setIsLoadingDogs(true);
    apiRequest<{ success: boolean; total: number; dogs: MarketplaceDog[] }>('/marketplace/dogs')
      .then((res) => {
        if (res && res.dogs) {
          try {
            const custom = localStorage.getItem('hound_marketplace_custom_dogs');
            const customList: MarketplaceDog[] = custom ? JSON.parse(custom) : [];
            const map = new Map<string, MarketplaceDog>();
            customList.forEach((d) => map.set(d.id, d));
            res.dogs.forEach((d) => {
              if (!map.has(d.id)) map.set(d.id, d);
            });
            setDogs(Array.from(map.values()));
          } catch {
            setDogs(res.dogs);
          }
        }
      })
      .catch(console.error)
      .finally(() => setIsLoadingDogs(false));
  }, []);

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
    if (selectedCategory === 'all') return allSupplies;
    return allSupplies.filter((item) => item.category === selectedCategory);
  }, [allSupplies, selectedCategory]);

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

  // Filtered & Sorted Supplies Items: newly added / edited items at top unless user chose custom sort
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
    }).sort((a: any, b: any) => {
      // If user selected a specific sort filter, respect that filter!
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'title') return a.title.localeCompare(b.title);

      // Default: newly added or edited items are placed at the top!
      const aTime = a.recentlyAdminEditedAt || (a.isRecentlyUpdated ? 1 : 0) || 0;
      const bTime = b.recentlyAdminEditedAt || (b.isRecentlyUpdated ? 1 : 0) || 0;
      if (aTime !== bTime) {
        return bTime - aTime;
      }
      return 0; // maintain base order
    });
  }, [categoryItems, selectedShape, selectedType, priceRange, suppliesSearch, sortBy]);

  // Filtered Dogs: newly added / edited dogs at top unless user chose custom sort
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
    }).sort((a: any, b: any) => {
      // If user selected a specific sort filter, respect that filter!
      if (dogSortBy === 'price-low') return a.price - b.price;
      if (dogSortBy === 'price-high') return b.price - a.price;
      if (dogSortBy === 'weight-low') return a.weightLbs - b.weightLbs;
      if (dogSortBy === 'weight-high') return b.weightLbs - a.weightLbs;

      // Default: newly added or edited dogs are placed at the top!
      const aTime = a.recentlyAdminEditedAt || (a.isRecentlyUpdated ? 1 : 0) || 0;
      const bTime = b.recentlyAdminEditedAt || (b.isRecentlyUpdated ? 1 : 0) || 0;
      if (aTime !== bTime) {
        return bTime - aTime;
      }
      return 0;
    });
  }, [dogs, showOnlyFavorites, favorites, activeDogSize, selectedDogPartner, dogSearch, dogSortBy]);

  const activeCategoryDef = MARKETPLACE_CATEGORIES.find((c) => c.id === selectedCategory);

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-24 text-[#1E232A] w-full max-w-full overflow-x-hidden">
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
      <section className="relative overflow-hidden bg-[#1E232A] text-white border-b border-gray-800 w-full max-w-full">
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 w-full max-w-full min-w-0">
        {viewMode === 'supplies' ? (
          <div className="w-full max-w-full min-w-0">
            {/* 12 Departments Scrollable Filter Bar */}
            <div className="mb-6 w-full max-w-full min-w-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Select Dog Department ({MARKETPLACE_CATEGORIES.length} Categories):
                </span>
                <span className="text-xs font-medium text-[#0E5E58]">
                  {selectedCategory === 'all' ? 'Showing All 624 Items' : `${activeCategoryDef?.name} (52 Items)`}
                </span>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin w-full max-w-full">
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
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E8E6DF] mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs w-full max-w-full">
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

            {/* Controls Bar: Search, Shape Dropdown, Type Dropdown, Price Dropdown, Sort Dropdown */}
            <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-[#E8E6DF] mb-6 shadow-2xs space-y-3 w-full max-w-full">
              {/* Row 1: Search */}
              <div className="relative w-full">
                <Search size={16} className="absolute left-3.5 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by title, shape (round, rectangular), type (orthopedic, waterproof)..."
                  value={suppliesSearch}
                  onChange={(e) => setSuppliesSearch(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-[#FAF9F6] py-2.5 pl-10 pr-9 text-xs text-[#1E232A] focus:border-[#0E5E58] focus:bg-white focus:outline-none transition-all"
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

              {/* Row 2: Dropdowns - Shape, Type, Price, Sort */}
              <div className="pt-2 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-xs">
                {/* Shape Filter Dropdown */}
                <div className="flex flex-col gap-1 min-w-0">
                  <label htmlFor="filter-shape" className="text-[11px] font-bold text-gray-600 flex items-center gap-1">
                    <Box size={13} className="text-[#0E5E58]" /> Shape
                  </label>
                  <select
                    id="filter-shape"
                    value={selectedShape}
                    onChange={(e) => setSelectedShape(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-[#FAF9F6] px-2.5 py-2 text-xs font-semibold text-gray-800 focus:border-[#0E5E58] focus:bg-white focus:outline-none truncate"
                  >
                    <option value="all">All Shapes ({availableShapes.length})</option>
                    {availableShapes.map((shape) => (
                      <option key={shape} value={shape}>
                        {shape}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Type Filter Dropdown */}
                <div className="flex flex-col gap-1 min-w-0">
                  <label htmlFor="filter-type" className="text-[11px] font-bold text-gray-600 flex items-center gap-1">
                    <Layers size={13} className="text-[#0E5E58]" /> Type
                  </label>
                  <select
                    id="filter-type"
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-[#FAF9F6] px-2.5 py-2 text-xs font-semibold text-gray-800 focus:border-[#0E5E58] focus:bg-white focus:outline-none truncate"
                  >
                    <option value="all">All Types ({availableTypes.length})</option>
                    {availableTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Filter Dropdown */}
                <div className="flex flex-col gap-1 min-w-0">
                  <label htmlFor="filter-price" className="text-[11px] font-bold text-gray-600 flex items-center gap-1">
                    <Tag size={13} className="text-[#0E5E58]" /> Price
                  </label>
                  <select
                    id="filter-price"
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-[#FAF9F6] px-2.5 py-2 text-xs font-semibold text-gray-800 focus:border-[#0E5E58] focus:bg-white focus:outline-none truncate"
                  >
                    <option value="all">All Prices</option>
                    <option value="under-10">Under $10</option>
                    <option value="10-20">$10 - $20</option>
                    <option value="20-30">$20 - $30</option>
                    <option value="30-plus">$30 &amp; Above</option>
                  </select>
                </div>

                {/* Sort Selector Dropdown */}
                <div className="flex flex-col gap-1 min-w-0">
                  <label htmlFor="filter-sort" className="text-[11px] font-bold text-gray-600 flex items-center gap-1">
                    <ArrowUpDown size={13} className="text-[#0E5E58]" /> Sort
                  </label>
                  <select
                    id="filter-sort"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-[#FAF9F6] px-2.5 py-2 text-xs font-semibold text-gray-800 focus:border-[#0E5E58] focus:bg-white focus:outline-none truncate"
                  >
                    <option value="featured">Featured First</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                    <option value="title">Alphabetical (A-Z)</option>
                  </select>
                </div>
              </div>

              {/* Active Filter Tags Indicator (if filters applied) with Quick Clear */}
              {(selectedShape !== 'all' || selectedType !== 'all' || priceRange !== 'all' || suppliesSearch.trim() !== '') && (
                <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="text-gray-500 font-medium">Active:</span>
                  {selectedShape !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#F4F8F7] text-[#0E5E58] border border-[#0E5E58]/20 font-semibold">
                      Shape: {selectedShape}
                      <button onClick={() => setSelectedShape('all')} className="hover:text-red-600 ml-0.5" title="Remove shape filter">✕</button>
                    </span>
                  )}
                  {selectedType !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#F4F8F7] text-[#0E5E58] border border-[#0E5E58]/20 font-semibold">
                      Type: {selectedType}
                      <button onClick={() => setSelectedType('all')} className="hover:text-red-600 ml-0.5" title="Remove type filter">✕</button>
                    </span>
                  )}
                  {priceRange !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#F4F8F7] text-[#0E5E58] border border-[#0E5E58]/20 font-semibold">
                      Price: {priceRange}
                      <button onClick={() => setPriceRange('all')} className="hover:text-red-600 ml-0.5" title="Remove price filter">✕</button>
                    </span>
                  )}
                  {suppliesSearch.trim() && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#F4F8F7] text-[#0E5E58] border border-[#0E5E58]/20 font-semibold">
                      Search: "{suppliesSearch}"
                      <button onClick={() => setSuppliesSearch('')} className="hover:text-red-600 ml-0.5" title="Remove search filter">✕</button>
                    </span>
                  )}
                  <button
                    onClick={() => {
                      setSelectedShape('all');
                      setSelectedType('all');
                      setPriceRange('all');
                      setSuppliesSearch('');
                    }}
                    className="text-red-600 hover:underline font-semibold ml-auto text-[11px]"
                  >
                    Reset all
                  </button>
                </div>
              )}
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
          <div className="w-full max-w-full min-w-0">
            <div className="bg-white rounded-2xl p-4 border border-[#E8E6DF] mb-6 shadow-2xs space-y-3 w-full max-w-full">
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
                  className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
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
              <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 pt-2 border-t border-gray-100">
                <div className="relative flex-1 min-w-0">
                  <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by dog name, breed, location..."
                    value={dogSearch}
                    onChange={(e) => setDogSearch(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 py-1.5 pl-9 pr-3 text-xs"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 sm:flex sm:items-center sm:gap-3">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                    <span className="text-[11px] sm:text-xs font-bold text-gray-500">Size:</span>
                    <select
                      value={activeDogSize}
                      onChange={(e) => setActiveDogSize(e.target.value)}
                      className="rounded-lg border border-gray-200 px-2 py-1.5 text-xs font-semibold"
                    >
                      <option value="all">All Sizes</option>
                      <option value="toy">Toy (&lt; 12 lbs)</option>
                      <option value="small">Small (12-25 lbs)</option>
                      <option value="medium">Medium (26-55 lbs)</option>
                      <option value="large">Large (56-90 lbs)</option>
                      <option value="giant">Giant (90+ lbs)</option>
                    </select>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                    <span className="text-[11px] sm:text-xs font-bold text-gray-500">Source:</span>
                    <select
                      value={selectedDogPartner}
                      onChange={(e) => setSelectedDogPartner(e.target.value)}
                      className="rounded-lg border border-gray-200 px-2 py-1.5 text-xs font-semibold"
                    >
                      <option value="all">All Partners</option>
                      <option value="chewy">Chewy</option>
                      <option value="petco">Petco</option>
                    </select>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                    <span className="text-[11px] sm:text-xs font-bold text-gray-500">Sort:</span>
                    <select
                      value={dogSortBy}
                      onChange={(e) => setDogSortBy(e.target.value)}
                      className="rounded-lg border border-gray-200 px-2 py-1.5 text-xs font-semibold"
                    >
                      <option value="featured">Featured</option>
                      <option value="price-low">Price: Low</option>
                      <option value="price-high">Price: High</option>
                      <option value="weight-low">Weight: Low</option>
                      <option value="weight-high">Weight: High</option>
                    </select>
                  </div>
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
