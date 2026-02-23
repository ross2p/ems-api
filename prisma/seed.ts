import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
import { UserSeeder } from './seeds/user.seeder';
import { CategorySeeder } from './seeds/category.seeder';
import { EventSeeder } from './seeds/event.seeder';
import { AttendanceSeeder } from './seeds/attendance.seeder';
import { Logger } from '@nestjs/common';

dotenv.config();

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });
const logger = new Logger('Seed');

async function main() {
  const seeders = [
    new UserSeeder(),
    new CategorySeeder(),
    new EventSeeder(),
    new AttendanceSeeder(),
  ];

  logger.log('Starting execution of all seeders...');

  for (const seeder of seeders) {
    await seeder.run(prisma);
  }

  logger.log('All seeders executed successfully.');
}

main()
  .catch((e) => {
    logger.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
