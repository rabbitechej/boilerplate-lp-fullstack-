export type PublicPostDto = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  coverImageUrl?: string;
  createdAt: string;
  updatedAt: string;
};

export type PostDto = PublicPostDto & { published: boolean };

export type AdminDto = {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
};

export type LoginResponse = {
  accessToken: string;
  admin: AdminDto;
};
