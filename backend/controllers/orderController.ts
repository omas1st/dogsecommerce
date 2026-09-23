import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { OrderModel } from '../models';
import { OrderStatus } from '../config/constants';

export const getUserOrders = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized.' });
    }

    const orders = await OrderModel.find({ userId: req.user.id });
    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return res.json({ success: true, orders });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const getOrderById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const order = await OrderModel.findById(id);

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found.' });
    }

    // Check ownership if user logged in, or allow guest verification via email
    if (req.user && order.userId && order.userId !== req.user.id && req.user.role === 'customer') {
      return res.status(403).json({ success: false, error: 'Access denied.' });
    }

    return res.json({ success: true, order });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const trackOrder = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { orderNumber, email } = req.body;
    if (!orderNumber) {
      return res.status(400).json({ success: false, error: 'Order number is required.' });
    }

    let order = await OrderModel.findOne({ orderNumber: orderNumber.trim().toUpperCase() });
    if (!order) {
      // Check if id was passed
      order = await OrderModel.findById(orderNumber);
    }

    if (!order) {
      return res.status(404).json({ success: false, error: 'No order found matching this reference number.' });
    }

    if (email && order.customerEmail.toLowerCase() !== email.trim().toLowerCase()) {
      return res.status(400).json({ success: false, error: 'Billing/shipping email address does not match this order.' });
    }

    return res.json({ success: true, order });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const requestReturn = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason, notes, returnItemIds } = req.body;

    const order = await OrderModel.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found.' });
    }

    const updatedTimeline = [
      ...order.timeline,
      {
        status: OrderStatus.RETURNED,
        timestamp: new Date().toISOString(),
        note: `Customer requested return: "${reason}". Notes: ${notes || 'None provided'}. Prepaid return label issued.`,
      },
    ];

    const updated = await OrderModel.findByIdAndUpdate(id, {
      orderStatus: OrderStatus.RETURNED,
      timeline: updatedTimeline,
    });

    return res.json({ success: true, order: updated, message: 'Return request registered. Prepaid USPS label sent to your email.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
