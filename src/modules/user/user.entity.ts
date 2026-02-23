import { User } from '../../../generated/prisma';

export class UserEntity implements User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string | null;
  createdAt: Date;
  updatedAt: Date;
}
