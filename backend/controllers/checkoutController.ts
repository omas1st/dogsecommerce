import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import {
  CartModel,
  OrderModel,
  ProductModel,
  SubscriptionModel,
  GiftCardModel,
  UserModel,
  NotificationModel,
} from '../models';
import { IOrder, IOrderItem, IShippingAddress } from '../models/types';
import { OrderStatus, PaymentStatus, ProductOwnerType, FulfillmentType, PLATFORM_CONFIG } from '../config/constants';
import { PaymentService } from '../services/paymentService';
import { ShippingService } from '../services/shippingService';
import { TaxService } from '../services/taxService';
import { MarketplaceService } from '../services/marketplaceService';
import { NotificationService } from '../services/notificationService';
import { mailService } from '../services/mailService';

export const createPaymentIntent = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { amount, currency = 'USD', paymentMethodType = 'credit_card' } = req.body;
    const intent = await PaymentService.createPaymentIntent({
      amount: Number(amount) || 10,
      currency,
      paymentMethodType,
    });
    return res.json({ success: true, ...intent });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const placeOrder = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      guestEmail,
      customerEmail,
      email,
      customerName,
      customerPhone,
      shippingAddress,
      billingAddress,
      shippingMethod = 'standard',
      paymentMethod = 'credit_card',
      paymentIntentId,
      cardDetails,
      petId,
      petName,
      notes,
    } = req.body;

    const user = req.user;
    const isGuest = !user;
    const guestSessionId = req.guestSessionId || (req.headers['x-guest-session-id'] as string);

    // Validate email
    const finalEmail = user ? user.email : (guestEmail || customerEmail || email || '').toLowerCase().trim();
    if (!finalEmail || !customerName || !shippingAddress || !shippingAddress.streetAddress || !shippingAddress.zipCode) {
      return res.status(400).json({
        success: false,
        error: 'Missing required checkout information: contact name, valid email, and complete shipping address.',
      });
    }

    // Get Cart
    const cart = user
      ? await CartModel.findOne({ userId: user.id })
      : await CartModel.findOne({ guestSessionId });

    if (!cart || cart.items.filter((i) => !i.savedForLater).length === 0) {
      return res.status(400).json({ success: false, error: 'Your cart is empty. Please add products to checkout.' });
    }

    const activeItems = cart.items.filter((i) => !i.savedForLater);

    // Calculate subtotal
    const subtotal = Number(activeItems.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2));
    const discountTotal = Math.min(subtotal, cart.appliedDiscountAmount || 0);
    const taxableSubtotal = Math.max(0, subtotal - discountTotal);

    // Shipping: Free standard ground shipping on all orders; $2.00 for express priority air
    const shippingCost = shippingMethod === 'express' ? 2.00 : 0.00;

    // Tax
    const { taxAmount, taxRate } = TaxService.calculateTax(taxableSubtotal, shippingAddress.state);

    // Subtotal before gift card
    const preGiftTotal = Number((taxableSubtotal + shippingCost + taxAmount).toFixed(2));

    // Gift card calculation
    let giftCardDeduction = 0;
    if (cart.appliedGiftCardCode && cart.appliedGiftCardAmount > 0) {
      const giftCard = await GiftCardModel.findOne({ code: cart.appliedGiftCardCode, status: 'active' });
      if (giftCard && giftCard.currentBalance > 0) {
        giftCardDeduction = Math.min(preGiftTotal, giftCard.currentBalance);
        // Deduct from gift card
        const newBalance = Number((giftCard.currentBalance - giftCardDeduction).toFixed(2));
        await GiftCardModel.findByIdAndUpdate(giftCard.id, {
          currentBalance: newBalance,
          status: newBalance <= 0 ? 'redeemed' : 'active',
        });
      }
    }

    const finalPayableTotal = Math.max(0, Number((preGiftTotal - giftCardDeduction).toFixed(2)));

    // Process Payment
    let paymentResult;
    if (finalPayableTotal > 0) {
      paymentResult = await PaymentService.confirmPayment({
        paymentIntentId: paymentIntentId || `pi_auto_${Date.now()}`,
        paymentMethodType: paymentMethod,
        tokenOrCardDetails: cardDetails,
        amount: finalPayableTotal,
      });

      if (!paymentResult.success) {
        return res.status(400).json({
          success: false,
          error: paymentResult.errorMessage || 'Payment authorization failed. Please verify your payment details.',
        });
      }
    }

    // Build Order Items
    const orderItems: IOrderItem[] = [];
    for (const item of activeItems) {
      const product = await ProductModel.findById(item.productId);
      const isSellerOwned = item.ownerType === ProductOwnerType.SELLER;
      const commissionRate = isSellerOwned ? PLATFORM_CONFIG.DEFAULT_COMMISSION_RATE : 0;
      const itemTotal = Number((item.price * item.quantity).toFixed(2));
      const platformFee = isSellerOwned ? Number((itemTotal * commissionRate).toFixed(2)) : itemTotal;
      const sellerEarnings = isSellerOwned ? Number((itemTotal - platformFee).toFixed(2)) : 0;

      orderItems.push({
        productId: item.productId,
        variantId: item.variantId,
        title: item.title,
        sku: product?.sku || `SKU-${item.productId.slice(-4)}`,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
        total: itemTotal,
        sellerId: item.sellerId,
        sellerName: item.sellerName,
        ownerType: item.ownerType,
        fulfillmentType: isSellerOwned ? FulfillmentType.SELLER_DIRECT : FulfillmentType.PLATFORM_WAREHOUSE,
        commissionRate,
        platformFee,
        sellerEarnings,
        status: OrderStatus.CONFIRMED,
      });

      // Update Inventory
      if (product) {
        const newStock = Math.max(0, product.stock - item.quantity);
        await ProductModel.findByIdAndUpdate(product.id, { stock: newStock });
      }

      // If item was added with subscription, create subscription record
      if (item.isSubscription && user) {
        await SubscriptionModel.create({
          userId: user.id,
          petId,
          petName,
          productId: item.productId,
          variantId: item.variantId,
          productTitle: item.title,
          productImage: item.image,
          quantity: item.quantity,
          pricePerUnit: item.price,
          discountPercentage: product?.subscriptionDiscountPercentage || 10,
          totalPerDelivery: itemTotal,
          frequency: item.subscriptionFrequency || ('monthly' as any),
          status: 'active' as any,
          nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          nextDeliveryDate: new Date(Date.now() + 32 * 24 * 60 * 60 * 1000).toISOString(),
          shippingAddress,
          paymentMethodLast4: paymentResult?.last4 || '4242',
        });
      }
    }

    // Generate Order Number
    const orderNumber = `HND-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const orderData: Partial<IOrder> = {
      orderNumber,
      userId: user?.id,
      guestEmail: isGuest ? finalEmail : undefined,
      guestSessionId: isGuest ? guestSessionId : undefined,
      isGuest,
      customerName,
      customerEmail: finalEmail,
      customerPhone,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      shippingMethod: shippingMethod as any,
      items: orderItems,
      subtotal,
      discountTotal,
      couponCode: cart.appliedCouponCode,
      giftCardCode: cart.appliedGiftCardCode,
      giftCardAmount: giftCardDeduction,
      shippingCost,
      taxAmount,
      taxRate,
      total: finalPayableTotal,
      paymentMethod: paymentResult ? `${paymentResult.brand} **** ${paymentResult.last4}` : 'Gift Card / Store Credit',
      paymentStatus: PaymentStatus.PAID,
      orderStatus: OrderStatus.CONFIRMED,
      petId,
      petName,
      notes,
      timeline: [
        {
          status: OrderStatus.PENDING,
          timestamp: new Date(Date.now() - 2000).toISOString(),
          note: 'Order submitted by customer',
        },
        {
          status: OrderStatus.CONFIRMED,
          timestamp: new Date().toISOString(),
          note: `Payment authorized via ${paymentResult?.brand || 'Payment Gateway'}. Sent to fulfillment dispatch.`,
        },
      ],
    };

    const newOrder = await OrderModel.create(orderData);

    // Multi-seller vendor split handling
    const { breakdowns } = await MarketplaceService.splitOrderForSellers(newOrder);
    if (breakdowns.length > 0) {
      await OrderModel.findByIdAndUpdate(newOrder.id, { sellerOrderBreakdowns: breakdowns });
    }

    // Reward Points for Registered Users (5 points per dollar)
    if (user) {
      const earnedPoints = Math.floor(finalPayableTotal * PLATFORM_CONFIG.POINTS_PER_DOLLAR);
      await UserModel.findByIdAndUpdate(user.id, {
        rewardPoints: (user.rewardPoints || 0) + earnedPoints,
        totalSpent: Number(((user.totalSpent || 0) + finalPayableTotal).toFixed(2)),
        ordersCount: (user.ordersCount || 0) + 1,
      });

      await NotificationService.send({
        userId: user.id,
        title: `Order ${orderNumber} Confirmed!`,
        message: `Thank you for your order. You earned ${earnedPoints} Paw Loyalty Points! Track your package in your dashboard.`,
        type: 'order',
        link: `/account/orders/${newOrder.id}`,
      });
    }

    // Clear Active Cart Items
    await CartModel.findByIdAndUpdate(cart.id, {
      items: cart.items.filter((i) => i.savedForLater),
      appliedCouponCode: undefined,
      appliedDiscountAmount: 0,
      appliedGiftCardCode: undefined,
      appliedGiftCardAmount: 0,
      updatedAt: new Date().toISOString(),
    });

    // Send automated email notification to Admin & Customer
    mailService.notifyAdminNewOrder(newOrder).catch((e) => {
      console.warn('[MailService] Order notification email error:', e.message);
    });

    return res.status(201).json({
      success: true,
      order: newOrder,
      orderNumber,
      message: 'Order placed successfully.',
    });
  } catch (err: any) {
    console.error('Order placement error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to complete order checkout.' });
  }
};
