import React, { useState } from 'react';
import { usePets } from '../context/PetContext';
import { useCart } from '../context/CartContext';
import {
  RefreshCw,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  Truck,
  Sparkles,
  ArrowRight,
  Home,
  ChevronRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface SmartReorderPageProps {
  onNavigate: (route: string, params?: any) => void;
}

export const SmartReorderPage: React.FC<SmartReorderPageProps> = ({ onNavigate }) => {
  const { pets, activePet, setActivePet } = usePets();
  const { addToCart } = useCart();

  // Calculator State
  const [dogWeight, setDogWeight] = useState<number>(activePet?.weightLbs || 50);
  const [activity, setActivity] = useState<string>('moderate');
  const [bagWeightLbs, setBagWeightLbs] = useState<number>(24);
  const [autoshipEnrolled, setAutoshipEnrolled] = useState<boolean>(false);

  // Math for depletion
  // Average consumption: approx 2% of body weight for active adult dogs in dry food ~ 0.035 to 0.05 lbs per lb of body weight
  const multiplier = activity === 'low' ? 0.03 : activity === 'moderate' ? 0.04 : 0.055;
  const dailyCups = Math.max(0.75, Math.round(dogWeight * multiplier * 10) / 10);
  const dailyLbs = dailyCups * 0.25; // ~4 cups per lb of kibble
  const daysBagLasts = Math.max(5, Math.round(bagWeightLbs / dailyLbs));

  // Projected Reorder Date
  const reorderThresholdDays = Math.max(1, daysBagLasts - 5);
  const projectedReorderDate = new Date();
  projectedReorderDate.setDate(projectedReorderDate.getDate() + reorderThresholdDays);

  const projectedDepletionDate = new Date();
  projectedDepletionDate.setDate(projectedDepletionDate.getDate() + daysBagLasts);

  return (
    <div className="min-h-screen bg-[#FAF9F6] py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Top Breadcrumb Navigation */}
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
            <span className="font-semibold text-gray-800">Smart Depletion &amp; Reorder Hub</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('home')}
              className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-2xs"
            >
              ← Back to Homepage
            </button>
            <button
              onClick={() => onNavigate('shop', { category: 'dog-food' })}
              className="px-3.5 py-1.5 rounded-lg bg-[#0E5E58] text-xs font-bold text-white hover:bg-[#0B4A45] transition-colors shadow-2xs"
            >
              Shop Dog Food
            </button>
          </div>
        </div>

        {/* Hero Banner */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F3F1] text-[#0E5E58] text-xs font-bold uppercase tracking-wider">
            <RefreshCw size={14} />
            <span>Automated Canine Logistics</span>
          </div>
          <h1 className="font-serif-brand text-3xl sm:text-4xl font-bold text-[#1E232A] tracking-tight">
            Never Run Out of Your Dog's Food Again
          </h1>
          <p className="text-sm text-[#525B67] leading-relaxed">
            Our predictive depletion algorithm continuously models your dog’s weight, metabolism, and scoop volume. We dispatch replacement bags 5 days before your food bin empties, guaranteeing fresh kibble with 15% recurring savings.
          </p>
        </div>

        {/* Interactive Depletion Calculator */}
        <div className="bg-white rounded-3xl border border-[#E8E6DF] p-6 sm:p-10 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-serif-brand text-xl font-bold text-[#1E232A]">
                Canine Depletion Calculator
              </h3>
              {activePet && (
                <span className="text-xs font-semibold text-[#0E5E58] bg-[#F4F8F7] px-2.5 py-1 rounded-full">
                  Using {activePet.name}'s Profile
                </span>
              )}
            </div>

            {/* Quick Canine Selector */}
            {pets.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Select Companion Dog
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {pets.filter((pet) => pet && pet.id).slice(0, 6).map((pet) => (
                    <button
                      key={pet.id}
                      type="button"
                      onClick={() => {
                        setActivePet(pet);
                        setDogWeight(pet.weightLbs);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 border transition-colors flex items-center gap-1.5 ${
                        activePet?.id === pet.id
                          ? 'border-[#0E5E58] bg-[#0E5E58] text-white'
                          : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span>{pet.name}</span>
                      <span className="text-[10px] opacity-80">({pet.weightLbs} lbs)</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Dog Weight Slider */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Dog Weight
                </label>
                <span className="text-sm font-bold text-[#0E5E58]">{dogWeight} lbs</span>
              </div>
              <input
                type="range"
                min="5"
                max="150"
                value={dogWeight}
                onChange={(e) => setDogWeight(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0E5E58]"
              />
            </div>

            {/* Activity Level */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Activity Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'low', label: 'Low (Lazy/Senior)' },
                  { id: 'moderate', label: 'Moderate (Active)' },
                  { id: 'athletic', label: 'High (Sport/Working)' },
                ].map((act) => (
                  <button
                    key={act.id}
                    type="button"
                    onClick={() => setActivity(act.id)}
                    className={`p-2.5 rounded-xl text-xs font-bold border transition-colors ${
                      activity === act.id
                        ? 'border-[#0E5E58] bg-[#F4F8F7] text-[#0E5E58]'
                        : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {act.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Bag Size */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Bag Size Purchased
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { lbs: 12, label: '12 lb Bag', desc: 'Ideal for small breeds' },
                  { lbs: 24, label: '24 lb Bag', desc: 'Standard monthly pack' },
                  { lbs: 32, label: '32 lb Pro Bag', desc: 'Large breeds & working' },
                ].map((bag) => (
                  <button
                    key={bag.lbs}
                    type="button"
                    onClick={() => setBagWeightLbs(bag.lbs)}
                    className={`p-3 rounded-xl text-left border transition-colors ${
                      bagWeightLbs === bag.lbs
                        ? 'border-[#0E5E58] bg-[#F4F8F7]'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-xs font-bold text-gray-900">{bag.label}</div>
                    <div className="text-[10px] text-gray-500 mt-0.5">{bag.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Display Card */}
          <div className="lg:col-span-5 bg-[#FAF9F6] rounded-2xl border border-[#E8E6DF] p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#0E5E58]">
                Predicted Feeding Metrics
              </span>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="bg-white p-3.5 rounded-xl border border-gray-200">
                  <div className="text-[10px] uppercase font-bold text-gray-400">Daily Intake</div>
                  <div className="text-xl font-bold text-gray-900 mt-1">{dailyCups} cups</div>
                  <div className="text-[10px] text-gray-500">~{dailyLbs.toFixed(2)} lbs / day</div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-gray-200">
                  <div className="text-[10px] uppercase font-bold text-gray-400">Supply Span</div>
                  <div className="text-xl font-bold text-emerald-700 mt-1">{daysBagLasts} days</div>
                  <div className="text-[10px] text-gray-500">Per {bagWeightLbs} lb bag</div>
                </div>
              </div>

              {/* Timeline schedule */}
              <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-1.5">
                    <Truck size={14} className="text-[#0E5E58]" /> Auto-Ship Trigger:
                  </span>
                  <strong className="text-gray-900">
                    {projectedReorderDate.toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-1.5">
                    <AlertCircle size={14} className="text-amber-600" /> Bin Runs Empty:
                  </span>
                  <strong className="text-gray-900">
                    {projectedDepletionDate.toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </strong>
                </div>
                <p className="text-[11px] text-gray-400 pt-1 border-t border-gray-100">
                  ⚡ Auto-dispatch triggers 5 days ahead so replacement arrives before the last scoop.
                </p>
              </div>

              {/* Autoship Savings Pill */}
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
                <Sparkles size={16} className="text-emerald-700 shrink-0" />
                <span>
                  Save <strong>15%</strong> ($11.25 / bag) + receive <strong>Free US Shipping</strong> on every autoship.
                </span>
              </div>
            </div>

            {/* Action */}
            <div className="space-y-2">
              <button
                onClick={() => {
                  setAutoshipEnrolled(true);
                  setTimeout(() => onNavigate('shop', { category: 'dog-food' }), 1000);
                }}
                className="w-full py-3 rounded-xl bg-[#0E5E58] text-xs font-bold text-white hover:bg-[#0B4A45] transition-colors shadow-xs flex items-center justify-center gap-2"
              >
                {autoshipEnrolled ? (
                  <>
                    <CheckCircle2 size={16} />
                    <span>Autoship Preferences Activated!</span>
                  </>
                ) : (
                  <>
                    <RefreshCw size={14} />
                    <span>Shop Food with Smart Autoship</span>
                  </>
                )}
              </button>
              <button
                onClick={() => onNavigate('account')}
                className="w-full py-2 text-xs font-semibold text-gray-500 hover:text-gray-800"
              >
                Manage Existing Subscriptions in Account →
              </button>
            </div>
          </div>
        </div>

        {/* 3 Pillars of Hound & Harbor Smart Reordering */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-[#E8E6DF] space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#F4F8F7] text-[#0E5E58] flex items-center justify-center font-bold">
              1
            </div>
            <h4 className="font-serif-brand text-lg font-bold text-gray-900">
              Zero Emergency Store Trips
            </h4>
            <p className="text-xs text-[#525B67] leading-relaxed">
              Never rush to the grocery store at 9 PM to buy low-grade filler kibble. Fresh food lands on your doorstep precisely when needed.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E8E6DF] space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#F4F8F7] text-[#0E5E58] flex items-center justify-center font-bold">
              2
            </div>
            <h4 className="font-serif-brand text-lg font-bold text-gray-900">
              100% Commitment-Free
            </h4>
            <p className="text-xs text-[#525B67] leading-relaxed">
              Heading on vacation? Adjust your delivery date, skip an upcoming shipment, or pause with a single click in your customer portal.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E8E6DF] space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#F4F8F7] text-[#0E5E58] flex items-center justify-center font-bold">
              3
            </div>
            <h4 className="font-serif-brand text-lg font-bold text-gray-900">
              Fresh Batch Batches
            </h4>
            <p className="text-xs text-[#525B67] leading-relaxed">
              We ship food manufactured within the last 45 days, locking in bioactive vitamins, cold-pressed nutrients, and rich natural aromatics.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
