import { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { routes } from '../routing';
import type { PublicPostDto } from '../api/types';

export function PostsPage() {
  const [posts, setPosts] = useState<PublicPostDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get<PublicPostDto[]>('/posts')
      .then(setPosts)
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Carregando...</p>;

  return (
    <div>
      <h1>Conteúdos</h1>
      <ul>
        {posts.map((post) => (
          <li key={post.id}>
            <a href={routes.post(post.slug)}>{post.title}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
