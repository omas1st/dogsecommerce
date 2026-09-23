import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { PetProvider, usePets } from './context/PetContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { PetDashboardPage } from './pages/PetDashboardPage';
import { AddPetPage } from './pages/AddPetPage';
import { PersonalizedPage } from './pages/PersonalizedPage';
import { SmartReorderPage } from './pages/SmartReorderPage';
import { RewardsPage } from './pages/RewardsPage';
import { MarketplacePage } from './pages/MarketplacePage';
import { ResalePage } from './pages/ResalePage';
import { CheckoutPage } from './pages/CheckoutPage';
import { TrackOrderPage } from './pages/TrackOrderPage';
import { AccountDashboardPage } from './pages/AccountDashboardPage';
import { SellerDashboardPage } from './pages/SellerDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AuthPage } from './pages/AuthPages';
import { InfoPage } from './pages/InfoPages';
import { Product } from './types';
import { apiRequest } from './services/api';
import { ArrowLeft, Home, Compass, ShieldCheck } from 'lucide-react';

function AppContent() {
  const { user } = useAuth();
  const { isCartOpen, setIsCartOpen } = useCart();
  const { pets, activePet } = usePets();

  const [currentRoute, setCurrentRoute] = useState<string>('marketplace');
  const [routeParams, setRouteParams] = useState<any>({});
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Navigate helper
  const handleNavigate = (route: string, params: any = {}) => {
    setRouteParams(params);
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Product Selection handler
  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    handleNavigate('product-detail', { slug: product.slug });
  };

  // If directly navigated to product detail by slug
  useEffect(() => {
    if (currentRoute === 'product-detail' && routeParams?.slug && !selectedProduct) {
      apiRequest<{ success: boolean; product: Product }>(`/products/${routeParams.slug}`)
        .then((res) => {
          if (res.product) setSelectedProduct(res.product);
        })
        .catch(console.error);
    }
  }, [currentRoute, routeParams, selectedProduct]);

  // Set of recognized routes
  const knownRoutes = new Set([
    'home',
    'shop',
    'categories',
    'product-detail',
    'pet-dashboard',
    'my-pets',
    'pet-intro',
    'personalized',
    'personalize',
    'smart-reorder',
    'subscriptions',
    'subscriptions-info',
    'rewards',
    'add-pet',
    'edit-pet',
    'marketplace',
    'resale',
    'certified-resale',
    'checkout',
    'track-order',
    'account',
    'my-orders',
    'seller-dashboard',
    'seller-portal',
    'admin',
    'login',
    'register',
    'about',
    'guarantee',
    'shipping',
    'shipping-info',
    'returns',
    'support',
    'gift-cards',
    'faq',
    'buyback-program',
    'privacy',
    'terms',
    'accessibility',
    'marketplace-apply',
  ]);

  const isKnown = knownRoutes.has(currentRoute);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#1E232A]">
      {/* Top Navigation */}
      <Navbar
        currentRoute={currentRoute}
        onNavigate={handleNavigate}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Prominent Back to Marketplace Sub-Nav Strip (Visible on subpages like checkout, account) */}
      {currentRoute !== 'marketplace' && currentRoute !== 'home' && (
        <aside aria-label="Page navigation" className="bg-white/95 border-b border-[#E8E6DF] py-2.5 px-4 sticky top-16 z-30 shadow-2xs backdrop-blur-md">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs gap-3">
            <button
              onClick={() => handleNavigate('marketplace')}
              className="flex items-center gap-1.5 font-bold text-[#0E5E58] hover:text-[#0B4A45] transition-colors group cursor-pointer bg-[#F4F8F7] hover:bg-[#E8F3F1] border border-[#0E5E58]/30 px-3.5 py-1.5 rounded-lg shadow-2xs shrink-0"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
              <span>← Back to Marketplace</span>
            </button>

            <div className="hidden sm:flex items-center gap-2 text-gray-500 font-medium truncate">
              <span>Current Section:</span>
              <span className="font-semibold text-gray-800 capitalize truncate">
                {currentRoute.replace(/-/g, ' ')}
              </span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <button
                onClick={() => handleNavigate('marketplace')}
                className="text-gray-600 hover:text-[#0E5E58] font-semibold transition-colors"
              >
                Marketplace (624+ Items)
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Main Routed Content */}
      <main className="flex-1">
        {(currentRoute === 'home' || currentRoute === 'marketplace') && (
          <MarketplacePage
            initialSearch={routeParams.search}
            onNavigate={handleNavigate}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {currentRoute === 'shop' && (
          <ShopPage
            initialCategory={routeParams.category}
            initialSearch={routeParams.search}
            onNavigate={handleNavigate}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {currentRoute === 'categories' && (
          <CategoriesPage
            onNavigate={handleNavigate}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {currentRoute === 'product-detail' && (
          <ProductDetailPage
            product={selectedProduct}
            onNavigate={handleNavigate}
            onProceedToCheckout={() => handleNavigate('checkout')}
          />
        )}

        {(currentRoute === 'pet-dashboard' || currentRoute === 'my-pets') && (
          <PetDashboardPage
            petId={routeParams.petId}
            onNavigate={handleNavigate}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {(currentRoute === 'pet-intro' ||
          currentRoute === 'personalized' ||
          currentRoute === 'personalize') && (
          <PersonalizedPage
            onNavigate={handleNavigate}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {currentRoute === 'smart-reorder' && (
          <SmartReorderPage onNavigate={handleNavigate} />
        )}

        {currentRoute === 'rewards' && (
          <RewardsPage onNavigate={handleNavigate} />
        )}

        {currentRoute === 'subscriptions' && (
          <AccountDashboardPage initialTab="subscriptions" onNavigate={handleNavigate} />
        )}

        {currentRoute === 'subscriptions-info' && (
          <SmartReorderPage onNavigate={handleNavigate} />
        )}

        {currentRoute === 'my-orders' && (
          <AccountDashboardPage initialTab="orders" onNavigate={handleNavigate} />
        )}

        {currentRoute === 'add-pet' && (
          <AddPetPage onNavigate={handleNavigate} />
        )}

        {currentRoute === 'edit-pet' && (
          <AddPetPage
            editingPet={pets.find((p) => p?.id === routeParams?.petId) || activePet || undefined}
            onNavigate={handleNavigate}
          />
        )}

        {(currentRoute === 'resale' || currentRoute === 'certified-resale') && (
          <ResalePage
            onNavigate={handleNavigate}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {currentRoute === 'checkout' && (
          <CheckoutPage onNavigate={handleNavigate} />
        )}

        {currentRoute === 'track-order' && (
          <TrackOrderPage
            initialOrderNumber={routeParams.orderNumber}
            onNavigate={handleNavigate}
          />
        )}

        {currentRoute === 'account' && (
          <AccountDashboardPage onNavigate={handleNavigate} />
        )}

        {(currentRoute === 'seller-dashboard' || currentRoute === 'seller-portal') && (
          <SellerDashboardPage onNavigate={handleNavigate} />
        )}

        {currentRoute === 'admin' && (
          <AdminDashboardPage onNavigate={handleNavigate} />
        )}

        {(currentRoute === 'login' || currentRoute === 'register') && (
          <AuthPage
            initialMode={currentRoute === 'register' ? 'register' : 'login'}
            onNavigate={handleNavigate}
          />
        )}

        {(currentRoute === 'about' ||
          currentRoute === 'guarantee' ||
          currentRoute === 'shipping' ||
          currentRoute === 'shipping-info' ||
          currentRoute === 'returns' ||
          currentRoute === 'support' ||
          currentRoute === 'buyback-program' ||
          currentRoute === 'gift-cards' ||
          currentRoute === 'faq' ||
          currentRoute === 'privacy' ||
          currentRoute === 'terms' ||
          currentRoute === 'accessibility' ||
          currentRoute === 'marketplace-apply') && (
          <InfoPage
            section={currentRoute}
            onNavigate={handleNavigate}
          />
        )}

        {/* Universal Fallback: NEVER allow any screen to be blank */}
        {!isKnown && (
          <div className="min-h-[70vh] flex flex-col items-center justify-center py-16 px-4 text-center bg-[#FAF9F6]">
            <div className="max-w-md mx-auto space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-[#E8F3F1] text-[#0E5E58] mx-auto flex items-center justify-center font-bold text-2xl shadow-xs">
                🐾
              </div>
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#0E5E58]">
                  Compass &amp; Trail Navigation
                </span>
                <h1 className="font-serif-brand text-3xl font-bold text-[#1E232A]">
                  Lost on the Trail?
                </h1>
                <p className="text-xs text-[#525B67] leading-relaxed">
                  We couldn’t find the exact trail or scent you were tracking, but Hound &amp; Harbor is here to guide you and your canine companion back to the homepage.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => handleNavigate('home')}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#0E5E58] text-xs font-bold text-white hover:bg-[#0B4A45] shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Home size={14} />
                  <span>Return to Homepage</span>
                </button>
                <button
                  onClick={() => handleNavigate('shop')}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl border border-gray-300 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-2xs cursor-pointer"
                >
                  Explore All Canine Products
                </button>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Quick Canine Destinations
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
                  <button
                    onClick={() => handleNavigate('shop', { category: 'dog-food' })}
                    className="px-3 py-1 rounded-lg bg-white border border-gray-200 hover:border-[#0E5E58] hover:text-[#0E5E58] cursor-pointer"
                  >
                    Dog Food &amp; Nutrition
                  </button>
                  <button
                    onClick={() => handleNavigate('pet-dashboard')}
                    className="px-3 py-1 rounded-lg bg-white border border-gray-200 hover:border-[#0E5E58] hover:text-[#0E5E58] cursor-pointer"
                  >
                    50 Canines Directory
                  </button>
                  <button
                    onClick={() => handleNavigate('resale')}
                    className="px-3 py-1 rounded-lg bg-white border border-gray-200 hover:border-[#0E5E58] hover:text-[#0E5E58] cursor-pointer"
                  >
                    Pre-Owned Crates
                  </button>
                  <button
                    onClick={() => handleNavigate('faq')}
                    className="px-3 py-1 rounded-lg bg-white border border-gray-200 hover:border-[#0E5E58] hover:text-[#0E5E58] cursor-pointer"
                  >
                    Help &amp; FAQ
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Global Slide-Out Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onProceedToCheckout={() => handleNavigate('checkout')}
      />

      {/* Global Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <PetProvider>
          <AppContent />
        </PetProvider>
      </CartProvider>
    </AuthProvider>
  );
}
