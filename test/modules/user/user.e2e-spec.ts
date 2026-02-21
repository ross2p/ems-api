import request from 'supertest';
import { setupE2ETestEnvironment } from '../../utils/e2e-setup.util';
import { getAuthDetails } from '../../utils/e2e-helpers.util';

describe('MeController (e2e)', () => {
  const env = setupE2ETestEnvironment();

  describe('/user/me (GET)', () => {
    it('should retrieve current user details', async () => {
      const { token, email } = await getAuthDetails(env.app);

      const response = await request(env.app.getHttpServer())
        .get('/user/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.message).toBe('User found successfully');
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

      const response = await request(env.app.getHttpServer())
        .patch('/user/me')
        .set('Authorization', `Bearer ${token}`)
        .send({
          firstName: 'UpdatedFirst',
          lastName: 'UpdatedLast',
        })
        .expect(200);

      expect(response.body.message).toBe('User updated successfully');
      expect(response.body.data.firstName).toBe('UpdatedFirst');
      expect(response.body.data.lastName).toBe('UpdatedLast');
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

      // Subsequent requests should fail as user is deleted
      await request(env.app.getHttpServer())
        .get('/user/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });
});
