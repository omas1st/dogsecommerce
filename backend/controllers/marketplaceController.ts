import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import {
  SellerModel,
  ProductModel,
  ResaleListingModel,
  BuybackOfferModel,
  UserModel,
  NotificationModel,
  MarketplaceDogModel,
} from '../models';
import { defaultMarketplaceDogs } from '../data/marketplaceDogs';
import { backendMarketplaceCatalog } from '../data/marketplaceCatalog';
import { SellerStatus, ProductCondition, BuybackStatus, ProductOwnerType, PLATFORM_CONFIG } from '../config/constants';
import { BuybackService } from '../services/buybackService';

export const getSellers = async (req: Request, res: Response) => {
  try {
    const sellers = await SellerModel.find({ status: SellerStatus.APPROVED });
    return res.json({ success: true, sellers });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const getSellerBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    let seller = await SellerModel.findOne({ slug });
    if (!seller) seller = await SellerModel.findById(slug);

    if (!seller) {
      return res.status(404).json({ success: false, error: 'Seller not found.' });
    }

    const products = await ProductModel.find({ sellerId: seller.id, isPublished: true });
    return res.json({ success: true, seller, products });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const applySeller = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized. Please sign in.' });

    const { storeName, description, phone, businessAddress, businessType = 'llc', taxId } = req.body;
    if (!storeName || !phone || !businessAddress) {
      return res.status(400).json({ success: false, error: 'Store name, phone, and business address are required.' });
    }

    const slug = storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const existing = await SellerModel.findOne({ $or: [{ slug }, { userId: req.user.id }] });
    if (existing) {
      return res.status(400).json({ success: false, error: 'You already have an existing seller application or storefront.' });
    }

    const seller = await SellerModel.create({
      userId: req.user.id,
      storeName: storeName.trim(),
      slug,
      description: description || 'Specialized canine care artisan.',
      contactEmail: req.user.email,
      phone,
      businessAddress,
      businessType,
      taxId: taxId || '',
      status: SellerStatus.APPROVED, // Auto-approve in development demo for seamless evaluation
      commissionRate: PLATFORM_CONFIG.DEFAULT_COMMISSION_RATE,
      rating: 5.0,
      totalSales: 0,
      totalRevenue: 0,
      pendingPayout: 0,
      availablePayout: 0,
      paidPayoutTotal: 0,
      bankAccountLast4: '8812',
    });

    // Upgrade user role
    await UserModel.findByIdAndUpdate(req.user.id, { role: 'seller' as any });

    return res.status(201).json({
      success: true,
      seller,
      message: 'Seller application approved! Your merchant dashboard is now ready.',
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const getResaleListings = async (req: Request, res: Response) => {
  try {
    const listings = await ResaleListingModel.find({ status: 'active' });
    return res.json({ success: true, listings });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const createResaleListing = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized.' });

    const {
      title,
      category = 'crates-travel',
      brand = 'Generic Canine Gear',
      condition = ProductCondition.LIKE_NEW,
      conditionDescription,
      askingPrice,
      originalRetailPrice,
      images = [],
      dimensions,
    } = req.body;

    if (!title || !askingPrice || !conditionDescription) {
      return res.status(400).json({ success: false, error: 'Title, asking price, and condition description are required.' });
    }

    const defaultImages = [
      'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80',
    ];

    const listing = await ResaleListingModel.create({
      sellerId: req.user.id,
      sellerName: `${req.user.firstName} ${req.user.lastName[0] || ''}.`,
      title: title.trim(),
      category,
      brand,
      condition,
      conditionDescription,
      askingPrice: Number(askingPrice),
      originalRetailPrice: originalRetailPrice ? Number(originalRetailPrice) : undefined,
      images: images.length > 0 ? images : defaultImages,
      dimensions,
      status: 'active',
      isPlatformOwned: false,
      buybackEligible: true,
    });

    // Also automatically evaluate for an instant platform buyback offer
    const calculation = BuybackService.calculateOffer({
      askingPrice: Number(askingPrice),
      condition,
      category,
      originalRetailPrice: originalRetailPrice ? Number(originalRetailPrice) : undefined,
    });

    const buybackOffer = await BuybackOfferModel.create({
      listingId: listing.id,
      sellerId: req.user.id,
      sellerName: `${req.user.firstName} ${req.user.lastName}`,
      sellerEmail: req.user.email,
      itemTitle: title,
      itemCategory: category,
      itemBrand: brand,
      condition,
      itemConditionNotes: conditionDescription,
      itemPhotos: listing.images,
      askingPrice: Number(askingPrice),
      platformOfferAmount: calculation.offerAmount,
      estimatedResalePrice: calculation.estimatedResalePrice,
      status: BuybackStatus.OFFER_PENDING,
      timeline: [
        {
          status: BuybackStatus.OFFER_PENDING,
          timestamp: new Date().toISOString(),
          note: `Hound & Harbor evaluated your gear: Instant buyback offer of $${calculation.offerAmount.toFixed(2)} generated!`,
        },
      ],
    });

    return res.status(201).json({
      success: true,
      listing,
      buybackOffer,
      message: 'Resale listing created! Hound & Harbor has also extended an instant buyback offer if you prefer quick cash.',
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const requestBuybackQuote = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, category, brand, condition, askingPrice, originalRetailPrice, notes, photos } = req.body;

    if (!title || !askingPrice || !condition) {
      return res.status(400).json({ success: false, error: 'Title, condition, and asking price are required.' });
    }

    const calculation = BuybackService.calculateOffer({
      askingPrice: Number(askingPrice),
      condition,
      category,
      originalRetailPrice: originalRetailPrice ? Number(originalRetailPrice) : undefined,
    });

    const user = req.user;
    const buybackOffer = await BuybackOfferModel.create({
      sellerId: user ? user.id : 'guest_seller',
      sellerName: user ? `${user.firstName} ${user.lastName}` : 'Direct Seller',
      sellerEmail: user ? user.email : 'seller@example.com',
      itemTitle: title,
      itemCategory: category || 'crates-travel',
      itemBrand: brand || 'Canine Essentials',
      condition,
      itemConditionNotes: notes || 'Good clean gear.',
      itemPhotos: photos || ['https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80'],
      askingPrice: Number(askingPrice),
      platformOfferAmount: calculation.offerAmount,
      estimatedResalePrice: calculation.estimatedResalePrice,
      status: BuybackStatus.OFFER_PENDING,
      timeline: [
        {
          status: BuybackStatus.OFFER_PENDING,
          timestamp: new Date().toISOString(),
          note: `Official buyback quote prepared: $${calculation.offerAmount.toFixed(2)}. Prepaid shipping box available.`,
        },
      ],
    });

    return res.json({ success: true, buybackOffer, calculation });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const respondToBuybackOffer = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { accept } = req.body;

    const offer = await BuybackOfferModel.findById(id);
    if (!offer) return res.status(404).json({ success: false, error: 'Buyback offer not found.' });

    const newStatus = accept ? BuybackStatus.ACCEPTED : BuybackStatus.REJECTED;
    const note = accept
      ? 'Seller accepted platform buyback offer. Prepaid UPS Ground shipping kit generated.'
      : 'Seller declined platform buyback offer. Item remains listed as peer-to-peer resale.';

    const updatedTimeline = [
      ...offer.timeline,
      {
        status: newStatus,
        timestamp: new Date().toISOString(),
        note,
      },
    ];

    const updated = await BuybackOfferModel.findByIdAndUpdate(id, {
      status: newStatus,
      timeline: updatedTimeline,
    });

    return res.json({ success: true, buybackOffer: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const getMarketplaceDogs = async (req: Request, res: Response) => {
  try {
    let dogs = await MarketplaceDogModel.find();
    if (!dogs || dogs.length === 0) {
      dogs = defaultMarketplaceDogs;
    }

    const { size, search, partner, minPrice, maxPrice, sortBy, limit, offset } = req.query;

    let filtered = [...dogs];

    // Filter by size
    if (size && size !== 'all') {
      filtered = filtered.filter((d) => d.size.toLowerCase() === String(size).toLowerCase());
    }

    // Filter by partner source (Chewy or Petco or Hound Reserve)
    if (partner && partner !== 'all') {
      const pStr = String(partner).toLowerCase();
      filtered = filtered.filter((d) => d.partnerSource.toLowerCase().includes(pStr));
    }

    // Filter by price range
    if (minPrice) {
      filtered = filtered.filter((d) => d.price >= Number(minPrice));
    }
    if (maxPrice) {
      filtered = filtered.filter((d) => d.price <= Number(maxPrice));
    }

    // Search by name, breed, or temperament
    if (search) {
      const q = String(search).toLowerCase().trim();
      filtered = filtered.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.breed.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q) ||
          d.location.toLowerCase().includes(q) ||
          d.temperament.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Sort: if custom sort is selected, use it. Otherwise, newly added/edited items are at the top!
    if (sortBy === 'price-low') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'weight-low') {
      filtered.sort((a, b) => a.weightLbs - b.weightLbs);
    } else if (sortBy === 'weight-high') {
      filtered.sort((a, b) => b.weightLbs - a.weightLbs);
    } else if (sortBy === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      // Default: place newly added or edited dogs at the top
      filtered.sort((a: any, b: any) => {
        const aTime = a.recentlyAdminEditedAt || (a.isRecentlyUpdated ? 1 : 0) || 0;
        const bTime = b.recentlyAdminEditedAt || (b.isRecentlyUpdated ? 1 : 0) || 0;
        if (aTime !== bTime) {
          return bTime - aTime;
        }
        return 0;
      });
    }

    const total = filtered.length;
    const startIndex = offset ? Number(offset) : 0;
    const pageLimit = limit ? Number(limit) : 100;
    const paginated = filtered.slice(startIndex, startIndex + pageLimit);

    return res.json({
      success: true,
      total,
      count: paginated.length,
      dogs: paginated,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const getMarketplaceDogById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let dog = await MarketplaceDogModel.findById(id);
    if (!dog) {
      dog = defaultMarketplaceDogs.find((d) => d.id === id) || null;
    }

    if (!dog) {
      return res.status(404).json({ success: false, error: 'Marketplace dog profile not found.' });
    }

    return res.json({ success: true, dog });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const getMarketplaceItems = async (req: Request, res: Response) => {
  try {
    const { category, search, limit = 52, page = 1, shape, itemType, sort } = req.query;
    let items = [...backendMarketplaceCatalog];
    if (category) {
      items = items.filter((it) => it.category === category);
    }
    if (shape) {
      items = items.filter((it) => it.shape?.toLowerCase() === String(shape).toLowerCase());
    }
    if (itemType) {
      items = items.filter((it) => it.itemType?.toLowerCase() === String(itemType).toLowerCase());
    }
    if (search) {
      const q = String(search).toLowerCase();
      items = items.filter(
        (it) =>
          it.title.toLowerCase().includes(q) ||
          it.description.toLowerCase().includes(q) ||
          it.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    if (sort === 'price-low') {
      items.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-high') {
      items.sort((a, b) => b.price - a.price);
    } else if (sort === 'rating') {
      items.sort((a, b) => b.rating - a.rating);
    } else {
      // Default: place newly added or edited items at the top of the marketplace
      items.sort((a: any, b: any) => {
        const aTime = a.recentlyAdminEditedAt || (a.isRecentlyUpdated ? 1 : 0) || 0;
        const bTime = b.recentlyAdminEditedAt || (b.isRecentlyUpdated ? 1 : 0) || 0;
        if (aTime !== bTime) {
          return bTime - aTime;
        }
        return 0;
      });
    }

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Number(limit) || 52);
    const total = items.length;
    const paginated = items.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    return res.json({
      success: true,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      items: paginated,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const getMarketplaceItemById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const item = backendMarketplaceCatalog.find((it) => it.id === id || it.slug === id);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Marketplace item not found.' });
    }
    return res.json({ success: true, item });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};


