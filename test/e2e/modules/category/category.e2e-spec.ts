import request from 'supertest';
import { setupTestEnvironment } from '../../../utils/test-setup.util';
import { getAuthDetails } from '../../../e2e/utils/get-auth-details.utils';
import { randomUUID } from 'node:crypto';
import { ApiBody, httpServer, PageData } from '../../utils/typed-request.utils';

interface CategoryData {
  id: string;
  name: string;
  description: string | null;
}

describe('CategoryController (e2e)', () => {
  const env = setupTestEnvironment();

  describe('/category (POST)', () => {
    it('should create a new category when authenticated', async () => {
      const { token } = await getAuthDetails(env.app);

      const response = await request(httpServer(env.app))
        .post('/category')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Tech Events',
          description: 'All technology related events',
        })
        .expect(201);

      const body = response.body as ApiBody<CategoryData>;
      expect(body.message).toBe('Category created successfully');
      expect(body.data.name).toBe('Tech Events');
      expect(body.data.description).toBe('All technology related events');
    });

    it('should fail to create category when not authenticated', async () => {
      await request(httpServer(env.app))
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

      await request(httpServer(env.app))
        .post('/category')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Cat 1', description: 'Desc 1' })
        .expect(201);

      await request(httpServer(env.app))
        .post('/category')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Cat 2', description: 'Desc 2' })
        .expect(201);

      const response = await request(httpServer(env.app))
        .get('/category')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const body = response.body as ApiBody<PageData<CategoryData>>;
      expect(body.message).toBe('Categories retrieved successfully');
      expect(body.data.content.length).toBeGreaterThanOrEqual(2);
    });
    it('should fail with 401 if user unauthorized', async () => {
      await request(httpServer(env.app)).get('/category').expect(401);
    });
  });

  describe('/category/:id (GET)', () => {
    it('should retrieve a category by its ID', async () => {
      const { token } = await getAuthDetails(env.app);

      const createResponse = await request(httpServer(env.app))
        .post('/category')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Specific Category', description: 'Desc' })
        .expect(201);

      const createBody = createResponse.body as ApiBody<CategoryData>;
      const categoryId = createBody.data.id;

      const response = await request(httpServer(env.app))
        .get(`/category/${categoryId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const body = response.body as ApiBody<CategoryData>;
      expect(body.message).toBe('Category found successfully');
      expect(body.data.id).toBe(categoryId);
      expect(body.data.name).toBe('Specific Category');
    });

    it('should fail with 404 if category not found', async () => {
      const { token } = await getAuthDetails(env.app);
      const invalidCategoryId = randomUUID();
      await request(httpServer(env.app))
        .get(`/category/${invalidCategoryId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });

    it('should fail with 400 if categoryId is incorrect format', async () => {
      const { token } = await getAuthDetails(env.app);
      await request(httpServer(env.app))
        .get('/category/invalid-uuid')
        .set('Authorization', `Bearer ${token}`)
        .expect(400);
    });

    it('should fail with 401 if user unauthorized', async () => {
      const invalidCategoryId = randomUUID();
      await request(httpServer(env.app))
        .get(`/category/${invalidCategoryId}`)
        .expect(401);
    });
  });

  describe('/category/:id (PATCH)', () => {
    it('should update a category when authenticated', async () => {
      const { token } = await getAuthDetails(env.app);

      const createResponse = await request(httpServer(env.app))
        .post('/category')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Old Name', description: 'Old desc' })
        .expect(201);

      const createBody = createResponse.body as ApiBody<CategoryData>;
      const categoryId = createBody.data.id;

      const response = await request(httpServer(env.app))
        .patch(`/category/${categoryId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'New Name' })
        .expect(200);

      const body = response.body as ApiBody<CategoryData>;
      expect(body.message).toBe('Category updated successfully');
      expect(body.data.name).toBe('New Name');
    });

    it('should fail with 400 if categoryId is incorrect format', async () => {
      const { token } = await getAuthDetails(env.app);
      await request(httpServer(env.app))
        .patch('/category/invalid-uuid')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'New Name' })
        .expect(400);
    });

    it('should fail with 404 if category not found', async () => {
      const { token } = await getAuthDetails(env.app);
      const invalidCategoryId = randomUUID();
      await request(httpServer(env.app))
        .patch(`/category/${invalidCategoryId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'New Name' })
        .expect(404);
    });

    it('should fail to update category when unauthorized', async () => {
      const invalidCategoryId = randomUUID();
      await request(httpServer(env.app))
        .patch(`/category/${invalidCategoryId}`)
        .send({ name: 'New Name' })
        .expect(401);
    });
  });

  describe('/category/:id (DELETE)', () => {
    it('should delete a category when authenticated', async () => {
      const { token } = await getAuthDetails(env.app);

      const createResponse = await request(httpServer(env.app))
        .post('/category')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'To Delete', description: 'desc' })
        .expect(201);

      const createBody = createResponse.body as ApiBody<CategoryData>;
      const categoryId = createBody.data.id;

      const deleteResponse = await request(httpServer(env.app))
        .delete(`/category/${categoryId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const deleteBody = deleteResponse.body as ApiBody<unknown>;
      expect(deleteBody.message).toBe('Category deleted successfully');

      await request(httpServer(env.app))
        .get(`/category/${categoryId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
    it('should fail with 400 if categoryId is incorrect format', async () => {
      const { token } = await getAuthDetails(env.app);
      await request(httpServer(env.app))
        .delete('/category/invalid-uuid')
        .set('Authorization', `Bearer ${token}`)
        .expect(400);
    });

    it('should fail with 404 if category not found', async () => {
      const { token } = await getAuthDetails(env.app);
      const invalidCategoryId = randomUUID();
      await request(httpServer(env.app))
        .delete(`/category/${invalidCategoryId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });

    it('should fail to delete category when unauthorized', async () => {
      const invalidCategoryId = randomUUID();
      await request(httpServer(env.app))
        .delete(`/category/${invalidCategoryId}`)
        .expect(401);
    });
  });
});
