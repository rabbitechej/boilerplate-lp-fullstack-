import AuditLog from '../models/AuditLog';

export async function recordAuditLog(params: {
  adminId: string;
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    await AuditLog.create(params);
  } catch (error) {
    console.error('Falha ao registrar audit log:', error);
  }
}
