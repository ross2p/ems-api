import { Event } from '../../../generated/prisma/client';

export class EventEntity implements Event {
  description: string;
  id: string;
  createdAt: Date;
  updatedAt: Date;
  title: string;
  startDate: Date;
  endDate: Date;
  location: string;
  latitude: number | null;
  longitude: number | null;
  categoryId: string | null;
  createdById: string;
}
