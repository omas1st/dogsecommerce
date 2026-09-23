import React, { useState } from 'react';
import { Product } from '../types';
import {
  Bone,
  Bed,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Package,
  Layers,
  Heart,
  RefreshCw,
  Search,
  CheckCircle2,
  ChevronRight,
  Home,
} from 'lucide-react';

interface CategoriesPageProps {
  onNavigate: (route: string, params?: any) => void;
  onSelectProduct?: (product: Product) => void;
}

export const CategoriesPage: React.FC<CategoriesPageProps> = ({ onNavigate }) => {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const categoryGroups = [
    {
      id: 'dog-food',
      name: 'Nutrition & Formulas',
      tagline: 'Veterinarian-formulated, single-protein & hypoallergenic meals',
      filterType: 'nutrition',
      image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=600&q=80',
      badge: 'Bestseller',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      subcategories: [
        { name: 'Cold-Pressed Dry Kibble', count: '14 Blends', desc: 'Preserves delicate omega fatty acids and enzymes' },
        { name: 'Freeze-Dried Raw Protein', count: '9 Recipes', desc: 'Pure USDA grass-fed beef, venison, & wild salmon' },
        { name: 'Fresh-Cooked Gently Steamed', count: '6 Formulas', desc: 'Human-grade turkey, sweet potato, & organic greens' },
        { name: 'Veterinary Limited-Ingredient', count: '8 Diets', desc: 'Engineered for sensitive stomachs & food allergies' },
      ],
      stats: '100% Free of poultry by-products, corn, wheat, & artificial preservatives',
    },
    {
      id: 'beds-furniture',
      name: 'Orthopedic Beds & Rest',
      tagline: 'Medical-grade high-density foam supporting canine hips and joints',
      filterType: 'comfort',
      image: 'https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?auto=format&fit=crop&w=600&q=80',
      badge: 'Veterinary Approved',
      badgeColor: 'bg-blue-100 text-blue-800',
      subcategories: [
        { name: 'Memory Foam Bolster Beds', count: '12 Sizes', desc: 'Cervical neck support with water-resistant microsuede' },
        { name: 'Cooling Gel Orthopedic Loungers', count: '8 Models', desc: 'Dissipates body heat for thick-coated breeds' },
        { name: 'Washable Heavy-Duty Covers', count: '16 Colors', desc: 'Ripstop fabric with hidden industrial zippers' },
        { name: 'Ergonomic Wooden Ramps & Stairs', count: '5 Heights', desc: 'Protects senior dogs and small breeds from joint impact' },
      ],
      stats: 'Tested to retain 95%+ firmness after 10,000 compression cycles',
    },
    {
      id: 'health-supplements',
      name: 'Supplements & Wellness',
      tagline: 'Clinical bioactive chews for mobility, gut microbiome, and calm',
      filterType: 'health',
      image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80',
      badge: 'Pure Science',
      badgeColor: 'bg-purple-100 text-purple-800',
      subcategories: [
        { name: 'Glucosamine & Green-Lipped Mussel', count: '6 Formulations', desc: 'Superior cartilage hydration and synovial fluid renewal' },
        { name: 'Probiotic & Prebiotic Digestion Chews', count: '5 Strengths', desc: '5 Billion CFU live cultures per soft chew' },
        { name: 'Wild Alaskan Salmon & Krill Oil', count: '4 Sizes', desc: 'High-potency EPA & DHA for glossy coat and brain health' },
        { name: 'L-Theanine & Chamomile Calm Chews', count: '3 Blends', desc: 'Eases thunderstorm and travel anxiety naturally' },
      ],
      stats: 'Manufactured in FDA-inspected, cGMP certified USA facilities',
    },
    {
      id: 'collars-leashes',
      name: 'Artisan Collars & Leashes',
      tagline: 'Hand-stitched English bridle leather & waterproof tactical biothane',
      filterType: 'gear',
      image: 'https://images.unsplash.com/photo-1535294435445-d7249524ef2e?auto=format&fit=crop&w=600&q=80',
      badge: 'Artisan Made',
      badgeColor: 'bg-amber-100 text-amber-800',
      subcategories: [
        { name: 'Waterproof Biothane Leashes', count: '18 Variations', desc: 'Odor-proof, mud-proof with solid brass hardware' },
        { name: 'Full-Grain Bridle Leather Collars', count: '14 Styles', desc: 'Handcrafted by heirloom leather artisans' },
        { name: 'No-Pull Ergonomic Chest Harnesses', count: '8 Sizes', desc: 'Distributes leash pressure evenly across canine sternum' },
        { name: 'Reflective Hands-Free Trail Running Leashes', count: '6 Models', desc: 'Bungee shock absorption with integrated dual handles' },
      ],
      stats: 'Solid cast brass snaps load-tested up to 500 lbs of pull force',
    },
    {
      id: 'crates-travel',
      name: 'Crates, Pens & Travel Gear',
      tagline: 'Heavy-duty aluminum crash-tested kennels & vehicle protective systems',
      filterType: 'gear',
      image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=600&q=80',
      badge: 'Crash Tested',
      badgeColor: 'bg-slate-100 text-slate-800',
      subcategories: [
        { name: 'Aviation-Grade Aluminum Crates', count: '7 Sizes', desc: 'Escape-proof dual slam-latch with reinforced corners' },
        { name: 'Foldable Heavy-Duty Exercise Pens', count: '5 Heights', desc: 'Rust-resistant electro-coat wire with secure stakes' },
        { name: 'Waterproof Hammock Car Seat Covers', count: '4 Profiles', desc: '600D Oxford cotton protecting upholstery & door cards' },
        { name: 'Airline-Approved Soft Carriers', count: '6 Styles', desc: 'Reinforced mesh ventilation with padded shoulder straps' },
      ],
      stats: 'Also available via our Certified Pre-Owned Resale program',
    },
    {
      id: 'treats-chews',
      name: 'Single-Ingredient Treats',
      tagline: 'Slow-roasted bully sticks, yak cheese churros, and freeze-dried organ meats',
      filterType: 'nutrition',
      image: 'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?auto=format&fit=crop&w=600&q=80',
      badge: '100% Natural',
      badgeColor: 'bg-rose-100 text-rose-800',
      subcategories: [
        { name: 'Odor-Free Grass-Fed Bully Sticks', count: '10 Packs', desc: 'Natural plaque and tartar scraping for clean canine teeth' },
        { name: 'Himalayan Yak Cheese Hard Chews', count: '6 Sizes', desc: 'Long-lasting, lactose-free rich protein chews' },
        { name: 'Freeze-Dried Beef & Bison Liver Bites', count: '8 Tins', desc: 'Ultra-high value positive reinforcement training rewards' },
        { name: 'Split Elk & Deer Antlers', count: '5 Grades', desc: 'Naturally shed mineral-rich marrow chews' },
      ],
      stats: '100% Single-ingredient or two-ingredient pure recipes',
    },
    {
      id: 'grooming-wellness',
      name: 'Spa Grooming & Coat Care',
      tagline: 'Botanical oat & aloe shampoos, detangling sprays, and paw protection balms',
      filterType: 'health',
      image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=600&q=80',
      badge: 'Non-Toxic',
      badgeColor: 'bg-teal-100 text-teal-800',
      subcategories: [
        { name: 'Colloidal Oatmeal Hypoallergenic Shampoo', count: '4 Sizes', desc: 'Calms itchy, sensitive canine skin and hot spots' },
        { name: 'Organic Shea Butter Paw & Nose Balm', count: '3 Tins', desc: 'Protects pads from scorching summer asphalt and winter salt' },
        { name: 'Stainless Steel Undercoat De-Shedding Rakes', count: '4 Styles', desc: 'Safely removes trapped dead hair without cutting topcoat' },
        { name: 'Silent Cordless Nail Grinders', count: '3 Kits', desc: 'Diamond bit wheels with quiet low-vibration motors' },
      ],
      stats: 'Free of sulfates, parabens, artificial fragrances, and dyes',
    },
    {
      id: 'resale',
      name: 'Certified Pre-Owned Resale',
      tagline: 'Inspected, 18-point sanitized premium gear at 30% to 55% off retail',
      filterType: 'gear',
      image: 'https://images.unsplash.com/photo-1597633425046-08f5110420b5?auto=format&fit=crop&w=600&q=80',
      badge: 'Eco Circular',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      subcategories: [
        { name: 'Certified Pre-Owned Crates', count: 'Varying Daily', desc: 'Heavy-duty Impact and Gunner kennels at incredible values' },
        { name: 'Inspected Vehicle Ramps', count: 'Weekly Drops', desc: 'Telescoping non-slip ramps with verified load safety' },
        { name: 'Refurbished Training Pens', count: 'Limited Stock', desc: 'Sanitized and inspected with complete hardware kits' },
        { name: 'Buyback Trade-In Portal', count: 'Instant Quotes', desc: 'Sell your dog’s outgrown equipment for cash or store credit' },
      ],
      stats: 'Every unit passes our strict 18-point mechanical and sanitation checklist',
    },
  ];

  const filtered = categoryGroups.filter((group) => {
    const matchesFilter = activeFilter === 'all' || group.filterType === activeFilter;
    const matchesSearch =
      searchTerm === '' ||
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.tagline.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.subcategories.some((s) => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#FAF9F6] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Navigation Breadcrumb Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E8E6DF]">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-1 text-[#0E5E58] font-bold hover:underline"
            >
              <Home size={14} />
              <span>Home</span>
            </button>
            <ChevronRight size={12} className="text-gray-400" />
            <span className="font-semibold text-gray-800">Canine Product Categories</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('home')}
              className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-2xs"
            >
              ← Back to Homepage
            </button>
            <button
              onClick={() => onNavigate('shop')}
              className="px-3.5 py-1.5 rounded-lg bg-[#0E5E58] text-xs font-bold text-white hover:bg-[#0B4A45] transition-colors shadow-2xs"
            >
              Browse All Products
            </button>
          </div>
        </div>

        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F3F1] text-[#0E5E58] text-xs font-bold uppercase tracking-wider">
            <Layers size={14} />
            <span>Complete Canine Catalog Directory</span>
          </div>
          <h1 className="font-serif-brand text-3xl sm:text-4xl font-bold text-[#1E232A] tracking-tight">
            Explore Hound &amp; Harbor Categories
          </h1>
          <p className="text-sm text-[#525B67] leading-relaxed">
            From precision veterinarian nutrition and medical-grade orthopedic beds to artisan hand-stitched leashes and certified pre-owned crates, discover specialized gear engineered for your dog's happiness and longevity.
          </p>
        </div>

        {/* Search & Filter Tabs Bar */}
        <div className="bg-white p-4 rounded-2xl border border-[#E8E6DF] shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {[
              { id: 'all', label: 'All Categories' },
              { id: 'nutrition', label: 'Food & Nutrition' },
              { id: 'comfort', label: 'Beds & Sleep' },
              { id: 'health', label: 'Wellness & Grooming' },
              { id: 'gear', label: 'Gear & Crates' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                  activeFilter === tab.id
                    ? 'bg-[#0E5E58] text-white shadow-2xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search size={15} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search category or item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-[#FAF9F6] py-1.5 pl-9 pr-3 text-xs text-gray-800 focus:border-[#0E5E58] focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filtered.map((category) => (
            <div
              key={category.id}
              className="group rounded-2xl border border-[#E8E6DF] bg-white overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col"
            >
              {/* Category Card Header */}
              <div className="relative h-48 sm:h-56 overflow-hidden bg-gray-100">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute top-4 left-4">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${category.badgeColor}`}>
                    {category.badge}
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="font-serif-brand text-2xl font-bold">{category.name}</h3>
                  <p className="text-xs text-gray-200 line-clamp-1 mt-0.5">{category.tagline}</p>
                </div>
              </div>

              {/* Subcategories List */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                <div className="space-y-3">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#0E5E58]">
                    Featured Subcategories
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {category.subcategories.map((sub, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          if (category.id === 'resale') {
                            onNavigate('resale');
                          } else {
                            onNavigate('shop', { category: category.id, search: sub.name });
                          }
                        }}
                        className="p-3 rounded-xl bg-[#FAF9F6] border border-gray-100 hover:border-[#0E5E58]/40 hover:bg-[#F4F8F7] cursor-pointer transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-900 line-clamp-1">{sub.name}</span>
                          <span className="text-[10px] text-gray-400 shrink-0 font-medium">{sub.count}</span>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-1 line-clamp-1">{sub.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quality Note & Action Button */}
                <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 text-[11px] text-[#0E5E58] font-medium">
                    <CheckCircle2 size={14} className="shrink-0" />
                    <span>{category.stats}</span>
                  </div>
                  <button
                    onClick={() => {
                      if (category.id === 'resale') {
                        onNavigate('resale');
                      } else {
                        onNavigate('shop', { category: category.id });
                      }
                    }}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-[#0E5E58] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#0B4A45] transition-colors shrink-0"
                  >
                    <span>View All {category.name.split(' ')[0]}</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Educational Banner */}
        <div className="rounded-2xl border border-[#0E5E58]/20 bg-[#F4F8F7] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <h3 className="font-serif-brand text-xl font-bold text-[#0E5E58]">
              Unsure Which Category Fits Your Dog?
            </h3>
            <p className="text-xs text-gray-600 max-w-xl">
              Use our personalized canine consultation engine. Input your dog's age, weight, and allergy profile, or choose from our 50 pre-calibrated default dogs to get an automated nutritional and gear plan.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('pet-intro')}
              className="px-5 py-2.5 rounded-xl bg-[#0E5E58] text-xs font-bold text-white hover:bg-[#0B4A45] transition-colors shadow-xs"
            >
              Personalize for My Dog
            </button>
            <button
              onClick={() => onNavigate('pet-dashboard')}
              className="px-5 py-2.5 rounded-xl border border-[#0E5E58] text-xs font-bold text-[#0E5E58] hover:bg-white transition-colors"
            >
              View 50 Dogs Directory
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
