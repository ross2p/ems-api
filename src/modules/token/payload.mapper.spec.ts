import { Test, TestingModule } from '@nestjs/testing';
import { PayloadMapper } from './payload.mapper';
import { UserEntity } from '../user/user.entity';
import { UserPayload } from './interfaces/userPayload.interface';

describe('PayloadMapper', () => {
  let mapper: PayloadMapper;

  const mockUser: UserEntity = {
    id: 'user-id',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    password: 'hashed-password',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PayloadMapper],
    }).compile();

    mapper = module.get<PayloadMapper>(PayloadMapper);
  });

  it('should be defined', () => {
    expect(mapper).toBeDefined();
  });

  describe('userEntityToUserPayload', () => {
    it('should map UserEntity to UserPayload correctly', () => {
      const expectedPayload: UserPayload = {
        userId: mockUser.id,
        email: mockUser.email,
      };

      const result = mapper.userEntityToUserPayload(mockUser);

      expect(result).toEqual(expectedPayload);
    });
  });
});
