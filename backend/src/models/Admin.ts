import { Schema, Types, model, type InferSchemaType } from 'mongoose';

export const ADMIN_ROLES = ['admin', 'editor'] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

const adminSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true, maxlength: 200 },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ADMIN_ROLES, default: 'editor' },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export type IAdmin = InferSchemaType<typeof adminSchema> & { _id: Types.ObjectId };

export default model('Admin', adminSchema);
