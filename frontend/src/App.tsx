import { useEffect, useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { PostsPage } from './pages/PostsPage';
import { PostPage } from './pages/PostPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { LoginPage } from './admin/LoginPage';
import { AdminPortal } from './admin/AdminPortal';
import { PostsAdminPage } from './admin/PostsAdminPage';
import { getRoute } from './routing';

export function App() {
  const [pathname, setPathname] = useState(() => window.location.pathname);

  useEffect(() => {
    const onPopState = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const route = getRoute(pathname);

  if (route.kind === 'admin-login') return <LoginPage />;

  if (route.kind === 'admin-dashboard' || route.kind === 'admin-posts') {
    return (
      <AuthProvider>
        <AdminPortal>
          {route.kind === 'admin-posts' ? (
            <PostsAdminPage mode={route.mode} id={route.id} />
          ) : (
            <p>Bem-vindo ao painel administrativo.</p>
          )}
        </AdminPortal>
      </AuthProvider>
    );
  }

  return (
    <Layout>
      {route.kind === 'home' && <HomePage />}
      {route.kind === 'about' && <AboutPage />}
      {route.kind === 'contact' && <ContactPage />}
      {route.kind === 'posts' && <PostsPage />}
      {route.kind === 'post' && <PostPage slug={route.slug} />}
      {route.kind === 'not-found' && <NotFoundPage />}
    </Layout>
  );
}
