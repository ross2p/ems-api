import { Test, TestingModule } from '@nestjs/testing';
import { MeController } from './me.controller';
import { UserService } from './user.service';
import { UserEntity } from './user.entity';
import { UpdateUserDto } from './dtos/update-user.dto';
import { AuthGuard } from '../../guards/user.guard';
import { createMock, DeepMocked } from '@golevelup/ts-jest';

describe('MeController', () => {
  let controller: MeController;
  let userService: DeepMocked<UserService>;

  const mockUser: UserEntity = {
    id: 'user-id',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    password: 'hashedPassword',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MeController],
      providers: [
        {
          provide: UserService,
          useValue: createMock<UserService>(),
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<MeController>(MeController);
    userService = module.get(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findMe', () => {
    it('should return the current user profile', async () => {
      userService.findUserByIdOrThrow.mockResolvedValue(mockUser);

      const result = await controller.findMe(mockUser);

      expect(result).toEqual(mockUser);
    });
  });

  describe('updateMe', () => {
    it('should update and return the current user profile', async () => {
      const updateUserDto: UpdateUserDto = {
        firstName: 'updatedUser',
      };
      const updatedUser = { ...mockUser, ...updateUserDto };

      userService.updateUser.mockResolvedValue(updatedUser);

      const result = await controller.updateMe(mockUser, updateUserDto);

      expect(result).toEqual(updatedUser);
    });
  });

  describe('deleteMe', () => {
    it('should delete the current user account', async () => {
      userService.deleteUser.mockResolvedValue(mockUser);

      const result = await controller.deleteMe(mockUser);

      expect(result).toEqual(mockUser);
    });
  });
});
