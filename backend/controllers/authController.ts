import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { AuthenticatedRequest, generateToken } from '../middleware/auth';
import { UserModel, CartModel, NotificationModel } from '../models';
import { UserRole } from '../config/constants';
import { mailService } from '../services/mailService';

export const register = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ success: false, error: 'First name, last name, email, and password are required.' });
    }

    const existing = await UserModel.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ success: false, error: 'An account with this email address already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const referralCode = `HOUND-${firstName.toUpperCase().slice(0, 3)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const user = await UserModel.create({
      email: email.toLowerCase().trim(),
      passwordHash,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone || '',
      role: UserRole.CUSTOMER,
      isEmailVerified: true,
      rewardPoints: 100, // Welcome bonus points
      totalSpent: 0,
      ordersCount: 0,
      status: 'active',
      referralCode,
    });

    // Notify admin email about new user registration
    mailService.notifyAdminNewUser(user).catch((err) => {
      console.warn('[MailService] Failed to notify admin of new user registration:', err.message);
    });

    // Welcome notification
    await NotificationModel.create({
      userId: user.id,
      title: 'Welcome to Hound & Harbor!',
      message: 'Your account is active. We added 100 bonus loyalty points to your account to celebrate!',
      type: 'loyalty',
      link: '/account/rewards',
      isRead: false,
    });

    // Merge guest cart if guest session provided
    if (req.guestSessionId) {
      const guestCart = await CartModel.findOne({ guestSessionId: req.guestSessionId });
      if (guestCart && guestCart.items.length > 0) {
        let userCart = await CartModel.findOne({ userId: user.id });
        if (!userCart) {
          await CartModel.create({
            userId: user.id,
            items: guestCart.items,
            appliedDiscountAmount: guestCart.appliedDiscountAmount || 0,
            appliedGiftCardAmount: guestCart.appliedGiftCardAmount || 0,
            updatedAt: new Date().toISOString(),
          });
        }
      }
    }

    const token = generateToken(user);

    const safeUser = { ...user };
    delete safeUser.passwordHash;

    return res.status(201).json({
      success: true,
      token,
      user: safeUser,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Registration failed.' });
  }
};

export const login = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const envAdminEmail = (process.env.ADMIN_EMAIL || 'omas7th@gmail.com').toLowerCase().trim();
    const envAdminPassword = process.env.ADMIN_PASSWORD || '@Stephen1st';

    // Check if this matches configured Super Admin credentials from environment
    if (cleanEmail === envAdminEmail && password === envAdminPassword) {
      let adminUser = await UserModel.findOne({ email: envAdminEmail });
      const passwordHash = await bcrypt.hash(envAdminPassword, 10);

      if (!adminUser) {
        adminUser = await UserModel.create({
          email: envAdminEmail,
          passwordHash,
          firstName: 'Omas',
          lastName: 'Admin',
          role: UserRole.SUPER_ADMIN,
          isEmailVerified: true,
          status: 'active',
          rewardPoints: 10000,
          totalSpent: 0,
          ordersCount: 0,
        });
      } else if (adminUser.role !== UserRole.SUPER_ADMIN) {
        await UserModel.findByIdAndUpdate(adminUser.id, {
          role: UserRole.SUPER_ADMIN,
          passwordHash,
          status: 'active',
        });
        adminUser.role = UserRole.SUPER_ADMIN;
      }

      const token = generateToken(adminUser);
      const safeUser = { ...adminUser };
      delete safeUser.passwordHash;

      return res.json({
        success: true,
        token,
        user: safeUser,
      });
    }

    const user = await UserModel.findOne({ email: cleanEmail });
    if (!user || !user.passwordHash) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ success: false, error: 'Your account has been suspended. Please reach out to customer care.' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const token = generateToken(user);
    const safeUser = { ...user };
    delete safeUser.passwordHash;

    return res.json({
      success: true,
      token,
      user: safeUser,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Login failed.' });
  }
};

export const getCurrentUser = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.json({ success: true, user: null });
  }
  const safeUser = { ...req.user };
  delete safeUser.passwordHash;
  return res.json({ success: true, user: safeUser });
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized.' });
    const { firstName, lastName, phone, addresses } = req.body;

    const updated = await UserModel.findByIdAndUpdate(req.user.id, {
      firstName: firstName || req.user.firstName,
      lastName: lastName || req.user.lastName,
      phone: phone !== undefined ? phone : req.user.phone,
      addresses: addresses || req.user.addresses,
    });

    const safeUser = { ...updated };
    delete safeUser?.passwordHash;
    return res.json({ success: true, user: safeUser });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Failed to update profile.' });
  }
};
