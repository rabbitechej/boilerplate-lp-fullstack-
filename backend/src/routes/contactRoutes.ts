import { Router } from 'express';
import { rateLimit } from '../middlewares/rateLimit';
import { protect, requireRole } from '../middlewares/authMiddleware';
import ContactMessage from '../models/ContactMessage';
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

  // Persiste no banco para nao perder a mensagem (o Render free tier tem
  // sistema de arquivos efemero e os logs nao sao um lugar confiavel para
  // guardar dados). Ponto de extensao: alem de salvar, integrar com um
  // servico de e-mail (ex.: Web3Forms, Resend) para notificar em tempo real.
  await ContactMessage.create({ name, email: email.trim().toLowerCase(), message });

  res.status(201).json({ data: { received: true } });
});

router.get('/admin/contact-messages', protect, requireRole('admin', 'editor'), async (_req, res) => {
  const messages = await ContactMessage.find().sort({ createdAt: -1 }).limit(200).lean();
  res.json({
    data: messages.map((entry) => ({
      id: String(entry._id),
      name: entry.name,
      email: entry.email,
      message: entry.message,
      createdAt: (entry as unknown as { createdAt: Date }).createdAt,
    })),
  });
});

export default router;
