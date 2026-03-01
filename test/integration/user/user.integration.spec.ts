import {
  setupTestEnvironment,
  TestEnvironment,
} from '../../utils/test-setup.util';
import { UserService } from '@/modules/user/user.service';
import { CreateUserDto } from '@/modules/user/dtos/create-user.dto';
import { UpdateUserDto } from '@/modules/user/dtos/update-user.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('UserService (Integration)', () => {
  const env: TestEnvironment = setupTestEnvironment();
  let userService: UserService;

  beforeAll(() => {
    userService = env.app.get(UserService);
  });

  describe('createUser', () => {
    it('should successfully create a new user and hash the password', async () => {
      const dto: CreateUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.create@example.com',
        password: 'password123',
      };

      const result = await userService.createUser(dto);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.email).toBe(dto.email);
      expect(result.firstName).toBe(dto.firstName);

      // Verify in DB directly
      const userInDb = await env.dbEnv.prisma.user.findUnique({
        where: { id: result.id },
      });
      expect(userInDb).toBeDefined();
      expect(userInDb?.email).toBe(dto.email);

      // Verify password was hashed
      expect(userInDb?.password).toBeDefined();
      expect(userInDb?.password).not.toBe(dto.password);

      const hashedPassword = userInDb!.password;
      const isPasswordHashed = await bcrypt.compare(
        dto.password,
        String(hashedPassword),
      );
      expect(isPasswordHashed).toBe(true);
    });

    it('should throw ConflictException if user with email already exists', async () => {
      const dto: CreateUserDto = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.duplicate@example.com',
        password: 'password123',
      };

      await userService.createUser(dto);

      await expect(userService.createUser(dto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findUserByIdOrThrow', () => {
    it('should return the user if found', async () => {
      const dto: CreateUserDto = {
        firstName: 'Find',
        lastName: 'User',
        email: 'find.by.id@example.com',
        password: 'password123',
      };
      const createdUser = await userService.createUser(dto);

      const foundUser = await userService.findUserByIdOrThrow(createdUser.id);
      expect(foundUser).toBeDefined();
      expect(foundUser.id).toBe(createdUser.id);
    });

    it('should throw NotFoundException if user not found', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      await expect(userService.findUserByIdOrThrow(fakeId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateUser', () => {
    it('should update user details successfully', async () => {
      const createDto: CreateUserDto = {
        firstName: 'Update',
        lastName: 'Me',
        email: 'update.me@example.com',
        password: 'password123',
      };
      const user = await userService.createUser(createDto);

      const updateDto: UpdateUserDto = {
        firstName: 'UpdatedName',
        lastName: 'UpdatedLastName',
      };

      const result = await userService.updateUser(user.id, updateDto);
      expect(result.firstName).toBe(updateDto.firstName);
      expect(result.lastName).toBe(updateDto.lastName);

      // Verify in DB directly
      const userInDb = await env.dbEnv.prisma.user.findUnique({
        where: { id: user.id },
      });
      expect(userInDb?.firstName).toBe(updateDto.firstName);
    });

    it('should hash a new password if password is provided in update', async () => {
      const createDto: CreateUserDto = {
        firstName: 'Update',
        lastName: 'Password',
        email: 'update.password@example.com',
        password: 'oldPassword123',
      };
      const user = await userService.createUser(createDto);

      const newPassword = 'newPassword456';
      await userService.updateUser(user.id, { password: newPassword });

      const userInDb = await env.dbEnv.prisma.user.findUnique({
        where: { id: user.id },
      });

      expect(userInDb?.password).toBeDefined();
      expect(userInDb?.password).not.toBe(newPassword);
      expect(userInDb?.password).not.toBe(user.password);

      const isPasswordUpdatedAndHashed = await bcrypt.compare(
        newPassword,
        userInDb!.password as string,
      );
      expect(isPasswordUpdatedAndHashed).toBe(true);
    });

    it('should throw NotFoundException if trying to update non-existing user', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      await expect(
        userService.updateUser(fakeId, { firstName: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteUser', () => {
    it('should completely delete the user from database', async () => {
      const createDto: CreateUserDto = {
        firstName: 'Delete',
        lastName: 'Me',
        email: 'delete.me@example.com',
        password: 'password123',
      };
      const user = await userService.createUser(createDto);

      await userService.deleteUser(user.id);

      const userInDb = await env.dbEnv.prisma.user.findUnique({
        where: { id: user.id },
      });
      expect(userInDb).toBeNull();
    });

    it('should throw NotFoundException if trying to delete non-existing user', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      await expect(userService.deleteUser(fakeId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findUserByEmailWithPassword', () => {
    it('should return the user with their hashed password', async () => {
      const dto: CreateUserDto = {
        firstName: 'FindPwd',
        lastName: 'User',
        email: 'find.pwd@example.com',
        password: 'password123',
      };
      await userService.createUser(dto);

      const foundUser = await userService.findUserByEmailWithPassword(
        dto.email,
      );
      expect(foundUser).toBeDefined();
      expect(foundUser.email).toBe(dto.email);
      expect(foundUser.password).toBeDefined();

      const hashedPassword = foundUser.password;
      expect(hashedPassword).toBeDefined();
      const isMatch = await bcrypt.compare(
        dto.password,
        String(hashedPassword),
      );
      expect(isMatch).toBe(true);
    });

    it('should throw NotFoundException if user not found by email', async () => {
      await expect(
        userService.findUserByEmailWithPassword('non.existent@example.com'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
