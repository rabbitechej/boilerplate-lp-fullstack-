import { Router } from 'express';
import AuditLog from '../models/AuditLog';
import { protect, requireRole } from '../middlewares/authMiddleware';

const router = Router();

router.get('/admin/audit-logs', protect, requireRole('admin'), async (_req, res) => {
  const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(200).lean();
  res.json({
    data: logs.map((log) => ({
      id: String(log._id),
      adminId: String(log.adminId),
      action: log.action,
      resource: log.resource,
      resourceId: log.resourceId,
      metadata: log.metadata,
      createdAt: (log as unknown as { createdAt: Date }).createdAt,
    })),
  });
});

export default router;
