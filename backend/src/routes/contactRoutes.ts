import { Router } from 'express';
import { rateLimit } from '../middlewares/rateLimit';
import { isNonEmptyString, isValidEmail } from '../utils/validation';

const router = Router();

const contactRateLimit = rateLimit({ windowMs: 60 * 60 * 1000, max: 20, keyPrefix: 'contact' });

router.post('/contact', contactRateLimit, async (req, res) => {
  const { name, email, message } = req.body as Record<string, unknown>;

  if (!isNonEmptyString(name) || !isValidEmail(email) || !isNonEmptyString(message)) {
    res.status(400).json({
      error: { code: 'INVALID_INPUT', message: 'Informe nome, email valido e mensagem.' },
    });
    return;
  }

  // Ponto de extensao: integrar aqui com um servico de e-mail (ex.: Web3Forms, Resend) se necessario.
  console.info('Novo contato recebido:', { name, email, message });

  res.status(201).json({ data: { received: true } });
});

export default router;
