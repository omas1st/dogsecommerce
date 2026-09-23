import bcrypt from 'bcryptjs';
import { db } from '../config/db';
import { defaultDogsList } from './defaultDogs';
import { defaultProductsList } from './defaultProducts';
import {
  UserModel,
  PetModel,
  ProductModel,
  OrderModel,
  SubscriptionModel,
  SellerModel,
  ResaleListingModel,
  BuybackOfferModel,
  GiftCardModel,
  CouponModel,
  AdminSettingsModel,
  ReviewModel,
  MarketplaceDogModel,
} from '../models';
import { defaultMarketplaceDogs } from './marketplaceDogs';
import {
  UserRole,
  ProductOwnerType,
  ProductCondition,
  BuybackStatus,
  OrderStatus,
  PaymentStatus,
  SellerStatus,
  SubscriptionFrequency,
  SubscriptionStatus,
} from '../config/constants';

export const seedDatabase = async () => {
  console.log('[Seed] Initializing Hound & Harbor production catalog & accounts...');

  // 1. Admin Account
  const envAdminEmail = (process.env.ADMIN_EMAIL || 'omas7th@gmail.com').toLowerCase().trim();
  const envAdminPassword = process.env.ADMIN_PASSWORD || '@Stephen1st';
  const passwordHashAdmin = await bcrypt.hash(envAdminPassword, 10);
  const passwordHashCustomer = await bcrypt.hash('CustomerPass123!', 10);

  let admin = await UserModel.findOne({ email: envAdminEmail });
  if (!admin) {
    admin = await UserModel.create({
      email: envAdminEmail,
      passwordHash: passwordHashAdmin,
      firstName: 'Omas',
      lastName: 'Admin',
      phone: '+1 (415) 890-4412',
      role: UserRole.SUPER_ADMIN,
      isEmailVerified: true,
      rewardPoints: 10000,
      totalSpent: 0,
      ordersCount: 0,
      status: 'active',
      referralCode: 'HOUND-OMAS-ADM1',
    });
  } else {
    await UserModel.findByIdAndUpdate(admin.id, {
      role: UserRole.SUPER_ADMIN,
      passwordHash: passwordHashAdmin,
      status: 'active',
    });
  }

  // 2. Demo Customer Account
  let customer = await UserModel.findOne({ email: 'sarah.jenkins@example.com' });
  if (!customer) {
    customer = await UserModel.create({
      email: 'sarah.jenkins@example.com',
      passwordHash: passwordHashCustomer,
      firstName: 'Sarah',
      lastName: 'Jenkins',
      phone: '+1 (512) 670-9921',
      role: UserRole.CUSTOMER,
      isEmailVerified: true,
      rewardPoints: 450,
      totalSpent: 389.5,
      ordersCount: 4,
      status: 'active',
      referralCode: 'HOUND-SARAH-941',
      addresses: [
        {
          id: 'addr-1',
          isDefault: true,
          fullName: 'Sarah Jenkins',
          streetAddress: '742 Evergreen Terrace',
          apartment: 'Apt 4B',
          city: 'Austin',
          state: 'TX',
          zipCode: '78704',
          country: 'United States',
          phone: '+1 (512) 670-9921',
        },
      ],
      savedPaymentMethods: [
        {
          id: 'pm-1',
          brand: 'Visa',
          last4: '4242',
          expMonth: 12,
          expYear: 2028,
          isDefault: true,
        },
      ],
    });
  }

  // 3. Partner Marketplace Seller
  let sellerUser = await UserModel.findOne({ email: 'artisan@timberhound.com' });
  if (!sellerUser) {
    sellerUser = await UserModel.create({
      email: 'artisan@timberhound.com',
      passwordHash: passwordHashCustomer,
      firstName: 'Marcus',
      lastName: 'Vance',
      phone: '+1 (206) 441-8930',
      role: UserRole.SELLER,
      isEmailVerified: true,
      rewardPoints: 100,
      totalSpent: 0,
      ordersCount: 0,
      status: 'active',
      referralCode: 'TIMBER-SELLER-1',
    });
  }

  let seller = await SellerModel.findOne({ slug: 'timber-trail-canines' });
  if (!seller) {
    seller = await SellerModel.create({
      userId: sellerUser.id,
      storeName: 'Timber & Trail Artisan Canines',
      slug: 'timber-trail-canines',
      description: 'Hand-stitched full-grain bridle leather collars, biothane mountain gear, and organic small-batch training treats from the Pacific Northwest.',
      contactEmail: 'artisan@timberhound.com',
      phone: '+1 (206) 441-8930',
      businessAddress: '1420 Pine St, Seattle, WA 98101',
      businessType: 'llc',
      status: SellerStatus.APPROVED,
      commissionRate: 0.12,
      rating: 4.9,
      totalSales: 48,
      totalRevenue: 3420.0,
      pendingPayout: 384.5,
      availablePayout: 384.5,
      paidPayoutTotal: 2620.0,
      bankAccountLast4: '9012',
    });
  }

  // 4. Seed 50 Default Dogs Details
  console.log(`[Seed] Checking and populating 50 default canine profiles...`);
  let maxPet: any = null;
  for (const dogData of defaultDogsList) {
    let pet = await PetModel.findOne({ name: dogData.name, breed: dogData.breed });
    if (!pet) {
      pet = await PetModel.create({
        userId: customer.id,
        name: dogData.name,
        type: dogData.type,
        breed: dogData.breed,
        gender: dogData.gender,
        isNeuteredOrSpayed: dogData.isNeuteredOrSpayed,
        ageYears: dogData.ageYears,
        ageMonths: dogData.ageMonths,
        weightLbs: dogData.weightLbs,
        size: dogData.size,
        activityLevel: dogData.activityLevel,
        dietType: dogData.dietType,
        allergies: dogData.allergies,
        foodPreferences: dogData.foodPreferences,
        specialNeeds: dogData.specialNeeds,
        photoUrl: dogData.photoUrl,
        notes: dogData.notes,
        favoriteProductIds: [],
      });
    }
    if (dogData.name === 'Max') {
      maxPet = pet;
    }
  }

  // 5. Products Catalog (Expanded multi-category catalog)
  console.log(`[Seed] Checking and populating expanded product catalog...`);
  for (const productData of defaultProductsList) {
    const existing = await ProductModel.findOne({ slug: productData.slug });
    if (!existing) {
      const isSellerProduct = productData.brand?.includes('Timber & Trail');
      const prod = await ProductModel.create({
        ...productData,
        sellerId: isSellerProduct ? seller.id : undefined,
        sellerName: isSellerProduct ? seller.storeName : undefined,
      } as any);

      // Seed Reviews for key products
      if (prod.rating && prod.rating >= 4.8) {
        await ReviewModel.create({
          productId: prod.id,
          userId: customer.id,
          userName: 'Sarah J.',
          petContext: {
            petName: 'Max',
            breed: 'Golden Retriever',
            age: '3 yrs',
          },
          rating: 5,
          title: `Remarkable quality for ${prod.title.split(' ')[0]}!`,
          content: `Our veterinary nutrition team and Max both love this. You can immediately feel the craftsmanship and purity of ingredients compared to grocery store brands. Essential part of our monthly routine!`,
          isVerifiedPurchase: true,
          status: 'approved',
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        });
      }
    } else {
      await ProductModel.findByIdAndUpdate(existing.id, {
        price: productData.price,
        compareAtPrice: productData.compareAtPrice,
        variants: productData.variants,
      });
    }
  }

  // 6. Seed Promotional Coupons
  let coupon = await CouponModel.findOne({ code: 'WELCOME15' });
  if (!coupon) {
    await CouponModel.create({
      code: 'WELCOME15',
      discountType: 'percentage',
      discountValue: 15,
      minOrderAmount: 30,
      usageLimit: 1000,
      usageCount: 24,
      startDate: new Date().toISOString(),
      isActive: true,
      description: '15% off your first order over $30',
    });
  }

  let freeShipCoupon = await CouponModel.findOne({ code: 'FREESHIP' });
  if (!freeShipCoupon) {
    await CouponModel.create({
      code: 'FREESHIP',
      discountType: 'free_shipping',
      discountValue: 5.99,
      minOrderAmount: 25,
      usageLimit: 500,
      usageCount: 12,
      startDate: new Date().toISOString(),
      isActive: true,
      description: 'Free standard ground shipping on orders $25+',
    });
  }

  // 7. Seed Gift Cards
  let sampleGiftCard = await GiftCardModel.findOne({ code: 'HND-GIFT-50' });
  if (!sampleGiftCard) {
    await GiftCardModel.create({
      code: 'HND-GIFT-50',
      initialAmount: 50.0,
      currentBalance: 50.0,
      recipientEmail: customer.email,
      recipientName: 'Sarah Jenkins',
      senderName: 'David Jenkins',
      message: 'Happy birthday to Max & Bella! Enjoy some premium gear.',
      isDigital: true,
      status: 'active',
    });
  }

  // 8. Seed Sample Customer Order & Active Subscription
  const salmonFood = await ProductModel.findOne({ slug: 'wild-alaskan-salmon-sweet-potato-kibble' });
  if (salmonFood) {
    const existingOrder = await OrderModel.findOne({ userId: customer.id });
    if (!existingOrder) {
      await OrderModel.create({
        orderNumber: 'HND-2026-881920',
        userId: customer.id,
        isGuest: false,
        customerName: 'Sarah Jenkins',
        customerEmail: customer.email,
        customerPhone: customer.phone,
        shippingAddress: customer.addresses![0],
        shippingMethod: 'free',
        items: [
          {
            productId: salmonFood.id,
            title: salmonFood.title,
            sku: salmonFood.sku,
            image: salmonFood.images[0],
            price: 67.49, // 10% subscription price
            quantity: 1,
            total: 67.49,
            ownerType: ProductOwnerType.PLATFORM,
            fulfillmentType: 'platform_warehouse' as any,
            commissionRate: 0,
            platformFee: 67.49,
            sellerEarnings: 0,
            status: OrderStatus.DELIVERED,
            trackingNumber: '1Z9999999999999999',
            carrier: 'UPS Ground',
          },
        ],
        subtotal: 67.49,
        discountTotal: 0,
        shippingCost: 0,
        taxAmount: 5.57,
        taxRate: 0.0825,
        total: 73.06,
        paymentMethod: 'Visa **** 4242',
        paymentStatus: PaymentStatus.PAID,
        orderStatus: OrderStatus.DELIVERED,
        petId: maxPet?.id,
        petName: maxPet?.name,
        timeline: [
          { status: OrderStatus.PENDING, timestamp: new Date(Date.now() - 27 * 24 * 60 * 60 * 1000).toISOString(), note: 'Order placed' },
          { status: OrderStatus.CONFIRMED, timestamp: new Date(Date.now() - 27 * 24 * 60 * 60 * 1000).toISOString(), note: 'Payment captured' },
          { status: OrderStatus.SHIPPED, timestamp: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(), note: 'Shipped from Dallas hub' },
          { status: OrderStatus.DELIVERED, timestamp: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000).toISOString(), note: 'Delivered to front porch' },
        ],
        createdAt: new Date(Date.now() - 27 * 24 * 60 * 60 * 1000).toISOString(),
      });

      // Also create an active subscription for Max's food
      await SubscriptionModel.create({
        userId: customer.id,
        petId: maxPet?.id,
        petName: maxPet?.name,
        productId: salmonFood.id,
        productTitle: salmonFood.title,
        productImage: salmonFood.images[0],
        quantity: 1,
        pricePerUnit: 67.49,
        discountPercentage: 10,
        totalPerDelivery: 67.49,
        frequency: SubscriptionFrequency.MONTHLY,
        status: SubscriptionStatus.ACTIVE,
        nextBillingDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        nextDeliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        shippingAddress: customer.addresses![0],
        paymentMethodLast4: '4242',
      });
    }
  }

  // 9. Seed Resale Listings & Buyback Offer
  let resaleListing = await ResaleListingModel.findOne({ title: 'Ruffwear Approach Dog Backpack (Size L/XL)' });
  if (!resaleListing) {
    resaleListing = await ResaleListingModel.create({
      sellerId: customer.id,
      sellerName: 'Sarah Jenkins',
      title: 'Ruffwear Approach Dog Backpack (Size L/XL)',
      category: 'crates-travel',
      brand: 'Ruffwear',
      condition: ProductCondition.LIKE_NEW,
      conditionDescription: 'Used on two light trail walks with Max. Zero tears, clean buckles, looks brand new.',
      askingPrice: 65.0,
      originalRetailPrice: 110.0,
      images: ['https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80'],
      dimensions: 'Fits 32"-42" dog girth',
      status: 'active',
      isPlatformOwned: false,
      buybackEligible: true,
    });

    await BuybackOfferModel.create({
      listingId: resaleListing.id,
      sellerId: customer.id,
      sellerName: 'Sarah Jenkins',
      sellerEmail: customer.email,
      itemTitle: resaleListing.title,
      itemCategory: resaleListing.category,
      itemBrand: resaleListing.brand,
      condition: resaleListing.condition,
      itemConditionNotes: resaleListing.conditionDescription,
      itemPhotos: resaleListing.images,
      askingPrice: 65.0,
      platformOfferAmount: 48.0,
      estimatedResalePrice: 77.0,
      status: BuybackStatus.OFFER_PENDING,
      timeline: [
        {
          status: BuybackStatus.OFFER_PENDING,
          timestamp: new Date().toISOString(),
          note: 'Hound & Harbor instant buyback appraisal generated: $48.00 prepaid payout offer ready for Sarah.',
        },
      ],
    });
  }

  // 10. Seed Admin Settings
  let settings = await AdminSettingsModel.findOne();
  if (!settings) {
    await AdminSettingsModel.create({
      storeName: 'Hound & Harbor',
      supportEmail: 'care@houndandharbor.com',
      contactPhone: '+1 (800) 555-4686',
      marketplaceCommission: 0.12,
      freeShippingThreshold: 49.0,
      standardShippingFee: 5.99,
      expressShippingFee: 2.00,
      taxRateDefault: 0.07,
      loyaltyPointsPerDollar: 5,
      enableGuestCheckout: true,
      enableAutoBuybackOffers: true,
      buybackMarginTarget: 0.38,
      lowStockThreshold: 10,
      updatedAt: new Date().toISOString(),
    });
  }

  // 11. Seed Marketplace 100 Dogs across all sizes with Chewy and Petco partner ties
  const existingDogs = await MarketplaceDogModel.find();
  if (existingDogs.length < 100) {
    for (const dog of defaultMarketplaceDogs) {
      const exists = await MarketplaceDogModel.findById(dog.id);
      if (!exists) {
        await MarketplaceDogModel.create(dog);
      }
    }
    console.log(`[Seed] 100 Marketplace Dogs populated successfully across all sizes (toy, small, medium, large, giant).`);
  }

  db.flush();
  console.log('[Seed] Seeding completed successfully!');
};

