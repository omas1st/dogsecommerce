import { NotificationModel } from '../models';

export class NotificationService {
  public static async send(params: {
    userId: string;
    title: string;
    message: string;
    type: 'order' | 'subscription' | 'reorder' | 'seller' | 'loyalty' | 'system';
    link?: string;
  }) {
    try {
      await NotificationModel.create({
        userId: params.userId,
        title: params.title,
        message: params.message,
        type: params.type,
        link: params.link,
        isRead: false,
      });

      // Also log development email simulation
      console.log(`[Email Notification Simulator] -> To User: ${params.userId} | Subject: ${params.title} | ${params.message}`);
    } catch (err) {
      console.error('Failed to create notification', err);
    }
  }
}
