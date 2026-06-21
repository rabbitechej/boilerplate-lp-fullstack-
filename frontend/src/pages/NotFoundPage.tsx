import { routes } from '../routing';

export function NotFoundPage() {
  return (
    <div>
      <h1>Página não encontrada</h1>
      <a href={routes.home}>Voltar ao início</a>
    </div>
  );
}
