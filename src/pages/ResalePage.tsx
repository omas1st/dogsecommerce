import React, { useState, useEffect } from 'react';
import { Product, BuybackOffer } from '../types';
import { ProductCard } from '../components/ProductCard';
import { apiRequest } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  RotateCcw,
  Sparkles,
  DollarSign,
  CheckCircle2,
  Package,
  ArrowRight,
  Calculator,
} from 'lucide-react';

interface ResalePageProps {
  onNavigate: (route: string, params?: any) => void;
  onSelectProduct: (product: Product) => void;
}

export const ResalePage: React.FC<ResalePageProps> = ({ onNavigate, onSelectProduct }) => {
  const { user } = useAuth();
  const [resaleProducts, setResaleProducts] = useState<Product[]>([]);
  const [showBuybackModal, setShowBuybackModal] = useState(false);

  // Buyback Appraisal Calculator
  const [itemTitle, setItemTitle] = useState('');
  const [itemCategory, setItemCategory] = useState('crates-travel');
  const [itemBrand, setItemBrand] = useState('');
  const [itemCondition, setItemCondition] = useState<'like_new' | 'good' | 'fair'>('like_new');
  const [askingPrice, setAskingPrice] = useState<number>(85);
  const [sellerNotes, setSellerNotes] = useState('');
  const [appraisalOffer, setAppraisalOffer] = useState<BuybackOffer | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [offerAccepted, setOfferAccepted] = useState(false);

  useEffect(() => {
    async function loadResale() {
      try {
        const data = await apiRequest<{ success: boolean; products: Product[] }>(
          '/products?ownerType=resale_platform'
        );
        setResaleProducts(data.products || []);
      } catch (err) {
        console.error(err);
      }
    }
    loadResale();
  }, []);

  const handleRequestAppraisal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemTitle.trim() || askingPrice <= 0) return;

    setIsCalculating(true);
    try {
      const data = await apiRequest<{ success: boolean; offer: BuybackOffer }>('/buyback/quote', {
        method: 'POST',
        body: JSON.stringify({
          itemTitle,
          itemCategory,
          itemBrand: itemBrand || 'Unspecified',
          condition: itemCondition,
          askingPrice: Number(askingPrice),
          itemConditionNotes: sellerNotes,
          itemPhotos: ['https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80'],
          sellerEmail: user?.email || 'guest.seller@example.com',
          sellerName: user ? `${user.firstName} ${user.lastName}` : 'Guest Pet Parent',
        }),
      });
      setAppraisalOffer(data.offer);
    } catch (err: any) {
      alert(err.message || 'Error generating buyback appraisal.');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleAcceptOffer = async () => {
    if (!appraisalOffer) return;
    try {
      await apiRequest(`/buyback/${appraisalOffer.id}/respond`, {
        method: 'POST',
        body: JSON.stringify({ action: 'accept' }),
      });
      setOfferAccepted(true);
    } catch (err: any) {
      alert(err.message || 'Could not process acceptance.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Hero Section */}
        <div className="rounded-3xl bg-[#0E5E58] text-white p-8 sm:p-12 shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-xs px-3.5 py-1 text-xs font-semibold text-white">
              <ShieldCheck size={14} />
              <span>18-Point Protocol Certified</span>
            </div>
            <h1 className="font-serif-brand text-3xl sm:text-5xl font-bold tracking-tight">
              Certified Pre-Owned Gear &amp; Platform Buyback
            </h1>
            <p className="text-sm text-emerald-100 leading-relaxed">
              Sustainable circular economy for dogs. Purchase premium aluminum crates and travel ramps at up to 50% off retail, or sell your dog’s outgrown gear directly to Hound &amp; Harbor for instant cash or store credit.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={() => setShowBuybackModal(true)}
                className="rounded-xl bg-white px-5 py-3 text-xs font-bold text-[#0E5E58] shadow-md hover:bg-gray-100 transition-colors flex items-center gap-2"
              >
                <Calculator size={16} />
                <span>Calculate Instant Buyback Offer</span>
              </button>
            </div>
          </div>
        </div>

        {/* 18-Point Inspection Standard */}
        <div className="rounded-2xl border border-[#E8E6DF] bg-white p-6 sm:p-8 shadow-xs">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0E5E58]">
              Rigorous Quality Protocol
            </span>
            <h2 className="font-serif-brand text-2xl font-bold text-[#1E232A] mt-1">
              Every Pre-Owned Item is Guaranteed
            </h2>
            <p className="mt-1 text-xs text-[#525B67]">
              We inspect, sanitize, and verify safety before any pre-owned gear is listed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-[#525B67]">
            <div className="p-4 rounded-xl bg-[#FAF9F6] border border-gray-100 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#E8F3F1] text-[#0E5E58] flex items-center justify-center font-bold">
                1
              </div>
              <h4 className="font-bold text-gray-800 text-sm">Structural Integrity Check</h4>
              <p>Locking deadbolts, slam-latches, hinges, and aluminum welds are load-tested to guarantee zero escape vulnerabilities.</p>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF9F6] border border-gray-100 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#E8F3F1] text-[#0E5E58] flex items-center justify-center font-bold">
                2
              </div>
              <h4 className="font-bold text-gray-800 text-sm">Hospital-Grade Sterilization</h4>
              <p>Items undergo high-temperature pressurized steam washing and veterinary-safe disinfectant treatments.</p>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF9F6] border border-gray-100 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#E8F3F1] text-[#0E5E58] flex items-center justify-center font-bold">
                3
              </div>
              <h4 className="font-bold text-gray-800 text-sm">30-Day Pre-Owned Guarantee</h4>
              <p>Every certified pre-owned purchase is backed by our full 30-day money-back guarantee and return policy.</p>
            </div>
          </div>
        </div>

        {/* Certified Pre-Owned Available Listings */}
        <div>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#0E5E58]">
                In Stock &amp; Inspected
              </span>
              <h2 className="font-serif-brand text-2xl font-bold text-[#1E232A] mt-0.5">
                Current Certified Pre-Owned Inventory
              </h2>
            </div>
          </div>

          {resaleProducts.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center text-xs text-gray-500">
              No certified pre-owned items currently in stock. Check back soon or sell us your outgrown equipment!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {resaleProducts.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onSelect={onSelectProduct}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Buyback Appraisal Calculator Modal */}
      {showBuybackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 sm:p-8 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Calculator size={18} className="text-[#0E5E58]" />
                <h3 className="font-serif-brand text-xl font-bold text-[#1E232A]">
                  Instant Buyback Appraisal
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowBuybackModal(false);
                  setAppraisalOffer(null);
                  setOfferAccepted(false);
                }}
                className="text-gray-400 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {!appraisalOffer ? (
              <form onSubmit={handleRequestAppraisal} className="mt-4 space-y-4 text-xs">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Equipment Name / Model *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ruffwear Approach Dog Pack or Impact Crate 40"
                    value={itemTitle}
                    onChange={(e) => setItemTitle(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 p-2.5"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Category</label>
                    <select
                      value={itemCategory}
                      onChange={(e) => setItemCategory(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 p-2.5 bg-white"
                    >
                      <option value="crates-travel">Crates &amp; Travel</option>
                      <option value="beds-furniture">Orthopedic Beds</option>
                      <option value="collars-leashes">Harnesses &amp; Packs</option>
                      <option value="toys">Enrichment Puzzles</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Brand</label>
                    <input
                      type="text"
                      placeholder="e.g. Ruffwear, Gunner, Impact"
                      value={itemBrand}
                      onChange={(e) => setItemBrand(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 p-2.5"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Condition</label>
                    <select
                      value={itemCondition}
                      onChange={(e) => setItemCondition(e.target.value as any)}
                      className="w-full rounded-lg border border-gray-300 p-2.5 bg-white"
                    >
                      <option value="like_new">Like New (Gently used 1-2 times)</option>
                      <option value="good">Good (Normal cosmetic wear)</option>
                      <option value="fair">Fair (Visible scuffs, fully functional)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Original Price ($)</label>
                    <input
                      type="number"
                      required
                      min={10}
                      value={askingPrice}
                      onChange={(e) => setAskingPrice(Number(e.target.value))}
                      className="w-full rounded-lg border border-gray-300 p-2.5"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Notes on wear or accessories</label>
                  <textarea
                    rows={2}
                    placeholder="Include size, color, accessories included..."
                    value={sellerNotes}
                    onChange={(e) => setSellerNotes(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 p-2.5"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isCalculating}
                  className="w-full rounded-xl bg-[#0E5E58] py-3 text-xs font-bold text-white shadow-md hover:bg-[#0B4A45]"
                >
                  {isCalculating ? 'Calculating Valuation...' : 'Get Instant Guaranteed Offer'}
                </button>
              </form>
            ) : offerAccepted ? (
              <div className="mt-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#0E5E58] flex items-center justify-center mx-auto">
                  <CheckCircle2 size={28} />
                </div>
                <h4 className="font-serif-brand text-lg font-bold text-[#1E232A]">
                  Offer Accepted! Shipping Label Created.
                </h4>
                <p className="text-xs text-gray-600">
                  We have sent a prepaid insured shipping kit label to <strong>{appraisalOffer.sellerEmail}</strong>. Once our hub completes the 18-point verification, <strong>${appraisalOffer.platformOfferAmount.toFixed(2)}</strong> will be deposited to your account.
                </p>
                <button
                  onClick={() => {
                    setShowBuybackModal(false);
                    setAppraisalOffer(null);
                    setOfferAccepted(false);
                  }}
                  className="rounded-lg bg-[#0E5E58] px-5 py-2 text-xs font-bold text-white"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="mt-6 space-y-4 text-xs">
                <div className="rounded-xl bg-[#F4F8F7] border border-[#D4E8E4] p-4 text-center space-y-1">
                  <span className="text-[11px] text-[#0E5E58] font-bold uppercase">Hound &amp; Harbor Guaranteed Appraisal</span>
                  <div className="text-3xl font-bold text-[#1E232A]">
                    ${appraisalOffer.platformOfferAmount.toFixed(2)} Cash
                  </div>
                  <span className="text-gray-500 text-[11px] block">
                    or ${(appraisalOffer.platformOfferAmount * 1.15).toFixed(2)} Store Credit (15% bonus)
                  </span>
                </div>

                <div className="space-y-1 text-gray-600">
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span>Item:</span>
                    <strong className="text-gray-800">{appraisalOffer.itemTitle}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span>Condition:</span>
                    <span className="capitalize">{appraisalOffer.condition.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span>Prepaid Shipping:</span>
                    <span className="text-emerald-600 font-bold">100% Covered by Platform</span>
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    onClick={handleAcceptOffer}
                    className="flex-1 rounded-xl bg-[#0E5E58] py-3 font-bold text-white shadow-sm hover:bg-[#0B4A45]"
                  >
                    Accept Offer &amp; Receive Prepaid Label
                  </button>
                  <button
                    onClick={() => setAppraisalOffer(null)}
                    className="rounded-xl border border-gray-300 px-4 py-3 font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Recalculate
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
