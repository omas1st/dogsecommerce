export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'customer' | 'seller' | 'admin' | 'super_admin';
  isEmailVerified: boolean;
  rewardPoints: number;
  loyaltyPoints?: number;
  rewardTier?: string;
  totalSpent: number;
  ordersCount: number;
  status: 'active' | 'suspended';
  referralCode: string;
  addresses?: ShippingAddress[];
}

export interface ShippingAddress {
  id?: string;
  isDefault?: boolean;
  fullName: string;
  streetAddress: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
}

export interface Pet {
  id: string;
  userId: string;
  name: string;
  type: 'dog' | 'cat' | 'other';
  breed: string;
  gender: 'male' | 'female';
  isNeuteredOrSpayed?: boolean;
  birthDate?: string;
  ageYears: number;
  ageMonths: number;
  weightLbs: number;
  size: 'toy' | 'small' | 'medium' | 'large' | 'giant';
  activityLevel: 'low' | 'moderate' | 'high' | 'athletic' | 'working' | string;
  dietType?: string;
  allergies: string[];
  foodPreferences: string[];
  specialNeeds?: string;
  photoUrl?: string;
  notes?: string;
  createdAt?: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  attributes: Record<string, string>;
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  description: string;
  shortDescription?: string;
  price: number;
  compareAtPrice?: number;
  sku: string;
  images: string[];
  category: string;
  categoryName?: string;
  brand: string;
  ownerType: 'platform' | 'seller' | 'resale_platform';
  sellerId?: string;
  sellerName?: string;
  condition: 'new' | 'like_new' | 'good' | 'fair';
  variants: ProductVariant[];
  stock: number;
  rating: number;
  reviewsCount: number;
  tags: string[];
  ingredients?: string[];
  specifications?: Record<string, string>;
  isSubscriptionEligible: boolean;
  subscriptionDiscountPercentage?: number;
  isPublished: boolean;
  featured?: boolean;
  bestSeller?: boolean;
  suitability: {
    petTypes: string[];
    lifeStages: ('puppy' | 'adult' | 'senior' | 'all_stages')[];
    sizes: ('toy' | 'small' | 'medium' | 'large' | 'giant' | 'all_sizes')[];
    breedRecommendations?: string[];
    allergenFree?: string[];
    healthFocus?: string[];
  };
}

export interface CartItem {
  productId: string;
  variantId?: string;
  title: string;
  slug: string;
  image: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  sellerId?: string;
  sellerName?: string;
  ownerType: 'platform' | 'seller' | 'resale_platform';
  isSubscription?: boolean;
  subscriptionFrequency?: string;
  savedForLater?: boolean;
}

export interface CartSummary {
  subtotal: number;
  discount: number;
  appliedCouponCode?: string;
  appliedGiftCardCode?: string;
  giftCardDeduction: number;
  shippingCost: number;
  shippingOptions: { id: string; name: string; description: string; price: number; estimatedDeliveryDays: string }[];
  taxAmount: number;
  taxRate: number;
  total: number;
  itemsCount: number;
}

export interface OrderItem {
  productId: string;
  variantId?: string;
  title: string;
  sku: string;
  image: string;
  price: number;
  quantity: number;
  total: number;
  sellerId?: string;
  sellerName?: string;
  ownerType: string;
  trackingNumber?: string;
  carrier?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  isGuest: boolean;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress: ShippingAddress;
  billingAddress?: ShippingAddress;
  shippingMethod: string;
  items: OrderItem[];
  subtotal: number;
  discountTotal: number;
  couponCode?: string;
  giftCardCode?: string;
  giftCardAmount?: number;
  shippingCost: number;
  taxAmount: number;
  taxRate: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  carrier?: string;
  trackingNumber?: string;
  timeline: { status: string; timestamp: string; note: string }[];
  petId?: string;
  petName?: string;
  notes?: string;
  createdAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  petId?: string;
  petName?: string;
  productId: string;
  productTitle: string;
  productImage: string;
  quantity: number;
  pricePerUnit: number;
  discountPercentage: number;
  totalPerDelivery: number;
  price?: number;
  frequency: string;
  status: 'active' | 'paused' | 'cancelled';
  nextBillingDate: string;
  nextDeliveryDate: string;
  nextShipmentDate?: string;
  shippingAddress: ShippingAddress;
  paymentMethodLast4: string;
}

export interface Seller {
  id: string;
  userId: string;
  storeName: string;
  slug: string;
  description: string;
  contactEmail: string;
  phone: string;
  businessAddress: string;
  businessType: string;
  status: string;
  commissionRate: number;
  rating: number;
  totalSales: number;
  totalRevenue: number;
  pendingPayout: number;
  availablePayout: number;
  paidPayoutTotal: number;
  bankAccountLast4?: string;
}

export interface ResaleListing {
  id: string;
  sellerId: string;
  sellerName: string;
  title: string;
  category: string;
  brand: string;
  condition: 'new' | 'like_new' | 'good' | 'fair';
  conditionDescription: string;
  askingPrice: number;
  originalRetailPrice?: number;
  images: string[];
  dimensions?: string;
  status: 'active' | 'sold';
  isPlatformOwned: boolean;
}

export interface BuybackOffer {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerEmail: string;
  itemTitle: string;
  itemCategory: string;
  itemBrand: string;
  condition: string;
  itemConditionNotes: string;
  itemPhotos: string[];
  askingPrice: number;
  platformOfferAmount: number;
  estimatedResalePrice: number;
  status: string;
  inspectionNotes?: string;
  timeline: { status: string; timestamp: string; note: string }[];
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  petContext?: { petName: string; breed: string; age: string };
  rating: number;
  title: string;
  content: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
}

export interface GiftCard {
  id: string;
  code: string;
  initialAmount: number;
  currentBalance: number;
  recipientEmail: string;
  recipientName: string;
  senderName: string;
  message?: string;
  status: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
  minOrderAmount?: number;
  isActive: boolean;
  description: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  customerEmail: string;
  customerName: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  messages: { sender: string; senderName: string; content: string; timestamp: string }[];
  createdAt: string;
}

export interface MarketplaceDog {
  id: string;
  name: string;
  breed: string;
  size: 'toy' | 'small' | 'medium' | 'large' | 'giant';
  weightLbs: number;
  price: number;
  comparePrice?: number;
  partnerSource: 'Chewy Partner Network' | 'Petco Love Partner' | 'Chewy Certified Breeder' | 'Chewy Verified Breeder' | 'Petco Certified Haven' | 'Petco Adoption Network' | 'Hound & Harbor Reserve' | string;
  ageYears: number;
  ageMonths: number;
  gender: 'male' | 'female';
  isNeuteredOrSpayed: boolean;
  isVaccinated: boolean;
  isMicrochipped: boolean;
  energyLevel: 'calm' | 'moderate' | 'playful' | 'athletic' | 'working';
  photoUrl: string;
  location: string;
  chewyPetcoBundle: string;
  temperament: string[];
  description: string;
  healthGuarantee: string;
}

