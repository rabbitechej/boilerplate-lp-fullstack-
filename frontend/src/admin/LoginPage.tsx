import { useState, type FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../api/client';
import { routes } from '../routing';

export function LoginPage() {
  const { login } = useAuth();
  const [errorMessage, setErrorMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSubmitting(true);
    setErrorMessage('');
    try {
      await login(String(form.get('email')), String(form.get('password')));
      window.location.assign(routes.adminDashboard);
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? error.message : 'Erro inesperado.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h1>Login administrativo</h1>
      <form className="stack" onSubmit={handleSubmit}>
        <label>
          Email
          <input name="email" type="email" required />
        </label>
        <label>
          Senha
          <input name="password" type="password" required />
        </label>
        <button type="submit" disabled={submitting}>
          {submitting ? 'Entrando...' : 'Entrar'}
        </button>
        {errorMessage && <p role="alert">{errorMessage}</p>}
      </form>
    </div>
  );
}
