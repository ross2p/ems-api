import { PrismaClient } from '../../generated/prisma/client';
import { Seeder } from './seeder.abstract';

export class EventSeeder extends Seeder {
  async shouldRun(prisma: PrismaClient): Promise<boolean> {
    const count = await prisma.event.count();
    return count === 0;
  }

  async seed(prisma: PrismaClient): Promise<void> {
    const users = await prisma.user.findMany({ take: 10 });
    const categories = await prisma.category.findMany();

    if (users.length === 0) return;

    const adjectives = [
      'Global',
      'Advanced',
      'Annual',
      'Interactive',
      'Practical',
      'Modern',
      'Creative',
      'Strategic',
      'Future of',
      'Innovations in',
    ];
    const subjects = [
      'Tech',
      'React',
      'AI',
      'Startup',
      'Design',
      'Web Performance',
      'Cybersecurity',
      'Blockchain',
      'Marketing',
      'Leadership',
      'Data Science',
      'Python',
      'UX/UI',
      'Cloud Computing',
      'Machine Learning',
      'E-commerce',
    ];
    const types = [
      'Summit',
      'Workshop',
      'Meetup',
      'Conference',
      'Masterclass',
      'Hackathon',
      'Expo',
      'Symposium',
      'Forum',
      'Camp',
    ];
    const locations = [
      'Kyiv',
      'Lviv',
      'Online',
      'San Francisco',
      'London',
      'Berlin',
      'New York',
      'Toronto',
      'Warsaw',
      'Krakow',
      'Tokyo',
      'Remote',
    ];

    const eventsData = Array.from({ length: 100 }).map(() => {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomCategory =
        categories.length > 0
          ? categories[Math.floor(Math.random() * categories.length)]
          : undefined;

      const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
      const sub = subjects[Math.floor(Math.random() * subjects.length)];
      const type = types[Math.floor(Math.random() * types.length)];
      const loc = locations[Math.floor(Math.random() * locations.length)];

      const title = `${adj} ${sub} ${type} 2026`;
      const description = `Join us for an engaging and comprehensive ${type.toLowerCase()} focused on the latest trends in ${sub}. Learn from industry experts, network with peers, and improve your skills at this ${adj.toLowerCase()} event in ${loc}.`;

      const startDate = new Date();
      startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 180)); // Events in the next 180 days

      const endDate = new Date(startDate);
      endDate.setHours(endDate.getHours() + Math.floor(Math.random() * 6) + 2); // Duration 2-8 hours

      return {
        title,
        description,
        location: loc,
        startDate,
        endDate,
        createdById: randomUser.id,
        categoryId: randomCategory?.id,
      };
    });

    await prisma.event.createMany({
      data: eventsData,
    });
  }
}
