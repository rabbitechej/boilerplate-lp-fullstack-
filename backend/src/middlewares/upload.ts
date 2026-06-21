import multer from 'multer';
import type { NextFunction, Request, Response } from 'express';

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter(_req, file, callback) {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      callback(new Error('Tipo de arquivo nao suportado. Envie JPEG, PNG, WEBP ou AVIF.'));
      return;
    }
    callback(null, true);
  },
});

export function handleUploadError(error: unknown, _req: Request, res: Response, next: NextFunction): void {
  if (error instanceof multer.MulterError) {
    const message =
      error.code === 'LIMIT_FILE_SIZE'
        ? 'Arquivo maior que o limite permitido (5MB).'
        : 'Falha ao processar o arquivo enviado.';
    res.status(400).json({ error: { code: 'INVALID_INPUT', message } });
    return;
  }
  if (error instanceof Error) {
    res.status(400).json({ error: { code: 'INVALID_INPUT', message: error.message } });
    return;
  }
  next(error);
}
