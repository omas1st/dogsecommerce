import { OrderModel, ProductModel, PetModel } from '../models';
import { IOrder, IProduct, IPet } from '../models/types';

export interface SmartReorderAlert {
  petId?: string;
  petName: string;
  product: IProduct;
  lastOrderedDate: string;
  daysSinceLastOrder: number;
  expectedConsumptionDays: number;
  isUrgent: boolean;
  message: string;
}

export class ReorderService {
  public static async getUserReorderAlerts(userId: string): Promise<SmartReorderAlert[]> {
    const orders = await OrderModel.find({ userId });
    const pets = await PetModel.find({ userId });
    const alerts: SmartReorderAlert[] = [];

    // Map recent items ordered
    const orderedProductsMap = new Map<string, { order: IOrder; orderDate: string; quantity: number }>();
    for (const ord of orders) {
      for (const item of ord.items) {
        if (!orderedProductsMap.has(item.productId)) {
          orderedProductsMap.set(item.productId, { order: ord, orderDate: ord.createdAt, quantity: item.quantity });
        }
      }
    }

    const now = Date.now();
    for (const [productId, orderInfo] of orderedProductsMap.entries()) {
      const product = await ProductModel.findById(productId);
      if (!product || !product.isSubscriptionEligible) continue;

      const orderTime = new Date(orderInfo.orderDate).getTime();
      const daysSince = Math.floor((now - orderTime) / (1000 * 60 * 60 * 24));

      // Calculate consumption timeline based on product category & dog weight
      let expectedDays = 30 * orderInfo.quantity;
      if (product.category === 'dog-food') {
        expectedDays = 28 * orderInfo.quantity;
      } else if (product.category === 'dog-treats') {
        expectedDays = 21 * orderInfo.quantity;
      } else if (product.category === 'health-supplements') {
        expectedDays = 30 * orderInfo.quantity;
      }

      // Check if pet profile associated with this order
      const associatedPet = pets.find((p) => p.id === orderInfo.order.petId) || pets[0];
      const petName = associatedPet ? associatedPet.name : 'your dog';

      if (daysSince >= expectedDays - 5) {
        alerts.push({
          petId: associatedPet?.id,
          petName,
          product,
          lastOrderedDate: orderInfo.orderDate,
          daysSinceLastOrder: daysSince,
          expectedConsumptionDays: expectedDays,
          isUrgent: daysSince >= expectedDays,
          message: `${petName} may be running low on ${product.title}. Your last order was ${daysSince} days ago.`,
        });
      }
    }

    return alerts;
  }
}
