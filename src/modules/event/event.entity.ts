import { Event } from '../../../generated/prisma/client';

export class EventEntity implements Event {
    description: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    title: string;
    startDate: Date;
    endDate: Date;
    categoryId: string | null;
    createdById: string;
}
