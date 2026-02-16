import { Test } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { UserEntity } from './user.entity';

const hashedPassword = 'hashedPassword';

const mockUser: UserEntity = {
  id: 'user-id',
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
  password: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn().mockResolvedValue(true),
}));
describe('UserService', () => {
  let userService: UserService;
  let userRepository: DeepMocked<UserRepository>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: createMock<UserRepository>(),
        },
      ],
    }).compile();

    userService = module.get(UserService);
    userRepository = module.get(UserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('findUserByIdOrThrow', () => {
    it('should return a user if found', async () => {
      userRepository.findUserById.mockResolvedValue(mockUser);

      const result = await userService.findUserByIdOrThrow(mockUser.id);

      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      userRepository.findUserById.mockResolvedValue(null);

      await expect(userService.findUserByIdOrThrow('bad-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createUser', () => {
    it('should create a user with hashed password', async () => {
      const createUserDto: CreateUserDto = {
        email: mockUser.email,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        password: 'password',
      };

      userRepository.createUser.mockResolvedValue(mockUser);

      const result = await userService.createUser(createUserDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(
        createUserDto.password,
        expect.anything(),
      );
      expect(userRepository.createUser).toHaveBeenCalledWith({
        ...createUserDto,
        password: hashedPassword,
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('updateUser', () => {
    it('should update a user and hash password if provided', async () => {
      const updateUserDto: UpdateUserDto = {
        email: 'test-new@mail.com',
        password: 'newPassword',
      };

      const newUser = {
        ...mockUser,
        ...updateUserDto,
      };

      userRepository.findUserById.mockResolvedValue(mockUser);
      userRepository.updateUser.mockResolvedValue(newUser);

      const updatedUser = await userService.updateUser(
        mockUser.id,
        updateUserDto,
      );

      expect(updatedUser).toBe(newUser);
      expect(bcrypt.hash).toHaveBeenCalledWith(
        newUser.password,
        expect.anything(),
      );
      expect(userRepository.updateUser).toHaveBeenCalledWith(mockUser.id, {
        password: 'hashedPassword',
      });
    });

    it('should throw NotFoundException if user not found during update', async () => {
      userRepository.findUserById.mockResolvedValue(null);

      await expect(userService.updateUser('bad-id', {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deleteUser', () => {
    it('should delete a user if found', async () => {
      userRepository.findUserById.mockResolvedValue(mockUser);
      userRepository.deleteUser.mockResolvedValue(mockUser);

      const deletedUser = await userService.deleteUser(mockUser.id);

      expect(deletedUser).toBe(mockUser);
    });

    it('should throw when user not found', async () => {
      userRepository.findUserById.mockResolvedValue(null);

      await expect(userService.deleteUser('bad-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findUserByEmailWithPassword', () => {
    it('should return user if found', async () => {
      userRepository.findUserByEmailWithPassword.mockResolvedValue(mockUser);

      const result = await userService.findUserByEmailWithPassword(
        mockUser.email,
      );
      expect(result).toEqual(mockUser);
    });

    it('should throw if not found', async () => {
      userRepository.findUserByEmailWithPassword.mockResolvedValue(null);
      await expect(
        userService.findUserByEmailWithPassword('non-existent-email'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
