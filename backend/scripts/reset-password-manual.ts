import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function resetPassword() {
  const email = 'mau@mau.com';
  const newPassword = 'Mau123!';

  console.log(`🔄 Reseteando contraseña para ${email}...`);

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.error(`❌ Usuario ${email} no encontrado.`);
    return;
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { email },
    data: {
      password: hashedPassword,
    },
  });

  console.log(`✅ Contraseña actualizada correctamente.`);
  console.log(`📧 Email: ${email}`);
  console.log(`🔑 Nueva contraseña: ${newPassword}`);
}

resetPassword()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
