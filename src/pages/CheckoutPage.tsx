import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { usePets } from '../context/PetContext';
import { apiRequest } from '../services/api';
import { Order } from '../types';
import {
  ShieldCheck,
  CreditCard,
  Lock,
  Truck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ShoppingBag,
  Tag,
  MapPin,
} from 'lucide-react';

interface CheckoutPageProps {
  onNavigate: (route: string, params?: any) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onNavigate }) => {
  const { user, login } = useAuth();
  const { items, summary, refreshCart } = useCart();
  const { activePet } = usePets();

  // Multi-step
  const [step, setStep] = useState<'details' | 'confirmation'>('details');
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form Fields (clean blanks, no hardcoded autofill dummy data)
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [fullName, setFullName] = useState(user ? `${user.firstName} ${user.lastName}`.trim() : '');
  const [streetAddress, setStreetAddress] = useState('');
  const [apartment, setApartment] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('United States');

  // Shipping selection
  const [shippingMethod, setShippingMethod] = useState<'free' | 'standard' | 'express'>('free');

  // Credit Card details (First & Last Name, Number, Expiry, CVC)
  const [cardFirstName, setCardFirstName] = useState(user?.firstName || '');
  const [cardLastName, setCardLastName] = useState(user?.lastName || '');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  // Billing Address details inside Credit Card feature
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
  const [billingStreetAddress, setBillingStreetAddress] = useState('');
  const [billingApartment, setBillingApartment] = useState('');
  const [billingCity, setBillingCity] = useState('');
  const [billingState, setBillingState] = useState('');
  const [billingZipCode, setBillingZipCode] = useState('');
  const [billingCountry, setBillingCountry] = useState('United States');

  // Guest Account creation after order
  const [accountPassword, setAccountPassword] = useState('');
  const [accountCreated, setAccountCreated] = useState(false);

  if (items.length === 0 && step !== 'confirmation') {
    return (
      <div className="min-h-[60vh] bg-[#FAF9F6] py-16 text-center">
        <div className="max-w-md mx-auto px-4">
          <ShoppingBag size={32} className="mx-auto text-gray-400 mb-3" />
          <h2 className="font-serif-brand text-2xl font-bold text-[#1E232A]">Your Cart is Empty</h2>
          <p className="mt-1 text-xs text-gray-500">Add products to your cart before proceeding to checkout.</p>
          <button
            onClick={() => onNavigate('shop')}
            className="mt-6 rounded-xl bg-[#0E5E58] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#0B4A45]"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !fullName.trim() || !streetAddress.trim() || !city.trim() || !state.trim() || !zipCode.trim()) {
      alert('Please fill in all required shipping address fields.');
      return;
    }
    if (!cardFirstName.trim() || !cardLastName.trim()) {
      alert('Please enter the cardholder First Name and Last Name in the payment details.');
      return;
    }
    if (!cardNumber.trim() || !cardExpiry.trim() || !cardCvc.trim()) {
      alert('Please enter your credit card number, expiration date, and security CVC.');
      return;
    }
    if (!billingSameAsShipping) {
      if (!billingStreetAddress.trim() || !billingCity.trim() || !billingState.trim() || !billingZipCode.trim()) {
        alert('Please fill in all required billing address fields.');
        return;
      }
    }

    setIsProcessing(true);
    try {
      const cleanCardLast4 = cardNumber.replace(/\s+/g, '').slice(-4) || '4242';
      const cardholderFullName = `${cardFirstName.trim()} ${cardLastName.trim()}`;
      const selectedPaymentMethod = `Credit Card (ending in ${cleanCardLast4})`;

      const effectiveBillingAddress = billingSameAsShipping
        ? {
            fullName: cardholderFullName || fullName,
            streetAddress,
            apartment,
            city,
            state,
            zipCode,
            country,
            phone,
          }
        : {
            fullName: cardholderFullName,
            streetAddress: billingStreetAddress,
            apartment: billingApartment,
            city: billingCity,
            state: billingState,
            zipCode: billingZipCode,
            country: billingCountry,
            phone,
          };

      const payload = {
        guestEmail: email,
        customerEmail: email,
        email,
        customerName: fullName,
        customerPhone: phone,
        shippingAddress: {
          fullName,
          streetAddress,
          apartment,
          city,
          state,
          zipCode,
          country,
          phone,
        },
        billingAddress: effectiveBillingAddress,
        cardDetails: {
          firstName: cardFirstName.trim(),
          lastName: cardLastName.trim(),
          last4: cleanCardLast4,
          expiry: cardExpiry,
        },
        shippingMethod,
        paymentMethod: selectedPaymentMethod,
        petId: activePet?.id,
        petName: activePet?.name,
      };

      const data = await apiRequest<{ success: boolean; order: Order }>('/checkout/place-order', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setConfirmedOrder(data.order);
      setStep('confirmation');
      await refreshCart();
    } catch (err: any) {
      alert(err.message || 'Payment processing failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateAccountFromOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountPassword || accountPassword.length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }
    try {
      const parts = fullName.split(' ');
      await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password: accountPassword,
          firstName: parts[0] || 'Pet',
          lastName: parts.slice(1).join(' ') || 'Parent',
          phone,
        }),
      });
      setAccountCreated(true);
    } catch (err: any) {
      alert(err.message || 'Error creating account.');
    }
  };

  // Order Confirmation View
  if (step === 'confirmation' && confirmedOrder) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="rounded-3xl border border-[#E8E6DF] bg-white p-8 sm:p-12 shadow-xl text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#0E5E58] flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 size={36} />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0E5E58]">Order Placed Successfully</span>
              <h1 className="font-serif-brand text-3xl font-bold text-[#1E232A]">
                Thank you, {confirmedOrder.customerName}!
              </h1>
              <p className="text-xs text-[#525B67]">
                We’ve sent an order receipt and live package tracking link to <strong>{confirmedOrder.customerEmail}</strong>.
              </p>
            </div>

            <div className="rounded-2xl bg-[#FAF9F6] border border-gray-200 p-6 text-left space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-200 text-xs">
                <div>
                  <span className="text-gray-400 block">Order Number</span>
                  <strong className="text-[#1E232A] text-sm">{confirmedOrder.orderNumber}</strong>
                </div>
                <div>
                  <span className="text-gray-400 block">Estimated US Delivery</span>
                  <strong className="text-[#0E5E58] text-sm">In 2-3 Business Days</strong>
                </div>
                <div>
                  <span className="text-gray-400 block">Total Charged</span>
                  <strong className="text-[#1E232A] text-sm">${confirmedOrder.total.toFixed(2)}</strong>
                </div>
              </div>

              {/* Items in order */}
              <div className="space-y-3 pt-1">
                {confirmedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <img src={item.image} alt={item.title} className="w-12 h-12 rounded-lg object-cover bg-gray-100" />
                      <div>
                        <div className="font-bold text-gray-800 line-clamp-1">{item.title}</div>
                        <div className="text-gray-500">Qty: {item.quantity} • {item.ownerType === 'seller' ? 'Artisan Maker' : 'Hound & Harbor'}</div>
                      </div>
                    </div>
                    <span className="font-bold text-[#1E232A]">${item.total.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Shipping and Billing addresses */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-gray-200 text-xs">
                <div>
                  <span className="text-gray-400 block font-semibold mb-1">Shipping Address</span>
                  <div className="text-gray-800">
                    <p className="font-bold">{confirmedOrder.shippingAddress?.fullName || confirmedOrder.customerName}</p>
                    <p>{confirmedOrder.shippingAddress?.streetAddress} {confirmedOrder.shippingAddress?.apartment || ''}</p>
                    <p>{confirmedOrder.shippingAddress?.city}, {confirmedOrder.shippingAddress?.state} {confirmedOrder.shippingAddress?.zipCode}</p>
                  </div>
                </div>
                <div>
                  <span className="text-gray-400 block font-semibold mb-1">Cardholder &amp; Billing Address</span>
                  <div className="text-gray-800">
                    <p className="font-bold">{confirmedOrder.billingAddress?.fullName || confirmedOrder.customerName}</p>
                    <p>{confirmedOrder.billingAddress?.streetAddress || confirmedOrder.shippingAddress?.streetAddress} {confirmedOrder.billingAddress?.apartment || ''}</p>
                    <p>{confirmedOrder.billingAddress?.city || confirmedOrder.shippingAddress?.city}, {confirmedOrder.billingAddress?.state || confirmedOrder.shippingAddress?.state} {confirmedOrder.billingAddress?.zipCode || confirmedOrder.shippingAddress?.zipCode}</p>
                    <p className="text-[11px] text-[#0E5E58] font-bold mt-1">{confirmedOrder.paymentMethod}</p>
                  </div>
                </div>
              </div>
            </div>
            {!user && !accountCreated && (
              <div className="rounded-2xl bg-[#F4F8F7] border border-[#D4E8E4] p-6 text-left space-y-3">
                <h3 className="font-serif-brand text-lg font-bold text-[#1E232A]">
                  Save {activePet ? `${activePet.name}’s Profile` : 'Your Dog Profile'} &amp; Track This Order
                </h3>
                <p className="text-xs text-[#525B67]">
                  Create a password to unlock 1-click smart reordering, track this shipment in real-time, and earn 250 welcome Paw Loyalty Points.
                </p>
                <form onSubmit={handleCreateAccountFromOrder} className="flex gap-3 pt-1">
                  <input
                    type="password"
                    required
                    placeholder="Choose a password (min 6 chars)"
                    value={accountPassword}
                    onChange={(e) => setAccountPassword(e.target.value)}
                    className="flex-1 rounded-xl border border-gray-300 bg-white p-2.5 text-xs focus:border-[#0E5E58] focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-[#0E5E58] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#0B4A45]"
                  >
                    Save Account
                  </button>
                </form>
              </div>
            )}

            {accountCreated && (
              <div className="p-4 rounded-xl bg-emerald-50 text-[#0E5E58] text-xs font-bold text-center border border-emerald-200">
                ✓ Your account has been saved! You can now log in anytime to manage orders and subscriptions.
              </div>
            )}

            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <button
                onClick={() => onNavigate('track-order', { orderNumber: confirmedOrder.orderNumber })}
                className="rounded-xl bg-[#0E5E58] px-6 py-3 text-xs font-bold text-white shadow-sm hover:bg-[#0B4A45]"
              >
                Track Shipment Live
              </button>
              <button
                onClick={() => onNavigate('home')}
                className="rounded-xl border border-gray-300 px-6 py-3 text-xs font-bold text-gray-700 hover:bg-gray-50"
              >
                Return to Shop
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Active Checkout Form
  return (
    <div className="min-h-screen bg-[#FAF9F6] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 mb-2"
          >
            <ArrowLeft size={14} /> Continue Shopping
          </button>
          <h1 className="font-serif-brand text-3xl font-bold text-[#1E232A]">
            Express Checkout
          </h1>
          <p className="text-xs text-[#525B67] mt-0.5">
            Encrypted &amp; Secure. Guest checkout always welcome.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Checkout Steps Form */}
          <form onSubmit={handlePlaceOrder} className="lg:col-span-7 space-y-6">
            {/* Step 1: Customer Info */}
            <div className="rounded-2xl border border-[#E8E6DF] bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="font-serif-brand text-base font-bold text-[#1E232A]">
                  1. Contact Information
                </h3>
                {!user && (
                  <button
                    type="button"
                    onClick={() => onNavigate('login')}
                    className="text-xs font-semibold text-[#0E5E58] hover:underline"
                  >
                    Already have an account? Sign in
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 p-2.5 text-xs focus:border-[#0E5E58] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Phone Number for Delivery</label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 p-2.5 text-xs focus:border-[#0E5E58] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Shipping Address */}
            <div className="rounded-2xl border border-[#E8E6DF] bg-white p-6 shadow-xs space-y-4">
              <h3 className="font-serif-brand text-base font-bold text-[#1E232A] pb-3 border-b border-gray-100">
                2. Shipping Address
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Recipient name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 p-2.5 text-xs"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-gray-700 block mb-1">Street Address *</label>
                    <input
                      type="text"
                      required
                      placeholder="Street address or P.O. Box"
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 p-2.5 text-xs"
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Apt / Suite</label>
                    <input
                      type="text"
                      placeholder="Apt, suite, unit (optional)"
                      value={apartment}
                      onChange={(e) => setApartment(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 p-2.5 text-xs"
                      autoComplete="off"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">City *</label>
                    <input
                      type="text"
                      required
                      placeholder="City"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 p-2.5 text-xs"
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">State *</label>
                    <input
                      type="text"
                      required
                      placeholder="State (e.g. TX)"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 p-2.5 text-xs"
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">ZIP Code *</label>
                    <input
                      type="text"
                      required
                      placeholder="ZIP Code (e.g. 78701)"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 p-2.5 text-xs"
                      autoComplete="off"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Shipping Method */}
            <div className="rounded-2xl border border-[#E8E6DF] bg-white p-6 shadow-xs space-y-3">
              <h3 className="font-serif-brand text-base font-bold text-[#1E232A] pb-3 border-b border-gray-100">
                3. Shipping Delivery Method
              </h3>

              <div className="space-y-2">
                <label
                  className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer ${
                    shippingMethod === 'free' ? 'border-[#0E5E58] bg-[#F4F8F7]' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shippingMethod"
                      checked={shippingMethod === 'free'}
                      onChange={() => setShippingMethod('free')}
                      className="text-[#0E5E58]"
                    />
                    <div>
                      <div className="text-xs font-bold text-gray-800">Free US Ground Shipping (Orders $49+)</div>
                      <div className="text-[11px] text-gray-500">Delivered in 2-4 business days</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#0E5E58]">FREE</span>
                </label>

                <label
                  className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer ${
                    shippingMethod === 'express' ? 'border-[#0E5E58] bg-[#F4F8F7]' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shippingMethod"
                      checked={shippingMethod === 'express'}
                      onChange={() => setShippingMethod('express')}
                      className="text-[#0E5E58]"
                    />
                    <div>
                      <div className="text-xs font-bold text-gray-800">Expedited Priority Air</div>
                      <div className="text-[11px] text-gray-500">Guaranteed 1-2 business days</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-gray-800">$14.99</span>
                </label>
              </div>
            </div>

            {/* Step 4: Payment Information (Credit Card Only) */}
            <div className="rounded-2xl border border-[#E8E6DF] bg-white p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div>
                  <h3 className="font-serif-brand text-base font-bold text-[#1E232A]">
                    4. Payment Information
                  </h3>
                  <p className="text-[11px] text-gray-500 mt-0.5">Secure Credit or Debit Card Processing</p>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-semibold bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-200">
                  <Lock size={12} className="text-[#0E5E58]" /> 256-bit SSL Encrypted
                </div>
              </div>

              {/* Supported Card Networks */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#F4F8F7] border border-[#D4E8E4]">
                <div className="flex items-center gap-2">
                  <CreditCard size={18} className="text-[#0E5E58]" />
                  <span className="text-xs font-bold text-[#1E232A]">Credit / Debit Card</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-600">
                  <span className="px-1.5 py-0.5 bg-white border border-gray-200 rounded font-mono">VISA</span>
                  <span className="px-1.5 py-0.5 bg-white border border-gray-200 rounded font-mono">MC</span>
                  <span className="px-1.5 py-0.5 bg-white border border-gray-200 rounded font-mono">AMEX</span>
                  <span className="px-1.5 py-0.5 bg-white border border-gray-200 rounded font-mono">DISC</span>
                </div>
              </div>

              {/* Cardholder First & Last Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    First Name (on card) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah"
                    value={cardFirstName}
                    onChange={(e) => setCardFirstName(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 p-2.5 text-xs text-gray-900 focus:border-[#0E5E58] focus:outline-none"
                    autoComplete="cc-given-name"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Last Name (on card) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jenkins"
                    value={cardLastName}
                    onChange={(e) => setCardLastName(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 p-2.5 text-xs text-gray-900 focus:border-[#0E5E58] focus:outline-none"
                    autoComplete="cc-family-name"
                  />
                </div>
              </div>

              {/* Card Number */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Card Number *</label>
                <div className="relative">
                  <CreditCard size={16} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    required
                    maxLength={19}
                    placeholder="4000 1234 5678 9010"
                    value={cardNumber}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 16);
                      const formatted = val.replace(/(\d{4})/g, '$1 ').trim();
                      setCardNumber(formatted);
                    }}
                    className="w-full rounded-xl border border-gray-300 p-2.5 pl-9 text-xs font-mono text-gray-900 tracking-wider focus:border-[#0E5E58] focus:outline-none"
                    autoComplete="cc-number"
                  />
                </div>
              </div>

              {/* Expiry & CVC */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Expiration *</label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    placeholder="MM / YY"
                    value={cardExpiry}
                    onChange={(e) => {
                      let val = e.target.value.replace(/\D/g, '').slice(0, 4);
                      if (val.length >= 3) {
                        val = `${val.slice(0, 2)}/${val.slice(2)}`;
                      }
                      setCardExpiry(val);
                    }}
                    className="w-full rounded-xl border border-gray-300 p-2.5 text-xs font-mono text-gray-900 focus:border-[#0E5E58] focus:outline-none"
                    autoComplete="cc-exp"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Security CVC *</label>
                  <input
                    type="password"
                    required
                    maxLength={4}
                    placeholder="CVC / CVV"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    className="w-full rounded-xl border border-gray-300 p-2.5 text-xs font-mono text-gray-900 focus:border-[#0E5E58] focus:outline-none"
                    autoComplete="cc-csc"
                  />
                </div>
              </div>

              {/* Billing Address Subsection inside Credit Card */}
              <div className="pt-3 border-t border-gray-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
                    <MapPin size={14} className="text-[#0E5E58]" />
                    <span>Billing Address</span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-600 select-none">
                    <input
                      type="checkbox"
                      checked={billingSameAsShipping}
                      onChange={(e) => setBillingSameAsShipping(e.target.checked)}
                      className="rounded border-gray-300 text-[#0E5E58] focus:ring-[#0E5E58]"
                    />
                    <span>Same as shipping address</span>
                  </label>
                </div>

                {billingSameAsShipping ? (
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-600 flex items-start gap-2">
                    <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-800">Billing matches shipping address:</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {streetAddress ? `${streetAddress}, ${city}, ${state} ${zipCode}` : 'Using shipping address entered above'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 p-4 rounded-xl bg-[#FAF9F6] border border-gray-200">
                    <p className="text-[11px] text-gray-500 font-medium">
                      Enter the billing address registered with this credit or debit card.
                    </p>

                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">
                        Billing Street Address *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="123 Financial Way"
                        value={billingStreetAddress}
                        onChange={(e) => setBillingStreetAddress(e.target.value)}
                        className="w-full rounded-xl border border-gray-300 p-2.5 text-xs bg-white text-gray-900 focus:border-[#0E5E58] focus:outline-none"
                        autoComplete="billing street-address"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">
                        Apt / Suite / Floor (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="Suite 400"
                        value={billingApartment}
                        onChange={(e) => setBillingApartment(e.target.value)}
                        className="w-full rounded-xl border border-gray-300 p-2.5 text-xs bg-white text-gray-900 focus:border-[#0E5E58] focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">City *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Austin"
                          value={billingCity}
                          onChange={(e) => setBillingCity(e.target.value)}
                          className="w-full rounded-xl border border-gray-300 p-2.5 text-xs bg-white text-gray-900 focus:border-[#0E5E58] focus:outline-none"
                          autoComplete="billing address-level2"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">State / Province *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. TX"
                          value={billingState}
                          onChange={(e) => setBillingState(e.target.value)}
                          className="w-full rounded-xl border border-gray-300 p-2.5 text-xs bg-white text-gray-900 focus:border-[#0E5E58] focus:outline-none"
                          autoComplete="billing address-level1"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">Postal / ZIP Code *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 78701"
                          value={billingZipCode}
                          onChange={(e) => setBillingZipCode(e.target.value)}
                          className="w-full rounded-xl border border-gray-300 p-2.5 text-xs bg-white text-gray-900 focus:border-[#0E5E58] focus:outline-none"
                          autoComplete="billing postal-code"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">Country *</label>
                      <input
                        type="text"
                        required
                        value={billingCountry}
                        onChange={(e) => setBillingCountry(e.target.value)}
                        className="w-full rounded-xl border border-gray-300 p-2.5 text-xs bg-white text-gray-900 focus:border-[#0E5E58] focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button
              id="final-place-order-btn"
              type="submit"
              disabled={isProcessing}
              className="w-full rounded-2xl bg-[#0E5E58] py-4 text-sm font-bold text-white shadow-xl hover:bg-[#0B4A45] active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <span>{isProcessing ? 'Authorizing Payment...' : `Place Order ($${summary?.total.toFixed(2)})`}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Right Order Summary Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl border border-[#E8E6DF] bg-white p-6 shadow-xs space-y-4">
              <h3 className="font-serif-brand text-base font-bold text-[#1E232A] pb-3 border-b border-gray-100">
                Order Summary ({items.length} items)
              </h3>

              {/* Items List */}
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {items.map((item, idx) => (
                  <div key={idx} className="flex gap-3 text-xs">
                    <img src={item.image} alt={item.title} className="w-14 h-14 rounded-lg object-cover bg-gray-100 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-800 line-clamp-1">{item.title}</h4>
                      <div className="text-gray-500 text-[11px]">Qty: {item.quantity}</div>
                      {item.isSubscription && (
                        <span className="text-[10px] text-[#0E5E58] font-bold">
                          Autoship ({item.subscriptionFrequency})
                        </span>
                      )}
                    </div>
                    <span className="font-bold text-[#1E232A]">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Financial Totals */}
              {summary && (
                <div className="pt-4 border-t border-gray-100 space-y-2 text-xs text-[#525B67]">
                  <div className="flex justify-between">
                    <span>Items Subtotal</span>
                    <span className="font-semibold text-[#1E232A]">${summary.subtotal.toFixed(2)}</span>
                  </div>
                  {summary.discount > 0 && (
                    <div className="flex justify-between text-[#0E5E58]">
                      <span>Promotion ({summary.appliedCouponCode})</span>
                      <span>-${summary.discount.toFixed(2)}</span>
                    </div>
                  )}
                  {summary.giftCardDeduction > 0 && (
                    <div className="flex justify-between text-[#0E5E58]">
                      <span>Gift Card ({summary.appliedGiftCardCode})</span>
                      <span>-${summary.giftCardDeduction.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{shippingMethod === 'express' ? '$14.99' : 'FREE'}</span>
                  </div>
                  <div className="pt-3 border-t border-gray-100 flex justify-between text-base font-bold text-[#1E232A]">
                    <span>Total Amount</span>
                    <span className="text-[#0E5E58]">${(summary.total + (shippingMethod === 'express' ? 14.99 : 0)).toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Canine Tail-Wag Guarantee Note */}
            <div className="rounded-2xl bg-[#FAF9F6] border border-[#E8E6DF] p-4 text-xs text-[#525B67] space-y-2">
              <div className="flex items-center gap-2 font-bold text-[#0E5E58]">
                <ShieldCheck size={16} />
                <span>Hound &amp; Harbor 30-Day Guarantee</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                If your dog doesn’t take to their new food formula or equipment, we’ll gladly process a free exchange or refund within 30 days.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
