import { PrismaClient } from '../../generated/prisma/client';
import { Seeder } from './seeder.abstract';
import * as bcrypt from 'bcrypt';

export class UserSeeder extends Seeder {
  async shouldRun(prisma: PrismaClient): Promise<boolean> {
    const count = await prisma.user.count();
    return count === 0;
  }

  async seed(prisma: PrismaClient): Promise<void> {
    const hashedPassword = await bcrypt.hash('Test123!', 10);

    const usersData = Array.from({ length: 10 }).map((_, i) => ({
      email: `user${i + 1}@example.com`,
      firstName: `First${i + 1}`,
      lastName: `Last${i + 1}`,
      password: hashedPassword,
    }));

    await prisma.user.createMany({
      data: usersData,
    });
  }
}
