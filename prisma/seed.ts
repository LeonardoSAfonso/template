import { PrismaClient } from '@prisma/client';
import BCryptHashProvider from '../src/shared/providers/hashProvider/implementations/BCryptHashProvider';

const prisma = new PrismaClient();

async function main() {
  const hasProvider = new BCryptHashProvider();

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
