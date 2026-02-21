import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from './user.repository';
import { DatabaseService } from '../database/database.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { createMock, DeepMocked } from '@golevelup/ts-jest';

describe('UserRepository', () => {
  let repository: UserRepository;
  let databaseService: DeepMocked<DatabaseService>;

  const mockUser = {
    id: 'user-id',
    email: 'test@example.com',
    password: 'hashedPassword',
    firstName: 'John',
    lastName: 'Doe',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        {
          provide: DatabaseService,
          useValue: createMock<DatabaseService>(),
        },
      ],
    }).compile();

    repository = module.get(UserRepository);
    databaseService = module.get(DatabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a user', async () => {
      const createUserDto: CreateUserDto = {
        email: mockUser.email,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        password: mockUser.password,
      };

      const savedUser = {
        id: mockUser.id,
        ...createUserDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      databaseService.user.create.mockResolvedValue(savedUser);

      const result = await repository.createUser(createUserDto);

      expect(result).toEqual(savedUser);
    });
  });

  describe('findUserById', () => {
    it('should find user by id', async () => {
      databaseService.user.findUnique.mockResolvedValue(mockUser);

      const result = await repository.findUserById(mockUser.id);

      expect(result).toEqual(mockUser);
    });
  });

  describe('findUserByEmailWithPassword', () => {
    it('should find user by email and include password', async () => {
      databaseService.user.findUnique.mockResolvedValue(mockUser);

      const result = await repository.findUserByEmailWithPassword(
        mockUser.email,
      );

      expect(result).toEqual(mockUser);
    });
  });

  describe('findUserByEmail', () => {
    it('should find user by email and include password', async () => {
      databaseService.user.findUnique.mockResolvedValue(mockUser);

      const result = await repository.findUserByEmail(mockUser.email);

      expect(result).toEqual(mockUser);
    });
  });
  describe('updateUser', () => {
    it('should update user', async () => {
      const updateUserDto: UpdateUserDto = { firstName: 'Updated' };
      databaseService.user.update.mockResolvedValue(mockUser);

      const result = await repository.updateUser(mockUser.id, updateUserDto);

      expect(result).toEqual(mockUser);
    });
  });

  describe('deleteUser', () => {
    it('should delete user', async () => {
      databaseService.user.delete.mockResolvedValue(mockUser);

      const result = await repository.deleteUser(mockUser.id);

      expect(result).toEqual(mockUser);
    });
  });
});
