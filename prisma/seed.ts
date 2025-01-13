import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const main = async () => {
  const exstingAdmin =
    (await prisma.user.count({
      where: {
        username: 'admin',
      },
    })) > 0;

  if (!exstingAdmin) {
    const hashedPass = await bcrypt.hash('password@admin', 10);
    await prisma.user.create({
      data: {
        email: 'admin@internal.com',
        password: hashedPass,
        username: 'admin',
        role: Role.ADMIN,
        profile: {
          create: {
            fullName: 'Admin App',
            bio: 'This account is Admin App',
          },
        },
      },
    });
  }

  const exstingUser =
    (await prisma.user.count({
      where: {
        username: 'user-test',
      },
    })) > 0;

  if (!exstingUser) {
    const hashedPass = await bcrypt.hash('password-user', 10);
    await prisma.user.create({
      data: {
        email: 'user-test@dev.com',
        password: hashedPass,
        username: 'user-test',
        role: Role.USER,
        profile: {
          create: {
            fullName: 'User Test',
            bio: 'This account is User Test',
          },
        },
      },
    });
  }
};

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
