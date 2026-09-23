import React, { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';
import { Order } from '../types';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  ArrowLeft,
  ShieldCheck,
  Search,
} from 'lucide-react';

interface TrackOrderPageProps {
  initialOrderNumber?: string;
  onNavigate: (route: string, params?: any) => void;
}

export const TrackOrderPage: React.FC<TrackOrderPageProps> = ({
  initialOrderNumber,
  onNavigate,
}) => {
  const [orderNumberInput, setOrderNumberInput] = useState(initialOrderNumber || '');
  const [order, setOrder] = useState<Order | null>(null);
  const [trackingEvents, setTrackingEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchTracking = async (numberToSearch: string) => {
    if (!numberToSearch.trim()) return;
    setIsLoading(true);
    setErrorMessage('');
    try {
      const data = await apiRequest<{
        success: boolean;
        order: Order;
        events: any[];
      }>(`/orders/track/${encodeURIComponent(numberToSearch.trim())}`);
      setOrder(data.order);
      setTrackingEvents(data.events || data.order?.timeline || []);
    } catch (err: any) {
      setErrorMessage(err.message || 'Order not found. Please check your order number.');
      setOrder(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrderNumber) {
      setOrderNumberInput(initialOrderNumber);
      fetchTracking(initialOrderNumber);
    }
  }, [initialOrderNumber]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTracking(orderNumberInput);
  };

  // Timeline steps
  const steps = [
    { key: 'placed', label: 'Order Confirmed', icon: Clock },
    { key: 'packed', label: 'Inspected & Packed', icon: Package },
    { key: 'shipped', label: 'In Transit with UPS', icon: Truck },
    { key: 'delivered', label: 'Delivered to Doorstep', icon: CheckCircle2 },
  ];

  const currentStepIdx = !order
    ? 0
    : order.orderStatus === 'delivered'
    ? 3
    : order.orderStatus === 'shipped'
    ? 2
    : order.orderStatus === 'confirmed'
    ? 1
    : 0;

  return (
    <div className="min-h-screen bg-[#FAF9F6] py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft size={14} /> Back to Shop
        </button>

        {/* Search Bar */}
        <div className="rounded-2xl border border-[#E8E6DF] bg-white p-6 sm:p-8 shadow-xs space-y-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#0E5E58]">
              Hound &amp; Harbor Real-Time Tracking
            </span>
            <h1 className="font-serif-brand text-2xl sm:text-3xl font-bold text-[#1E232A] mt-1">
              Track Your Canine Essentials Shipment
            </h1>
          </div>

          <form onSubmit={handleSearch} className="flex gap-3 pt-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={orderNumberInput}
                onChange={(e) => setOrderNumberInput(e.target.value)}
                placeholder="Enter Order Number (e.g. HND-2026-948123)"
                className="w-full rounded-xl border border-gray-300 p-2.5 pl-9 text-xs font-mono uppercase focus:border-[#0E5E58] focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-xl bg-[#0E5E58] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#0B4A45] shadow-xs"
            >
              {isLoading ? 'Locating...' : 'Track Package'}
            </button>
          </form>

          {errorMessage && (
            <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs font-medium">
              {errorMessage}
            </div>
          )}
        </div>

        {/* Empty State when no order tracked yet */}
        {!order && !isLoading && (
          <div className="rounded-2xl border border-dashed border-[#D4D2C9] bg-white p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#F4F8F7] text-[#0E5E58] flex items-center justify-center mx-auto">
              <Package size={24} />
            </div>
            <h3 className="font-serif-brand text-lg font-bold text-[#1E232A]">
              Ready to Track Your Order
            </h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
              Enter your order reference number above (found in your confirmation email, SMS receipt, or account order history) to view parcel status, carrier tracking, and estimated delivery dates.
            </p>
          </div>
        )}

        {/* Tracking Details */}
        {order && (
          <div className="space-y-6">
            {/* Visual Milestones Tracker */}
            <div className="rounded-2xl border border-[#E8E6DF] bg-white p-6 sm:p-8 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-gray-100">
                <div>
                  <span className="text-xs text-gray-500">Carrier &amp; Method:</span>
                  <div className="text-sm font-bold text-gray-900">
                    {order.carrier || 'UPS Ground'} • Tracking #{' '}
                    <span className="font-mono text-[#0E5E58]">
                      {order.trackingNumber || '1Z9999999999999999'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-500">Estimated Delivery:</span>
                  <div className="text-sm font-bold text-emerald-700">In 1-2 Business Days</div>
                </div>
              </div>

              {/* Steps Progress Bar */}
              <div className="pt-8 pb-4">
                <div className="grid grid-cols-4 relative">
                  {/* Connecting Line */}
                  <div className="absolute top-5 left-8 right-8 h-1 bg-gray-200 -z-0">
                    <div
                      className="h-full bg-[#0E5E58] transition-all duration-500"
                      style={{ width: `${(currentStepIdx / 3) * 100}%` }}
                    />
                  </div>

                  {steps.map((step, idx) => {
                    const Icon = step.icon;
                    const isDone = idx <= currentStepIdx;
                    return (
                      <div key={step.key} className="flex flex-col items-center text-center relative z-10">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                            isDone
                              ? 'border-[#0E5E58] bg-[#0E5E58] text-white shadow-sm'
                              : 'border-gray-300 bg-white text-gray-400'
                          }`}
                        >
                          <Icon size={18} />
                        </div>
                        <span className={`text-xs mt-2 font-semibold ${isDone ? 'text-gray-900' : 'text-gray-400'}`}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Carrier Transit Log */}
            <div className="rounded-2xl border border-[#E8E6DF] bg-white p-6 shadow-xs space-y-4">
              <h3 className="font-serif-brand text-lg font-bold text-[#1E232A]">
                Carrier Activity History
              </h3>

              <div className="space-y-4 border-l-2 border-[#0E5E58]/30 ml-4 pl-4 text-xs">
                {trackingEvents.length > 0 ? (
                  trackingEvents.map((event, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-[#0E5E58] border-2 border-white" />
                      <div className="font-bold text-gray-800">{event.status}</div>
                      <div className="text-gray-500">{event.location} • {event.timestamp}</div>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="relative">
                      <div className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-[#0E5E58] border-2 border-white" />
                      <div className="font-bold text-gray-800">Package scanned at carrier regional sorting hub</div>
                      <div className="text-gray-500">Austin Hub, TX • Today, 08:30 AM</div>
                    </div>
                    <div className="relative">
                      <div className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-gray-300 border-2 border-white" />
                      <div className="font-bold text-gray-800">Shipment dispatched from Hound &amp; Harbor fulfillment facility</div>
                      <div className="text-gray-500">Central Warehouse • Yesterday, 04:15 PM</div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Destination Address & Items Card */}
            <div className="rounded-2xl border border-[#E8E6DF] bg-white p-6 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
              <div>
                <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-1.5">
                  <MapPin size={14} className="text-[#0E5E58]" /> Destination Address
                </h4>
                <div className="text-gray-600 space-y-0.5">
                  <div className="font-bold text-gray-800">{order.shippingAddress.fullName}</div>
                  <div>{order.shippingAddress.streetAddress} {order.shippingAddress.apartment}</div>
                  <div>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-1.5">
                  <Package size={14} className="text-[#0E5E58]" /> Order Items ({order.items.length})
                </h4>
                <div className="space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-gray-600">
                      <span className="line-clamp-1">{item.title} (x{item.quantity})</span>
                      <strong className="text-gray-800 shrink-0 ml-2">${item.total.toFixed(2)}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
