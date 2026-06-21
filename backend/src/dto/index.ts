import type { IAdmin } from '../models/Admin';
import type { IPost } from '../models/Post';

export type AdminDto = {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
};

export function toAdminDto(admin: IAdmin): AdminDto {
  return {
    id: String(admin._id),
    name: admin.name,
    email: admin.email,
    role: admin.role,
    active: admin.active,
  };
}

export type PostDto = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  coverImageUrl?: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export function toPostDto(post: IPost): PostDto {
  return {
    id: String(post._id),
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt ?? undefined,
    content: post.content,
    coverImageUrl: post.coverImageUrl ?? undefined,
    published: post.published,
    createdAt: (post as unknown as { createdAt: Date }).createdAt,
    updatedAt: (post as unknown as { updatedAt: Date }).updatedAt,
  };
}

export type PublicPostDto = Omit<PostDto, 'published'>;

export function toPublicPostDto(post: IPost): PublicPostDto {
  const { published: _published, ...rest } = toPostDto(post);
  return rest;
}
