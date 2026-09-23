export enum UserRole {
  CUSTOMER = 'customer',
  SELLER = 'seller',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
  OPERATIONS_MANAGER = 'operations_manager',
  CUSTOMER_SUPPORT = 'customer_support',
  FINANCE_MANAGER = 'finance_manager',
  MARKETPLACE_MANAGER = 'marketplace_manager',
  INVENTORY_MANAGER = 'inventory_manager',
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  PACKED = 'packed',
  SHIPPED = 'shipped',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
  RETURNED = 'returned',
}

export enum PaymentStatus {
  PENDING = 'pending',
  AUTHORIZED = 'authorized',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
  CANCELLED = 'cancelled',
}

export enum ProductOwnerType {
  PLATFORM = 'platform',
  SELLER = 'seller',
  RESALE_PLATFORM = 'resale_platform', // Platform-owned buyback inventory
}

export enum FulfillmentType {
  PLATFORM_WAREHOUSE = 'platform_warehouse',
  SELLER_DIRECT = 'seller_direct',
  HYBRID = 'hybrid',
}

export enum ProductCondition {
  NEW = 'new',
  LIKE_NEW = 'like_new',
  GOOD = 'good',
  FAIR = 'fair',
}

export enum BuybackStatus {
  OFFER_PENDING = 'offer_pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  PAID = 'paid',
  SHIPPED_TO_PLATFORM = 'shipped_to_platform',
  RECEIVED = 'received',
  INSPECTED = 'inspected',
  APPROVED = 'approved',
  LISTED = 'listed',
  SOLD = 'sold',
  RETURNED = 'returned',
}

export enum SellerStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SUSPENDED = 'suspended',
  BANNED = 'banned',
}

export enum SubscriptionFrequency {
  WEEKLY = 'weekly',
  BIWEEKLY = 'biweekly',
  MONTHLY = 'monthly',
  SIX_WEEKS = 'six_weeks',
  TWO_MONTHS = 'two_months',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  CANCELLED = 'cancelled',
  PAST_DUE = 'past_due',
}

export const PLATFORM_CONFIG = {
  BRAND_NAME: 'Hound & Harbor',
  SUPPORT_EMAIL: 'support@houndandharbor.com',
  DEFAULT_COMMISSION_RATE: 0.12, // 12% marketplace commission
  FREE_SHIPPING_THRESHOLD: 49.00,
  STANDARD_SHIPPING_FEE: 5.99,
  EXPRESS_SHIPPING_FEE: 14.99,
  POINTS_PER_DOLLAR: 5,
  POINTS_REDEEM_RATIO: 100, // 100 points = $1.00 credit
};
