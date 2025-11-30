export class UserEntity {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string | null;
  createdAt: Date;
  updatedAt: Date;
}
