import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models';
import { IUser } from '../models/types';
import { UserRole } from '../config/constants';

const JWT_SECRET = process.env.JWT_SECRET || 'hound-harbor-jwt-secret-key-2026';

export interface AuthenticatedRequest extends Request {
  user?: IUser | null;
  guestSessionId?: string;
}

export const generateToken = (user: IUser): string => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export const authOptional = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const guestHeader = req.headers['x-guest-session-id'] as string;
    if (guestHeader) {
      req.guestSessionId = guestHeader;
    }

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
      const user = await UserModel.findById(decoded.id);
      if (user && user.status === 'active') {
        req.user = user;
      }
    }
  } catch (err) {
    // Non-blocking for optional auth
    req.user = null;
  }
  next();
};

export const requireAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Authentication required. Please sign in.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const user = await UserModel.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, error: 'User account not found.' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ success: false, error: 'Your account has been suspended. Please contact customer care.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid or expired authentication session.' });
  }
};

export const requireAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Admin authentication required.' });
  }

  const adminRoles = [
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
    UserRole.OPERATIONS_MANAGER,
    UserRole.FINANCE_MANAGER,
    UserRole.MARKETPLACE_MANAGER,
    UserRole.CUSTOMER_SUPPORT,
    UserRole.INVENTORY_MANAGER,
  ];

  if (!adminRoles.includes(req.user.role)) {
    return res.status(403).json({ success: false, error: 'Access denied. Administrative privileges required.' });
  }

  next();
};

export const requireSeller = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Authentication required.' });
  }

  if (req.user.role !== UserRole.SELLER && req.user.role !== UserRole.ADMIN && req.user.role !== UserRole.SUPER_ADMIN) {
    return res.status(403).json({ success: false, error: 'Marketplace seller privileges required.' });
  }

  next();
};
