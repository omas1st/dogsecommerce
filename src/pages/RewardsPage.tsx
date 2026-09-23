import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Award,
  Gift,
  Share2,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Home,
  ChevronRight,
  Star,
  Copy,
  Users,
  ShieldCheck,
  Heart,
} from 'lucide-react';

interface RewardsPageProps {
  onNavigate: (route: string, params?: any) => void;
}

export const RewardsPage: React.FC<RewardsPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [redeemedCode, setRedeemedCode] = useState<string | null>(null);

  const referralCode = user ? `HOUND-${user.firstName.toUpperCase()}-15` : 'HOUND-PACK-15';

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleRedeem = (pointsCost: number, discountAmount: string) => {
    if (!user) {
      onNavigate('login');
      return;
    }
    if ((user.rewardPoints || 0) < pointsCost) {
      alert(`You need ${pointsCost} Paw Points to redeem this reward. Keep shopping to earn more!`);
      return;
    }
    setRedeemedCode(`PAW-${discountAmount}-OFF-${Math.floor(1000 + Math.random() * 9000)}`);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
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
            <span className="font-semibold text-gray-800">Paw Rewards &amp; Pack Loyalty</span>
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
              Earn Points in Shop
            </button>
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold uppercase tracking-wider border border-amber-200">
            <Star size={14} className="fill-amber-500 text-amber-500" />
            <span>The Hound &amp; Harbor Loyalty Pack</span>
          </div>
          <h1 className="font-serif-brand text-3xl sm:text-4xl font-bold text-[#1E232A] tracking-tight">
            Earn Paw Points On Every Canine Purchase
          </h1>
          <p className="text-sm text-[#525B67] leading-relaxed">
            Turn your dog's daily meals, orthopedic beds, and artisan leashes into valuable vouchers, free treats, and exclusive access to certified pre-owned releases.
          </p>
        </div>

        {/* User Rewards Status Card */}
        <div className="bg-white rounded-3xl border border-[#E8E6DF] p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Your Member Standing
              </span>
              <div className="font-serif-brand text-2xl sm:text-3xl font-bold text-gray-900">
                {user ? `${user.firstName}'s Paw Passport` : 'Guest Canine Guardian'}
              </div>
              <p className="text-xs text-gray-500">
                {user
                  ? `Member since 2024 • Tier: ${user.rewardTier?.toUpperCase() || 'TRAIL SCOUT'}`
                  : 'Sign in to access and redeem your accumulated points'}
              </p>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-center p-4 rounded-2xl bg-[#FAF9F6] border border-gray-200 min-w-[140px]">
                <div className="text-[10px] uppercase font-bold text-gray-400">Current Balance</div>
                <div className="text-3xl font-bold text-[#0E5E58] mt-0.5">
                  {user ? user.rewardPoints || 350 : 0}
                </div>
                <div className="text-[10px] text-gray-500 font-semibold">Paw Points</div>
              </div>

              {!user ? (
                <button
                  onClick={() => onNavigate('login')}
                  className="px-5 py-3 rounded-xl bg-[#0E5E58] text-xs font-bold text-white hover:bg-[#0B4A45] transition-colors"
                >
                  Sign In to View Points
                </button>
              ) : (
                <button
                  onClick={() => onNavigate('account')}
                  className="px-5 py-3 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  View Account History
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Redeem Rewards Catalog */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif-brand text-2xl font-bold text-[#1E232A]">
              Redeem Available Rewards
            </h2>
            <span className="text-xs text-gray-500">Vouchers apply instantly at checkout</span>
          </div>

          {redeemedCode && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
              <div>
                <strong>Reward Unlocked!</strong> Use promo code{' '}
                <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-emerald-300">
                  {redeemedCode}
                </span>{' '}
                at checkout.
              </div>
              <button
                onClick={() => onNavigate('shop')}
                className="px-3 py-1 rounded-lg bg-emerald-800 text-white font-bold hover:bg-emerald-900"
              >
                Go to Shop
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: '$10 Off Any Order',
                points: 500,
                amount: '10',
                desc: 'Valid on single-protein dry food, freeze-dried treats, or gear.',
              },
              {
                title: '$25 Off Orders $75+',
                points: 1000,
                amount: '25',
                desc: 'Perfect for orthopedic beds, heavy-duty harnesses, and bulk food.',
              },
              {
                title: '$50 Off Equipment & Crates',
                points: 1800,
                amount: '50',
                desc: 'Applicable to aviation-grade aluminum kennels & certified resale items.',
              },
            ].map((reward, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-[#E8E6DF] bg-white p-6 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
                    <Star size={12} className="fill-amber-500" />
                    <span>{reward.points} Points</span>
                  </div>
                  <h4 className="font-serif-brand text-xl font-bold text-gray-900">
                    {reward.title}
                  </h4>
                  <p className="text-xs text-gray-500 leading-relaxed">{reward.desc}</p>
                </div>

                <button
                  onClick={() => handleRedeem(reward.points, reward.amount)}
                  className="w-full py-2.5 rounded-xl bg-[#0E5E58] text-xs font-bold text-white hover:bg-[#0B4A45] transition-colors"
                >
                  Redeem Reward
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* How to Earn Points */}
        <div className="bg-white rounded-3xl border border-[#E8E6DF] p-6 sm:p-10 shadow-xs space-y-6">
          <h2 className="font-serif-brand text-2xl font-bold text-[#1E232A]">
            How to Earn Paw Points
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                10x
              </div>
              <h4 className="font-bold text-xs text-gray-900">10 Pts per $1 Spent</h4>
              <p className="text-xs text-gray-500">
                Earn automatically on every food bag, supplement chew, or artisan collar.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-sm">
                +200
              </div>
              <h4 className="font-bold text-xs text-gray-900">Add a Dog Profile</h4>
              <p className="text-xs text-gray-500">
                Configure your dog’s breed, weight, and allergies in the Pet Portal.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-sm">
                +150
              </div>
              <h4 className="font-bold text-xs text-gray-900">Leave a Verified Review</h4>
              <p className="text-xs text-gray-500">
                Share photos and dietary feedback on products your canine companion tested.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm">
                +500
              </div>
              <h4 className="font-bold text-xs text-gray-900">Refer a Dog Parent</h4>
              <p className="text-xs text-gray-500">
                Give your fellow dog guardian $15 off and get 500 points when they order.
              </p>
            </div>
          </div>
        </div>

        {/* Referral Sharing Banner */}
        <div className="rounded-3xl border border-[#0E5E58]/20 bg-[#F4F8F7] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0E5E58]">
              Give $15, Get 500 Paw Points
            </span>
            <h3 className="font-serif-brand text-2xl font-bold text-gray-900">
              Invite Canine Guardians &amp; Friends
            </h3>
            <p className="text-xs text-gray-600 max-w-md">
              Share your personal pack link. When a friend places their first order, they receive $15 off, and 500 points are deposited into your vault.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white border border-gray-300 p-2 rounded-2xl shadow-2xs">
            <span className="font-mono text-xs font-bold text-gray-800 px-3">
              {referralCode}
            </span>
            <button
              onClick={handleCopyCode}
              className="px-4 py-2 rounded-xl bg-[#0E5E58] text-xs font-bold text-white hover:bg-[#0B4A45] transition-colors flex items-center gap-1.5"
            >
              {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
