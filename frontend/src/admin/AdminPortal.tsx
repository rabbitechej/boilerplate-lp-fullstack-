import { useEffect, type ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import { routes } from '../routing';

export function AdminPortal({ children }: { children: ReactNode }) {
  const { admin, accessToken, ensureFreshToken, logout } = useAuth();

  useEffect(() => {
    if (!accessToken) {
      ensureFreshToken().then((token) => {
        if (!token) window.location.assign(routes.adminLogin);
      });
    }
  }, [accessToken, ensureFreshToken]);

  if (!accessToken) return <p>Verificando sessão...</p>;

  return (
    <div className="admin-shell">
      <nav className="admin-shell__nav">
        <p>Olá, {admin?.name ?? 'administrador'}</p>
        <ul>
          <li>
            <a href={routes.adminDashboard}>Painel</a>
          </li>
          <li>
            <a href={routes.adminPosts}>Conteúdos</a>
          </li>
        </ul>
        <button onClick={() => logout().then(() => window.location.assign(routes.adminLogin))}>
          Sair
        </button>
      </nav>
      <div className="admin-shell__content">{children}</div>
    </div>
  );
}
