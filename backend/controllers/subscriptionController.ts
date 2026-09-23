import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { SubscriptionModel, ProductModel } from '../models';
import { SubscriptionStatus } from '../config/constants';

export const getUserSubscriptions = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized.' });
    const subscriptions = await SubscriptionModel.find({ userId: req.user.id });
    return res.json({ success: true, subscriptions });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const updateSubscription = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized.' });
    const { id } = req.params;
    const { status, frequency, quantity, nextDeliveryDate } = req.body;

    const sub = await SubscriptionModel.findById(id);
    if (!sub || sub.userId !== req.user.id) {
      return res.status(404).json({ success: false, error: 'Subscription not found.' });
    }

    const updates: any = {};
    if (status) updates.status = status;
    if (frequency) updates.frequency = frequency;
    if (quantity) {
      updates.quantity = quantity;
      updates.totalPerDelivery = Number((sub.pricePerUnit * quantity).toFixed(2));
    }
    if (nextDeliveryDate) updates.nextDeliveryDate = nextDeliveryDate;

    const updated = await SubscriptionModel.findByIdAndUpdate(id, updates);
    return res.json({ success: true, subscription: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const cancelSubscription = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized.' });
    const { id } = req.params;
    const sub = await SubscriptionModel.findById(id);

    if (!sub || sub.userId !== req.user.id) {
      return res.status(404).json({ success: false, error: 'Subscription not found.' });
    }

    const updated = await SubscriptionModel.findByIdAndUpdate(id, {
      status: SubscriptionStatus.CANCELLED,
    });

    return res.json({ success: true, subscription: updated, message: 'Subscription successfully cancelled.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
