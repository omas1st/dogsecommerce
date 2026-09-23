import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import {
  SlidersHorizontal,
  DollarSign,
  Package,
  Users,
  ShieldCheck,
  Tag,
  Gift,
  RefreshCw,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Edit2,
  Download,
} from 'lucide-react';

interface AdminDashboardPageProps {
  onNavigate: (route: string, params?: any) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<
    'overview' | 'products' | 'orders' | 'pets' | 'sellers' | 'buybacks' | 'coupons' | 'audit'
  >('overview');

  const [overview, setOverview] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [pets, setPets] = useState<any[]>([]);
  const [sellers, setSellers] = useState<any[]>([]);
  const [buybacks, setBuybacks] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New Coupon Form
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(10);
  const [couponType, setCouponType] = useState('percentage');

  // New Gift Card Form
  const [giftCardCode, setGiftCardCode] = useState('');
  const [giftCardAmount, setGiftCardAmount] = useState(50);
  const [giftCardEmail, setGiftCardEmail] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [ovData, prData, orData, ptData, slData, bbData, cpData, auData] = await Promise.all([
        apiRequest('/admin/overview'),
        apiRequest('/admin/products'),
        apiRequest('/admin/orders'),
        apiRequest('/admin/pets'),
        apiRequest('/admin/sellers'),
        apiRequest('/admin/buybacks'),
        apiRequest('/admin/coupons'),
        apiRequest('/admin/audit-logs'),
      ]);

      setOverview(ovData.metrics);
      setProducts(prData.products || []);
      setOrders(orData.orders || []);
      setPets(ptData.pets || []);
      setSellers(slData.sellers || []);
      setBuybacks(bbData.buybackOffers || []);
      setCoupons(cpData.coupons || []);
      setAuditLogs(auData.logs || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      await apiRequest(`/admin/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({
          status,
          trackingNumber: status === 'shipped' ? '1Z9999999999999999' : undefined,
          carrier: status === 'shipped' ? 'UPS Ground' : undefined,
        }),
      });
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Status update failed.');
    }
  };

  const handleInspectBuyback = async (buybackId: string) => {
    try {
      await apiRequest(`/admin/buybacks/${buybackId}/inspect`, {
        method: 'POST',
        body: JSON.stringify({
          decision: 'pass_and_list',
          inspectionNotes: '18-point safety verified. Aluminum frame pristine. Sanitized with steam.',
          finalResalePrice: 389.0,
        }),
      });
      alert('Buyback gear verified and automatically published to Certified Pre-Owned catalog!');
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Inspection action failed.');
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    try {
      await apiRequest('/admin/coupons', {
        method: 'POST',
        body: JSON.stringify({
          code: couponCode.trim().toUpperCase(),
          discountType: couponType,
          discountValue: Number(couponDiscount),
          isActive: true,
          description: `${couponDiscount}% off promotional discount`,
        }),
      });
      setCouponCode('');
      await loadData();
      alert('Promotional coupon active!');
    } catch (err: any) {
      alert(err.message || 'Could not create coupon.');
    }
  };

  const handleCreateGiftCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!giftCardCode.trim() || !giftCardEmail.trim()) return;
    try {
      await apiRequest('/admin/gift-cards', {
        method: 'POST',
        body: JSON.stringify({
          code: giftCardCode.trim().toUpperCase(),
          amount: Number(giftCardAmount),
          recipientEmail: giftCardEmail.trim(),
        }),
      });
      setGiftCardCode('');
      setGiftCardEmail('');
      alert('Digital Gift Card issued!');
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Could not issue gift card.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-md bg-amber-100 text-amber-900 px-2.5 py-0.5 text-xs font-bold">
              <SlidersHorizontal size={13} /> Platform Administrator
            </div>
            <h1 className="font-serif-brand text-3xl font-bold text-[#1E232A] mt-1">
              Hound &amp; Harbor Command Center
            </h1>
            <p className="text-xs text-gray-500">
              Logged in as {user?.firstName} {user?.lastName} ({user?.email})
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onNavigate('home')}
              className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              Customer View
            </button>
            <button
              onClick={loadData}
              className="rounded-xl bg-[#0E5E58] px-4 py-2 text-xs font-bold text-white hover:bg-[#0B4A45] flex items-center gap-1.5 shadow-xs"
            >
              <RefreshCw size={13} /> Refresh
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 gap-2 overflow-x-auto text-xs font-bold">
          {[
            { id: 'overview', label: 'Dashboard Metrics' },
            { id: 'products', label: `Products (${products.length})` },
            { id: 'orders', label: `Orders (${orders.length})` },
            { id: 'pets', label: `Pets (${pets.length})` },
            { id: 'sellers', label: `Artisan Sellers (${sellers.length})` },
            { id: 'buybacks', label: `Buyback Hub (${buybacks.length})` },
            { id: 'coupons', label: `Promotions & Cards` },
            { id: 'audit', label: `Audit Trail` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 px-3 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-b-2 border-[#0E5E58] text-[#0E5E58]'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && overview && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="rounded-2xl border border-[#E8E6DF] bg-white p-5 shadow-2xs">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Gross Sales</span>
                <div className="text-2xl font-bold text-[#1E232A] mt-2">
                  ${overview.totalSales?.toFixed(2) || '0.00'}
                </div>
                <div className="text-[11px] text-emerald-600 font-semibold mt-1">Platform GMV</div>
              </div>

              <div className="rounded-2xl border border-[#E8E6DF] bg-white p-5 shadow-2xs">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Orders</span>
                <div className="text-2xl font-bold text-[#1E232A] mt-2">
                  {overview.totalOrders || 0}
                </div>
                <div className="text-[11px] text-gray-500 mt-1">Avg Order: ${(overview.totalSales / (overview.totalOrders || 1)).toFixed(2)}</div>
              </div>

              <div className="rounded-2xl border border-[#E8E6DF] bg-white p-5 shadow-2xs">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Registered Dogs</span>
                <div className="text-2xl font-bold text-[#0E5E58] mt-2">
                  {overview.totalPets || 0}
                </div>
                <div className="text-[11px] text-gray-500 mt-1">Active nutritional profiles</div>
              </div>

              <div className="rounded-2xl border border-[#E8E6DF] bg-white p-5 shadow-2xs">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Active Subscriptions</span>
                <div className="text-2xl font-bold text-[#1E232A] mt-2">
                  {overview.totalSubscriptions || 0}
                </div>
                <div className="text-[11px] text-emerald-600 font-semibold mt-1">Automated autoship MRR</div>
              </div>
            </div>

            {/* Quick Actions Row */}
            <div className="rounded-2xl border border-[#E8E6DF] bg-white p-6 shadow-xs">
              <h3 className="font-serif-brand text-lg font-bold text-[#1E232A] mb-3">
                Operations &amp; Reports
              </h3>
              <div className="flex flex-wrap gap-3 text-xs">
                <button
                  onClick={() => setActiveTab('orders')}
                  className="rounded-xl bg-[#F4F8F7] border border-[#D4E8E4] px-4 py-2 font-bold text-[#0E5E58]"
                >
                  Manage Pending Shipments
                </button>
                <button
                  onClick={() => setActiveTab('buybacks')}
                  className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-2 font-bold text-amber-900"
                >
                  Inspect Incoming Pre-Owned Gear
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Products */}
        {activeTab === 'products' && (
          <div className="rounded-2xl border border-[#E8E6DF] bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="font-serif-brand text-lg font-bold text-[#1E232A]">
                Catalog Products ({products.length})
              </h3>
            </div>

            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF9F6] text-gray-500 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Product</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Inventory</th>
                    <th className="p-3">Owner</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="p-3 flex items-center gap-2.5">
                        <img src={p.images?.[0]} alt="" className="w-9 h-9 rounded-lg object-cover bg-gray-100" />
                        <div>
                          <div className="font-bold text-gray-800 line-clamp-1">{p.title}</div>
                          <div className="text-[10px] text-gray-400">{p.sku}</div>
                        </div>
                      </td>
                      <td className="p-3 capitalize">{p.category?.replace(/-/g, ' ')}</td>
                      <td className="p-3 font-semibold text-gray-800">${p.price.toFixed(2)}</td>
                      <td className="p-3 font-semibold text-gray-800">{p.stock} units</td>
                      <td className="p-3 capitalize">
                        <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-medium">
                          {p.ownerType?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                          Published
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Orders */}
        {activeTab === 'orders' && (
          <div className="rounded-2xl border border-[#E8E6DF] bg-white p-6 shadow-xs">
            <h3 className="font-serif-brand text-lg font-bold text-[#1E232A] mb-4">
              All Platform Orders ({orders.length})
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF9F6] text-gray-500 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Order Number</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Items</th>
                    <th className="p-3">Total</th>
                    <th className="p-3">Fulfillment Status</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-gray-50">
                      <td className="p-3 font-mono font-bold text-gray-800">{o.orderNumber}</td>
                      <td className="p-3">
                        <div>{o.customerName}</div>
                        <div className="text-[10px] text-gray-400">{o.customerEmail}</div>
                      </td>
                      <td className="p-3">{o.items?.length || 1} items</td>
                      <td className="p-3 font-bold text-gray-800">${o.total?.toFixed(2)}</td>
                      <td className="p-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                          o.orderStatus === 'delivered' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'
                        }`}>
                          {o.orderStatus}
                        </span>
                      </td>
                      <td className="p-3 flex gap-2">
                        {o.orderStatus !== 'shipped' && o.orderStatus !== 'delivered' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(o.id, 'shipped')}
                            className="rounded-lg bg-[#0E5E58] px-2.5 py-1 text-[10px] font-bold text-white hover:bg-[#0B4A45]"
                          >
                            Mark Shipped
                          </button>
                        )}
                        {o.orderStatus === 'shipped' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(o.id, 'delivered')}
                            className="rounded-lg bg-emerald-700 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-emerald-800"
                          >
                            Mark Delivered
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Pets */}
        {activeTab === 'pets' && (
          <div className="rounded-2xl border border-[#E8E6DF] bg-white p-6 shadow-xs">
            <h3 className="font-serif-brand text-lg font-bold text-[#1E232A] mb-4">
              Registered Dog Nutritional Profiles ({pets.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {pets.map((pet) => (
                <div key={pet.id} className="rounded-xl border border-gray-200 bg-[#FAF9F6] p-4 text-xs space-y-2">
                  <div className="flex items-center gap-3">
                    <img src={pet.photoUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=150&q=80'} alt="" className="w-12 h-12 rounded-xl object-cover" />
                    <div>
                      <h4 className="font-bold text-sm text-gray-800">{pet.name}</h4>
                      <div className="text-gray-500">{pet.breed} • {pet.ageYears} yrs • {pet.weightLbs} lbs</div>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-gray-200 flex justify-between text-[11px]">
                    <span className="text-gray-500">Allergies:</span>
                    <strong className="text-[#E05338]">{pet.allergies?.join(', ') || 'None'}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Sellers */}
        {activeTab === 'sellers' && (
          <div className="rounded-2xl border border-[#E8E6DF] bg-white p-6 shadow-xs">
            <h3 className="font-serif-brand text-lg font-bold text-[#1E232A] mb-4">
              Artisan Marketplace Merchants ({sellers.length})
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF9F6] text-gray-500 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Store</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Sales</th>
                    <th className="p-3">Commission</th>
                    <th className="p-3">Available Payout</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sellers.map((s) => (
                    <tr key={s.id}>
                      <td className="p-3 font-bold text-gray-800">{s.storeName}</td>
                      <td className="p-3 text-gray-500">{s.contactEmail}</td>
                      <td className="p-3">${s.totalRevenue?.toFixed(2)}</td>
                      <td className="p-3">{(s.commissionRate * 100).toFixed(0)}%</td>
                      <td className="p-3 font-semibold text-[#0E5E58]">${s.availablePayout?.toFixed(2)}</td>
                      <td className="p-3">
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 6: Buybacks Hub */}
        {activeTab === 'buybacks' && (
          <div className="rounded-2xl border border-[#E8E6DF] bg-white p-6 shadow-xs space-y-4">
            <div>
              <h3 className="font-serif-brand text-lg font-bold text-[#1E232A]">
                Certified Pre-Owned Buyback Inspection Hub
              </h3>
              <p className="text-xs text-gray-500">
                Review submitted items, run 18-point verification, and convert into live Certified Pre-Owned listings.
              </p>
            </div>

            <div className="space-y-4">
              {buybacks.map((bb) => (
                <div key={bb.id} className="rounded-xl border border-gray-200 bg-[#FAF9F6] p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
                  <div>
                    <h4 className="font-bold text-sm text-gray-800">{bb.itemTitle}</h4>
                    <div className="text-gray-500 mt-0.5">
                      Submitted by: {bb.sellerName} ({bb.sellerEmail}) • Asking: ${bb.askingPrice}
                    </div>
                    <div className="mt-1 text-emerald-700 font-semibold">
                      Guaranteed Platform Offer: ${bb.platformOfferAmount?.toFixed(2)} • Status: {bb.status}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {bb.status !== 'certified_and_listed' ? (
                      <button
                        onClick={() => handleInspectBuyback(bb.id)}
                        className="rounded-lg bg-[#0E5E58] px-4 py-2 font-bold text-white hover:bg-[#0B4A45] shadow-xs"
                      >
                        Run 18-Pt Inspection &amp; Publish Resale
                      </button>
                    ) : (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 size={14} /> Certified &amp; Listed
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 7: Promotions & Gift Cards */}
        {activeTab === 'coupons' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Create Coupon */}
            <div className="rounded-2xl border border-[#E8E6DF] bg-white p-6 shadow-xs space-y-4">
              <h3 className="font-serif-brand text-lg font-bold text-[#1E232A]">
                Create Promotional Coupon
              </h3>
              <form onSubmit={handleCreateCoupon} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Coupon Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. FLASH20"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 p-2 uppercase"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Type</label>
                    <select
                      value={couponType}
                      onChange={(e) => setCouponType(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 p-2 bg-white"
                    >
                      <option value="percentage">Percentage Off (%)</option>
                      <option value="fixed">Fixed Dollar ($)</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Value</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={couponDiscount}
                      onChange={(e) => setCouponDiscount(Number(e.target.value))}
                      className="w-full rounded-lg border border-gray-300 p-2"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="rounded-lg bg-[#0E5E58] px-4 py-2 font-bold text-white hover:bg-[#0B4A45]"
                >
                  Create Promo Code
                </button>
              </form>

              <div className="pt-3 border-t border-gray-100">
                <span className="font-bold text-gray-700 text-xs block mb-2">Active Codes:</span>
                <div className="space-y-1 text-xs">
                  {coupons.map((c) => (
                    <div key={c.id} className="flex justify-between p-2 rounded bg-gray-50 border border-gray-100 font-mono">
                      <span>{c.code} ({c.discountValue}% off)</span>
                      <span className="text-emerald-600 font-semibold">Active</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Issue Gift Card */}
            <div className="rounded-2xl border border-[#E8E6DF] bg-white p-6 shadow-xs space-y-4">
              <h3 className="font-serif-brand text-lg font-bold text-[#1E232A]">
                Issue Digital Gift Card
              </h3>
              <form onSubmit={handleCreateGiftCard} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Card Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. HND-GIFT-100"
                    value={giftCardCode}
                    onChange={(e) => setGiftCardCode(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 p-2 uppercase"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Amount ($)</label>
                    <input
                      type="number"
                      required
                      min={5}
                      value={giftCardAmount}
                      onChange={(e) => setGiftCardAmount(Number(e.target.value))}
                      className="w-full rounded-lg border border-gray-300 p-2"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Recipient Email</label>
                    <input
                      type="email"
                      required
                      placeholder="customer@example.com"
                      value={giftCardEmail}
                      onChange={(e) => setGiftCardEmail(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 p-2"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="rounded-lg bg-[#24303E] px-4 py-2 font-bold text-white hover:bg-black"
                >
                  Issue Gift Card
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Tab 8: Audit Logs */}
        {activeTab === 'audit' && (
          <div className="rounded-2xl border border-[#E8E6DF] bg-white p-6 shadow-xs">
            <h3 className="font-serif-brand text-lg font-bold text-[#1E232A] mb-4">
              System Audit &amp; Event Logs
            </h3>
            <div className="space-y-2 text-xs font-mono max-h-96 overflow-y-auto">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-2.5 rounded bg-gray-50 border border-gray-100 flex justify-between">
                  <div>
                    <span className="font-bold text-[#0E5E58]">{log.action}</span> - {log.details}
                  </div>
                  <span className="text-gray-400 text-[11px]">{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
