import { useState, type FormEvent } from 'react';
import { apiClient, ApiError } from '../api/client';

type ContactStatus = 'idle' | 'sending' | 'sent' | 'error';

export function ContactPage() {
  const [status, setStatus] = useState<ContactStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setStatus('sending');
    try {
      await apiClient.post('/contact', {
        name: form.get('name'),
        email: form.get('email'),
        message: form.get('message'),
      });
      setStatus('sent');
      event.currentTarget.reset();
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof ApiError ? error.message : 'Erro inesperado.');
    }
  }

  return (
    <div>
      <h1>Contato</h1>
      <form className="stack" onSubmit={handleSubmit}>
        <label>
          Nome
          <input name="name" type="text" required />
        </label>
        <label>
          Email
          <input name="email" type="email" required />
        </label>
        <label>
          Mensagem
          <textarea name="message" required />
        </label>
        <button type="submit" disabled={status === 'sending'}>
          {status === 'sending' ? 'Enviando...' : 'Enviar'}
        </button>
        {status === 'sent' && <p>Mensagem enviada com sucesso.</p>}
        {status === 'error' && <p role="alert">{errorMessage}</p>}
      </form>
    </div>
  );
}
