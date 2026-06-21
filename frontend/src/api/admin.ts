import { apiClient } from './client';
import type { LoginResponse, PostDto } from './types';

export const adminApi = {
  login(email: string, password: string) {
    return apiClient.post<LoginResponse>('/auth/login', { email, password });
  },
  refresh() {
    return apiClient.post<{ accessToken: string }>('/auth/refresh');
  },
  logout() {
    return apiClient.post<{ loggedOut: boolean }>('/auth/logout');
  },
  listPosts(accessToken: string) {
    return apiClient.get<PostDto[]>('/admin/posts', accessToken);
  },
  getPost(id: string, accessToken: string) {
    return apiClient.get<PostDto>(`/admin/posts/${id}`, accessToken);
  },
  createPost(payload: Partial<PostDto>, accessToken: string) {
    return apiClient.post<PostDto>('/admin/posts', payload, accessToken);
  },
  updatePost(id: string, payload: Partial<PostDto>, accessToken: string) {
    return apiClient.put<PostDto>(`/admin/posts/${id}`, payload, accessToken);
  },
  deletePost(id: string, accessToken: string) {
    return apiClient.delete<{ deleted: boolean }>(`/admin/posts/${id}`, accessToken);
  },
};
