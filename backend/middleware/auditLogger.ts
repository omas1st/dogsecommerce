import { AuditLogModel } from '../models';
import { AuthenticatedRequest } from './auth';

export const recordAuditLog = async (
  req: AuthenticatedRequest,
  action: string,
  entity: string,
  entityId: string,
  beforeValue?: any,
  afterValue?: any
) => {
  try {
    const admin = req.user;
    if (!admin) return;

    await AuditLogModel.create({
      adminId: admin.id,
      adminEmail: admin.email,
      adminName: `${admin.firstName} ${admin.lastName}`.trim() || admin.email,
      action,
      entity,
      entityId,
      beforeValue,
      afterValue,
      ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1',
    });
  } catch (err) {
    console.error('Failed to log audit event', err);
  }
};
