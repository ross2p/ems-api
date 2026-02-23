import { PrismaClient } from '../../generated/prisma/client';
import { Logger } from '@nestjs/common';

export abstract class Seeder {
  abstract seed(prisma: PrismaClient): Promise<void>;

  abstract shouldRun(prisma: PrismaClient): Promise<boolean>;

  async run(prisma: PrismaClient): Promise<void> {
    const seederName = this.constructor.name;
    const logger = new Logger(seederName);
    const shouldExecute = await this.shouldRun(prisma);

    if (!shouldExecute) {
      logger.log(
        `Seed finished, but did not run because it was already executed previously.`,
      );
      return;
    }

    logger.log(`Starting seed.`);
    const startTime = performance.now();

    await this.seed(prisma);

    const endTime = performance.now();
    const duration = (endTime - startTime).toFixed(2);
    logger.log(`Seed finished (${duration}ms).`);
  }
}
