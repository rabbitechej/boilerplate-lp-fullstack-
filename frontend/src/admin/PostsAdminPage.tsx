import { useEffect, useState, type FormEvent } from 'react';
import { adminApi } from '../api/admin';
import { useAuth } from '../context/AuthContext';
import { routes } from '../routing';
import type { PostDto } from '../api/types';

type Props = { mode: 'list' | 'new' | 'edit'; id?: string };

export function PostsAdminPage({ mode, id }: Props) {
  const { accessToken } = useAuth();
  const [posts, setPosts] = useState<PostDto[]>([]);

  useEffect(() => {
    if (mode !== 'list' || !accessToken) return;
    adminApi.listPosts(accessToken).then(setPosts);
  }, [mode, accessToken]);

  if (!accessToken) return null;

  if (mode === 'list') {
    return (
      <div>
        <h1>Conteúdos</h1>
        <a href={routes.adminPostsNew}>Novo conteúdo</a>
        <ul>
          {posts.map((post) => (
            <li key={post.id}>
              <a href={routes.adminPostsEdit(post.id)}>{post.title}</a>
              <button
                onClick={async () => {
                  await adminApi.deletePost(post.id, accessToken);
                  setPosts((prev) => prev.filter((item) => item.id !== post.id));
                }}
              >
                Excluir
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return <PostForm mode={mode} id={id} accessToken={accessToken} />;
}

function PostForm({ mode, id, accessToken }: { mode: 'new' | 'edit'; id?: string; accessToken: string }) {
  const [post, setPost] = useState<PostDto | null>(null);

  useEffect(() => {
    if (mode === 'edit' && id) {
      adminApi.listPosts(accessToken).then((all) => setPost(all.find((item) => item.id === id) ?? null));
    }
  }, [mode, id, accessToken]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      title: String(form.get('title')),
      slug: String(form.get('slug')),
      excerpt: String(form.get('excerpt') ?? ''),
      content: String(form.get('content')),
      published: form.get('published') === 'on',
    };

    if (mode === 'new') {
      await adminApi.createPost(payload, accessToken);
    } else if (id) {
      await adminApi.updatePost(id, payload, accessToken);
    }
    window.location.assign(routes.adminPosts);
  }

  if (mode === 'edit' && !post) return <p>Carregando...</p>;

  return (
    <form className="stack" onSubmit={handleSubmit}>
      <label>
        Título
        <input name="title" defaultValue={post?.title} required />
      </label>
      <label>
        Slug
        <input name="slug" defaultValue={post?.slug} required />
      </label>
      <label>
        Resumo
        <input name="excerpt" defaultValue={post?.excerpt} />
      </label>
      <label>
        Conteúdo
        <textarea name="content" defaultValue={post?.content} required />
      </label>
      <label>
        Publicado
        <input name="published" type="checkbox" defaultChecked={post?.published} />
      </label>
      <button type="submit">Salvar</button>
    </form>
  );
}
