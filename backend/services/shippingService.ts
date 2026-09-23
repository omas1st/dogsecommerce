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
    const options: ShippingOption[] = [
      {
        id: 'free',
        name: 'Free US Ground Shipping',
        description: 'Delivered in 2-4 business days via UPS / FedEx Ground.',
        price: 0,
        estimatedDeliveryDays: '2-4 Business Days',
      },
      {
        id: 'express',
        name: 'Expedited Priority Air',
        description: 'Priority handling with guaranteed 1-2 business days dispatch.',
        price: PLATFORM_CONFIG.EXPRESS_SHIPPING_FEE,
        estimatedDeliveryDays: '1-2 Business Days',
      },
    ];

    return options;
  }
}
