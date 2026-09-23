import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { usePets } from '../context/PetContext';
import {
  ShoppingBag,
  Search,
  User as UserIcon,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  Package,
  Plus,
  LogOut,
  SlidersHorizontal,
  Store,
  RefreshCw,
  Truck,
  Menu,
  X,
} from 'lucide-react';

interface NavbarProps {
  currentRoute: string;
  onNavigate: (route: string, params?: any) => void;
  onOpenCart: () => void;
  onSearch?: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRoute,
  onNavigate,
  onOpenCart,
  onSearch,
}) => {
  const { user, logout } = useAuth();
  const { summary } = useCart();
  const { pets, activePet, setActivePet } = usePets();

  const [searchQuery, setSearchQuery] = useState('');
  const [isPetMenuOpen, setIsPetMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (onSearch) onSearch(searchQuery.trim());
      onNavigate('marketplace', { search: searchQuery.trim() });
    }
  };

  const navLinks = [
    { label: 'Marketplace', route: 'marketplace' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#E8E6DF] shadow-2xs">
      {/* Main Nav Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo */}
          <div
            onClick={() => onNavigate('marketplace')}
            className="flex items-center gap-2 cursor-pointer select-none group shrink-0"
          >
            <div className="w-9 h-9 rounded-xl bg-[#0E5E58] text-white flex items-center justify-center font-serif-brand font-bold text-lg shadow-sm group-hover:bg-[#0B4A45] transition-colors">
              H&amp;H
            </div>
            <div className="flex flex-col">
              <span className="font-serif-brand text-xl font-bold tracking-tight text-[#1E232A] group-hover:text-[#0E5E58] transition-colors">
                Hound &amp; Harbor
              </span>
              <span className="text-[9px] uppercase tracking-widest text-[#6B7280] font-semibold">
                Canine Marketplace
              </span>
            </div>
          </div>

          {/* Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="relative flex-1 max-w-md hidden md:block"
          >
            <Search size={16} className="absolute left-3.5 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search kibble, orthopedic beds, treats, crates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-[#E8E6DF] bg-[#FAF9F6] py-2 pl-9 pr-4 text-xs text-[#1E232A] focus:border-[#0E5E58] focus:bg-white focus:outline-none transition-all shadow-2xs"
            />
          </form>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Account Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                className="flex items-center gap-1.5 rounded-lg p-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-[#FAF9F6] border border-gray-200 flex items-center justify-center text-gray-700">
                  <UserIcon size={16} />
                </div>
                <span className="hidden xl:inline text-xs font-semibold">
                  {user ? user.firstName : 'Account'}
                </span>
                <ChevronDown size={14} className="text-gray-400 hidden xl:inline" />
              </button>

              {isAccountMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white p-2 shadow-xl border border-gray-100 z-50">
                  {user ? (
                    <>
                      <div className="p-2 border-b border-gray-100">
                        <div className="text-xs font-bold text-gray-800">{user.firstName} {user.lastName}</div>
                        <div className="text-[11px] text-gray-500 truncate">{user.email}</div>
                        <div className="mt-1 text-[10px] font-semibold text-[#0E5E58] bg-[#F4F8F7] px-2 py-0.5 rounded-full inline-block">
                          {user.rewardPoints} Paw Points
                        </div>
                      </div>

                      <button
                        onClick={() => { setIsAccountMenuOpen(false); onNavigate('account'); }}
                        className="w-full flex items-center gap-2 p-2 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 text-left"
                      >
                        <UserIcon size={14} /> My Account
                      </button>

                      <button
                        onClick={() => { setIsAccountMenuOpen(false); onNavigate('my-orders'); }}
                        className="w-full flex items-center gap-2 p-2 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 text-left"
                      >
                        <Package size={14} /> My Orders
                      </button>

                      <button
                        onClick={() => { setIsAccountMenuOpen(false); onNavigate('track-order'); }}
                        className="w-full flex items-center gap-2 p-2 rounded-lg text-xs font-medium text-[#0E5E58] hover:bg-[#F4F8F7] text-left"
                      >
                        <Truck size={14} /> Track Order
                      </button>

                      <button
                        onClick={() => { setIsAccountMenuOpen(false); onNavigate('my-pets'); }}
                        className="w-full flex items-center gap-2 p-2 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 text-left"
                      >
                        <Sparkles size={14} /> My Pets &amp; Health Profiles
                      </button>

                      <button
                        onClick={() => { setIsAccountMenuOpen(false); onNavigate('subscriptions'); }}
                        className="w-full flex items-center gap-2 p-2 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 text-left"
                      >
                        <RefreshCw size={14} /> Subscriptions &amp; Autoship
                      </button>

                      {/* Seller Portal Link */}
                      <button
                        onClick={() => { setIsAccountMenuOpen(false); onNavigate('seller-portal'); }}
                        className="w-full flex items-center gap-2 p-2 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 text-left"
                      >
                        <Store size={14} /> Seller Dashboard
                      </button>

                      {/* Admin Portal Link */}
                      {(user.role === 'admin' || user.role === 'super_admin') && (
                        <button
                          onClick={() => { setIsAccountMenuOpen(false); onNavigate('admin'); }}
                          className="w-full flex items-center gap-2 p-2 rounded-lg text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 text-left mt-1"
                        >
                          <SlidersHorizontal size={14} /> Admin Operations Portal
                        </button>
                      )}

                      <div className="pt-2 mt-1 border-t border-gray-100">
                        <button
                          onClick={() => { logout(); setIsAccountMenuOpen(false); }}
                          className="w-full flex items-center gap-2 p-2 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 text-left"
                        >
                          <LogOut size={14} /> Sign Out
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-3 text-center border-b border-gray-100">
                        <div className="font-serif-brand font-semibold text-sm text-[#1E232A]">Welcome to Hound &amp; Harbor</div>
                        <div className="text-[11px] text-gray-500 mt-0.5">Guest shopping always welcome</div>
                      </div>
                      <button
                        onClick={() => { setIsAccountMenuOpen(false); onNavigate('login'); }}
                        className="w-full mt-2 rounded-lg bg-[#0E5E58] py-2 text-center text-xs font-semibold text-white hover:bg-[#0B4A45]"
                      >
                        Sign In
                      </button>
                      <button
                        onClick={() => { setIsAccountMenuOpen(false); onNavigate('register'); }}
                        className="w-full mt-1.5 rounded-lg border border-gray-200 py-2 text-center text-xs font-semibold text-[#1E232A] hover:bg-gray-50"
                      >
                        Create Account
                      </button>
                      <button
                        onClick={() => { setIsAccountMenuOpen(false); onNavigate('track-order'); }}
                        className="w-full mt-2 flex items-center justify-center gap-2 rounded-lg border border-[#0E5E58]/30 py-2 text-center text-xs font-semibold text-[#0E5E58] bg-[#F4F8F7] hover:bg-[#E8F3F1]"
                      >
                        <Truck size={14} /> Track Order
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Shopping Cart Button */}
            <button
              id="nav-cart-btn"
              type="button"
              onClick={onOpenCart}
              className="relative flex items-center gap-2 rounded-full bg-[#1E232A] px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#0E5E58] transition-colors active:scale-95"
            >
              <ShoppingBag size={16} />
              <span className="hidden sm:inline">Cart</span>
              <span className="rounded-full bg-[#E05338] px-1.5 py-0.2 text-[10px] font-bold text-white">
                {summary?.itemsCount || 0}
              </span>
            </button>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Secondary Category Navigation Bar */}
        <nav className="hidden md:flex items-center gap-6 py-2.5 overflow-x-auto text-xs font-medium text-[#525B67] border-t border-[#F0EFEA]">
          {navLinks.map((link) => (
            <button
              key={link.route}
              onClick={() => onNavigate(link.route)}
              className={`whitespace-nowrap transition-colors hover:text-[#0E5E58] pb-0.5 ${
                currentRoute === link.route ? 'text-[#0E5E58] font-bold border-b-2 border-[#0E5E58]' : ''
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white p-4 space-y-3 shadow-lg">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search marketplace items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-[#FAF9F6] py-2 pl-9 pr-3 text-xs"
            />
          </form>

          <div className="flex flex-col gap-2 pt-2">
            {navLinks.map((link) => (
              <button
                key={link.route}
                onClick={() => {
                  onNavigate(link.route);
                  setIsMobileMenuOpen(false);
                }}
                className={`p-2.5 text-left text-xs font-medium rounded-lg ${
                  currentRoute === link.route ? 'bg-[#F4F8F7] text-[#0E5E58] font-bold' : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => {
                onNavigate('track-order');
                setIsMobileMenuOpen(false);
              }}
              className="p-2.5 text-left text-xs font-medium rounded-lg hover:bg-gray-50 text-gray-700 flex items-center gap-2"
            >
              <Truck size={14} className="text-[#0E5E58]" /> Track Order
            </button>
            {user && (user.role === 'admin' || user.role === 'super_admin') && (
              <button
                onClick={() => {
                  onNavigate('admin');
                  setIsMobileMenuOpen(false);
                }}
                className="p-2.5 text-left text-xs font-bold rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100 flex items-center gap-2 mt-1"
              >
                <SlidersHorizontal size={14} /> Admin Operations Portal
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
