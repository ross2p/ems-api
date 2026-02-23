import { PrismaClient } from '../../generated/prisma/client';
import { Seeder } from './seeder.abstract';

export class CategorySeeder extends Seeder {
  async shouldRun(prisma: PrismaClient): Promise<boolean> {
    const count = await prisma.category.count();
    return count === 0;
  }

  async seed(prisma: PrismaClient): Promise<void> {
    const user = await prisma.user.findFirst();
    if (!user) return;

    await prisma.category.createMany({
      data: [
        {
          name: 'Technology',
          description: 'Tech related events',
          createdById: user.id,
        },
        {
          name: 'Design',
          description: 'Design related events',
          createdById: user.id,
        },
        {
          name: 'Business',
          description: 'Business and startup events',
          createdById: user.id,
        },
        {
          name: 'Health',
          description: 'Health and wellness events',
          createdById: user.id,
        },
      ],
    });
  }
}
