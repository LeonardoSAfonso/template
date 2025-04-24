import { PrismaClient } from '@prisma/client';
import HashProvider from '../src/shared/providers/Hash';

const prisma = new PrismaClient();

async function main() {
  const hasProvider = new HashProvider();

  const hashed = await hasProvider.generateHash(
    process.env.SYSTEM_PASSWORD || 'default',
  );

  await prisma.user.create({
    data: {
      name: 'System',
      email: 'contato@gmail.com',
      password: hashed,
      access_level: 0,
    },
  });
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
