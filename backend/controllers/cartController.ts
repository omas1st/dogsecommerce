import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { CartModel, ProductModel, CouponModel, GiftCardModel, MarketplaceDogModel } from '../models';
import { ICart, ICartItem } from '../models/types';
import { TaxService } from '../services/taxService';
import { ShippingService } from '../services/shippingService';
import { findBackendMarketplaceItem } from '../data/marketplaceCatalog';

const findOrCreateCart = async (req: AuthenticatedRequest): Promise<ICart> => {
  const userId = req.user?.id;
  const guestSessionId = req.guestSessionId || req.headers['x-guest-session-id'] as string;

  if (userId) {
    let cart = await CartModel.findOne({ userId });
    if (!cart) {
      cart = await CartModel.create({
        userId,
        items: [],
        appliedDiscountAmount: 0,
        appliedGiftCardAmount: 0,
        updatedAt: new Date().toISOString(),
      });
    }
    return cart;
  }

  const effectiveGuestId = guestSessionId || `gst_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  let cart = await CartModel.findOne({ guestSessionId: effectiveGuestId });
  if (!cart) {
    cart = await CartModel.create({
      guestSessionId: effectiveGuestId,
      items: [],
      appliedDiscountAmount: 0,
      appliedGiftCardAmount: 0,
      updatedAt: new Date().toISOString(),
    });
  }
  return cart;
};

const calculateCartSummary = (cart: ICart) => {
  const activeItems = cart.items.filter((i) => !i.savedForLater);
  const subtotal = Number(activeItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2));
  const discount = Math.min(subtotal, cart.appliedDiscountAmount || 0);
  const taxableSubtotal = Math.max(0, subtotal - discount);

  const shippingOptions = ShippingService.calculateRates(taxableSubtotal);
  const defaultShipping = 0;
  const { taxAmount, taxRate } = TaxService.calculateTax(taxableSubtotal);

  const preGiftCardTotal = Number((taxableSubtotal + defaultShipping + taxAmount).toFixed(2));
  const giftCardDeduction = Math.min(preGiftCardTotal, cart.appliedGiftCardAmount || 0);
  const total = activeItems.length === 0 ? 0 : Math.max(0, Number((preGiftCardTotal - giftCardDeduction).toFixed(2)));

  return {
    subtotal,
    discount,
    appliedCouponCode: cart.appliedCouponCode,
    appliedGiftCardCode: cart.appliedGiftCardCode,
    giftCardDeduction,
    shippingCost: 0,
    shippingOptions,
    taxAmount,
    taxRate,
    total,
    itemsCount: activeItems.reduce((acc, i) => acc + i.quantity, 0),
  };
};

export const getCart = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const cart = await findOrCreateCart(req);
    const summary = calculateCartSummary(cart);

    return res.json({
      success: true,
      cart,
      summary,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const addToCart = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { productId, variantId, quantity = 1, isSubscription, subscriptionFrequency, productData } = req.body;
    let product: any = await ProductModel.findById(productId);
    if (!product) {
      const marketplaceItem = findBackendMarketplaceItem(productId);
      if (marketplaceItem) {
        product = marketplaceItem;
      } else {
        const dog = await MarketplaceDogModel.findById(productId);
        if (dog) {
          product = {
            id: dog.id,
            title: `Adoption: ${dog.name} (${dog.breed})`,
            slug: `adopt-${dog.id}`,
            images: [dog.photoUrl],
            price: dog.price,
            compareAtPrice: dog.comparePrice,
            sellerId: 'hound_adoption_network',
            sellerName: dog.partnerSource,
            ownerType: 'platform',
            variants: [],
          };
        } else if (productData) {
          product = {
            ...productData,
            images: productData.images || (productData.photoUrl ? [productData.photoUrl] : [productData.image || '']),
            variants: productData.variants || [],
          };
        }
      }
    }
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found.' });
    }

    let unitPrice = product.price;
    let variantName = '';

    if (variantId) {
      const v = product.variants.find((item: any) => item.id === variantId);
      if (v) {
        unitPrice = v.price;
        variantName = v.name;
      }
    }

    // Apply subscription discount if chosen
    if (isSubscription && product.subscriptionDiscountPercentage) {
      unitPrice = Number((unitPrice * (1 - product.subscriptionDiscountPercentage / 100)).toFixed(2));
    }

    const cart = await findOrCreateCart(req);
    const existingIndex = cart.items.findIndex(
      (item) => item.productId === productId && item.variantId === variantId && !item.savedForLater
    );

    const safeQty = Math.max(1, parseInt(quantity) || 1);

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += safeQty;
      if (isSubscription) {
        cart.items[existingIndex].isSubscription = true;
        cart.items[existingIndex].subscriptionFrequency = subscriptionFrequency;
      }
    } else {
      const newItem: ICartItem = {
        productId: product.id,
        variantId,
        title: variantName ? `${product.title} (${variantName})` : product.title,
        slug: product.slug,
        image: product.images[0] || '',
        price: unitPrice,
        originalPrice: product.compareAtPrice || product.price,
        quantity: safeQty,
        sellerId: product.sellerId,
        sellerName: product.sellerName,
        ownerType: product.ownerType,
        isSubscription: !!isSubscription,
        subscriptionFrequency,
        savedForLater: false,
      };
      cart.items.push(newItem);
    }

    const updated = await CartModel.findByIdAndUpdate(cart.id, {
      items: cart.items,
      updatedAt: new Date().toISOString(),
    });

    const summary = calculateCartSummary(updated!);
    return res.json({ success: true, cart: updated, summary });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const updateCartItem = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { productId, variantId, quantity, savedForLater } = req.body;
    const cart = await findOrCreateCart(req);

    const item = cart.items.find((i) => i.productId === productId && i.variantId === variantId);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Item not in cart.' });
    }

    if (quantity !== undefined) {
      if (quantity <= 0) {
        cart.items = cart.items.filter((i) => !(i.productId === productId && i.variantId === variantId));
      } else {
        item.quantity = quantity;
      }
    }

    if (savedForLater !== undefined) {
      item.savedForLater = !!savedForLater;
    }

    const updated = await CartModel.findByIdAndUpdate(cart.id, {
      items: cart.items,
      updatedAt: new Date().toISOString(),
    });

    const summary = calculateCartSummary(updated!);
    return res.json({ success: true, cart: updated, summary });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const removeFromCart = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { productId, variantId } = req.body;
    const cart = await findOrCreateCart(req);

    cart.items = cart.items.filter((i) => !(i.productId === productId && i.variantId === variantId));

    const updated = await CartModel.findByIdAndUpdate(cart.id, {
      items: cart.items,
      updatedAt: new Date().toISOString(),
    });

    const summary = calculateCartSummary(updated!);
    return res.json({ success: true, cart: updated, summary });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const applyCoupon = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ success: false, error: 'Coupon code required.' });

    const coupon = await CouponModel.findOne({ code: code.toUpperCase().trim(), isActive: true });
    if (!coupon) {
      return res.status(404).json({ success: false, error: 'Invalid or expired promotional code.' });
    }

    const cart = await findOrCreateCart(req);
    const activeItems = cart.items.filter((i) => !i.savedForLater);
    const subtotal = activeItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
      return res.status(400).json({
        success: false,
        error: `This coupon requires a minimum subtotal of $${coupon.minOrderAmount.toFixed(2)}.`,
      });
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = Number(((subtotal * coupon.discountValue) / 100).toFixed(2));
    } else if (coupon.discountType === 'fixed') {
      discountAmount = Math.min(subtotal, coupon.discountValue);
    }

    const updated = await CartModel.findByIdAndUpdate(cart.id, {
      appliedCouponCode: coupon.code,
      appliedDiscountAmount: discountAmount,
      updatedAt: new Date().toISOString(),
    });

    const summary = calculateCartSummary(updated!);
    return res.json({ success: true, cart: updated, summary, message: `Coupon applied: saved $${discountAmount.toFixed(2)}!` });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const applyGiftCard = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ success: false, error: 'Gift card code required.' });

    const card = await GiftCardModel.findOne({ code: code.toUpperCase().trim(), status: 'active' });
    if (!card || card.currentBalance <= 0) {
      return res.status(404).json({ success: false, error: 'Gift card not found or has zero balance.' });
    }

    const cart = await findOrCreateCart(req);
    const updated = await CartModel.findByIdAndUpdate(cart.id, {
      appliedGiftCardCode: card.code,
      appliedGiftCardAmount: card.currentBalance,
      updatedAt: new Date().toISOString(),
    });

    const summary = calculateCartSummary(updated!);
    return res.json({
      success: true,
      cart: updated,
      summary,
      message: `Gift card applied! $${card.currentBalance.toFixed(2)} available.`,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
