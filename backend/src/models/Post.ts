import { Schema, Types, model, type InferSchemaType } from 'mongoose';

const postSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, required: true, trim: true, lowercase: true, unique: true, maxlength: 200 },
    excerpt: { type: String, trim: true, maxlength: 400 },
    content: { type: String, required: true },
    coverImageUrl: { type: String, trim: true },
    published: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export type IPost = InferSchemaType<typeof postSchema> & { _id: Types.ObjectId };

export default model('Post', postSchema);
