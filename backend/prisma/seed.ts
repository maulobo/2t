import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Hashear contraseñas
  const adminPassword = await bcrypt.hash('Admin123!', 10);
  const coachPassword = await bcrypt.hash('Coach123!', 10);
  const athletePassword = await bcrypt.hash('Atleta123!', 10);

  // Crear usuario ADMIN
  const admin = await prisma.user.upsert({
    where: { email: 'admin@gym.com' },
    update: {},
    create: {
      email: 'admin@gym.com',
      password: adminPassword,
      phone: '+5491199999999',
      role: 'ADMIN',
    },
  });

  console.log('✅ Admin creado:', admin.email, '(id:', admin.id, ')');

  // Crear el primer coach
  const coach = await prisma.user.upsert({
    where: { email: 'coach@gym.com' },
    update: {},
    create: {
      email: 'coach@gym.com',
      password: coachPassword,
      phone: '+5491100000000',
      role: 'COACH',
      coach: {
        create: {
          // Acá podrías agregar campos específicos del coach si tenés en CoachProfile
        },
      },
    },
  });

  console.log('✅ Coach creado:', coach.email, '(id:', coach.id, ')');

  // Opcional: crear un atleta de ejemplo
  const athlete = await prisma.user.upsert({
    where: { email: 'atleta@gym.com' },
    update: {},
    create: {
      email: 'atleta@gym.com',
      password: athletePassword,
      phone: '+5491100000001',
      role: 'ATHLETE',
      athlete: {
        create: {
          fullName: 'Juan Pérez',
          birthDate: new Date('1995-03-15'),
          coachId: coach.id,
          notes: 'Atleta de ejemplo',
        },
      },
    },
  });

  console.log('✅ Atleta creado:', athlete.email, '(id:', athlete.id, ')');

  // Crear actividades por defecto
  console.log('\n🏋️ Creando actividades...');

  console.log('\n📝 Credenciales para testing:');
  console.log('   Admin: admin@gym.com / Admin123!');
  console.log('   Coach: coach@gym.com / Coach123!');
  console.log('   Atleta: atleta@gym.com / Atleta123!');
  console.log(`\n🔑 CoachId para crear atletas: ${coach.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
