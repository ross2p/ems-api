import request from 'supertest';
import { setupE2ETestEnvironment } from '../../utils/e2e-setup.util';
import { getAuthDetails } from '../../utils/e2e-helpers.util';

describe('CategoryController (e2e)', () => {
  const env = setupE2ETestEnvironment();

  describe('/category (POST)', () => {
    it('should create a new category when authenticated', async () => {
      const { token } = await getAuthDetails(env.app);

      const response = await request(env.app.getHttpServer())
        .post('/category')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Tech Events',
          description: 'All technology related events',
        })
        .expect(201);

      expect(response.body.message).toBe('Category created successfully');
      expect(response.body.data.name).toBe('Tech Events');
      expect(response.body.data.description).toBe(
        'All technology related events',
      );
    });

    it('should fail to create category when not authenticated', async () => {
      await request(env.app.getHttpServer())
        .post('/category')
        .send({
          name: 'Tech Events',
          description: 'All technology related events',
        })
        .expect(401);
    });
  });

  describe('/category (GET)', () => {
    it('should retrieve a paginated list of categories', async () => {
      const { token } = await getAuthDetails(env.app);

      // Create some categories first
      await request(env.app.getHttpServer())
        .post('/category')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Cat 1', description: 'Desc 1' })
        .expect(201);

      await request(env.app.getHttpServer())
        .post('/category')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Cat 2', description: 'Desc 2' })
        .expect(201);

      const response = await request(env.app.getHttpServer())
        .get('/category')
        .expect(200);

      expect(response.body.message).toBe('Categories retrieved successfully');
      expect(response.body.data.content.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('/category/:id (GET)', () => {
    it('should retrieve a category by its ID', async () => {
      const { token } = await getAuthDetails(env.app);

      const createResponse = await request(env.app.getHttpServer())
        .post('/category')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Specific Category', description: 'Desc' })
        .expect(201);

      const categoryId = createResponse.body.data.id;

      const response = await request(env.app.getHttpServer())
        .get(`/category/${categoryId}`)
        .expect(200);

      expect(response.body.message).toBe('Category found successfully');
      expect(response.body.data.id).toBe(categoryId);
      expect(response.body.data.name).toBe('Specific Category');
    });

    it('should fail with 404 if category not found', async () => {
      // Valid UUID but random
      await request(env.app.getHttpServer())
        .get('/category/123e4567-e89b-12d3-a456-426614174000')
        .expect(404);
    });
  });

  describe('/category/:id (PATCH)', () => {
    it('should update a category when authenticated', async () => {
      const { token } = await getAuthDetails(env.app);

      const createResponse = await request(env.app.getHttpServer())
        .post('/category')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Old Name', description: 'Old desc' })
        .expect(201);

      const categoryId = createResponse.body.data.id;

      const response = await request(env.app.getHttpServer())
        .patch(`/category/${categoryId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'New Name' })
        .expect(200);

      expect(response.body.message).toBe('Category updated successfully');
      expect(response.body.data.name).toBe('New Name');
    });
  });

  describe('/category/:id (DELETE)', () => {
    it('should delete a category when authenticated', async () => {
      const { token } = await getAuthDetails(env.app);

      const createResponse = await request(env.app.getHttpServer())
        .post('/category')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'To Delete', description: 'desc' })
        .expect(201);

      const categoryId = createResponse.body.data.id;

      const deleteResponse = await request(env.app.getHttpServer())
        .delete(`/category/${categoryId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(deleteResponse.body.message).toBe('Category deleted successfully');

      // Verify it's gone
      await request(env.app.getHttpServer())
        .get(`/category/${categoryId}`)
        .expect(404);
    });
  });
});
