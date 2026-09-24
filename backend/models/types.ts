import {
  UserRole,
  OrderStatus,
  PaymentStatus,
  ProductOwnerType,
  FulfillmentType,
  ProductCondition,
  BuybackStatus,
  SellerStatus,
  SubscriptionFrequency,
  SubscriptionStatus,
} from '../config/constants';

export interface IUser {
  id: string;
  email: string;
  passwordHash?: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  isEmailVerified: boolean;
  addresses?: IShippingAddress[];
  savedPaymentMethods?: ISavedPaymentMethod[];
  guestSessionId?: string;
  rewardPoints: number;
  totalSpent: number;
  ordersCount: number;
  status: 'active' | 'suspended';
  referralCode: string;
  referredBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IShippingAddress {
  id: string;
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

export interface ISavedPaymentMethod {
  id: string;
  brand: string; // 'visa', 'mastercard', 'amex'
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault?: boolean;
}

export interface IPet {
  id: string;
  userId: string;
  name: string;
  type: 'dog' | 'cat' | 'other' | string;
  breed: string;
  gender: 'male' | 'female';
  isNeuteredOrSpayed?: boolean;
  birthDate?: string;
  ageYears: number;
  ageMonths: number;
  weightLbs: number;
  size: 'toy' | 'small' | 'medium' | 'large' | 'giant';
  activityLevel: 'low' | 'moderate' | 'high' | 'athletic' | 'working' | string;
  dietType?: 'dry_kibble' | 'wet_food' | 'raw' | 'freeze_dried' | 'fresh_cooked' | 'prescription' | 'raw_fresh' | 'wet_canned' | string;
  allergies: string[];
  foodPreferences: string[];
  specialNeeds?: string;
  photoUrl?: string;
  notes?: string;
  favoriteProductIds?: string[];
  lastPurchasedDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IProductVariant {
  id: string;
  name: string; // e.g. "Small (6-20 lbs)", "Large 30lb Bag"
  sku: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  attributes: Record<string, string>;
}

export interface IProduct {
  id: string;
  slug: string;
  title: string;
  description: string;
  shortDescription?: string;
  price: number;
  compareAtPrice?: number;
  sku: string;
  barcode?: string;
  images: string[];
  category: string; // e.g. 'dog-food', 'dog-treats', 'toys', 'beds-furniture', 'crates-travel', 'health-supplements', 'grooming', 'collars-leashes'
  categoryName?: string;
  brand: string;
  brandId?: string;
  ownerType: ProductOwnerType;
  sellerId?: string;
  sellerName?: string;
  condition: ProductCondition; // new, like_new, good, fair
  variants: IProductVariant[];
  stock: number;
  rating: number;
  reviewsCount: number;
  tags: string[];
  ingredients?: string[];
  nutritionalAnalysis?: Record<string, string>;
  specifications?: Record<string, string>;
  isSubscriptionEligible: boolean;
  subscriptionDiscountPercentage?: number;
  isMarketplaceEligible?: boolean;
  isPublished: boolean;
  // Pet Suitability Metadata
  suitability: {
    petTypes: string[]; // ['dog']
    lifeStages: ('puppy' | 'adult' | 'senior' | 'all_stages')[];
    sizes: ('toy' | 'small' | 'medium' | 'large' | 'giant' | 'all_sizes')[];
    breedRecommendations?: string[];
    allergenFree?: string[]; // ['grain-free', 'chicken-free', 'soy-free']
    healthFocus?: string[]; // ['joint-health', 'skin-coat', 'digestive-care', 'weight-management', 'dental-care']
  };
  featured?: boolean;
  bestSeller?: boolean;
  recentlyAdminEditedAt?: number;
  isRecentlyUpdated?: boolean;
  isNewlyAdded?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ICartItem {
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
  ownerType: ProductOwnerType;
  isSubscription?: boolean;
  subscriptionFrequency?: SubscriptionFrequency;
  savedForLater?: boolean;
}

export interface ICart {
  id: string;
  userId?: string;
  guestSessionId?: string;
  items: ICartItem[];
  appliedCouponCode?: string;
  appliedDiscountAmount: number;
  appliedGiftCardCode?: string;
  appliedGiftCardAmount: number;
  updatedAt: string;
}

export interface IOrderItem {
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
  ownerType: ProductOwnerType;
  fulfillmentType: FulfillmentType;
  commissionRate: number;
  platformFee: number;
  sellerEarnings: number;
  status: OrderStatus;
  trackingNumber?: string;
  carrier?: string;
}

export interface IOrder {
  id: string;
  orderNumber: string;
  userId?: string;
  guestEmail?: string;
  guestSessionId?: string;
  isGuest: boolean;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress: IShippingAddress;
  billingAddress?: IShippingAddress;
  shippingMethod: 'standard' | 'express' | 'free';
  items: IOrderItem[];
  subtotal: number;
  discountTotal: number;
  couponCode?: string;
  giftCardCode?: string;
  giftCardAmount?: number;
  rewardPointsUsed?: number;
  rewardDiscountAmount?: number;
  shippingCost: number;
  taxAmount: number;
  taxRate: number;
  total: number;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  timeline: {
    status: OrderStatus;
    timestamp: string;
    note: string;
  }[];
  // Multi-seller vendor split orders
  sellerOrderBreakdowns?: {
    sellerId: string;
    sellerName: string;
    itemsSubtotal: number;
    commissionRate: number;
    platformFee: number;
    sellerNetEarnings: number;
    status: OrderStatus;
  }[];
  notes?: string;
  petId?: string;
  petName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ISubscription {
  id: string;
  userId: string;
  petId?: string;
  petName?: string;
  productId: string;
  variantId?: string;
  productTitle: string;
  productImage: string;
  quantity: number;
  pricePerUnit: number;
  discountPercentage: number;
  totalPerDelivery: number;
  frequency: SubscriptionFrequency;
  status: SubscriptionStatus;
  nextBillingDate: string;
  nextDeliveryDate: string;
  lastBilledDate?: string;
  shippingAddress: IShippingAddress;
  paymentMethodLast4: string;
  createdAt: string;
  updatedAt: string;
}

export interface IGiftCard {
  id: string;
  code: string; // e.g. HND-8942-KF92
  initialAmount: number;
  currentBalance: number;
  purchasedByUserId?: string;
  recipientEmail: string;
  recipientName: string;
  senderName: string;
  message?: string;
  isDigital: boolean;
  deliveryDate?: string;
  status: 'active' | 'redeemed' | 'disabled';
  createdAt: string;
  updatedAt: string;
}

export interface ICoupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed' | 'free_shipping';
  discountValue: number;
  minOrderAmount?: number;
  usageLimit?: number;
  usageCount: number;
  startDate: string;
  endDate?: string;
  eligibleCategories?: string[];
  isActive: boolean;
  description: string;
}

export interface IReview {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  petContext?: {
    petName: string;
    breed: string;
    age: string;
  };
  rating: number; // 1-5
  title: string;
  content: string;
  images?: string[];
  isVerifiedPurchase: boolean;
  sellerResponse?: {
    content: string;
    respondedAt: string;
  };
  status: 'approved' | 'pending' | 'flagged';
  createdAt: string;
}

export interface ISeller {
  id: string;
  userId: string;
  storeName: string;
  slug: string;
  description: string;
  logoUrl?: string;
  bannerUrl?: string;
  contactEmail: string;
  phone: string;
  businessAddress: string;
  businessType: 'individual' | 'llc' | 'corporation';
  taxId?: string;
  status: SellerStatus;
  commissionRate: number; // default 0.12
  rating: number;
  totalSales: number;
  totalRevenue: number;
  pendingPayout: number;
  availablePayout: number;
  paidPayoutTotal: number;
  bankAccountLast4?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ISellerPayout {
  id: string;
  sellerId: string;
  sellerName: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'paid' | 'failed';
  periodStart: string;
  periodEnd: string;
  ordersCount: number;
  payoutMethod: string;
  referenceCode: string;
  paidAt?: string;
  createdAt: string;
}

export interface IResaleListing {
  id: string;
  sellerId: string;
  sellerName: string;
  title: string;
  category: string;
  brand: string;
  condition: ProductCondition;
  conditionDescription: string;
  askingPrice: number;
  originalRetailPrice?: number;
  images: string[];
  dimensions?: string;
  status: 'active' | 'pending_moderation' | 'sold' | 'rejected';
  isPlatformOwned: boolean;
  buybackEligible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IBuybackOffer {
  id: string;
  listingId?: string;
  sellerId: string;
  sellerName: string;
  sellerEmail: string;
  itemTitle: string;
  itemCategory: string;
  itemBrand: string;
  condition: ProductCondition;
  itemConditionNotes: string;
  itemPhotos: string[];
  askingPrice: number;
  platformOfferAmount: number;
  estimatedResalePrice: number;
  status: BuybackStatus;
  inspectionNotes?: string;
  payoutTransactionId?: string;
  platformInventoryProductId?: string;
  timeline: {
    status: BuybackStatus;
    timestamp: string;
    note: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface INotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'order' | 'subscription' | 'reorder' | 'seller' | 'loyalty' | 'system';
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface ISupportTicket {
  id: string;
  ticketNumber: string;
  userId?: string;
  customerEmail: string;
  customerName: string;
  subject: string;
  category: 'order' | 'payment' | 'shipping' | 'return' | 'product' | 'seller' | 'other' | 'support_inquiry';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting_on_customer' | 'resolved' | 'closed';
  message?: string;
  initialMessage?: string;
  messages: {
    sender: 'customer' | 'agent' | 'system';
    senderName: string;
    content: string;
    timestamp: string;
  }[];
  internalNotes?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface IAuditLog {
  id: string;
  adminId: string;
  adminEmail: string;
  adminName: string;
  action: string;
  entity: string;
  entityId: string;
  beforeValue?: any;
  afterValue?: any;
  ipAddress?: string;
  createdAt: string;
}

export interface IAdminSettings {
  id: string;
  storeName: string;
  supportEmail: string;
  contactPhone: string;
  marketplaceCommission: number;
  freeShippingThreshold: number;
  standardShippingFee: number;
  expressShippingFee: number;
  taxRateDefault: number;
  loyaltyPointsPerDollar: number;
  enableGuestCheckout: boolean;
  enableAutoBuybackOffers: boolean;
  buybackMarginTarget: number; // e.g. 0.35 (35% margin)
  lowStockThreshold: number;
  updatedAt: string;
}

export interface IMarketplaceDog {
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
  recentlyAdminEditedAt?: number;
  isRecentlyUpdated?: boolean;
  isNewlyAdded?: boolean;
  updatedAt?: string;
}

