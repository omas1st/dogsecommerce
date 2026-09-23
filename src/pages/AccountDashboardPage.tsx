import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePets } from '../context/PetContext';
import { apiRequest } from '../services/api';
import { Order, Subscription } from '../types';
import {
  Package,
  Repeat,
  Award,
  LifeBuoy,
  Plus,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Clock,
  CheckCircle2,
  Calendar,
  SlidersHorizontal,
  ShieldCheck,
} from 'lucide-react';

interface AccountDashboardPageProps {
  initialTab?: 'orders' | 'subscriptions' | 'rewards' | 'support';
  onNavigate: (route: string, params?: any) => void;
}

export const AccountDashboardPage: React.FC<AccountDashboardPageProps> = ({ initialTab = 'orders', onNavigate }) => {
  const { user, logout } = useAuth();
  const { pets } = usePets();

  const [activeTab, setActiveTab] = useState<'orders' | 'subscriptions' | 'rewards' | 'support'>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [rewards, setRewards] = useState<any>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New Support Ticket modal
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketCategory, setTicketCategory] = useState('order_issue');

  useEffect(() => {
    async function loadAccountData() {
      if (!user) return;
      setIsLoading(true);
      try {
        const [ordData, subData, rewData, tckData] = await Promise.all([
          apiRequest<{ success: boolean; orders: Order[] }>('/orders/my-orders'),
          apiRequest<{ success: boolean; subscriptions: Subscription[] }>('/subscriptions/my-subscriptions'),
          apiRequest<{ success: boolean; profile: any }>('/loyalty/profile'),
          apiRequest<{ success: boolean; tickets: any[] }>('/support/tickets'),
        ]);

        setOrders(ordData.orders || []);
        setSubscriptions(subData.subscriptions || []);
        setRewards(rewData.profile || null);
        setTickets(tckData.tickets || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadAccountData();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-[60vh] bg-[#FAF9F6] py-16 text-center">
        <div className="max-w-md mx-auto px-4 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">
            <span>Customer Portal</span>
          </div>
          <h2 className="font-serif-brand text-2xl sm:text-3xl font-bold text-[#1E232A]">Sign In Required</h2>
          <p className="text-xs text-[#525B67]">Please sign in to view your orders, canine profiles, and autoship subscriptions.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('login')}
              className="w-full sm:w-auto rounded-xl bg-[#0E5E58] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#0B4A45]"
            >
              Sign In to Account
            </button>
            <button
              onClick={() => onNavigate('home')}
              className="w-full sm:w-auto rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              ← Back to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleUpdateSubStatus = async (subId: string, newStatus: 'active' | 'paused' | 'cancelled') => {
    try {
      await apiRequest(`/subscriptions/${subId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      // reload subscriptions
      const subData = await apiRequest<{ success: boolean; subscriptions: Subscription[] }>(
        '/subscriptions/my-subscriptions'
      );
      setSubscriptions(subData.subscriptions || []);
    } catch (err: any) {
      alert(err.message || 'Failed to update subscription.');
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) return;

    try {
      await apiRequest('/support/tickets', {
        method: 'POST',
        body: JSON.stringify({
          subject: ticketSubject,
          message: ticketMessage,
          category: ticketCategory,
        }),
      });
      setShowTicketModal(false);
      setTicketSubject('');
      setTicketMessage('');
      const tckData = await apiRequest<{ success: boolean; tickets: any[] }>('/support/tickets');
      setTickets(tckData.tickets || []);
      alert('Support ticket opened! Our canine concierge team will respond promptly.');
    } catch (err: any) {
      alert(err.message || 'Error submitting ticket.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Profile Card Header */}
        <div className="rounded-2xl border border-[#E8E6DF] bg-white p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#E8F3F1] text-[#0E5E58] flex items-center justify-center font-bold text-xl">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div>
              <h1 className="font-serif-brand text-2xl font-bold text-[#1E232A]">
                Welcome back, {user.firstName} {user.lastName}
              </h1>
              <div className="text-xs text-[#525B67] mt-0.5 flex items-center gap-3">
                <span>{user.email}</span>
                <span>•</span>
                <span>Role: <strong className="capitalize text-gray-800">{user.role}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[#F4F8F7] border border-[#D4E8E4] px-4 py-2 text-center">
              <span className="text-[10px] uppercase font-bold text-[#0E5E58] block">Paw Loyalty Points</span>
              <strong className="text-lg font-bold text-[#1E232A]">{user.loyaltyPoints || 450} pts</strong>
            </div>
            <button
              onClick={() => logout()}
              className="rounded-xl border border-gray-300 px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Super Admin Operations & Platform Controls Panel */}
        {(user.role === 'admin' || user.role === 'super_admin') && (
          <div className="rounded-2xl border border-amber-300 bg-linear-to-r from-amber-50 via-orange-50 to-amber-50 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[11px] font-bold">
                <ShieldCheck size={13} className="text-amber-800" />
                <span>Super Admin Privileges Active</span>
              </div>
              <h2 className="font-serif-brand text-lg font-bold text-gray-900">
                Admin Operations &amp; Management Dashboard
              </h2>
              <p className="text-xs text-gray-600 max-w-xl leading-relaxed">
                You are authenticated with administrative privileges. Manage orders, products, sellers, promotions, and platform metrics from the Admin Operations command center.
              </p>
            </div>
            <button
              onClick={() => onNavigate('admin')}
              className="rounded-xl bg-amber-700 hover:bg-amber-800 text-white px-5 py-3 text-xs font-bold shadow-md transition-all flex items-center gap-2 shrink-0 cursor-pointer active:scale-95"
            >
              <SlidersHorizontal size={15} />
              <span>Launch Admin Operations</span>
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 gap-4 text-xs font-bold overflow-x-auto">
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 px-2 flex items-center gap-2 transition-colors ${
              activeTab === 'orders' ? 'border-b-2 border-[#0E5E58] text-[#0E5E58]' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Package size={16} />
            <span>Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`pb-3 px-2 flex items-center gap-2 transition-colors ${
              activeTab === 'subscriptions' ? 'border-b-2 border-[#0E5E58] text-[#0E5E58]' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Repeat size={16} />
            <span>Autoship Subscriptions ({subscriptions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('rewards')}
            className={`pb-3 px-2 flex items-center gap-2 transition-colors ${
              activeTab === 'rewards' ? 'border-b-2 border-[#0E5E58] text-[#0E5E58]' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Award size={16} />
            <span>Rewards &amp; Tier</span>
          </button>

          <button
            onClick={() => setActiveTab('support')}
            className={`pb-3 px-2 flex items-center gap-2 transition-colors ${
              activeTab === 'support' ? 'border-b-2 border-[#0E5E58] text-[#0E5E58]' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <LifeBuoy size={16} />
            <span>Concierge Support ({tickets.length})</span>
          </button>

          {(user.role === 'admin' || user.role === 'super_admin') && (
            <button
              onClick={() => onNavigate('admin')}
              className="pb-3 px-2 flex items-center gap-2 transition-colors text-amber-700 hover:text-amber-900 border-b-2 border-transparent hover:border-amber-600 ml-auto shrink-0"
            >
              <SlidersHorizontal size={15} />
              <span>Admin Operations →</span>
            </button>
          )}
        </div>

        {/* Tab: Orders */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center text-xs text-gray-500">
                You haven’t placed any orders yet. Treat your dog today!
              </div>
            ) : (
              orders.filter((order) => order && order.id).map((order) => (
                <div key={order.id} className="rounded-2xl border border-[#E8E6DF] bg-white p-6 shadow-xs space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-100 text-xs">
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase">Order Number</span>
                      <strong className="text-gray-800 text-sm font-mono">{order.orderNumber}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase">Date Placed</span>
                      <span className="text-gray-700">{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase">Total</span>
                      <span className="text-gray-900 font-bold">${order.total.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase">Fulfillment</span>
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        order.orderStatus === 'delivered' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'
                      }`}>
                        {order.orderStatus}
                      </span>
                    </div>

                    <button
                      onClick={() => onNavigate('track-order', { orderNumber: order.orderNumber })}
                      className="rounded-xl bg-[#0E5E58] px-4 py-2 text-xs font-bold text-white hover:bg-[#0B4A45] flex items-center gap-1.5"
                    >
                      <span>Track Shipment</span>
                      <ExternalLink size={13} />
                    </button>
                  </div>

                  <div className="space-y-2">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <img src={item.image} alt="" className="w-12 h-12 rounded-lg object-cover bg-gray-100" />
                          <div>
                            <div className="font-bold text-gray-800">{item.title}</div>
                            <div className="text-gray-500">Qty: {item.quantity} • ${item.price.toFixed(2)} ea</div>
                          </div>
                        </div>
                        <span className="font-bold text-gray-800">${item.total.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab: Subscriptions */}
        {activeTab === 'subscriptions' && (
          <div className="space-y-4">
            {subscriptions.length === 0 ? (
              <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center text-xs text-gray-500">
                No active autoship subscriptions. Save 10% on every order by enabling autoship on eligible food and treats!
              </div>
            ) : (
              subscriptions.filter((sub) => sub && sub.id).map((sub) => (
                <div key={sub.id} className="rounded-2xl border border-[#E8E6DF] bg-white p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        sub.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {sub.status}
                      </span>
                      <span className="text-xs font-bold text-[#0E5E58]">Autoship ({sub.frequency})</span>
                    </div>
                    <h3 className="font-serif-brand text-lg font-bold text-[#1E232A]">
                      {sub.productTitle}
                    </h3>
                    <div className="text-xs text-gray-500 flex items-center gap-3">
                      <span>Price: <strong>${(sub.price || sub.totalPerDelivery || 0).toFixed(2)}</strong></span>
                      <span>•</span>
                      <span>Next Shipment: <strong>{new Date(sub.nextShipmentDate || sub.nextDeliveryDate || Date.now()).toLocaleDateString()}</strong></span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs">
                    {sub.status === 'active' ? (
                      <>
                        <button
                          onClick={() => handleUpdateSubStatus(sub.id, 'paused')}
                          className="rounded-xl border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50"
                        >
                          Pause Autoship
                        </button>
                        <button
                          onClick={() => handleUpdateSubStatus(sub.id, 'cancelled')}
                          className="rounded-xl border border-red-200 px-4 py-2 font-semibold text-red-600 hover:bg-red-50"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleUpdateSubStatus(sub.id, 'active')}
                        className="rounded-xl bg-[#0E5E58] px-4 py-2 font-bold text-white hover:bg-[#0B4A45]"
                      >
                        Resume Autoship
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab: Rewards */}
        {activeTab === 'rewards' && (
          <div className="rounded-2xl border border-[#E8E6DF] bg-white p-6 sm:p-8 shadow-xs space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl bg-[#F4F8F7] border border-[#D4E8E4] p-5 space-y-1">
                <span className="text-[11px] font-bold text-[#0E5E58] uppercase">Current Balance</span>
                <div className="text-3xl font-bold text-[#1E232A]">{rewards?.points || 450} Points</div>
                <p className="text-[11px] text-gray-500">Worth $4.50 towards any future order</p>
              </div>

              <div className="rounded-xl bg-[#FAF9F6] border border-gray-200 p-5 space-y-1">
                <span className="text-[11px] font-bold text-gray-500 uppercase">Loyalty Tier</span>
                <div className="text-3xl font-bold text-amber-700 capitalize">{rewards?.tier || 'Silver Pack'}</div>
                <p className="text-[11px] text-gray-500">1.25x points on all subscription orders</p>
              </div>

              <div className="rounded-xl bg-[#FAF9F6] border border-gray-200 p-5 space-y-1">
                <span className="text-[11px] font-bold text-gray-500 uppercase">Lifetime Earned</span>
                <div className="text-3xl font-bold text-gray-800">{rewards?.lifetimePoints || 1250} Pts</div>
                <p className="text-[11px] text-gray-500">Thank you for being part of Hound &amp; Harbor</p>
              </div>
            </div>

            <div>
              <h3 className="font-serif-brand text-lg font-bold text-[#1E232A] mb-3">
                How to Earn Paw Points
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-[#525B67]">
                <div className="p-3 rounded-lg border border-gray-100 bg-[#FAF9F6]">
                  <strong className="text-gray-800 block mb-0.5">1 Point per $1 Spent</strong>
                  Earn on every purchase, including marketplace gear.
                </div>
                <div className="p-3 rounded-lg border border-gray-100 bg-[#FAF9F6]">
                  <strong className="text-gray-800 block mb-0.5">250 Pts for Pet Profile</strong>
                  Create a tailored profile for your dog.
                </div>
                <div className="p-3 rounded-lg border border-gray-100 bg-[#FAF9F6]">
                  <strong className="text-gray-800 block mb-0.5">100 Pts for Verified Reviews</strong>
                  Share honest feedback with other dog parents.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Support Concierge */}
        {activeTab === 'support' && (
          <div className="rounded-2xl border border-[#E8E6DF] bg-white p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <h3 className="font-serif-brand text-lg font-bold text-[#1E232A]">
                  Canine Concierge Support
                </h3>
                <p className="text-xs text-gray-500">
                  Have a question about food ingredients, shipping, or returns? We’re here to help.
                </p>
              </div>
              <button
                onClick={() => setShowTicketModal(true)}
                className="rounded-xl bg-[#0E5E58] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#0B4A45] flex items-center gap-1.5"
              >
                <Plus size={14} /> Open Concierge Ticket
              </button>
            </div>

            <div className="space-y-3">
              {tickets.length === 0 ? (
                <div className="py-6 text-center text-xs text-gray-500">
                  No active support tickets. All systems operational!
                </div>
              ) : (
                tickets.filter((t) => t && t.id).map((t) => (
                  <div key={t.id} className="p-4 rounded-xl border border-gray-100 bg-[#FAF9F6] text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <strong className="text-gray-800">{t.subject}</strong>
                      <span className="rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5 font-bold uppercase text-[10px]">
                        {t.status}
                      </span>
                    </div>
                    <p className="text-gray-600">{t.message}</p>
                    <div className="text-[10px] text-gray-400 pt-1">Opened on {new Date(t.createdAt).toLocaleDateString()}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Ticket Modal */}
      {showTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-gray-200">
            <h3 className="font-serif-brand text-xl font-bold text-[#1E232A]">
              Open Concierge Ticket
            </h3>
            <form onSubmit={handleCreateTicket} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Question regarding puppy feeding schedule transition"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-2.5"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Topic</label>
                <select
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-2.5 bg-white"
                >
                  <option value="order_issue">Order / Shipping Inquiry</option>
                  <option value="diet_advice">Nutritional Consultation</option>
                  <option value="returns">Exchange or 30-Day Guarantee</option>
                  <option value="seller_question">Artisan Marketplace Question</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Message</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe your inquiry in detail..."
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-2.5"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTicketModal(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#0E5E58] px-5 py-2 font-bold text-white hover:bg-[#0B4A45]"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
