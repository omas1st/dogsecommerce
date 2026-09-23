import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Heart,
  RotateCcw,
  Truck,
  Gift,
  CheckCircle2,
  Search,
  ArrowRight,
  Home,
  ChevronRight,
  HelpCircle,
  Mail,
  Phone,
  MessageSquare,
  FileText,
  DollarSign,
  Send,
  Sparkles,
} from 'lucide-react';
import { apiRequest } from '../services/api';

interface InfoPageProps {
  section?: string;
  onNavigate: (route: string, params?: any) => void;
}

export const InfoPage: React.FC<InfoPageProps> = ({ section = 'about', onNavigate }) => {
  // Normalize section aliases
  const normalizeSection = (sec: string) => {
    if (sec === 'shipping-info') return 'shipping';
    if (sec === 'seller-portal') return 'marketplace-apply';
    return sec;
  };

  const [activeSection, setActiveSection] = useState(normalizeSection(section));

  useEffect(() => {
    setActiveSection(normalizeSection(section));
  }, [section]);

  // Gift Card Lookup
  const [gcCode, setGcCode] = useState('');
  const [gcResult, setGcResult] = useState<any>(null);
  const [gcLoading, setGcLoading] = useState(false);

  // Return Request Form
  const [returnOrderNum, setReturnOrderNum] = useState('');
  const [returnReason, setReturnReason] = useState('taste');
  const [returnSubmitted, setReturnSubmitted] = useState(false);

  // Support Form
  const [supportName, setSupportName] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportSent, setSupportSent] = useState(false);

  // Buyback Calculator
  const [itemType, setItemType] = useState('aluminum_crate');
  const [condition, setCondition] = useState('like_new');
  const [estimatedQuote, setEstimatedQuote] = useState<number | null>(340);

  const checkGiftCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gcCode.trim()) return;
    setGcLoading(true);
    try {
      const data = await apiRequest<{ success: boolean; giftCard: any }>(
        `/gift-cards/${encodeURIComponent(gcCode.trim())}`
      );
      setGcResult(data.giftCard);
    } catch (err: any) {
      alert(err.message || 'Gift card not found.');
      setGcResult(null);
    } finally {
      setGcLoading(false);
    }
  };

  const calculateBuyback = (e: React.FormEvent) => {
    e.preventDefault();
    let base = 350;
    if (itemType === 'aluminum_crate') base = 420;
    if (itemType === 'orthopedic_bed') base = 120;
    if (itemType === 'vehicle_ramp') base = 160;
    if (itemType === 'travel_kennel') base = 220;

    const condMultiplier = condition === 'like_new' ? 1.0 : condition === 'excellent' ? 0.85 : 0.7;
    setEstimatedQuote(Math.round(base * condMultiplier));
  };

  const navTabs = [
    { id: 'about', label: 'Our Mission & Standards' },
    { id: 'guarantee', label: '18-Point Canine Guarantee' },
    { id: 'shipping', label: 'Shipping & Delivery' },
    { id: 'returns', label: 'Returns & Exchanges' },
    { id: 'support', label: 'Concierge Help & Support' },
    { id: 'buyback-program', label: 'Equipment Buyback Appraisal' },
    { id: 'gift-cards', label: 'Digital Gift Cards' },
    { id: 'faq', label: 'Frequently Asked Questions' },
    { id: 'privacy', label: 'Privacy & Canine Data' },
    { id: 'terms', label: 'Terms of Service' },
    { id: 'accessibility', label: 'Accessibility Statement' },
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6] py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Top Breadcrumb Navigation Bar with Back to Homepage */}
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
            <span className="font-semibold text-gray-800">Customer Resource Center</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('home')}
              className="px-3.5 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-2xs"
            >
              ← Back to Homepage
            </button>
            <button
              onClick={() => onNavigate('shop')}
              className="px-3.5 py-1.5 rounded-lg bg-[#0E5E58] text-xs font-bold text-white hover:bg-[#0B4A45] transition-colors shadow-2xs"
            >
              Shop All Products
            </button>
          </div>
        </div>

        {/* Navigation Tabs Horizontal Scroll */}
        <div className="flex border-b border-gray-200 gap-4 overflow-x-auto text-xs font-bold pb-2 scrollbar-none">
          {navTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`pb-2 transition-colors whitespace-nowrap ${
                activeSection === tab.id
                  ? 'border-b-2 border-[#0E5E58] text-[#0E5E58]'
                  : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Section: About */}
        {activeSection === 'about' && (
          <div className="rounded-2xl border border-[#E8E6DF] bg-white p-6 sm:p-10 shadow-xs space-y-6 text-sm text-[#525B67] leading-relaxed">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#0E5E58]">
                About Hound &amp; Harbor
              </span>
              <h1 className="font-serif-brand text-3xl font-bold text-[#1E232A] mt-1">
                Elevating the Canine Experience
              </h1>
            </div>
            <p>
              Founded in 2024 by veterinarians, canine nutritionists, and certified master trainers, Hound &amp; Harbor was built on a simple conviction: dogs deserve the same standard of culinary integrity, artisanal craftsmanship, and safety that we demand for ourselves.
            </p>
            <p>
              Rather than filling a warehouse with mass-market filler kibble and synthetic squeakers that end up in landfills within hours, we curate single-protein human-grade recipes, sustainable certified pre-owned equipment, and verify independent American artisans making heirloom-quality leather and biothane gear.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs">
              <div className="p-4 rounded-xl bg-[#FAF9F6] border border-gray-100 space-y-1.5">
                <Heart size={20} className="text-[#0E5E58]" />
                <h4 className="font-bold text-gray-900">Zero By-Products</h4>
                <p>No rendered meats, animal digests, or mystery bone meals.</p>
              </div>
              <div className="p-4 rounded-xl bg-[#FAF9F6] border border-gray-100 space-y-1.5">
                <RotateCcw size={20} className="text-[#0E5E58]" />
                <h4 className="font-bold text-gray-900">Circular Resale</h4>
                <p>Direct buyback ensures premium dog crates and ramps never end up discarded.</p>
              </div>
              <div className="p-4 rounded-xl bg-[#FAF9F6] border border-gray-100 space-y-1.5">
                <ShieldCheck size={20} className="text-[#0E5E58]" />
                <h4 className="font-bold text-gray-900">Tail-Wag Guarantee</h4>
                <p>30 days to test in your home. Free exchanges on all canine gear.</p>
              </div>
            </div>
          </div>
        )}

        {/* Section: Guarantee */}
        {activeSection === 'guarantee' && (
          <div className="rounded-2xl border border-[#E8E6DF] bg-white p-6 sm:p-10 shadow-xs space-y-6 text-sm text-[#525B67] leading-relaxed">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#0E5E58]">
                Certified Standard
              </span>
              <h1 className="font-serif-brand text-3xl font-bold text-[#1E232A] mt-1">
                The 18-Point Canine Safety Protocol
              </h1>
            </div>

            <p>
              Before any pre-owned kennel, crate, orthopedic mattress, or car seat is accepted into the Hound &amp; Harbor Resale Catalog, our certified technicians execute an exhaustive 18-point inspection:
            </p>

            <div className="space-y-3 text-xs">
              {[
                'Load testing on all structural aluminum welds and corner rivets',
                'Dual-action slam latch and deadbolt locking tension calibration',
                'Escapability gap tolerance inspection (under 0.25 inches across all panels)',
                '180°F hospital-grade pressurized steam sanitation cycle',
                'Non-toxic veterinary antibacterial disinfectant wipe down',
                'Orthopedic memory foam density retention testing under 80 lb mechanical press',
                'Tensile strength verification on heavy-duty biothane and climbing-rope leashes',
                'Zero-chew hardware inspection on marine-grade solid brass and stainless steel snaps',
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-3 rounded-lg bg-[#FAF9F6] border border-gray-100">
                  <CheckCircle2 size={16} className="text-[#0E5E58] shrink-0 mt-0.5" />
                  <span className="font-medium text-gray-800">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section: Shipping */}
        {activeSection === 'shipping' && (
          <div className="rounded-2xl border border-[#E8E6DF] bg-white p-6 sm:p-10 shadow-xs space-y-4 text-sm text-[#525B67] leading-relaxed">
            <h1 className="font-serif-brand text-3xl font-bold text-[#1E232A]">
              Shipping &amp; Delivery Logistics
            </h1>
            <p>
              Orders placed by 2:00 PM CST Monday through Friday are packed and dispatched the very same day from our temperature-controlled central facility in Austin, Texas.
            </p>
            <div className="space-y-3 pt-2 text-xs">
              <div className="p-3 rounded-lg bg-[#FAF9F6] border border-gray-100">
                <strong className="text-gray-900 block">Free Standard Shipping on Orders $49+</strong>
                Delivery in 2 to 4 business days via UPS Ground or FedEx Home across the 48 contiguous US states.
              </div>
              <div className="p-3 rounded-lg bg-[#FAF9F6] border border-gray-100">
                <strong className="text-gray-900 block">Expedited Priority Air ($14.99)</strong>
                Guaranteed delivery in 1 to 2 business days.
              </div>
              <div className="p-3 rounded-lg bg-[#FAF9F6] border border-gray-100">
                <strong className="text-gray-900 block">Heavy Equipment &amp; Crates</strong>
                Oversized aluminum crates travel via specialized freight carriers with liftgate curbside delivery.
              </div>
            </div>
          </div>
        )}

        {/* Section: Returns & Exchanges */}
        {activeSection === 'returns' && (
          <div className="rounded-2xl border border-[#E8E6DF] bg-white p-6 sm:p-10 shadow-xs space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#0E5E58]">
                Hassle-Free Protection
              </span>
              <h1 className="font-serif-brand text-3xl font-bold text-[#1E232A] mt-1">
                Returns &amp; 30-Day Canine Guarantee
              </h1>
              <p className="mt-1 text-xs text-[#525B67]">
                If your dog refuses their food, outgrows their gear, or if a fit isn’t 100% comfortable, we make returns simple.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-[#FAF9F6] border border-gray-100">
                <div className="font-bold text-gray-900">Food Taste Guarantee</div>
                <p className="text-gray-500 mt-1">
                  Even if the bag has been opened and sampled, return it within 30 days for a full refund or exchange.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#FAF9F6] border border-gray-100">
                <div className="font-bold text-gray-900">Free Exchanges</div>
                <p className="text-gray-500 mt-1">
                  Exchange collar or harness sizes with zero shipping or restocking fees.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#FAF9F6] border border-gray-100">
                <div className="font-bold text-gray-900">Prepaid Return Labels</div>
                <p className="text-gray-500 mt-1">
                  Instant printable UPS return shipping label emailed directly to you.
                </p>
              </div>
            </div>

            {/* Quick Return Portal Form */}
            <div className="rounded-xl bg-[#FAF9F6] border border-gray-200 p-6 space-y-4">
              <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                <RotateCcw size={16} className="text-[#0E5E58]" /> Start a Return or Size Exchange
              </h3>
              {!returnSubmitted ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setReturnSubmitted(true);
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        Order Number
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. ORD-2026-8910"
                        value={returnOrderNum}
                        onChange={(e) => setReturnOrderNum(e.target.value)}
                        className="w-full rounded-xl border border-gray-300 p-2.5 text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        Reason for Return / Exchange
                      </label>
                      <select
                        value={returnReason}
                        onChange={(e) => setReturnReason(e.target.value)}
                        className="w-full rounded-xl border border-gray-300 p-2.5 text-xs bg-white"
                      >
                        <option value="taste">Dog Refused Taste / Sensitive Stomach</option>
                        <option value="size_small">Harness or Collar Too Small</option>
                        <option value="size_large">Harness or Collar Too Large</option>
                        <option value="changed_mind">No Longer Needed</option>
                        <option value="defect">Damaged in Transit</option>
                      </select>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="rounded-xl bg-[#0E5E58] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#0B4A45]"
                  >
                    Generate Prepaid Return Label
                  </button>
                </form>
              ) : (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 size={16} className="text-emerald-700" />
                    <span>Prepaid Return Authorized!</span>
                  </div>
                  <p>
                    We’ve generated return authorization <strong>RMA-{Math.floor(10000 + Math.random() * 90000)}</strong> for {returnOrderNum}. A prepaid UPS shipping label has been dispatched to your email.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Section: Support & Concierge */}
        {activeSection === 'support' && (
          <div className="rounded-2xl border border-[#E8E6DF] bg-white p-6 sm:p-10 shadow-xs space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#0E5E58]">
                Canine Concierge Desk
              </span>
              <h1 className="font-serif-brand text-3xl font-bold text-[#1E232A] mt-1">
                How Can We Help You &amp; Your Dog?
              </h1>
              <p className="mt-1 text-xs text-[#525B67]">
                Our certified canine nutritionists and product experts are available 7 days a week from 8 AM to 8 PM CST.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-[#FAF9F6] border border-gray-100 flex items-start gap-3">
                <Mail size={18} className="text-[#0E5E58] shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-gray-900">Email Concierge</div>
                  <div className="text-gray-500">concierge@houndandharbor.com</div>
                  <div className="text-[10px] text-[#0E5E58] mt-1">Average reply: &lt; 15 mins</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF9F6] border border-gray-100 flex items-start gap-3">
                <Phone size={18} className="text-[#0E5E58] shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-gray-900">Telephone Line</div>
                  <div className="text-gray-500">1 (800) 555-HOUND</div>
                  <div className="text-[10px] text-[#0E5E58] mt-1">Toll-free across US &amp; Canada</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF9F6] border border-gray-100 flex items-start gap-3">
                <MessageSquare size={18} className="text-[#0E5E58] shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-gray-900">Nutritional Help</div>
                  <div className="text-gray-500">Free diet review for your dog</div>
                  <div className="text-[10px] text-[#0E5E58] mt-1">With licensed vet techs</div>
                </div>
              </div>
            </div>

            {/* Direct message ticket form */}
            <div className="rounded-xl bg-[#FAF9F6] border border-gray-200 p-6 space-y-4">
              <h3 className="font-bold text-gray-800 text-sm">Send a Direct Message</h3>
              {!supportSent ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSupportSent(true);
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        Your Name
                      </label>
                      <input
                        type="text"
                        required
                        value={supportName}
                        onChange={(e) => setSupportName(e.target.value)}
                        placeholder="e.g. Kimberly"
                        className="w-full rounded-xl border border-gray-300 p-2.5 text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={supportEmail}
                        onChange={(e) => setSupportEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full rounded-xl border border-gray-300 p-2.5 text-xs bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Question or Order Inquiry
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={supportMessage}
                      onChange={(e) => setSupportMessage(e.target.value)}
                      placeholder="Tell us how we can assist your canine..."
                      className="w-full rounded-xl border border-gray-300 p-2.5 text-xs bg-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="flex items-center gap-2 rounded-xl bg-[#0E5E58] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#0B4A45]"
                  >
                    <Send size={13} />
                    <span>Send Message to Concierge</span>
                  </button>
                </form>
              ) : (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 size={16} className="text-emerald-700" />
                    <span>Message Dispatched!</span>
                  </div>
                  <p>
                    Thank you, {supportName}! Our concierge team has logged your inquiry and will reach back out to {supportEmail} shortly.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Section: Buyback Program */}
        {activeSection === 'buyback-program' && (
          <div className="rounded-2xl border border-[#E8E6DF] bg-white p-6 sm:p-10 shadow-xs space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#0E5E58]">
                Circular Canine Economy
              </span>
              <h1 className="font-serif-brand text-3xl font-bold text-[#1E232A] mt-1">
                Hound &amp; Harbor Buyback Appraisal
              </h1>
              <p className="mt-1 text-xs text-[#525B67]">
                Has your puppy outgrown their aluminum crate, ramp, or training pen? Trade it in for instant cash or 120% store credit.
              </p>
            </div>

            {/* Instant Valuation Form */}
            <form onSubmit={calculateBuyback} className="p-6 rounded-2xl bg-[#FAF9F6] border border-gray-200 space-y-4">
              <h3 className="font-bold text-gray-900 text-sm">Calculate Instant Valuation</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    Equipment Category
                  </label>
                  <select
                    value={itemType}
                    onChange={(e) => setItemType(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 p-2.5 text-xs bg-white"
                  >
                    <option value="aluminum_crate">Heavy-Duty Aluminum Kennel (Gunner, Impact, etc.)</option>
                    <option value="vehicle_ramp">Telescoping Vehicle Ramp</option>
                    <option value="orthopedic_bed">Large/Giant Orthopedic Foam Bed (Washable)</option>
                    <option value="travel_kennel">Airline-Approved Travel Carrier</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    Physical Condition
                  </label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 p-2.5 text-xs bg-white"
                  >
                    <option value="like_new">Like New (Flawless, barely used)</option>
                    <option value="excellent">Excellent (Light cosmetic scuffs, mechanically perfect)</option>
                    <option value="good">Good (Normal wear, fully functional latches)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="rounded-xl bg-[#0E5E58] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#0B4A45]"
              >
                Update Appraisal Valuation
              </button>

              {estimatedQuote && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
                  <div>
                    <div className="text-xs text-gray-600">Guaranteed Instant Appraisal Offer:</div>
                    <div className="text-2xl font-bold text-emerald-800">
                      ${estimatedQuote} Cash <span className="text-sm font-normal text-gray-600">or</span> ${Math.round(estimatedQuote * 1.2)} Store Credit
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate('resale')}
                    className="px-5 py-2 rounded-xl bg-emerald-800 text-white text-xs font-bold hover:bg-emerald-900"
                  >
                    Accept Offer &amp; Get Free Shipping Box
                  </button>
                </div>
              )}
            </form>
          </div>
        )}

        {/* Section: Gift Cards */}
        {activeSection === 'gift-cards' && (
          <div className="rounded-2xl border border-[#E8E6DF] bg-white p-6 sm:p-10 shadow-xs space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#0E5E58]">
                Hound &amp; Harbor Digital Gift Cards
              </span>
              <h1 className="font-serif-brand text-3xl font-bold text-[#1E232A] mt-1">
                Give the Gift of Canine Wellness
              </h1>
              <p className="mt-1 text-xs text-[#525B67]">
                Delivered instantly via email with no expiration dates or maintenance fees.
              </p>
            </div>

            {/* Check Balance Form */}
            <div className="rounded-xl bg-[#FAF9F6] border border-gray-200 p-6 space-y-4">
              <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                <Gift size={16} className="text-[#0E5E58]" /> Check Existing Gift Card Balance
              </h3>
              <form onSubmit={checkGiftCard} className="flex gap-3">
                <input
                  type="text"
                  placeholder="Enter 16-digit code (e.g. HND-GIFT-50)"
                  value={gcCode}
                  onChange={(e) => setGcCode(e.target.value)}
                  className="flex-1 rounded-xl border border-gray-300 p-2.5 text-xs font-mono uppercase bg-white"
                />
                <button
                  type="submit"
                  disabled={gcLoading}
                  className="rounded-xl bg-[#0E5E58] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#0B4A45]"
                >
                  {gcLoading ? 'Checking...' : 'Check Balance'}
                </button>
              </form>

              {gcResult && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                  <div className="font-bold">Card Code: {gcResult.code}</div>
                  <div>Remaining Balance: <strong>${gcResult.balance?.toFixed(2)}</strong></div>
                  <div>Recipient: {gcResult.recipientEmail}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Section: FAQ */}
        {activeSection === 'faq' && (
          <div className="rounded-2xl border border-[#E8E6DF] bg-white p-6 sm:p-10 shadow-xs space-y-6">
            <h1 className="font-serif-brand text-3xl font-bold text-[#1E232A]">
              Frequently Asked Questions
            </h1>
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-[#FAF9F6] border border-gray-100 space-y-1">
                <h4 className="font-bold text-gray-900">How does the Smart Reorder Depletion algorithm work?</h4>
                <p className="text-[#525B67]">
                  When you configure your dog’s weight, age, and activity level, our platform calculates their daily caloric requirements in cups of kibble. As you purchase bags, we monitor your consumption rate and notify you 5-7 days before your dog’s food bin runs empty.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#FAF9F6] border border-gray-100 space-y-1">
                <h4 className="font-bold text-gray-900">Can I pause or skip autoship deliveries?</h4>
                <p className="text-[#525B67]">
                  Yes, with a single click inside your Account Dashboard. You can skip upcoming deliveries, adjust the frequency from every 2 weeks to every 8 weeks, or cancel at any time with zero penalties.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#FAF9F6] border border-gray-100 space-y-1">
                <h4 className="font-bold text-gray-900">How do I sell my dog’s outgrown gear to Hound &amp; Harbor?</h4>
                <p className="text-[#525B67]">
                  Navigate to Certified Pre-Owned, click "Calculate Instant Buyback Offer", enter the equipment details, and accept our guaranteed cash or store credit valuation. We immediately send you a prepaid insured shipping kit.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#FAF9F6] border border-gray-100 space-y-1">
                <h4 className="font-bold text-gray-900">Are the food ingredients 100% human grade?</h4>
                <p className="text-[#525B67]">
                  All meat proteins are sourced from USDA-inspected suppliers and contain zero rendered meat meals, zero animal digests, and zero artificial colors or chemical preservatives.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Section: Privacy Policy */}
        {activeSection === 'privacy' && (
          <div className="rounded-2xl border border-[#E8E6DF] bg-white p-6 sm:p-10 shadow-xs space-y-4 text-sm text-[#525B67] leading-relaxed">
            <h1 className="font-serif-brand text-3xl font-bold text-[#1E232A]">
              Privacy Policy &amp; Canine Data Protection
            </h1>
            <p>
              Hound &amp; Harbor is committed to safeguarding the privacy of our pet guardians. We never sell, lease, or monetize your dog’s dietary records, clinical health profiles, or purchase histories.
            </p>
            <div className="space-y-3 pt-2 text-xs">
              <div className="p-3 rounded-lg bg-[#FAF9F6] border border-gray-100">
                <strong className="text-gray-900 block">Pet Profile Privacy</strong>
                Your dog's weight, allergy markers, and age are used exclusively to compute nutrition formulas and accurate depletion autoship triggers.
              </div>
              <div className="p-3 rounded-lg bg-[#FAF9F6] border border-gray-100">
                <strong className="text-gray-900 block">Encrypted Payments</strong>
                All financial data is processed via PCI-DSS Level 1 certified gateways with TLS 1.3 tokenization.
              </div>
            </div>
          </div>
        )}

        {/* Section: Terms of Service */}
        {activeSection === 'terms' && (
          <div className="rounded-2xl border border-[#E8E6DF] bg-white p-6 sm:p-10 shadow-xs space-y-4 text-sm text-[#525B67] leading-relaxed">
            <h1 className="font-serif-brand text-3xl font-bold text-[#1E232A]">
              Terms of Service &amp; E-Commerce Policies
            </h1>
            <p>
              By accessing Hound &amp; Harbor, you agree to our standard consumer terms. All orders are backed by our 30-Day Tail-Wag Guarantee and 18-Point Certified Pre-Owned Inspection standards.
            </p>
            <div className="space-y-3 pt-2 text-xs">
              <div className="p-3 rounded-lg bg-[#FAF9F6] border border-gray-100">
                <strong className="text-gray-900 block">Autoship Flexibility</strong>
                Autoship subscriptions have no minimum term and can be cancelled or rescheduled at any time without fees.
              </div>
              <div className="p-3 rounded-lg bg-[#FAF9F6] border border-gray-100">
                <strong className="text-gray-900 block">Certified Resale Protocol</strong>
                All pre-owned gear is certified functional and sanitized before shipment.
              </div>
            </div>
          </div>
        )}

        {/* Section: Accessibility */}
        {activeSection === 'accessibility' && (
          <div className="rounded-2xl border border-[#E8E6DF] bg-white p-6 sm:p-10 shadow-xs space-y-4 text-sm text-[#525B67] leading-relaxed">
            <h1 className="font-serif-brand text-3xl font-bold text-[#1E232A]">
              Accessibility Statement
            </h1>
            <p>
              We believe every pet lover deserves barrier-free access. Hound &amp; Harbor adheres to the World Wide Web Consortium’s Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards.
            </p>
            <div className="space-y-3 pt-2 text-xs">
              <div className="p-3 rounded-lg bg-[#FAF9F6] border border-gray-100">
                <strong className="text-gray-900 block">Keyboard Navigation &amp; Screen Readers</strong>
                All interactive menus, forms, and product selectors are built with semantic ARIA tags and full keyboard focus traps.
              </div>
            </div>
          </div>
        )}

        {/* Section: Marketplace Apply */}
        {activeSection === 'marketplace-apply' && (
          <div className="rounded-2xl border border-[#E8E6DF] bg-white p-6 sm:p-10 shadow-xs space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#0E5E58]">
                Independent Artisan Makers
              </span>
              <h1 className="font-serif-brand text-3xl font-bold text-[#1E232A] mt-1">
                Apply to Sell on Hound &amp; Harbor Marketplace
              </h1>
              <p className="mt-1 text-xs text-[#525B67]">
                We partner with dedicated craftspeople making small-batch leashes, solid wood beds, and organic single-ingredient treats.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-[#FAF9F6] border border-gray-200 text-xs space-y-3">
              <div className="font-bold text-gray-900 text-sm">Maker Benefits:</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-white border border-gray-100">
                  <strong className="block text-gray-800">Low 8% Commission</strong>
                  Industry-lowest fee supporting independent artisans.
                </div>
                <div className="p-3 rounded-xl bg-white border border-gray-100">
                  <strong className="block text-gray-800">Pre-Qualified Dog Parents</strong>
                  Direct access to tens of thousands of dedicated canine guardians.
                </div>
                <div className="p-3 rounded-xl bg-white border border-gray-100">
                  <strong className="block text-gray-800">Fast Bi-Weekly Payouts</strong>
                  Direct ACH deposits with full sales telemetry.
                </div>
              </div>
              <button
                onClick={() => onNavigate('seller-portal')}
                className="mt-4 px-6 py-2.5 rounded-xl bg-[#0E5E58] text-xs font-bold text-white hover:bg-[#0B4A45]"
              >
                Access Merchant Seller Portal
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
