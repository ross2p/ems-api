import { PrismaClient } from '../../generated/prisma/client';
import { Seeder } from './seeder.abstract';

export class AttendanceSeeder extends Seeder {
  async shouldRun(prisma: PrismaClient): Promise<boolean> {
    const count = await prisma.attendance.count();
    return count === 0;
  }

  async seed(prisma: PrismaClient): Promise<void> {
    const users = await prisma.user.findMany({ take: 5 });
    const events = await prisma.event.findMany({ take: 5 });

    if (users.length === 0 || events.length === 0) return;

    const attendancesData: { userId: string; eventId: string }[] = [];

    // Create cross join of attendances
    for (const user of users) {
      for (const event of events) {
        attendancesData.push({ userId: user.id, eventId: event.id });
      }
    }

    await prisma.attendance.createMany({
      data: attendancesData,
    });
  }
}
