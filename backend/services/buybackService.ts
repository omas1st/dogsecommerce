import { BuybackOfferModel, ProductModel, ResaleListingModel } from '../models';
import { IBuybackOffer, IResaleListing, IProduct } from '../models/types';
import { BuybackStatus, ProductCondition, ProductOwnerType } from '../config/constants';

export class BuybackService {
  /**
   * Generates a calibrated platform buyback offer for certified dog gear
   * (crates, carriers, ramps, orthopedic beds, strollers, agility sets).
   * Note: strictly for pet PRODUCTS and never live animals.
   */
  public static calculateOffer(params: {
    askingPrice: number;
    condition: ProductCondition;
    category: string;
    originalRetailPrice?: number;
  }): { offerAmount: number; estimatedResalePrice: number; marginPercentage: number } {
    const baseRetail = params.originalRetailPrice || params.askingPrice * 1.5;

    let conditionMultiplier = 0.55;
    if (params.condition === ProductCondition.LIKE_NEW) conditionMultiplier = 0.70;
    else if (params.condition === ProductCondition.GOOD) conditionMultiplier = 0.55;
    else if (params.condition === ProductCondition.FAIR) conditionMultiplier = 0.40;

    const estimatedResalePrice = Number((baseRetail * conditionMultiplier).toFixed(2));
    // Platform buys back at ~60-65% of estimated resale price to guarantee a healthy margin for refurbishing & logistics
    const targetBuybackRatio = 0.62;
    const offerAmount = Number((estimatedResalePrice * targetBuybackRatio).toFixed(2));
    const marginPercentage = Number((((estimatedResalePrice - offerAmount) / estimatedResalePrice) * 100).toFixed(1));

    return {
      offerAmount,
      estimatedResalePrice,
      marginPercentage,
    };
  }

  /**
   * Converts inspected & approved buyback gear into official platform-owned certified resale inventory
   */
  public static async convertToPlatformResaleProduct(buyback: IBuybackOffer): Promise<IProduct> {
    const title = `[Certified Pre-Owned] ${buyback.itemTitle}`;
    const slug = `resale-${buyback.itemTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${buyback.id.slice(-4)}`;

    const newProduct = await ProductModel.create({
      title,
      slug,
      description: `Certified Pre-Owned pet gear inspected and approved by the Hound & Harbor logistics hub.\n\nCondition: ${buyback.condition.toUpperCase()}\nInspection Notes: ${buyback.inspectionNotes || 'Thoroughly sanitized and tested for safety and structural integrity.'}`,
      shortDescription: `Platform-inspected and guaranteed certified pre-owned ${buyback.itemCategory}.`,
      price: buyback.estimatedResalePrice,
      compareAtPrice: buyback.askingPrice,
      sku: `RESALE-PLT-${buyback.id.slice(-6).toUpperCase()}`,
      images: buyback.itemPhotos.length > 0 ? buyback.itemPhotos : ['https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80'],
      category: buyback.itemCategory || 'crates-travel',
      brand: buyback.itemBrand || 'Hound & Harbor Certified',
      ownerType: ProductOwnerType.RESALE_PLATFORM,
      condition: buyback.condition,
      variants: [
        {
          id: `var_${buyback.id}`,
          name: 'Standard Pre-Owned',
          sku: `RESALE-${buyback.id.slice(-6).toUpperCase()}`,
          price: buyback.estimatedResalePrice,
          compareAtPrice: buyback.askingPrice,
          stock: 1,
          attributes: { Condition: buyback.condition },
        },
      ],
      stock: 1,
      rating: 4.8,
      reviewsCount: 1,
      tags: ['certified-resale', 'pre-owned', 'eco-friendly', 'inspected'],
      isSubscriptionEligible: false,
      isPublished: true,
      suitability: {
        petTypes: ['dog'],
        lifeStages: ['all_stages'],
        sizes: ['all_sizes'],
      },
    });

    // Update buyback offer with product link
    await BuybackOfferModel.findByIdAndUpdate(buyback.id, {
      status: BuybackStatus.LISTED,
      platformInventoryProductId: newProduct.id,
    });

    return newProduct;
  }
}
