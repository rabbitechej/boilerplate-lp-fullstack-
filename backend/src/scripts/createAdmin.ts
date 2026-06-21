import 'dotenv/config';
import bcrypt from 'bcrypt';
import { connectDatabase, disconnectDatabase } from '../config/db';
import Admin from '../models/Admin';
import { isValidEmail, isNonEmptyString } from '../utils/validation';

async function run(): Promise<void> {
  const name = process.env.ADMIN_NAME;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!isNonEmptyString(name) || !isValidEmail(email) || !isNonEmptyString(password) || password.length < 8) {
    throw new Error(
      'Defina ADMIN_NAME, ADMIN_EMAIL (valido) e ADMIN_PASSWORD (>= 8 caracteres) no .env antes de rodar este script.',
    );
  }

  await connectDatabase();

  const existing = await Admin.findOne({ email: email.trim().toLowerCase() });
  if (existing) {
    console.log(`Ja existe um administrador com o email ${email}.`);
    await disconnectDatabase();
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await Admin.create({
    name,
    email: email.trim().toLowerCase(),
    passwordHash,
    role: 'admin',
    active: true,
  });

  console.log(`Administrador criado com sucesso: ${admin.email} (id: ${admin._id})`);
  await disconnectDatabase();
}

run().catch((error) => {
  console.error('Erro ao criar administrador:', error);
  process.exit(1);
});
