import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { SupportTicketModel, NotificationModel, UserModel, GiftCardModel } from '../models';
import { mailService } from '../services/mailService';

export const getSupportTickets = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized.' });

    const query = req.user.role === 'admin' || req.user.role === 'super_admin'
      ? {}
      : { customerEmail: req.user.email };

    const tickets = await SupportTicketModel.find(query);
    tickets.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    return res.json({ success: true, tickets });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const createSupportTicket = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { subject, category = 'order', message, customerEmail, customerName } = req.body;
    const finalEmail = req.user?.email || customerEmail;
    const finalName = req.user ? `${req.user.firstName} ${req.user.lastName}` : customerName || 'Pet Parent';

    if (!subject || !message || !finalEmail) {
      return res.status(400).json({ success: false, error: 'Subject, message, and email are required.' });
    }

    const ticketNumber = `TCK-${Math.floor(100000 + Math.random() * 900000)}`;
    const ticket = await SupportTicketModel.create({
      ticketNumber,
      userId: req.user?.id,
      customerEmail: finalEmail,
      customerName: finalName,
      subject,
      category,
      priority: 'medium',
      status: 'open',
      messages: [
        {
          sender: 'customer',
          senderName: finalName,
          content: message,
          timestamp: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    mailService.notifyAdminSupportTicket(ticket).catch((err) => {
      console.warn('[MailService] Failed to notify admin of support ticket:', err.message);
    });

    return res.status(201).json({ success: true, ticket });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const replySupportTicket = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    const ticket = await SupportTicketModel.findById(id);
    if (!ticket) return res.status(404).json({ success: false, error: 'Ticket not found.' });

    const isStaff = req.user?.role === 'admin' || req.user?.role === 'super_admin';
    const sender = isStaff ? 'agent' : 'customer';
    const senderName = req.user ? `${req.user.firstName} ${req.user.lastName}` : ticket.customerName;

    const updated = await SupportTicketModel.findByIdAndUpdate(id, {
      status: isStaff ? 'waiting_on_customer' : 'in_progress',
      messages: [
        ...ticket.messages,
        {
          sender,
          senderName,
          content: message,
          timestamp: new Date().toISOString(),
        },
      ],
      updatedAt: new Date().toISOString(),
    });

    if (!isStaff) {
      mailService.notifyAdminSupportTicket({
        ...ticket,
        subject: `Re: ${ticket.subject}`,
        message,
      }).catch((err) => {
        console.warn('[MailService] Failed to notify admin of ticket reply:', err.message);
      });
    }

    return res.json({ success: true, ticket: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const getNotifications = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized.' });
    const notifications = await NotificationModel.find({ userId: req.user.id });
    notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return res.json({ success: true, notifications });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const markNotificationRead = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    await NotificationModel.findByIdAndUpdate(id, { isRead: true });
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const getLoyaltyAccount = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized.' });
    const user = await UserModel.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found.' });

    const availableRewards = [
      { id: 'rew-1', title: '$5 Off Next Order', pointsRequired: 500, discountValue: 5, discountType: 'fixed' },
      { id: 'rew-2', title: '$10 Off Next Order', pointsRequired: 1000, discountValue: 10, discountType: 'fixed' },
      { id: 'rew-3', title: 'Free Express Shipping', pointsRequired: 750, discountValue: 14.99, discountType: 'shipping' },
      { id: 'rew-4', title: '$25 Premium Gear Credit', pointsRequired: 2500, discountValue: 25, discountType: 'fixed' },
    ];

    return res.json({
      success: true,
      rewardPoints: user.rewardPoints || 0,
      referralCode: user.referralCode,
      availableRewards,
      tier: (user.totalSpent || 0) > 500 ? 'Alpha Pack Member' : 'Loyal Companion',
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
