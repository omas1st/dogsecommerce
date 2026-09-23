import React, { useState, useEffect } from 'react';
import { Pet, Product } from '../types';
import { ProductCard } from '../components/ProductCard';
import { usePets } from '../context/PetContext';
import { useCart } from '../context/CartContext';
import { apiRequest } from '../services/api';
import {
  Sparkles,
  AlertCircle,
  Repeat,
  Calendar,
  Weight,
  Heart,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Package,
  ShoppingBag,
  Search,
  Filter,
  X,
  Info,
  ShieldCheck,
  ChevronRight,
  Eye,
  Activity,
  Award,
} from 'lucide-react';

interface PetDashboardPageProps {
  petId?: string;
  onNavigate: (route: string, params?: any) => void;
  onSelectProduct: (product: Product) => void;
}

export const PetDashboardPage: React.FC<PetDashboardPageProps> = ({
  petId,
  onNavigate,
  onSelectProduct,
}) => {
  const { pets, activePet, setActivePet } = usePets();
  const { addToCart } = useCart();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'directory'>('dashboard');
  const [currentPet, setCurrentPet] = useState<Pet | null>(null);
  const [dashboardData, setDashboardData] = useState<{
    pet: Pet;
    depletionTracking: any[];
    recommendations: any[];
    recommendationReasons?: Record<string, string>;
    healthInsights: string[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Directory Filters & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [selectedDiet, setSelectedDiet] = useState<string>('all');
  const [selectedActivity, setSelectedActivity] = useState<string>('all');
  const [inspectingDog, setInspectingDog] = useState<Pet | null>(null);

  const targetPetId = petId || activePet?.id || pets[0]?.id;

  useEffect(() => {
    async function loadDashboard() {
      if (!targetPetId) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const found = pets.find((p) => p?.id === targetPetId) || activePet || pets[0];
        if (found) setCurrentPet(found);

        const data = await apiRequest<{
          success: boolean;
          pet: Pet;
          depletionTracking: any[];
          recommendations: any[];
          recommendationReasons?: Record<string, string>;
          healthInsights: string[];
        }>(`/pets/${targetPetId}/dashboard`);

        setDashboardData(data);
        if (data.pet) setCurrentPet(data.pet);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboard();
  }, [targetPetId, pets]);

  // Filter 50 dogs
  const filteredDogs = pets.filter((dog) => {
    const matchesSearch =
      dog.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dog.breed.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dog.allergies?.some((a) => a.toLowerCase().includes(searchQuery.toLowerCase())) ||
      dog.dietType?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSize = selectedSize === 'all' || dog.size === selectedSize;
    const matchesDiet = selectedDiet === 'all' || dog.dietType === selectedDiet;
    const matchesActivity = selectedActivity === 'all' || dog.activityLevel === selectedActivity;

    return matchesSearch && matchesSize && matchesDiet && matchesActivity;
  });

  const handleSelectPet = (pet: Pet) => {
    setActivePet(pet);
    setCurrentPet(pet);
    setActiveTab('dashboard');
  };

  const depletionItem = dashboardData?.depletionTracking?.[0];

  return (
    <div className="min-h-screen bg-[#FAF9F6] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-gray-200 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0E5E58]">
                Canine Health &amp; Nutrition System
              </span>
              <span className="text-xs bg-[#E8F3F1] text-[#0E5E58] px-2.5 py-0.5 rounded-full font-bold">
                {pets.length} Default Canines Available
              </span>
            </div>
            <h1 className="font-serif-brand text-3xl font-bold text-[#1E232A] mt-1">
              {activeTab === 'dashboard' && currentPet
                ? `${currentPet.name}’s Health & Care Portal`
                : 'Canine Directory & 50 Dog Profiles'}
            </h1>
          </div>

          {/* View Toggles & Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-white border border-gray-200 p-1 rounded-xl flex items-center shadow-xs">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-[#0E5E58] text-white shadow-xs'
                    : 'text-gray-600 hover:text-[#0E5E58]'
                }`}
              >
                🐾 Active Dashboard
              </button>
              <button
                onClick={() => setActiveTab('directory')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'directory'
                    ? 'bg-[#0E5E58] text-white shadow-xs'
                    : 'text-gray-600 hover:text-[#0E5E58]'
                }`}
              >
                🐕 50 Canines Directory ({pets.length})
              </button>
            </div>

            <button
              onClick={() => onNavigate('add-pet')}
              className="flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-xs font-bold text-[#0E5E58] hover:bg-[#F4F8F7] shadow-xs"
            >
              <Plus size={14} /> Add Dog
            </button>
          </div>
        </div>

        {/* Quick Dog Selector Strip */}
        <div className="bg-white border border-[#E8E6DF] rounded-2xl p-3 shadow-2xs flex items-center gap-3 overflow-x-auto scrollbar-thin">
          <span className="text-xs font-bold text-gray-500 uppercase shrink-0 pl-1">
            Quick Switch ({pets.length}):
          </span>
          <div className="flex items-center gap-2 shrink-0">
            {pets.filter((p) => p && p.id).slice(0, 10).map((p) => (
              <button
                key={p.id}
                onClick={() => handleSelectPet(p)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold shrink-0 transition-all ${
                  currentPet?.id === p.id
                    ? 'bg-[#0E5E58] text-white shadow-xs'
                    : 'bg-[#FAF9F6] border border-gray-200 text-gray-700 hover:border-[#0E5E58]'
                }`}
              >
                <img
                  src={p.photoUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=80&q=80'}
                  alt={p.name}
                  className="w-4 h-4 rounded-full object-cover"
                />
                <span>{p.name}</span>
                <span className="text-[10px] opacity-75">({p.breed.split(' ')[0]})</span>
              </button>
            ))}
            {pets.length > 10 && (
              <button
                onClick={() => setActiveTab('directory')}
                className="text-xs font-bold text-[#0E5E58] bg-[#E8F3F1] hover:bg-[#D4E8E4] px-3 py-1 rounded-full shrink-0"
              >
                + View All {pets.length} Dogs →
              </button>
            )}
          </div>
        </div>

        {/* TAB 1: INDIVIDUAL PET DASHBOARD */}
        {activeTab === 'dashboard' && currentPet && (
          <div className="space-y-8">
            {/* Pet Profile Hero Card */}
            <div className="rounded-2xl border border-[#E8E6DF] bg-white p-6 shadow-xs">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Avatar & Key Stats */}
                <div className="lg:col-span-4 flex items-center gap-4">
                  <img
                    src={currentPet.photoUrl || 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=400&q=80'}
                    alt={currentPet.name}
                    className="w-24 h-24 rounded-2xl object-cover border-2 border-[#0E5E58] shrink-0"
                  />
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-bold text-[#1E232A] truncate">{currentPet.name}</h2>
                      <span className="text-xs bg-[#E8F3F1] text-[#0E5E58] px-2 py-0.5 rounded-md font-semibold capitalize shrink-0">
                        {currentPet.gender}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 font-medium truncate">{currentPet.breed}</div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 pt-1">
                      <span>{currentPet.ageYears} yrs {currentPet.ageMonths} mos</span>
                      <span>•</span>
                      <span>{currentPet.weightLbs} lbs ({currentPet.size})</span>
                    </div>
                  </div>
                </div>

                {/* Nutrition & Allergens Attributes */}
                <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-[#FAF9F6] p-3 rounded-xl border border-gray-200">
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Diet Strategy</span>
                    <span className="font-semibold text-gray-800 capitalize">
                      {currentPet.dietType?.replace(/_/g, ' ') || 'Dry Kibble'}
                    </span>
                  </div>

                  <div className="bg-[#FAF9F6] p-3 rounded-xl border border-gray-200">
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Known Allergies</span>
                    <span className="font-bold text-[#E05338] truncate block">
                      {currentPet.allergies && currentPet.allergies.length > 0
                        ? currentPet.allergies.join(', ')
                        : 'None Reported'}
                    </span>
                  </div>

                  <div className="bg-[#FAF9F6] p-3 rounded-xl border border-gray-200">
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Activity Level</span>
                    <span className="font-semibold text-gray-800 capitalize">
                      {currentPet.activityLevel}
                    </span>
                  </div>

                  <div className="bg-[#FAF9F6] p-3 rounded-xl border border-gray-200">
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Favorite Flavors</span>
                    <span className="font-semibold text-gray-800 truncate block">
                      {currentPet.foodPreferences?.slice(0, 2).join(', ') || 'Wild Salmon'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action & Notes Row */}
              <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="text-gray-600 flex items-center gap-2">
                  <Info size={14} className="text-[#0E5E58] shrink-0" />
                  <span className="italic">{currentPet.specialNeeds || currentPet.notes || 'Standard adult canine wellness routine.'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setInspectingDog(currentPet)}
                    className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    <Eye size={13} /> View Full Profile
                  </button>
                  <button
                    onClick={() => currentPet?.id && onNavigate('edit-pet', { petId: currentPet.id })}
                    className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    <Edit2 size={13} /> Edit Profile
                  </button>
                </div>
              </div>
            </div>

            {/* Smart Reorder Depletion Alert Banner */}
            {depletionItem && (
              <div className="rounded-2xl border-2 border-[#0E5E58]/30 bg-[#F4F8F7] p-6 shadow-xs">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-[#0E5E58] p-1 text-white">
                        <Repeat size={14} />
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#0E5E58]">
                        Smart Reorder Depletion Alert
                      </span>
                    </div>
                    <h3 className="font-serif-brand text-xl font-bold text-[#1E232A]">
                      {currentPet.name} has approximately {depletionItem.daysRemaining} days of food remaining
                    </h3>
                    <p className="text-xs text-[#525B67] leading-relaxed max-w-xl">
                      {depletionItem.recommendationMessage}
                    </p>

                    {/* Depletion Progress Bar */}
                    <div className="pt-2 max-w-md">
                      <div className="flex justify-between text-[11px] font-semibold text-gray-600 mb-1">
                        <span>Depletion Progress</span>
                        <span>{depletionItem.percentageRemaining}% Remaining in Bag</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            depletionItem.percentageRemaining < 25 ? 'bg-[#E05338]' : 'bg-[#0E5E58]'
                          }`}
                          style={{ width: `${depletionItem.percentageRemaining}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* 1-Click Replenish Action */}
                  <div className="shrink-0 bg-white p-4 rounded-xl border border-[#D4E8E4] text-center space-y-3">
                    <span className="text-xs text-gray-500 block">Autoship saves 10% on every bag</span>
                    <button
                      onClick={() => addToCart(depletionItem.productId, undefined, 1, true, 'monthly')}
                      className="w-full rounded-xl bg-[#0E5E58] px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#0B4A45] flex items-center justify-center gap-2"
                    >
                      <ShoppingBag size={14} />
                      <span>1-Click Reorder (${depletionItem.price?.toFixed(2) || '67.49'})</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Health Insights / Veterinary Tips */}
            {dashboardData?.healthInsights && dashboardData.healthInsights.length > 0 && (
              <div className="rounded-2xl border border-[#E8E6DF] bg-white p-6 shadow-xs">
                <h3 className="font-serif-brand text-lg font-bold text-[#1E232A] mb-3 flex items-center gap-2">
                  <Sparkles size={16} className="text-[#0E5E58]" />
                  Veterinarian &amp; Wellness Insights for {currentPet.name}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {dashboardData.healthInsights.map((insight, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FAF9F6] border border-gray-100 text-xs text-[#525B67]">
                      <CheckCircle2 size={16} className="text-[#0E5E58] shrink-0 mt-0.5" />
                      <span>{insight}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tailored Product Recommendations Grid */}
            <div>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0E5E58]">
                    Intelligent Algorithmic Matching
                  </span>
                  <h2 className="font-serif-brand text-2xl font-bold text-[#1E232A] mt-0.5">
                    Recommended For {currentPet.name}’s Breed &amp; Diet
                  </h2>
                </div>
                <button
                  onClick={() => onNavigate('shop')}
                  className="text-xs font-bold text-[#0E5E58] hover:underline"
                >
                  Browse All Products →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {dashboardData?.recommendations
                  ?.map((item: any) => {
                    const prod: Product = item?.product || item;
                    const reason: string =
                      item?.reason ||
                      dashboardData?.recommendationReasons?.[prod?.id] ||
                      `Tailored specifically for ${currentPet?.name || 'canines'}`;
                    return { product: prod, reason };
                  })
                  .filter((entry) => entry.product && entry.product.id)
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
          </div>
        )}

        {/* TAB 2: 50 CANINES DIRECTORY & PROFILES */}
        {activeTab === 'directory' && (
          <div className="space-y-6">
            {/* Search & Filter Header Bar */}
            <div className="bg-white border border-[#E8E6DF] rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-96">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by dog name, breed, allergy, or diet..."
                    className="w-full rounded-xl border border-gray-200 bg-[#FAF9F6] pl-10 pr-4 py-2.5 text-xs text-gray-800 placeholder-gray-400 focus:border-[#0E5E58] focus:bg-white focus:outline-none"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className="text-xs text-gray-500 font-semibold">
                  Showing <strong>{filteredDogs.length}</strong> of {pets.length} Default Canines
                </div>
              </div>

              {/* Filter Pills */}
              <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-100 text-xs">
                {/* Size Filter */}
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-400 font-bold uppercase text-[10px]">Size:</span>
                  {['all', 'toy', 'small', 'medium', 'large', 'giant'].map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`px-2.5 py-1 rounded-lg font-semibold capitalize transition-all ${
                        selectedSize === sz
                          ? 'bg-[#0E5E58] text-white shadow-xs'
                          : 'bg-[#FAF9F6] border border-gray-200 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>

                {/* Diet Filter */}
                <div className="flex items-center gap-1.5 ml-0 sm:ml-4">
                  <span className="text-gray-400 font-bold uppercase text-[10px]">Diet:</span>
                  {['all', 'dry_kibble', 'freeze_dried', 'raw_fresh', 'wet_canned'].map((dt) => (
                    <button
                      key={dt}
                      onClick={() => setSelectedDiet(dt)}
                      className={`px-2.5 py-1 rounded-lg font-semibold capitalize transition-all ${
                        selectedDiet === dt
                          ? 'bg-[#0E5E58] text-white shadow-xs'
                          : 'bg-[#FAF9F6] border border-gray-200 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {dt.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>

                {/* Activity Filter */}
                <div className="flex items-center gap-1.5 ml-0 sm:ml-4">
                  <span className="text-gray-400 font-bold uppercase text-[10px]">Activity:</span>
                  {['all', 'athletic', 'working', 'high', 'moderate', 'low'].map((act) => (
                    <button
                      key={act}
                      onClick={() => setSelectedActivity(act)}
                      className={`px-2.5 py-1 rounded-lg font-semibold capitalize transition-all ${
                        selectedActivity === act
                          ? 'bg-[#0E5E58] text-white shadow-xs'
                          : 'bg-[#FAF9F6] border border-gray-200 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {act}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Canine Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDogs.filter((dog) => dog && dog.id).map((dog) => {
                const isActive = currentPet?.id === dog.id;
                return (
                  <div
                    key={dog.id}
                    className={`rounded-2xl border transition-all duration-200 bg-white p-5 shadow-2xs hover:shadow-md flex flex-col justify-between ${
                      isActive ? 'border-[#0E5E58] ring-2 ring-[#0E5E58]/20' : 'border-[#E8E6DF]'
                    }`}
                  >
                    <div>
                      {/* Top Header */}
                      <div className="flex items-start gap-4">
                        <img
                          src={dog.photoUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=300&q=80'}
                          alt={dog.name}
                          className="w-20 h-20 rounded-xl object-cover border border-gray-200 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-serif-brand text-lg font-bold text-[#1E232A] truncate">
                              {dog.name}
                            </h3>
                            <span className="text-[10px] bg-[#E8F3F1] text-[#0E5E58] font-bold px-2 py-0.5 rounded-full capitalize">
                              {dog.size}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 font-medium truncate">{dog.breed}</p>
                          <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-1">
                            <span>{dog.ageYears}y {dog.ageMonths}m</span>
                            <span>•</span>
                            <span>{dog.weightLbs} lbs</span>
                            <span>•</span>
                            <span className="capitalize">{dog.gender}</span>
                          </div>
                        </div>
                      </div>

                      {/* Attributes & Diet */}
                      <div className="mt-4 grid grid-cols-2 gap-2 text-[11px]">
                        <div className="bg-[#FAF9F6] p-2 rounded-lg border border-gray-100">
                          <span className="text-gray-400 block text-[9px] uppercase font-bold">Diet</span>
                          <span className="font-semibold text-gray-700 capitalize truncate block">
                            {dog.dietType?.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <div className="bg-[#FAF9F6] p-2 rounded-lg border border-gray-100">
                          <span className="text-gray-400 block text-[9px] uppercase font-bold">Activity</span>
                          <span className="font-semibold text-gray-700 capitalize truncate block">
                            {dog.activityLevel}
                          </span>
                        </div>
                      </div>

                      {/* Allergies & Preferences */}
                      <div className="mt-3 space-y-1">
                        {dog.allergies && dog.allergies.length > 0 ? (
                          <div className="flex flex-wrap items-center gap-1">
                            <span className="text-[10px] text-[#E05338] font-bold">Allergies:</span>
                            {dog.allergies.map((allergy, i) => (
                              <span
                                key={i}
                                className="bg-[#FDF2F0] text-[#E05338] border border-[#F9D6D0] text-[9px] font-bold px-1.5 py-0.5 rounded"
                              >
                                {allergy}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[10px] text-gray-400">No known allergies</span>
                        )}
                      </div>

                      {/* Bio Notes */}
                      <p className="mt-3 text-xs text-gray-600 line-clamp-2 leading-relaxed">
                        {dog.notes || dog.specialNeeds || 'Friendly family canine.'}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2">
                      <button
                        onClick={() => handleSelectPet(dog)}
                        className={`flex-1 rounded-xl py-2 text-xs font-bold transition-all text-center ${
                          isActive
                            ? 'bg-[#0E5E58] text-white shadow-xs'
                            : 'bg-[#F4F8F7] text-[#0E5E58] hover:bg-[#0E5E58] hover:text-white'
                        }`}
                      >
                        {isActive ? '✓ Active Canine' : 'Switch to Dashboard'}
                      </button>
                      <button
                        onClick={() => setInspectingDog(dog)}
                        title="View Detailed Canine Health Profile"
                        className="rounded-xl border border-gray-200 p-2 text-gray-600 hover:bg-gray-50 hover:text-[#0E5E58]"
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* MODAL: FULL CANINE DETAILS & CLINICAL/NUTRITIONAL DOSSIER */}
        {inspectingDog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
            <div className="relative w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl border border-gray-100 space-y-6 max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setInspectingDog(null)}
                className="absolute right-5 top-5 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <X size={18} />
              </button>

              {/* Modal Header with Photo */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                <img
                  src={inspectingDog.photoUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80'}
                  alt={inspectingDog.name}
                  className="w-28 h-28 rounded-2xl object-cover border-2 border-[#0E5E58] shadow-sm"
                />
                <div className="space-y-1 text-center sm:text-left">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h2 className="font-serif-brand text-2xl font-bold text-[#1E232A]">
                      {inspectingDog.name}
                    </h2>
                    <span className="text-xs bg-[#E8F3F1] text-[#0E5E58] px-2.5 py-0.5 rounded-full font-bold capitalize">
                      {inspectingDog.gender} • {inspectingDog.size} size
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-gray-600">{inspectingDog.breed}</p>
                  <p className="text-xs text-gray-400">
                    Age: {inspectingDog.ageYears} years, {inspectingDog.ageMonths} months • Weight: {inspectingDog.weightLbs} lbs
                  </p>
                </div>
              </div>

              {/* Grid of Clinical & Nutritional Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-[#FAF9F6] p-3 rounded-xl border border-gray-200">
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Diet Strategy</span>
                  <span className="font-bold text-gray-800 capitalize">
                    {inspectingDog.dietType?.replace(/_/g, ' ') || 'Dry Kibble'}
                  </span>
                </div>
                <div className="bg-[#FAF9F6] p-3 rounded-xl border border-gray-200">
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Activity Metabolism</span>
                  <span className="font-bold text-gray-800 capitalize">{inspectingDog.activityLevel}</span>
                </div>
                <div className="bg-[#FAF9F6] p-3 rounded-xl border border-gray-200">
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Neutered/Spayed</span>
                  <span className="font-bold text-gray-800">{inspectingDog.isNeuteredOrSpayed ? 'Yes (Sterilized)' : 'Intact'}</span>
                </div>
              </div>

              {/* Specific Allergies & Food Preferences */}
              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl bg-[#FDF2F0] border border-[#F9D6D0]">
                  <span className="text-[10px] uppercase font-bold text-[#E05338] block mb-1">
                    Known Allergies &amp; Intolerances
                  </span>
                  <p className="text-gray-800 font-medium">
                    {inspectingDog.allergies && inspectingDog.allergies.length > 0
                      ? inspectingDog.allergies.join(', ')
                      : 'None reported. Safe for multi-protein blends.'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F4F8F7] border border-[#D4E8E4]">
                  <span className="text-[10px] uppercase font-bold text-[#0E5E58] block mb-1">
                    Food &amp; Treat Preferences
                  </span>
                  <p className="text-gray-800 font-medium">
                    {inspectingDog.foodPreferences && inspectingDog.foodPreferences.length > 0
                      ? inspectingDog.foodPreferences.join(', ')
                      : 'Enjoys wild salmon, lean duck, and sweet potato.'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200">
                  <span className="text-[10px] uppercase font-bold text-gray-500 block mb-1">
                    Special Physical / Medical Care Needs
                  </span>
                  <p className="text-gray-700 leading-relaxed">
                    {inspectingDog.specialNeeds || 'Standard wellness maintenance and active daily exercise.'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200">
                  <span className="text-[10px] uppercase font-bold text-gray-500 block mb-1">
                    Personality &amp; Lifestyle Bio
                  </span>
                  <p className="text-gray-700 leading-relaxed">
                    {inspectingDog.notes || 'Gentle companion with high loyalty and curiosity.'}
                  </p>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  onClick={() => setInspectingDog(null)}
                  className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleSelectPet(inspectingDog);
                    setInspectingDog(null);
                  }}
                  className="rounded-xl bg-[#0E5E58] px-5 py-2 text-xs font-bold text-white hover:bg-[#0B4A45] shadow-xs"
                >
                  Activate &amp; View Dashboard
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
