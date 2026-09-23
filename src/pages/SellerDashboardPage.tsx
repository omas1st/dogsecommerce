import React, { useState, useEffect } from 'react';
import { Seller, Product } from '../types';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import {
  Store,
  DollarSign,
  Package,
  TrendingUp,
  Plus,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface SellerDashboardPageProps {
  onNavigate: (route: string, params?: any) => void;
}

export const SellerDashboardPage: React.FC<SellerDashboardPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [payoutSuccess, setPayoutSuccess] = useState(false);

  // New Product Form
  const [newTitle, setNewTitle] = useState('');
  const [newPrice, setNewPrice] = useState(48);
  const [newCategory, setNewCategory] = useState('collars-leashes');
  const [newDesc, setNewDesc] = useState('');
  const [newStock, setNewStock] = useState(25);
  const [newImage, setNewImage] = useState(
    'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=600&q=80'
  );

  useEffect(() => {
    async function loadSellerData() {
      setIsLoading(true);
      try {
        const overview = await apiRequest<{ success: boolean; seller: Seller; recentOrders: any[] }>(
          '/seller/overview'
        );
        setSeller(overview.seller);
        setOrders(overview.recentOrders || []);

        const prodData = await apiRequest<{ success: boolean; products: Product[] }>('/seller/products');
        setProducts(prodData.products || []);
      } catch (err: any) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSellerData();
  }, []);

  const handleRequestPayout = async () => {
    if (!seller || seller.availablePayout <= 0) {
      alert('No available payout balance.');
      return;
    }
    try {
      await apiRequest('/seller/payouts/request', {
        method: 'POST',
        body: JSON.stringify({ amount: seller.availablePayout }),
      });
      setPayoutSuccess(true);
      setSeller({ ...seller, availablePayout: 0 });
    } catch (err: any) {
      alert(err.message || 'Payout request failed.');
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await apiRequest<{ success: boolean; product: Product }>('/seller/products', {
        method: 'POST',
        body: JSON.stringify({
          title: newTitle,
          price: Number(newPrice),
          category: newCategory,
          description: newDesc,
          stock: Number(newStock),
          images: [newImage],
        }),
      });
      setProducts([data.product, ...products]);
      setShowAddModal(false);
      setNewTitle('');
      setNewDesc('');
      alert('Handcrafted product submitted for platform catalog!');
    } catch (err: any) {
      alert(err.message || 'Could not add product.');
    }
  };

  if (!seller && !isLoading) {
    return (
      <div className="min-h-[70vh] bg-[#FAF9F6] py-16 text-center">
        <div className="max-w-md mx-auto px-4">
          <Store size={36} className="text-[#0E5E58] mx-auto mb-3" />
          <h2 className="font-serif-brand text-2xl font-bold text-[#1E232A]">Artisan Partner Application</h2>
          <p className="mt-2 text-xs text-[#525B67]">
            You do not currently have an active seller store on Hound &amp; Harbor. Apply today to showcase your handcrafted gear.
          </p>
          <button
            onClick={() => onNavigate('marketplace-apply')}
            className="mt-6 rounded-xl bg-[#0E5E58] px-6 py-3 text-xs font-bold text-white hover:bg-[#0B4A45]"
          >
            Apply as an Artisan Maker
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#0E5E58]">
              Artisan Merchant Portal
            </span>
            <h1 className="font-serif-brand text-3xl font-bold text-[#1E232A]">
              {seller?.storeName || 'Artisan Dashboard'}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Platform Commission: {((seller?.commissionRate || 0.12) * 100).toFixed(0)}% • Rating: ★ {seller?.rating.toFixed(1)}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="rounded-xl bg-[#0E5E58] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#0B4A45] flex items-center gap-1.5"
            >
              <Plus size={14} /> Add Artisan Product
            </button>
          </div>
        </div>

        {/* Payout Success Alert */}
        {payoutSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>ACH direct deposit initiated to your linked bank account (ending in {seller?.bankAccountLast4 || '9012'}). Funds arrive in 1-2 business days.</span>
          </div>
        )}

        {/* Financial Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="rounded-2xl border border-[#E8E6DF] bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-xs font-bold uppercase tracking-wider">Gross Sales</span>
              <TrendingUp size={16} className="text-[#0E5E58]" />
            </div>
            <div className="text-2xl font-bold text-[#1E232A] mt-2">
              ${seller?.totalRevenue.toFixed(2) || '0.00'}
            </div>
            <div className="text-[11px] text-gray-500 mt-1">{seller?.totalSales || 0} customer orders</div>
          </div>

          <div className="rounded-2xl border border-[#E8E6DF] bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-xs font-bold uppercase tracking-wider">Available Payout</span>
              <DollarSign size={16} className="text-[#0E5E58]" />
            </div>
            <div className="text-2xl font-bold text-[#0E5E58] mt-2">
              ${seller?.availablePayout.toFixed(2) || '0.00'}
            </div>
            <button
              onClick={handleRequestPayout}
              disabled={!seller || seller.availablePayout <= 0}
              className="mt-2 text-xs font-bold text-[#0E5E58] hover:underline disabled:text-gray-400 disabled:no-underline"
            >
              Request ACH Payout →
            </button>
          </div>

          <div className="rounded-2xl border border-[#E8E6DF] bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-xs font-bold uppercase tracking-wider">Pending Clearing</span>
              <Package size={16} className="text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-[#1E232A] mt-2">
              ${seller?.pendingPayout.toFixed(2) || '0.00'}
            </div>
            <div className="text-[11px] text-gray-500 mt-1">Clears 48 hrs after delivery</div>
          </div>

          <div className="rounded-2xl border border-[#E8E6DF] bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-xs font-bold uppercase tracking-wider">Total Paid Out</span>
              <CheckCircle2 size={16} className="text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-[#1E232A] mt-2">
              ${seller?.paidPayoutTotal.toFixed(2) || '0.00'}
            </div>
            <div className="text-[11px] text-gray-500 mt-1">Lifetime earnings</div>
          </div>
        </div>

        {/* Handcrafted Products Catalog Table */}
        <div className="rounded-2xl border border-[#E8E6DF] bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <h3 className="font-serif-brand text-lg font-bold text-[#1E232A]">
              Your Active Artisan Listings ({products.length})
            </h3>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF9F6] text-gray-500 uppercase text-[10px]">
                <tr>
                  <th className="p-3">Product</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Inventory</th>
                  <th className="p-3">Rating</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="p-3 flex items-center gap-3">
                      <img src={p.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                      <div>
                        <div className="font-bold text-gray-800">{p.title}</div>
                        <div className="text-[10px] text-gray-400">{p.sku}</div>
                      </div>
                    </td>
                    <td className="p-3 font-semibold text-gray-800">${p.price.toFixed(2)}</td>
                    <td className="p-3 font-semibold text-gray-800">{p.stock} units</td>
                    <td className="p-3">★ {p.rating.toFixed(1)} ({p.reviewsCount})</td>
                    <td className="p-3">
                      <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-[#0E5E58]">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-gray-200">
            <h3 className="font-serif-brand text-xl font-bold text-[#1E232A]">
              Add Artisan Product
            </h3>

            <form onSubmit={handleCreateProduct} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Handmade Biothane Training Leash"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-2.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Price ($) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full rounded-lg border border-gray-300 p-2.5"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Stock Units *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newStock}
                    onChange={(e) => setNewStock(Number(e.target.value))}
                    className="w-full rounded-lg border border-gray-300 p-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-2.5 bg-white"
                >
                  <option value="collars-leashes">Collars, Harnesses &amp; Leashes</option>
                  <option value="dog-treats">Organic Treats &amp; Chews</option>
                  <option value="beds-furniture">Artisan Bedding</option>
                  <option value="toys">Handmade Dog Toys</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe craftsmanship, materials, hardware..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-2.5"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#0E5E58] px-5 py-2 font-bold text-white hover:bg-[#0B4A45]"
                >
                  Publish to Marketplace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
