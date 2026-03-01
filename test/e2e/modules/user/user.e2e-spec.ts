import request from 'supertest';
import { setupTestEnvironment } from '../../../utils/test-setup.util';
import { getAuthDetails } from '../../../e2e/utils/get-auth-details.utils';
import { HttpStatus } from '@nestjs/common';
import { VALIDATION_MESSAGE } from '../../utils/constants';
import { ApiBody, httpServer } from '../../utils/typed-request.utils';

interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

describe('MeController (e2e)', () => {
  const env = setupTestEnvironment();

  describe('/user/me (GET)', () => {
    it('should retrieve current user details', async () => {
      const { token, email, userId } = await getAuthDetails(env.app);

      const response = await request(httpServer(env.app))
        .get('/user/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const body = response.body as ApiBody<UserData>;
      expect(body.message).toBe('User found successfully');
      expect(body.data.id).toBe(userId);
      expect(body.data.email).toBe(email);
      expect(body.data.firstName).toBeDefined();
    });

    it('should fail with 401 if no token provided', async () => {
      await request(httpServer(env.app)).get('/user/me').expect(401);
    });
  });

  describe('/user/me (PATCH)', () => {
    it('should update current user details', async () => {
      const { token } = await getAuthDetails(env.app);

      const updateUser = {
        firstName: 'UpdatedFirst',
        lastName: 'UpdatedLast',
      };

      const response = await request(httpServer(env.app))
        .patch('/user/me')
        .set('Authorization', `Bearer ${token}`)
        .send({
          firstName: 'UpdatedFirst',
          lastName: 'UpdatedLast',
        })
        .expect(200);

      const body = response.body as ApiBody<UserData>;
      expect(body.message).toBe('User updated successfully');
      expect(body.data.firstName).toBe(updateUser.firstName);
      expect(body.data.lastName).toBe(updateUser.lastName);

      const user = await request(httpServer(env.app))
        .get('/user/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const userBody = user.body as ApiBody<UserData>;
      expect(userBody.data.firstName).toBe(updateUser.firstName);
      expect(userBody.data.lastName).toBe(updateUser.lastName);
    });

    it('should fail to update with empty body', async () => {
      const { token } = await getAuthDetails(env.app);

      const response = await request(httpServer(env.app))
        .patch('/user/me')
        .set('Authorization', `Bearer ${token}`)
        .send({})
        .expect(HttpStatus.BAD_REQUEST);

      const body = response.body as ApiBody<unknown>;
      expect(body.message).toBe(VALIDATION_MESSAGE);
    });

    it('should fail with 401 if no token provided', async () => {
      await request(httpServer(env.app)).patch('/user/me').expect(401);
    });
  });

  describe('/user/me (DELETE)', () => {
    it('should delete the current user', async () => {
      const { token } = await getAuthDetails(env.app);

      const response = await request(httpServer(env.app))
        .delete('/user/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const body = response.body as ApiBody<unknown>;
      expect(body.message).toBe('User deleted successfully');

      await request(httpServer(env.app))
        .get('/user/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });

    it('should fail with 401 if no token provided', async () => {
      await request(httpServer(env.app)).delete('/user/me').expect(401);
    });
  });
});
