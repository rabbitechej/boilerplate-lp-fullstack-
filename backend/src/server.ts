import 'dotenv/config';
import { createApp } from './app';
import { connectDatabase } from './config/db';
import { getPort, validateServerEnv } from './config/env';

async function main(): Promise<void> {
  validateServerEnv();
  await connectDatabase();

  const app = createApp();
  const port = getPort();
  const server = app.listen(port, () => {
    console.log(`API ouvindo na porta ${port}`);
  });

  const shutdown = () => {
    console.log('Encerrando servidor...');
    server.close(() => process.exit(0));
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

main().catch((error) => {
  console.error('Falha ao iniciar a API:', error);
  process.exit(1);
});
