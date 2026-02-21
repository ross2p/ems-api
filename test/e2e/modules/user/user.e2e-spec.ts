import request from 'supertest';
import { setupE2ETestEnvironment } from '../../utils/e2e-setup.util';
import { getAuthDetails } from '../../../e2e/utils/get-auth-details.utils';
import { HttpStatus } from '@nestjs/common';
import { VALIDATION_MESSAGE } from '../../utils/constants';

describe('MeController (e2e)', () => {
  const env = setupE2ETestEnvironment();

  describe('/user/me (GET)', () => {
    it('should retrieve current user details', async () => {
      const { token, email, userId } = await getAuthDetails(env.app);

      const response = await request(env.app.getHttpServer())
        .get('/user/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.message).toBe('User found successfully');
      expect(response.body.data.id).toBe(userId);
      expect(response.body.data.email).toBe(email);
      expect(response.body.data.firstName).toBeDefined();
    });

    it('should fail with 401 if no token provided', async () => {
      await request(env.app.getHttpServer()).get('/user/me').expect(401);
    });
  });

  describe('/user/me (PATCH)', () => {
    it('should update current user details', async () => {
      const { token } = await getAuthDetails(env.app);

      const updateUser = {
        firstName: 'UpdatedFirst',
        lastName: 'UpdatedLast',
      };

      const response = await request(env.app.getHttpServer())
        .patch('/user/me')
        .set('Authorization', `Bearer ${token}`)
        .send({
          firstName: 'UpdatedFirst',
          lastName: 'UpdatedLast',
        })
        .expect(200);

      expect(response.body.message).toBe('User updated successfully');
      expect(response.body.data.firstName).toBe(updateUser.firstName);
      expect(response.body.data.lastName).toBe(updateUser.lastName);

      const user = await request(env.app.getHttpServer())
        .get('/user/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(user.body.data.firstName).toBe(updateUser.firstName);
      expect(user.body.data.lastName).toBe(updateUser.lastName);
    });

    it('should fail to update with empty body', async () => {
      const { token } = await getAuthDetails(env.app);

      const response = await request(env.app.getHttpServer())
        .patch('/user/me')
        .set('Authorization', `Bearer ${token}`)
        .send({})
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toBe(VALIDATION_MESSAGE);
    });

    it('should fail with 401 if no token provided', async () => {
      await request(env.app.getHttpServer()).patch('/user/me').expect(401);
    });
  });

  describe('/user/me (DELETE)', () => {
    it('should delete the current user', async () => {
      const { token } = await getAuthDetails(env.app);

      const response = await request(env.app.getHttpServer())
        .delete('/user/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.message).toBe('User deleted successfully');

      await request(env.app.getHttpServer())
        .get('/user/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });

    it('should fail with 401 if no token provided', async () => {
      await request(env.app.getHttpServer()).delete('/user/me').expect(401);
    });
  });
});
