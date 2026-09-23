import { PLATFORM_CONFIG } from '../config/constants';
import { IShippingAddress } from '../models/types';

export interface ShippingOption {
  id: 'free' | 'standard' | 'express';
  name: string;
  description: string;
  price: number;
  estimatedDeliveryDays: string;
}

export class ShippingService {
  public static calculateRates(subtotal: number, address?: Partial<IShippingAddress>): ShippingOption[] {
    const isFreeEligible = subtotal >= PLATFORM_CONFIG.FREE_SHIPPING_THRESHOLD;

    const options: ShippingOption[] = [];

    if (isFreeEligible) {
      options.push({
        id: 'free',
        name: 'Free Premium Canine Ground',
        description: `Orders over $${PLATFORM_CONFIG.FREE_SHIPPING_THRESHOLD.toFixed(2)} qualify for free 2-3 business day delivery.`,
        price: 0,
        estimatedDeliveryDays: '2-3 Business Days',
      });
    } else {
      options.push({
        id: 'standard',
        name: 'Standard Ground Delivery',
        description: 'Delivered via USPS / UPS Ground with full parcel tracking.',
        price: PLATFORM_CONFIG.STANDARD_SHIPPING_FEE,
        estimatedDeliveryDays: '3-5 Business Days',
      });
    }

    options.push({
      id: 'express',
      name: 'Hound Expedited Air',
      description: 'Priority handling with guaranteed next-day dispatch.',
      price: PLATFORM_CONFIG.EXPRESS_SHIPPING_FEE,
      estimatedDeliveryDays: '1-2 Business Days',
    });

    return options;
  }
}
