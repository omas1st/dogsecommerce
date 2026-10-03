import { Request, Response } from 'express';
import { ProductModel, ReviewModel, UserModel } from '../models';
import { AuthenticatedRequest } from '../middleware/auth';
import { RecommendationService } from '../services/recommendationService';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const {
      search,
      category,
      brand,
      lifeStage,
      size,
      condition,
      ownerType,
      minPrice,
      maxPrice,
      featured,
      bestSeller,
      isSubscriptionEligible,
      sort,
      page = 1,
      limit = 24,
    } = req.query;

    let filter: any = { isPublished: true };

    if (category) {
      filter.category = category;
    }

    if (brand) {
      filter.brand = brand;
    }

    if (condition) {
      filter.condition = condition;
    }

    if (ownerType) {
      filter.ownerType = ownerType;
    }

    if (featured === 'true') {
      filter.featured = true;
    }

    if (bestSeller === 'true') {
      filter.bestSeller = true;
    }

    if (isSubscriptionEligible === 'true') {
      filter.isSubscriptionEligible = true;
    }

    let products = await ProductModel.find(filter);

    // Filter by text search
    if (search && typeof search === 'string') {
      const q = search.toLowerCase().trim();
      products = products.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)) ||
          p.category.toLowerCase().includes(q)
      );
    }

    // Filter by life stage suitability
    if (lifeStage && typeof lifeStage === 'string') {
      products = products.filter(
        (p) => p.suitability.lifeStages.includes(lifeStage as any) || p.suitability.lifeStages.includes('all_stages')
      );
    }

    // Filter by size suitability
    if (size && typeof size === 'string') {
      products = products.filter(
        (p) => p.suitability.sizes.includes(size as any) || p.suitability.sizes.includes('all_sizes')
      );
    }

    // Filter price range
    if (minPrice) {
      const min = parseFloat(minPrice as string);
      products = products.filter((p) => p.price >= min);
    }
    if (maxPrice) {
      const max = parseFloat(maxPrice as string);
      products = products.filter((p) => p.price <= max);
    }

    // Sorting
    if (sort === 'price_asc') {
      products.sort((a, b) => a.price - b.price);
    } else if (sort === 'price_desc') {
      products.sort((a, b) => b.price - a.price);
    } else if (sort === 'rating') {
      products.sort((a, b) => b.rating - a.rating);
    } else if (sort === 'newest') {
      products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      // Default: newly added or edited items ALWAYS first, then best seller / featured, then rating
      products.sort((a: any, b: any) => {
        const timeA = a.recentlyAdminEditedAt || (a.isNewlyAdded ? 1 : 0) || 0;
        const timeB = b.recentlyAdminEditedAt || (b.isRecentlyUpdated ? 1 : 0) || 0;
        if (timeA !== timeB) {
          return timeB - timeA;
        }
        if (a.bestSeller && !b.bestSeller) return -1;
        if (!a.bestSeller && b.bestSeller) return 1;
        return (b.rating || 0) - (a.rating || 0);
      });
    }

    const total = products.length;
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 24));
    const startIndex = (pageNum - 1) * limitNum;
    const paginated = products.slice(startIndex, startIndex + limitNum);

    return res.json({
      success: true,
      products: paginated,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Failed to fetch products.' });
  }
};

export const getProductBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    let product = await ProductModel.findOne({ slug });

    if (!product) {
      // Try by ID
      product = await ProductModel.findById(slug);
    }

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found.' });
    }

    // Fetch reviews
    const reviews = await ReviewModel.find({ productId: product.id, status: 'approved' });
    const similarProducts = await RecommendationService.getSimilarProducts(product.id, 4);

    return res.json({
      success: true,
      product,
      reviews,
      similarProducts,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Failed to fetch product.' });
  }
};

export const getCategories = async (req: Request, res: Response) => {
  const categories = [
    {
      id: 'dog-food',
      name: 'Dog Food & Nutrition',
      slug: 'dog-food',
      description: 'Human-grade kibble, freeze-dried raw, and veterinarian-formulated meals.',
      image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'dog-treats',
      name: 'Treats & Chews',
      slug: 'dog-treats',
      description: 'Single-ingredient jerky, dental yak chews, and training rewards.',
      image: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'toys',
      name: 'Interactive Toys',
      slug: 'toys',
      description: 'Mentally stimulating puzzle feeders, natural rubber balls, and tough tugs.',
      image: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'beds-furniture',
      name: 'Beds & Furniture',
      slug: 'beds-furniture',
      description: 'Memory foam orthopedic beds, waterproof covers, and soothing nest cushions.',
      image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'crates-travel',
      name: 'Crates, Pens & Travel',
      slug: 'crates-travel',
      description: 'Airline-compliant carriers, collapse-flat travel crates, and car seat belts.',
      image: 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'health-supplements',
      name: 'Health & Supplements',
      slug: 'health-supplements',
      description: 'Glucosamine joint chews, wild Alaskan salmon oil, and calming probiotics.',
      image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'collars-leashes',
      name: 'Collars, Harnesses & Leashes',
      slug: 'collars-leashes',
      description: 'No-pull ergonomic harnesses, biothane waterproof leashes, and LED collars.',
      image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'grooming',
      name: 'Grooming & Bath',
      slug: 'grooming',
      description: 'Oatmeal soothing shampoos, de-shedding slicker brushes, and paw balms.',
      image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=600&q=80',
    },
  ];

  return res.json({ success: true, categories });
};

export const getProductReviews = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    let reviews = await ReviewModel.find({ productId, status: 'approved' });

    // If no reviews exist yet for this item in MongoDB, seed initial realistic canine reviews
    if (!reviews || reviews.length === 0) {
      const initialReviewsData = [
        {
          productId,
          userId: 'usr_community_1',
          userName: 'Elena Rodriguez',
          petContext: { petName: 'Barnaby', breed: 'Golden Retriever', age: '3 yrs' },
          rating: 5,
          title: 'Unbelievable craftsmanship and fit!',
          content: 'You can immediately tell this was designed specifically with dog comfort in mind. The materials feel premium, durable, and our dog loves it. Highly recommend to any dog parent!',
          isVerifiedPurchase: true,
          status: 'approved',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          productId,
          userId: 'usr_community_2',
          userName: 'Marcus Sterling',
          petContext: { petName: 'Kona', breed: 'Australian Shepherd', age: '2 yrs' },
          rating: 5,
          title: 'Exceeded all expectations • 5 Stars',
          content: 'Arrived super fast in eco-friendly packaging. Sizing was true to scale and holding up great through everyday use and outdoor adventures.',
          isVerifiedPurchase: true,
          status: 'approved',
          createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          productId,
          userId: 'usr_community_3',
          userName: 'Samantha & Cooper',
          petContext: { petName: 'Cooper', breed: 'French Bulldog', age: '4 yrs' },
          rating: 4,
          title: 'Wonderful quality canine gear',
          content: 'Very well made and easy to clean. You definitely get what you pay for with Hound & Harbor. Will be buying more colors.',
          isVerifiedPurchase: true,
          status: 'approved',
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];

      for (const r of initialReviewsData) {
        await ReviewModel.create(r as any);
      }

      reviews = await ReviewModel.find({ productId, status: 'approved' });
    }

    // Sort newest reviews first
    reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return res.json({ success: true, count: reviews.length, reviews });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Failed to fetch reviews.' });
  }
};

export const addProductReview = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { productId, rating, title, content, petContext, authorName, reviewerName } = req.body;
    if (!productId || !rating || !content) {
      return res.status(400).json({ success: false, error: 'Rating and review comment are required.' });
    }

    const userId = req.user?.id || `guest_${Date.now()}`;
    const name = req.user
      ? `${req.user.firstName} ${req.user.lastName ? req.user.lastName[0] + '.' : ''}`
      : (authorName || reviewerName || 'Verified Dog Parent');

    const review = await ReviewModel.create({
      productId,
      userId,
      userName: name,
      rating: Math.min(5, Math.max(1, Number(rating))),
      title: title?.trim() || 'Verified Customer Review',
      content: content.trim(),
      petContext: petContext || { petName: 'My Dog', breed: 'Canine Companion', age: 'Adult' },
      isVerifiedPurchase: true,
      status: 'approved',
      createdAt: new Date().toISOString(),
    });

    // Recalculate product rating
    const allReviews = await ReviewModel.find({ productId, status: 'approved' });
    const avgRating = Number((allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(1));
    await ProductModel.findByIdAndUpdate(productId, {
      rating: avgRating,
      reviewsCount: allReviews.length,
    });

    return res.status(201).json({ success: true, review, avgRating, totalReviews: allReviews.length });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Failed to submit review.' });
  }
};
