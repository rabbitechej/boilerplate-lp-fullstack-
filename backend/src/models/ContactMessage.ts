import { Schema, Types, model, type InferSchemaType } from 'mongoose';

const contactMessageSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 200 },
    message: { type: String, required: true, maxlength: 4000 },
  },
  { timestamps: true },
);

export type IContactMessage = InferSchemaType<typeof contactMessageSchema> & { _id: Types.ObjectId };

export default model('ContactMessage', contactMessageSchema);
