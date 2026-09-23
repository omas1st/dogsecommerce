import { db } from '../config/db';
import {
  IUser,
  IPet,
  IProduct,
  ICart,
  IOrder,
  ISubscription,
  IGiftCard,
  ICoupon,
  IReview,
  ISeller,
  ISellerPayout,
  IResaleListing,
  IBuybackOffer,
  INotification,
  ISupportTicket,
  IAuditLog,
  IAdminSettings,
  IMarketplaceDog,
} from './types';

export const UserModel = db.collection<IUser>('users');
export const PetModel = db.collection<IPet>('pets');
export const ProductModel = db.collection<IProduct>('products');
export const CartModel = db.collection<ICart>('carts');
export const OrderModel = db.collection<IOrder>('orders');
export const SubscriptionModel = db.collection<ISubscription>('subscriptions');
export const GiftCardModel = db.collection<IGiftCard>('gift_cards');
export const CouponModel = db.collection<ICoupon>('coupons');
export const ReviewModel = db.collection<IReview>('reviews');
export const SellerModel = db.collection<ISeller>('sellers');
export const SellerPayoutModel = db.collection<ISellerPayout>('seller_payouts');
export const ResaleListingModel = db.collection<IResaleListing>('resale_listings');
export const BuybackOfferModel = db.collection<IBuybackOffer>('buyback_offers');
export const NotificationModel = db.collection<INotification>('notifications');
export const SupportTicketModel = db.collection<ISupportTicket>('support_tickets');
export const AuditLogModel = db.collection<IAuditLog>('audit_logs');
export const AdminSettingsModel = db.collection<IAdminSettings>('admin_settings');
export const MarketplaceDogModel = db.collection<IMarketplaceDog>('marketplace_dogs');

