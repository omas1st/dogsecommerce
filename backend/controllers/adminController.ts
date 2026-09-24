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
  MarketplaceDogModel,
} from '../models';
import { defaultMarketplaceDogs } from '../data/marketplaceDogs';
import { backendMarketplaceCatalog } from '../data/marketplaceCatalog';
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
    const dbProducts = await ProductModel.find();
    const productMap = new Map<string, any>();

    // Add all DB products
    for (const p of dbProducts) {
      productMap.set(p.id, p);
      if (p.slug) productMap.set(p.slug, p);
    }

    // Merge in all 624 items from backendMarketplaceCatalog so EVERYTHING in the marketplace is in admin panel
    for (const item of backendMarketplaceCatalog) {
      if (!productMap.has(item.id) && !productMap.has(item.slug)) {
        productMap.set(item.id, item);
      }
    }

    const allProducts = Array.from(new Set(productMap.values()));
    return res.json({ success: true, count: allProducts.length, products: allProducts });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const createAdminProduct = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const body = req.body;
    const title = body.title || body.name || 'Dog Supply Item';
    const slug = body.slug || `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Math.random().toString(36).substring(2, 6)}`;
    const imageUrl = body.image || (body.images && body.images[0]) || 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=600&q=80';
    const now = Date.now();

    const product = await ProductModel.create({
      ...body,
      title,
      slug,
      ownerType: body.ownerType || ProductOwnerType.PLATFORM,
      price: Number(body.price) || 0,
      stock: Number(body.stock) !== undefined ? Number(body.stock) : 50,
      images: body.images && body.images.length > 0 ? body.images : [imageUrl],
      category: body.category || 'dog-food',
      description: body.description || '',
      rating: 5.0,
      reviewsCount: 0,
      isPublished: body.isPublished !== undefined ? body.isPublished : true,
      recentlyAdminEditedAt: now,
      isRecentlyUpdated: true,
      isNewlyAdded: true,
      suitability: body.suitability || {
        petTypes: ['dog'],
        lifeStages: ['all_stages'],
        sizes: ['all_sizes'],
      },
    });

    // Also unshift to top of in-memory backendMarketplaceCatalog so it is immediately at the top
    backendMarketplaceCatalog.unshift(product as any);

    await recordAuditLog(req, `Created new catalog product: ${product.title}`, 'Product', product.id, null, product);
    return res.status(201).json({ success: true, product });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const updateAdminProduct = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    let existing = await ProductModel.findById(id);
    if (!existing) {
      existing = await ProductModel.findOne({ slug: id });
    }
    // If not yet in ProductModel, clone it from backendMarketplaceCatalog
    if (!existing) {
      const mktItem = backendMarketplaceCatalog.find((it) => it.id === id || it.slug === id);
      if (mktItem) {
        existing = await ProductModel.create(mktItem as any);
      }
    }
    if (!existing) return res.status(404).json({ success: false, error: 'Product not found.' });

    const now = Date.now();
    const updates = { ...req.body };
    if (updates.name && !updates.title) updates.title = updates.name;
    if (updates.price !== undefined) updates.price = Number(updates.price);
    if (updates.image) {
      updates.images = [updates.image, ...(existing.images?.filter((img: string) => img !== updates.image) || [])];
    }
    updates.recentlyAdminEditedAt = now;
    updates.isRecentlyUpdated = true;
    updates.updatedAt = new Date().toISOString();

    const updated = await ProductModel.findByIdAndUpdate(existing.id, updates);

    // Also update in-memory backendMarketplaceCatalog and place at top of list
    const mktIdx = backendMarketplaceCatalog.findIndex((it) => it.id === id || it.slug === id);
    if (mktIdx !== -1) {
      const updatedItem = {
        ...backendMarketplaceCatalog[mktIdx],
        ...updates,
      };
      backendMarketplaceCatalog.splice(mktIdx, 1);
      backendMarketplaceCatalog.unshift(updatedItem);
    } else {
      backendMarketplaceCatalog.unshift(updated as any);
    }

    await recordAuditLog(req, `Updated product: ${existing.title}`, 'Product', existing.id, existing, updated);
    return res.json({ success: true, product: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const deleteAdminProduct = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    let existing = await ProductModel.findById(id);
    if (!existing) {
      existing = await ProductModel.findOne({ slug: id });
    }
    if (existing) {
      await ProductModel.findByIdAndDelete(existing.id);
    }
    const mktIdx = backendMarketplaceCatalog.findIndex((it) => it.id === id || it.slug === id);
    if (mktIdx !== -1) {
      backendMarketplaceCatalog.splice(mktIdx, 1);
    }
    if (!existing && mktIdx === -1) {
      return res.status(404).json({ success: false, error: 'Product not found.' });
    }

    await recordAuditLog(req, `Deleted product: ${id}`, 'Product', id, existing, null);
    return res.json({ success: true, message: 'Product deleted.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const getAdminMarketplaceDogs = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const dbDogs = await MarketplaceDogModel.find();
    const dogMap = new Map<string, any>();
    for (const d of dbDogs) {
      dogMap.set(d.id, d);
    }
    for (const d of defaultMarketplaceDogs) {
      if (!dogMap.has(d.id)) {
        dogMap.set(d.id, d);
      }
    }
    const allDogs = Array.from(dogMap.values());
    return res.json({ success: true, count: allDogs.length, dogs: allDogs });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const createAdminMarketplaceDog = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const body = req.body;
    const now = Date.now();
    const dog = await MarketplaceDogModel.create({
      id: body.id || `dog-${Date.now()}`,
      name: body.name || 'Unnamed Canine',
      breed: body.breed || 'Mixed Breed',
      size: body.size || 'medium',
      weightLbs: Number(body.weightLbs) || 25,
      price: Number(body.price) || 0,
      comparePrice: body.comparePrice ? Number(body.comparePrice) : undefined,
      partnerSource: body.partnerSource || 'Hound & Harbor Adoption Network',
      ageYears: Number(body.ageYears) || 1,
      ageMonths: Number(body.ageMonths) || 0,
      gender: body.gender || 'male',
      isNeuteredOrSpayed: body.isNeuteredOrSpayed !== undefined ? body.isNeuteredOrSpayed : true,
      isVaccinated: body.isVaccinated !== undefined ? body.isVaccinated : true,
      isMicrochipped: body.isMicrochipped !== undefined ? body.isMicrochipped : true,
      energyLevel: body.energyLevel || 'playful',
      photoUrl: body.photoUrl || body.image || 'https://images.dog.ceo/breeds/retriever-golden/n02099601_100.jpg',
      location: body.location || 'Austin, TX',
      chewyPetcoBundle: body.chewyPetcoBundle || 'Starter Kit Included',
      temperament: Array.isArray(body.temperament)
        ? body.temperament
        : body.temperament
        ? String(body.temperament).split(',').map((s: string) => s.trim())
        : ['Friendly', 'Loving', 'Trainable'],
      description: body.description || 'Gentle and affectionate companion looking for a loving home.',
      healthGuarantee: body.healthGuarantee || '1-Year Comprehensive Health Shield',
      recentlyAdminEditedAt: now,
      isRecentlyUpdated: true,
      isNewlyAdded: true,
    });

    // Unshift to top of in-memory defaultMarketplaceDogs
    defaultMarketplaceDogs.unshift(dog as any);

    await recordAuditLog(req, `Created new dog for adoption: ${dog.name}`, 'MarketplaceDog', dog.id, null, dog);
    return res.status(201).json({ success: true, dog });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const updateAdminMarketplaceDog = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    let existing = await MarketplaceDogModel.findById(id);
    if (!existing) {
      const defaultDog = defaultMarketplaceDogs.find((d) => d.id === id);
      if (defaultDog) {
        existing = await MarketplaceDogModel.create(defaultDog);
      }
    }
    if (!existing) return res.status(404).json({ success: false, error: 'Dog profile not found.' });

    const now = Date.now();
    const updates = { ...req.body };
    if (updates.price !== undefined) updates.price = Number(updates.price);
    if (updates.image && !updates.photoUrl) updates.photoUrl = updates.image;
    if (typeof updates.temperament === 'string') {
      updates.temperament = updates.temperament.split(',').map((s: string) => s.trim());
    }
    updates.recentlyAdminEditedAt = now;
    updates.isRecentlyUpdated = true;
    updates.updatedAt = new Date().toISOString();

    const updated = await MarketplaceDogModel.findByIdAndUpdate(existing.id, updates);
    const dIdx = defaultMarketplaceDogs.findIndex((d) => d.id === id);
    if (dIdx !== -1) {
      const updatedDog = { ...defaultMarketplaceDogs[dIdx], ...updates };
      defaultMarketplaceDogs.splice(dIdx, 1);
      defaultMarketplaceDogs.unshift(updatedDog);
    } else {
      defaultMarketplaceDogs.unshift(updated as any);
    }

    await recordAuditLog(req, `Updated adoption dog: ${existing.name}`, 'MarketplaceDog', existing.id, existing, updated);
    return res.json({ success: true, dog: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const deleteAdminMarketplaceDog = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    let existing = await MarketplaceDogModel.findById(id);
    if (existing) {
      await MarketplaceDogModel.findByIdAndDelete(existing.id);
    }
    const dIdx = defaultMarketplaceDogs.findIndex((d) => d.id === id);
    if (dIdx !== -1) {
      defaultMarketplaceDogs.splice(dIdx, 1);
    }
    if (!existing && dIdx === -1) {
      return res.status(404).json({ success: false, error: 'Dog profile not found.' });
    }

    await recordAuditLog(req, `Deleted adoption dog: ${id}`, 'MarketplaceDog', id, existing, null);
    return res.json({ success: true, message: 'Dog profile deleted.' });
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
