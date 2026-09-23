import React, { useState } from 'react';
import { ShieldCheck, Truck, RotateCcw, HeartHandshake, CheckCircle2, Lock } from 'lucide-react';

interface FooterProps {
  onNavigate: (route: string, params?: any) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-[#1E232A] text-white pt-14 pb-10 border-t border-gray-800">
      {/* Brand Trust Badges Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-gray-800">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-[#293442] text-[#34D399] shrink-0">
              <Truck size={22} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Fast US Ground Delivery</h4>
              <p className="text-xs text-gray-400 mt-0.5">Free standard shipping on orders $49+ across the contiguous United States.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-[#293442] text-[#34D399] shrink-0">
              <RotateCcw size={22} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">30-Day Canine Guarantee</h4>
              <p className="text-xs text-gray-400 mt-0.5">If your dog dislikes their food or gear, return it hassle-free within 30 days.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-[#293442] text-[#34D399] shrink-0">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Certified Resale Protocol</h4>
              <p className="text-xs text-gray-400 mt-0.5">Every pre-owned crate, carrier, and ramp is 18-point safety sanitized and inspected.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-[#293442] text-[#34D399] shrink-0">
              <Lock size={22} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Bank-Grade Security</h4>
              <p className="text-xs text-gray-400 mt-0.5">Encrypted transactions via Visa, Mastercard, American Express, and Discover.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand & Mission Column */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#0E5E58] text-white flex items-center justify-center font-serif-brand font-bold text-base">
                H&amp;H
              </div>
              <span className="font-serif-brand text-xl font-bold tracking-tight text-white">
                Hound &amp; Harbor
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
              The intelligent canine &amp; pet ecommerce destination. We combine personalized breed nutrition, smart depletion reordering, verified artisan marketplace makers, and certified sustainable resale gear.
            </p>

            {/* Newsletter */}
            <div className="pt-2">
              <h5 className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                Join the Pack Newsletter (Get $10 Off)
              </h5>
              {subscribed ? (
                <div className="flex items-center gap-2 text-xs text-[#34D399] font-medium bg-[#293442] p-2 rounded-lg">
                  <CheckCircle2 size={16} />
                  <span>Welcome! Check your inbox for your $10 promo code.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2 max-w-sm">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 rounded-lg border border-gray-700 bg-[#293442] px-3 py-2 text-xs text-white placeholder-gray-400 focus:border-[#34D399] focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="rounded-lg bg-[#0E5E58] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0B4A45] transition-colors"
                  >
                    Subscribe
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Shop Column */}
          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-300 mb-3">
              Shop Categories
            </h5>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <button onClick={() => onNavigate('shop', { category: 'dog-food' })} className="hover:text-white transition-colors">
                  Dog Food &amp; Nutrition
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop', { category: 'beds-furniture' })} className="hover:text-white transition-colors">
                  Orthopedic Beds &amp; Furniture
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop', { category: 'health-supplements' })} className="hover:text-white transition-colors">
                  Joint &amp; Digestive Chews
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop', { category: 'collars-leashes' })} className="hover:text-white transition-colors">
                  Artisan Collars &amp; Leashes
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop', { category: 'crates-travel' })} className="hover:text-white transition-colors">
                  Travel Crates &amp; Vehicle Ramps
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('resale')} className="hover:text-white transition-colors text-emerald-400 font-medium">
                  Certified Pre-Owned Gear
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-300 mb-3">
              Customer Care
            </h5>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <button onClick={() => onNavigate('track-order')} className="hover:text-white transition-colors">
                  Track Your Shipment
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('returns')} className="hover:text-white transition-colors">
                  Returns &amp; Exchanges
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shipping-info')} className="hover:text-white transition-colors">
                  Shipping Policy &amp; Rates
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('faq')} className="hover:text-white transition-colors">
                  Frequently Asked Questions
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('support')} className="hover:text-white transition-colors">
                  Live Support &amp; Help Desk
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('rewards')} className="hover:text-white transition-colors">
                  Paw Rewards &amp; Referrals
                </button>
              </li>
            </ul>
          </div>

          {/* Selling & Platform */}
          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-300 mb-3">
              Marketplace &amp; Resale
            </h5>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <button onClick={() => onNavigate('marketplace-apply')} className="hover:text-white transition-colors">
                  Apply as an Artisan Maker
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('buyback-program')} className="hover:text-white transition-colors">
                  Hound &amp; Harbor Buyback Appraisal
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('seller-portal')} className="hover:text-white transition-colors">
                  Merchant Seller Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-white transition-colors">
                  Our Canine Welfare Standards
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Legal & Regulatory Bottom Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-gray-800 text-xs text-gray-500 flex flex-col md:flex-row items-center justify-between gap-4">
        <p>© {new Date().getFullYear()} Hound &amp; Harbor Inc. All rights reserved. Dedicated to healthy canines and happy companions.</p>
        <div className="flex items-center gap-4">
          <button onClick={() => onNavigate('privacy')} className="hover:text-gray-300">Privacy Policy</button>
          <span>•</span>
          <button onClick={() => onNavigate('terms')} className="hover:text-gray-300">Terms of Service</button>
          <span>•</span>
          <button onClick={() => onNavigate('accessibility')} className="hover:text-gray-300">Accessibility</button>
        </div>
      </div>
    </footer>
  );
};
