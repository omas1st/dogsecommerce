import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { SellerModel, ProductModel, OrderModel, SellerPayoutModel } from '../models';
import { ProductOwnerType, ProductCondition } from '../config/constants';

export const getSellerOverview = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized.' });

    let seller = await SellerModel.findOne({ userId: req.user.id });
    if (!seller && (req.user.role === 'admin' || req.user.role === 'super_admin')) {
      // If admin testing seller dashboard, grab the first seller
      seller = await SellerModel.findOne();
    }

    if (!seller) {
      return res.status(404).json({ success: false, error: 'No active seller profile found for this account.' });
    }

    const products = await ProductModel.find({ sellerId: seller.id });
    const allOrders = await OrderModel.find();

    // Filter orders where this seller has items
    const sellerOrders = allOrders.filter((ord) =>
      ord.items.some((item) => item.sellerId === seller?.id)
    );

    const payouts = await SellerPayoutModel.find({ sellerId: seller.id });

    return res.json({
      success: true,
      seller,
      stats: {
        totalProducts: products.length,
        totalOrders: sellerOrders.length,
        totalSalesUnits: seller.totalSales || 0,
        grossRevenue: seller.totalRevenue || 0,
        pendingPayout: seller.pendingPayout || 0,
        availablePayout: seller.availablePayout || (seller.pendingPayout || 0),
        paidPayoutTotal: seller.paidPayoutTotal || 0,
        commissionRate: seller.commissionRate,
      },
      recentOrders: sellerOrders.slice(0, 5),
      recentProducts: products.slice(0, 5),
      payouts,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const getSellerProducts = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized.' });
    const seller = await SellerModel.findOne({ userId: req.user.id }) || await SellerModel.findOne();
    if (!seller) return res.status(404).json({ success: false, error: 'Seller not found.' });

    const products = await ProductModel.find({ sellerId: seller.id });
    return res.json({ success: true, products });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const addSellerProduct = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized.' });
    const seller = await SellerModel.findOne({ userId: req.user.id }) || await SellerModel.findOne();
    if (!seller) return res.status(404).json({ success: false, error: 'Seller not found.' });

    const {
      title,
      description,
      price,
      compareAtPrice,
      sku,
      category = 'dog-treats',
      stock = 25,
      images = [],
      tags = [],
    } = req.body;

    if (!title || !price) {
      return res.status(400).json({ success: false, error: 'Title and price are required.' });
    }

    const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Math.random().toString(36).substring(2, 6)}`;
    const finalImages = images.length > 0 ? images : [
      'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=600&q=80',
    ];

    const product = await ProductModel.create({
      title: title.trim(),
      slug,
      description: description || 'Artisan handcrafted canine essential.',
      price: Number(price),
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : undefined,
      sku: sku || `VND-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      images: finalImages,
      category,
      brand: seller.storeName,
      ownerType: ProductOwnerType.SELLER,
      sellerId: seller.id,
      sellerName: seller.storeName,
      condition: ProductCondition.NEW,
      variants: [
        {
          id: `var_${Date.now()}`,
          name: 'Standard',
          sku: sku || `VND-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
          price: Number(price),
          stock: Number(stock) || 10,
          attributes: {},
        },
      ],
      stock: Number(stock) || 10,
      rating: 5.0,
      reviewsCount: 0,
      tags: Array.isArray(tags) ? tags : ['artisan', 'marketplace'],
      isSubscriptionEligible: false,
      isMarketplaceEligible: true,
      isPublished: true,
      suitability: {
        petTypes: ['dog'],
        lifeStages: ['all_stages'],
        sizes: ['all_sizes'],
      },
    });

    return res.status(201).json({ success: true, product });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const requestSellerPayout = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized.' });
    const seller = await SellerModel.findOne({ userId: req.user.id }) || await SellerModel.findOne();
    if (!seller) return res.status(404).json({ success: false, error: 'Seller not found.' });

    const availableAmount = seller.pendingPayout || 0;
    if (availableAmount <= 0) {
      return res.status(400).json({ success: false, error: 'No available funds for payout at this time.' });
    }

    const payout = await SellerPayoutModel.create({
      sellerId: seller.id,
      sellerName: seller.storeName,
      amount: availableAmount,
      currency: 'USD',
      status: 'processing',
      periodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      periodEnd: new Date().toISOString(),
      ordersCount: seller.totalSales || 1,
      payoutMethod: `Direct ACH (Bank Ending in ${seller.bankAccountLast4 || '4242'})`,
      referenceCode: `ACH-${Math.floor(100000 + Math.random() * 900000)}`,
    });

    await SellerModel.findByIdAndUpdate(seller.id, {
      pendingPayout: 0,
      availablePayout: 0,
      paidPayoutTotal: Number(((seller.paidPayoutTotal || 0) + availableAmount).toFixed(2)),
    });

    return res.status(201).json({ success: true, payout, message: `ACH transfer of $${availableAmount.toFixed(2)} initiated!` });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
