import { Attendance } from '../../../generated/prisma';

export class AttendanceEntity implements Attendance {
  id: string;
  userId: string;
  eventId: string;
  createdAt: Date;
  updatedAt: Date;
}
