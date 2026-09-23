import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { recordAuditLog } from '../middleware/auditLogger';
import {
  UserModel,
  PetModel,
  ProductModel,
  OrderModel,
  SubscriptionModel,
  SellerModel,
  SellerPayoutModel,
  ResaleListingModel,
  BuybackOfferModel,
  GiftCardModel,
  CouponModel,
  AuditLogModel,
  AdminSettingsModel,
  ReviewModel,
} from '../models';
import { OrderStatus, PaymentStatus, BuybackStatus, SellerStatus, ProductOwnerType } from '../config/constants';
import { BuybackService } from '../services/buybackService';

export const getAdminOverview = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const orders = await OrderModel.find();
    const users = await UserModel.find();
    const pets = await PetModel.find();
    const products = await ProductModel.find();
    const subscriptions = await SubscriptionModel.find({ status: 'active' });
    const sellers = await SellerModel.find();
    const buybackOffers = await BuybackOfferModel.find();

    const totalRevenue = Number(orders.reduce((sum, o) => sum + (o.total || 0), 0).toFixed(2));
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? Number((totalRevenue / totalOrders).toFixed(2)) : 0;

    // Marketplace GMV and commission
    const marketplaceOrders = orders.filter((o) => o.sellerOrderBreakdowns && o.sellerOrderBreakdowns.length > 0);
    const marketplaceGMV = Number(
      marketplaceOrders
        .reduce((sum, o) => sum + (o.sellerOrderBreakdowns?.reduce((s, b) => s + b.itemsSubtotal, 0) || 0), 0)
        .toFixed(2)
    );
    const platformCommissionCollected = Number(
      marketplaceOrders
        .reduce((sum, o) => sum + (o.sellerOrderBreakdowns?.reduce((s, b) => s + b.platformFee, 0) || 0), 0)
        .toFixed(2)
    );

    const pendingOrders = orders.filter((o) => o.orderStatus === OrderStatus.PENDING || o.orderStatus === OrderStatus.CONFIRMED).length;
    const lowStockProducts = products.filter((p) => p.stock <= 5).length;
    const pendingBuybacks = buybackOffers.filter((b) => b.status === BuybackStatus.OFFER_PENDING || b.status === BuybackStatus.RECEIVED).length;

    // Mock 7-day trend data for chart
    const recentDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const salesTrend = recentDays.map((day, idx) => ({
      day,
      sales: Math.floor(1200 + idx * 340 + Math.random() * 200),
      orders: Math.floor(14 + idx * 3 + Math.random() * 4),
    }));

    return res.json({
      success: true,
      stats: {
        totalRevenue,
        totalOrders,
        avgOrderValue,
        activeCustomers: users.filter((u) => u.role === 'customer').length,
        totalPets: pets.length,
        activeSubscriptions: subscriptions.length,
        activeProducts: products.filter((p) => p.isPublished).length,
        lowStockProducts,
        pendingOrders,
        marketplaceGMV,
        platformCommissionCollected,
        approvedSellers: sellers.filter((s) => s.status === SellerStatus.APPROVED).length,
        pendingBuybacks,
      },
      salesTrend,
      recentOrders: orders.slice(-8).reverse(),
      recentAuditLogs: (await AuditLogModel.find()).slice(-6).reverse(),
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const getAdminUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const users = await UserModel.find();
    return res.json({
      success: true,
      users: users.map((u) => {
        const safe = { ...u };
        delete safe.passwordHash;
        return safe;
      }),
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const updateUserStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, role } = req.body;

    const user = await UserModel.findById(id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found.' });

    const updated = await UserModel.findByIdAndUpdate(id, {
      status: status || user.status,
      role: role || user.role,
    });

    await recordAuditLog(req, `Updated user ${user.email} status to ${status || user.status}`, 'User', id, user, updated);

    return res.json({ success: true, user: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const getAdminPets = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const pets = await PetModel.find();
    return res.json({ success: true, pets });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const getAdminProducts = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const products = await ProductModel.find();
    return res.json({ success: true, products });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const createAdminProduct = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const body = req.body;
    const slug = body.slug || `${body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Math.random().toString(36).substring(2, 6)}`;

    const product = await ProductModel.create({
      ...body,
      slug,
      ownerType: body.ownerType || ProductOwnerType.PLATFORM,
      price: Number(body.price),
      stock: Number(body.stock) || 50,
      rating: 5.0,
      reviewsCount: 0,
      isPublished: body.isPublished !== undefined ? body.isPublished : true,
      suitability: body.suitability || {
        petTypes: ['dog'],
        lifeStages: ['all_stages'],
        sizes: ['all_sizes'],
      },
    });

    await recordAuditLog(req, `Created new catalog product: ${product.title}`, 'Product', product.id, null, product);
    return res.status(201).json({ success: true, product });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const updateAdminProduct = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await ProductModel.findById(id);
    if (!existing) return res.status(404).json({ success: false, error: 'Product not found.' });

    const updated = await ProductModel.findByIdAndUpdate(id, req.body);
    await recordAuditLog(req, `Updated product: ${existing.title}`, 'Product', id, existing, updated);

    return res.json({ success: true, product: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const deleteAdminProduct = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await ProductModel.findById(id);
    if (!existing) return res.status(404).json({ success: false, error: 'Product not found.' });

    await ProductModel.findByIdAndDelete(id);
    await recordAuditLog(req, `Deleted product: ${existing.title}`, 'Product', id, existing, null);

    return res.json({ success: true, message: 'Product deleted.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const getAdminOrders = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const orders = await OrderModel.find();
    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return res.json({ success: true, orders });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const updateOrderStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, note, trackingNumber, carrier } = req.body;

    const order = await OrderModel.findById(id);
    if (!order) return res.status(404).json({ success: false, error: 'Order not found.' });

    const newTimeline = [
      ...order.timeline,
      {
        status,
        timestamp: new Date().toISOString(),
        note: note || `Order status updated to ${status} by admin operations.`,
      },
    ];

    const updated = await OrderModel.findByIdAndUpdate(id, {
      orderStatus: status,
      timeline: newTimeline,
    });

    await recordAuditLog(req, `Updated order #${order.orderNumber} status to ${status}`, 'Order', id, order, updated);

    return res.json({ success: true, order: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const getAdminSellers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const sellers = await SellerModel.find();
    return res.json({ success: true, sellers });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const updateSellerStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, commissionRate } = req.body;

    const seller = await SellerModel.findById(id);
    if (!seller) return res.status(404).json({ success: false, error: 'Seller not found.' });

    const updated = await SellerModel.findByIdAndUpdate(id, {
      status: status || seller.status,
      commissionRate: commissionRate !== undefined ? Number(commissionRate) : seller.commissionRate,
    });

    await recordAuditLog(req, `Modified seller ${seller.storeName} status to ${status}`, 'Seller', id, seller, updated);
    return res.json({ success: true, seller: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const getAdminBuybacks = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const offers = await BuybackOfferModel.find();
    return res.json({ success: true, offers });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const inspectAndApproveBuyback = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { inspectionNotes, approveForResale = true } = req.body;

    const offer = await BuybackOfferModel.findById(id);
    if (!offer) return res.status(404).json({ success: false, error: 'Buyback offer not found.' });

    const newStatus = approveForResale ? BuybackStatus.APPROVED : BuybackStatus.REJECTED;

    const updated = await BuybackOfferModel.findByIdAndUpdate(id, {
      status: newStatus,
      inspectionNotes,
      timeline: [
        ...offer.timeline,
        {
          status: newStatus,
          timestamp: new Date().toISOString(),
          note: `Hound & Harbor hub inspected: ${inspectionNotes || 'Passed 18-point safety & sanitation protocol.'}`,
        },
      ],
    });

    let resaleProduct: any = null;
    if (approveForResale && updated) {
      resaleProduct = await BuybackService.convertToPlatformResaleProduct(updated);
    }

    await recordAuditLog(req, `Inspected & approved buyback item: ${offer.itemTitle}`, 'BuybackOffer', id, offer, updated);

    return res.json({
      success: true,
      offer: updated,
      resaleProduct,
      message: 'Buyback gear successfully certified and listed in pre-owned marketplace catalog!',
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const getAdminGiftCards = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const giftCards = await GiftCardModel.find();
    return res.json({ success: true, giftCards });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const createAdminGiftCard = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { amount, recipientEmail, recipientName, message } = req.body;
    const code = `HND-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const card = await GiftCardModel.create({
      code,
      initialAmount: Number(amount) || 50,
      currentBalance: Number(amount) || 50,
      recipientEmail: recipientEmail || 'customer@example.com',
      recipientName: recipientName || 'Valued Pet Parent',
      senderName: 'Hound & Harbor Concierge',
      message: message || 'A gift for your furry companion.',
      isDigital: true,
      status: 'active',
    });

    await recordAuditLog(req, `Generated gift card ${code} for $${amount}`, 'GiftCard', card.id, null, card);
    return res.status(201).json({ success: true, giftCard: card });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const getAdminCoupons = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const coupons = await CouponModel.find();
    return res.json({ success: true, coupons });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const createAdminCoupon = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { code, discountType, discountValue, minOrderAmount, description } = req.body;
    const coupon = await CouponModel.create({
      code: code.toUpperCase().trim(),
      discountType: discountType || 'percentage',
      discountValue: Number(discountValue) || 15,
      minOrderAmount: minOrderAmount ? Number(minOrderAmount) : 0,
      usageLimit: 500,
      usageCount: 0,
      startDate: new Date().toISOString(),
      isActive: true,
      description: description || 'Promotional coupon code',
    });

    await recordAuditLog(req, `Created promo coupon ${coupon.code}`, 'Coupon', coupon.id, null, coupon);
    return res.status(201).json({ success: true, coupon });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const getAuditLogs = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const logs = await AuditLogModel.find();
    logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return res.json({ success: true, logs });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const getSettings = async (req: AuthenticatedRequest, res: Response) => {
  try {
    let settings = await AdminSettingsModel.findOne();
    if (!settings) {
      settings = await AdminSettingsModel.create({
        storeName: 'Hound & Harbor',
        supportEmail: 'support@houndandharbor.com',
        contactPhone: '+1 (800) 555-DOGS',
        marketplaceCommission: 0.12,
        freeShippingThreshold: 49.0,
        standardShippingFee: 5.99,
        expressShippingFee: 2.00,
        taxRateDefault: 0.0,
        loyaltyPointsPerDollar: 5,
        enableGuestCheckout: true,
        enableAutoBuybackOffers: true,
        buybackMarginTarget: 0.38,
        lowStockThreshold: 10,
        updatedAt: new Date().toISOString(),
      });
    }
    return res.json({ success: true, settings });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const updateSettings = async (req: AuthenticatedRequest, res: Response) => {
  try {
    let settings = await AdminSettingsModel.findOne();
    const updated = settings
      ? await AdminSettingsModel.findByIdAndUpdate(settings.id, req.body)
      : await AdminSettingsModel.create(req.body);

    await recordAuditLog(req, 'Updated store platform configuration', 'Settings', updated!.id, settings, updated);
    return res.json({ success: true, settings: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const exportReportCsv = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { type = 'orders' } = req.query;

    if (type === 'orders') {
      const orders = await OrderModel.find();
      let csv = 'Order Number,Date,Customer,Email,Total,Payment Status,Fulfillment Status\n';
      orders.forEach((o) => {
        csv += `"${o.orderNumber}","${o.createdAt.slice(0, 10)}","${o.customerName}","${o.customerEmail}","$${o.total.toFixed(2)}","${o.paymentStatus}","${o.orderStatus}"\n`;
      });
      res.header('Content-Type', 'text/csv');
      res.attachment(`hound-orders-${Date.now()}.csv`);
      return res.send(csv);
    } else {
      const products = await ProductModel.find();
      let csv = 'SKU,Title,Price,Stock,Category,Owner Type,Rating\n';
      products.forEach((p) => {
        csv += `"${p.sku}","${p.title.replace(/"/g, '""')}","$${p.price.toFixed(2)}","${p.stock}","${p.category}","${p.ownerType}","${p.rating}"\n`;
      });
      res.header('Content-Type', 'text/csv');
      res.attachment(`hound-products-${Date.now()}.csv`);
      return res.send(csv);
    }
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
