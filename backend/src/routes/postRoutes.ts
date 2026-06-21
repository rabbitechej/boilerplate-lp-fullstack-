import { Router } from 'express';
import Post from '../models/Post';
import { protect, requireRole, type AuthRequest } from '../middlewares/authMiddleware';
import { toPostDto, toPublicPostDto } from '../dto';
import { isNonEmptyString, isValidObjectId, isValidSlug } from '../utils/validation';
import { recordAuditLog } from '../utils/audit';

const router = Router();

router.get('/posts', async (_req, res) => {
  const posts = await Post.find({ published: true }).sort({ createdAt: -1 });
  res.json({ data: posts.map(toPublicPostDto) });
});

router.get('/posts/:slug', async (req, res) => {
  const post = await Post.findOne({ slug: req.params.slug, published: true });
  if (!post) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Conteudo nao encontrado.' } });
    return;
  }
  res.json({ data: toPublicPostDto(post) });
});

router.get('/admin/posts', protect, async (_req, res) => {
  const posts = await Post.find().sort({ createdAt: -1 });
  res.json({ data: posts.map(toPostDto) });
});

router.post('/admin/posts', protect, requireRole('admin', 'editor'), async (req: AuthRequest, res) => {
  const { title, slug, excerpt, content, coverImageUrl, published } = req.body as Record<string, unknown>;

  if (!isNonEmptyString(title) || !isValidSlug(slug) || !isNonEmptyString(content)) {
    res.status(400).json({ error: { code: 'INVALID_INPUT', message: 'Informe titulo, slug e conteudo validos.' } });
    return;
  }

  const post = await Post.create({
    title,
    slug,
    excerpt: typeof excerpt === 'string' ? excerpt : undefined,
    content,
    coverImageUrl: typeof coverImageUrl === 'string' ? coverImageUrl : undefined,
    published: Boolean(published),
  });

  await recordAuditLog({ adminId: req.adminId!, action: 'create', resource: 'post', resourceId: String(post._id) });
  res.status(201).json({ data: toPostDto(post) });
});

router.put('/admin/posts/:id', protect, requireRole('admin', 'editor'), async (req: AuthRequest, res) => {
  if (!isValidObjectId(req.params.id)) {
    res.status(400).json({ error: { code: 'INVALID_INPUT', message: 'Identificador invalido.' } });
    return;
  }

  const { title, slug, excerpt, content, coverImageUrl, published } = req.body as Record<string, unknown>;
  if (slug !== undefined && !isValidSlug(slug)) {
    res.status(400).json({ error: { code: 'INVALID_INPUT', message: 'Slug invalido.' } });
    return;
  }

  const post = await Post.findByIdAndUpdate(
    req.params.id,
    {
      ...(title !== undefined ? { title } : {}),
      ...(slug !== undefined ? { slug } : {}),
      ...(excerpt !== undefined ? { excerpt } : {}),
      ...(content !== undefined ? { content } : {}),
      ...(coverImageUrl !== undefined ? { coverImageUrl } : {}),
      ...(published !== undefined ? { published: Boolean(published) } : {}),
    },
    { new: true },
  );

  if (!post) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Conteudo nao encontrado.' } });
    return;
  }

  await recordAuditLog({ adminId: req.adminId!, action: 'update', resource: 'post', resourceId: String(post._id) });
  res.json({ data: toPostDto(post) });
});

router.delete('/admin/posts/:id', protect, requireRole('admin'), async (req: AuthRequest, res) => {
  if (!isValidObjectId(req.params.id)) {
    res.status(400).json({ error: { code: 'INVALID_INPUT', message: 'Identificador invalido.' } });
    return;
  }

  const post = await Post.findByIdAndDelete(req.params.id);
  if (!post) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Conteudo nao encontrado.' } });
    return;
  }

  await recordAuditLog({ adminId: req.adminId!, action: 'delete', resource: 'post', resourceId: String(post._id) });
  res.json({ data: { deleted: true } });
});

export default router;
