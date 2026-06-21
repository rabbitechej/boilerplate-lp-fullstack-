import { useEffect, useState } from 'react';
import { apiClient, ApiError } from '../api/client';
import type { PublicPostDto } from '../api/types';

export function PostPage({ slug }: { slug: string }) {
  const [post, setPost] = useState<PublicPostDto | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setNotFound(false);
    setPost(null);
    apiClient.get<PublicPostDto>(`/posts/${slug}`).then(setPost, (error) => {
      if (error instanceof ApiError && error.status === 404) setNotFound(true);
    });
  }, [slug]);

  if (notFound) return <p>Conteúdo não encontrado.</p>;
  if (!post) return <p>Carregando...</p>;

  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  );
}
