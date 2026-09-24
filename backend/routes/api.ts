import { Router } from 'express';
import { authOptional, requireAuth, requireAdmin, requireSeller } from '../middleware/auth';
import * as authCtrl from '../controllers/authController';
import * as productCtrl from '../controllers/productController';
import * as petCtrl from '../controllers/petController';
import * as cartCtrl from '../controllers/cartController';
import * as checkoutCtrl from '../controllers/checkoutController';
import * as orderCtrl from '../controllers/orderController';
import * as subCtrl from '../controllers/subscriptionController';
import * as marketCtrl from '../controllers/marketplaceController';
import * as sellerCtrl from '../controllers/sellerDashboardController';
import * as adminCtrl from '../controllers/adminController';
import * as supportCtrl from '../controllers/supportController';
import * as uploadCtrl from '../controllers/uploadController';
import { seedDatabase } from '../data/seed';

export const apiRouter = Router();

// Health Check
apiRouter.get('/health', (req, res) => {
  res.json({ status: 'ok', brand: 'Hound & Harbor', platform: 'Production Canine Ecommerce', time: new Date().toISOString() });
});

// Database Seeding Endpoint (safe dev helper)
apiRouter.post('/seed', async (req, res) => {
  try {
    await seedDatabase();
    res.json({ success: true, message: 'Hound & Harbor catalog, sellers, and demo accounts successfully re-seeded!' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ---------------- AUTH ROUTES ----------------
apiRouter.post('/auth/register', authOptional, authCtrl.register);
apiRouter.post('/auth/login', authCtrl.login);
apiRouter.get('/auth/me', authOptional, authCtrl.getCurrentUser);
apiRouter.put('/auth/profile', requireAuth, authCtrl.updateProfile);

// ---------------- PRODUCTS & REVIEWS ----------------
apiRouter.get('/products', productCtrl.getProducts);
apiRouter.get('/products/:slug', productCtrl.getProductBySlug);
apiRouter.get('/categories', productCtrl.getCategories);
apiRouter.post('/reviews', requireAuth, productCtrl.addProductReview);

// ---------------- PET PROFILES & DASHBOARD ----------------
apiRouter.get('/pets', authOptional, petCtrl.getPets);
apiRouter.get('/pets/directory', authOptional, petCtrl.getAllPets);
apiRouter.post('/pets', requireAuth, petCtrl.createPet);
apiRouter.put('/pets/:id', requireAuth, petCtrl.updatePet);
apiRouter.delete('/pets/:id', requireAuth, petCtrl.deletePet);
apiRouter.get('/pets/:id/dashboard', authOptional, petCtrl.getPetDashboard);

// ---------------- CART (GUEST & AUTH) ----------------
apiRouter.get('/cart', authOptional, cartCtrl.getCart);
apiRouter.post('/cart/items', authOptional, cartCtrl.addToCart);
apiRouter.put('/cart/items', authOptional, cartCtrl.updateCartItem);
apiRouter.delete('/cart/items', authOptional, cartCtrl.removeFromCart);
apiRouter.post('/cart/coupon', authOptional, cartCtrl.applyCoupon);
apiRouter.post('/cart/gift-card', authOptional, cartCtrl.applyGiftCard);

// ---------------- CHECKOUT (GUEST & AUTH) ----------------
apiRouter.post('/checkout/payment-intent', authOptional, checkoutCtrl.createPaymentIntent);
apiRouter.post('/checkout/place-order', authOptional, checkoutCtrl.placeOrder);

// ---------------- ORDERS ----------------
apiRouter.get('/orders', requireAuth, orderCtrl.getUserOrders);
apiRouter.get('/orders/my-orders', requireAuth, orderCtrl.getUserOrders);
apiRouter.get('/orders/track/:orderNumber', authOptional, orderCtrl.trackOrder);
apiRouter.post('/orders/track', authOptional, orderCtrl.trackOrder);
apiRouter.get('/orders/:id', authOptional, orderCtrl.getOrderById);
apiRouter.post('/orders/:id/return', requireAuth, orderCtrl.requestReturn);

// ---------------- SUBSCRIPTIONS ----------------
apiRouter.get('/subscriptions', requireAuth, subCtrl.getUserSubscriptions);
apiRouter.get('/subscriptions/my-subscriptions', requireAuth, subCtrl.getUserSubscriptions);
apiRouter.put('/subscriptions/:id', requireAuth, subCtrl.updateSubscription);
apiRouter.put('/subscriptions/:id/status', requireAuth, subCtrl.updateSubscription);
apiRouter.delete('/subscriptions/:id', requireAuth, subCtrl.cancelSubscription);


// ---------------- MARKETPLACE & SELLERS ----------------
apiRouter.get('/marketplace/items', marketCtrl.getMarketplaceItems);
apiRouter.get('/marketplace/items/:id', marketCtrl.getMarketplaceItemById);
apiRouter.get('/marketplace/dogs', marketCtrl.getMarketplaceDogs);
apiRouter.get('/marketplace/dogs/:id', marketCtrl.getMarketplaceDogById);
apiRouter.get('/marketplace/sellers', marketCtrl.getSellers);
apiRouter.get('/marketplace/sellers/:slug', marketCtrl.getSellerBySlug);
apiRouter.post('/marketplace/apply', requireAuth, marketCtrl.applySeller);
apiRouter.get('/resale/listings', marketCtrl.getResaleListings);
apiRouter.post('/resale/create', requireAuth, marketCtrl.createResaleListing);
apiRouter.post('/buyback/quote', authOptional, marketCtrl.requestBuybackQuote);
apiRouter.post('/buyback/:id/respond', authOptional, marketCtrl.respondToBuybackOffer);

// ---------------- SELLER MERCHANT PORTAL ----------------
apiRouter.get('/seller/overview', requireAuth, sellerCtrl.getSellerOverview);
apiRouter.get('/seller/products', requireAuth, sellerCtrl.getSellerProducts);
apiRouter.post('/seller/products', requireAuth, sellerCtrl.addSellerProduct);
apiRouter.post('/seller/payouts/request', requireAuth, sellerCtrl.requestSellerPayout);

// ---------------- REWARDS & NOTIFICATIONS ----------------
apiRouter.get('/rewards', requireAuth, supportCtrl.getLoyaltyAccount);
apiRouter.get('/loyalty/profile', requireAuth, supportCtrl.getLoyaltyAccount);
apiRouter.get('/gift-cards/:code', authOptional, supportCtrl.getGiftCardByCode);
apiRouter.get('/notifications', requireAuth, supportCtrl.getNotifications);

apiRouter.put('/notifications/:id/read', requireAuth, supportCtrl.markNotificationRead);
apiRouter.get('/support/tickets', requireAuth, supportCtrl.getSupportTickets);
apiRouter.post('/support/tickets', authOptional, supportCtrl.createSupportTicket);
apiRouter.post('/support/tickets/:id/reply', authOptional, supportCtrl.replySupportTicket);

// ---------------- ADMIN PORTAL ----------------
apiRouter.get('/admin/overview', requireAuth, requireAdmin, adminCtrl.getAdminOverview);
apiRouter.get('/admin/users', requireAuth, requireAdmin, adminCtrl.getAdminUsers);
apiRouter.put('/admin/users/:id/status', requireAuth, requireAdmin, adminCtrl.updateUserStatus);
apiRouter.get('/admin/pets', requireAuth, requireAdmin, adminCtrl.getAdminPets);
apiRouter.get('/admin/products', requireAuth, requireAdmin, adminCtrl.getAdminProducts);
apiRouter.post('/admin/products', requireAuth, requireAdmin, adminCtrl.createAdminProduct);
apiRouter.put('/admin/products/:id', requireAuth, requireAdmin, adminCtrl.updateAdminProduct);
apiRouter.delete('/admin/products/:id', requireAuth, requireAdmin, adminCtrl.deleteAdminProduct);
apiRouter.get('/admin/marketplace-dogs', requireAuth, requireAdmin, adminCtrl.getAdminMarketplaceDogs);
apiRouter.post('/admin/marketplace-dogs', requireAuth, requireAdmin, adminCtrl.createAdminMarketplaceDog);
apiRouter.put('/admin/marketplace-dogs/:id', requireAuth, requireAdmin, adminCtrl.updateAdminMarketplaceDog);
apiRouter.delete('/admin/marketplace-dogs/:id', requireAuth, requireAdmin, adminCtrl.deleteAdminMarketplaceDog);
apiRouter.get('/admin/orders', requireAuth, requireAdmin, adminCtrl.getAdminOrders);
apiRouter.put('/admin/orders/:id/status', requireAuth, requireAdmin, adminCtrl.updateOrderStatus);
apiRouter.get('/admin/sellers', requireAuth, requireAdmin, adminCtrl.getAdminSellers);
apiRouter.put('/admin/sellers/:id/status', requireAuth, requireAdmin, adminCtrl.updateSellerStatus);
apiRouter.get('/admin/buybacks', requireAuth, requireAdmin, adminCtrl.getAdminBuybacks);
apiRouter.post('/admin/buybacks/:id/inspect', requireAuth, requireAdmin, adminCtrl.inspectAndApproveBuyback);
apiRouter.get('/admin/gift-cards', requireAuth, requireAdmin, adminCtrl.getAdminGiftCards);
apiRouter.post('/admin/gift-cards', requireAuth, requireAdmin, adminCtrl.createAdminGiftCard);
apiRouter.get('/admin/coupons', requireAuth, requireAdmin, adminCtrl.getAdminCoupons);
apiRouter.post('/admin/coupons', requireAuth, requireAdmin, adminCtrl.createAdminCoupon);
apiRouter.get('/admin/audit-logs', requireAuth, requireAdmin, adminCtrl.getAuditLogs);
apiRouter.get('/admin/settings', requireAuth, requireAdmin, adminCtrl.getSettings);
apiRouter.put('/admin/settings', requireAuth, requireAdmin, adminCtrl.updateSettings);
apiRouter.get('/admin/export', requireAuth, requireAdmin, adminCtrl.exportReportCsv);

// ---------------- MEDIA & STORAGE (CLOUDINARY) ----------------
apiRouter.post('/upload', requireAuth, uploadCtrl.uploadMedia);

