import { SellerModel, SellerPayoutModel, OrderModel } from '../models';
import { ISeller, IOrder, IOrderItem } from '../models/types';
import { PLATFORM_CONFIG, OrderStatus, ProductOwnerType } from '../config/constants';

export class MarketplaceService {
  public static async splitOrderForSellers(order: IOrder): Promise<{
    breakdowns: {
      sellerId: string;
      sellerName: string;
      itemsSubtotal: number;
      commissionRate: number;
      platformFee: number;
      sellerNetEarnings: number;
      status: OrderStatus;
    }[];
  }> {
    const sellerMap = new Map<string, { sellerName: string; items: IOrderItem[]; subtotal: number }>();

    for (const item of order.items) {
      if (item.ownerType === ProductOwnerType.SELLER && item.sellerId) {
        const current = sellerMap.get(item.sellerId) || {
          sellerName: item.sellerName || 'Partner Seller',
          items: [],
          subtotal: 0,
        };
        current.items.push(item);
        current.subtotal += item.total;
        sellerMap.set(item.sellerId, current);
      }
    }

    const breakdowns: any[] = [];
    for (const [sellerId, data] of sellerMap.entries()) {
      const seller = await SellerModel.findById(sellerId);
      const commissionRate = seller ? seller.commissionRate : PLATFORM_CONFIG.DEFAULT_COMMISSION_RATE;
      const platformFee = Number((data.subtotal * commissionRate).toFixed(2));
      const sellerNetEarnings = Number((data.subtotal - platformFee).toFixed(2));

      breakdowns.push({
        sellerId,
        sellerName: data.sellerName,
        itemsSubtotal: data.subtotal,
        commissionRate,
        platformFee,
        sellerNetEarnings,
        status: OrderStatus.CONFIRMED,
      });

      // Update seller balances
      if (seller) {
        await SellerModel.findByIdAndUpdate(seller.id, {
          totalSales: (seller.totalSales || 0) + data.items.length,
          totalRevenue: Number(((seller.totalRevenue || 0) + data.subtotal).toFixed(2)),
          pendingPayout: Number(((seller.pendingPayout || 0) + sellerNetEarnings).toFixed(2)),
        });
      }
    }

    return { breakdowns };
  }
}
