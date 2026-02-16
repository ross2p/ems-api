import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { AuthGuard } from '../src/guards/user.guard';
import { UserService } from '../src/modules/user/user.service';

describe('UserController (e2e)', () => {
  let app: INestApplication;

  const mockUser = {
    id: 'user-id',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    password: 'hashedPassword',
  };

  const mockUserService = {
    findUserByIdOrThrow: jest.fn().mockResolvedValue(mockUser),
    updateUser: jest.fn().mockResolvedValue({ ...mockUser, firstName: 'Jane' }),
    deleteUser: jest.fn().mockResolvedValue(mockUser),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(UserService)
      .useValue(mockUserService)
      .overrideGuard(AuthGuard)
      .useValue({
        canActivate: (context) => {
          const req = context.switchToHttp().getRequest();
          req.user = mockUser;
          return true;
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/user/me (GET)', () => {
    it('should return current user profile', () => {
      return request(app.getHttpServer())
        .get('/user/me')
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toEqual(mockUser);
        });
    });
  });

  describe('/user/me (PATCH)', () => {
    it('should update current user profile', () => {
      return request(app.getHttpServer())
        .patch('/user/me')
        .send({ firstName: 'Jane' })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.firstName).toEqual('Jane');
        });
    });
  });

  describe('/user/me (DELETE)', () => {
    it('should delete current user account', () => {
      return request(app.getHttpServer()).delete('/user/me').expect(200);
    });
  });
});
