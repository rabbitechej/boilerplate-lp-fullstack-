import { Schema, Types, model, type InferSchemaType } from 'mongoose';

const auditLogSchema = new Schema(
  {
    adminId: { type: Schema.Types.ObjectId, ref: 'Admin', required: true },
    action: { type: String, required: true, maxlength: 80 },
    resource: { type: String, required: true, maxlength: 80 },
    resourceId: { type: String, maxlength: 100 },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);

export type IAuditLog = InferSchemaType<typeof auditLogSchema> & { _id: Types.ObjectId };

export default model('AuditLog', auditLogSchema);
