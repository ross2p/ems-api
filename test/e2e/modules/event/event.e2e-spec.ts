import request from 'supertest';
import { randomUUID } from 'node:crypto';
import { setupTestEnvironment } from '../../../utils/test-setup.util';
import { getAuthDetails } from '../../../e2e/utils/get-auth-details.utils';
import { HttpStatus } from '@nestjs/common';
import { VALIDATION_MESSAGE } from '../../utils/constants';

describe('EventController (e2e)', () => {
  const env = setupTestEnvironment();

  let token1: string;
  let userId1: string;

  beforeEach(async () => {
    const authDetails = await getAuthDetails(env.app);
    token1 = authDetails.token;
    userId1 = authDetails.userId;
  });

  describe('/event (POST)', () => {
    it('should create a new event', async () => {
      const response = await request(env.app.getHttpServer())
        .post('/event')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          title: 'Future Tech Conference',
          description: 'A conference about future technologies',
          startDate: new Date(Date.now() + 86400000).toISOString(),
          endDate: new Date(Date.now() + 172800000).toISOString(),
          location: 'San Francisco, CA',
        })
        .expect(201);

      expect(response.body.message).toBe('Event created successfully');
      expect(response.body.data.title).toBe('Future Tech Conference');
      expect(response.body.data.createdById).toBe(userId1);
    });

    it('should fail with validation error when end date is before start date', async () => {
      await request(env.app.getHttpServer())
        .post('/event')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          title: 'Invalid Date Event',
          description: 'Testing invalid dates',
          startDate: new Date(Date.now() + 172800000).toISOString(),
          endDate: new Date(Date.now() + 86400000).toISOString(),
          location: 'Remote',
        })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should fail with 401 if no token provided', async () => {
      await request(env.app.getHttpServer()).post('/event').expect(401);
    });
  });

  describe('/event (GET)', () => {
    it('should retrieve a paginated list of events', async () => {
      // Create an event first
      await request(env.app.getHttpServer())
        .post('/event')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          title: 'Events List Test',
          description: 'A test event for listing',
          startDate: new Date(Date.now() + 86400000).toISOString(),
          endDate: new Date(Date.now() + 172800000).toISOString(),
          location: 'Online',
        })
        .expect(201);

      const response = await request(env.app.getHttpServer())
        .get('/event')
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      expect(response.body.message).toBe('Events retrieved successfully');
      expect(response.body.data.content.length).toBeGreaterThan(0);
      expect(response.body.data.content[0].title).toBeDefined();
    });
    it('should fail with 401 if no token provided', async () => {
      await request(env.app.getHttpServer()).get('/event').expect(401);
    });
  });

  describe('/event/:id (GET)', () => {
    it('should retrieve an event by ID', async () => {
      const createResponse = await request(env.app.getHttpServer())
        .post('/event')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          title: 'Specific Event',
          description: 'Find me by ID',
          startDate: new Date(Date.now() + 86400000).toISOString(),
          endDate: new Date(Date.now() + 172800000).toISOString(),
          location: 'Specific Location',
        })
        .expect(201);

      const eventId = createResponse.body.data.id;

      const response = await request(env.app.getHttpServer())
        .get(`/event/${eventId}`)
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      expect(response.body.message).toBe('Event found successfully');
      expect(response.body.data.id).toBe(eventId);
      expect(response.body.data.title).toBe('Specific Event');
    });

    it('should return 400 for invalid event id', async () => {
      const invalidEventId = 'invalid';
      const response = await request(env.app.getHttpServer())
        .get(`/event/${invalidEventId}`)
        .set('Authorization', `Bearer ${token1}`)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toEqual(VALIDATION_MESSAGE);
    });

    it('should fail with 401 if no token provided', async () => {
      const createResponse = await request(env.app.getHttpServer())
        .post('/event')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          title: 'Specific Event',
          description: 'Find me by ID',
          startDate: new Date(Date.now() + 86400000).toISOString(),
          endDate: new Date(Date.now() + 172800000).toISOString(),
          location: 'Specific Location',
        })
        .expect(201);

      const eventId = createResponse.body.data.id;
      await request(env.app.getHttpServer())
        .get(`/event/${eventId}`)
        .expect(401);
    });

    it('should return 404 for non-existent event', async () => {
      const invalidEventId = randomUUID();
      await request(env.app.getHttpServer())
        .get(`/event/${invalidEventId}`)
        .set('Authorization', `Bearer ${token1}`)
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('/event/:id (PATCH)', () => {
    it('should update an event successfully', async () => {
      const createResponse = await request(env.app.getHttpServer())
        .post('/event')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          title: 'Old Title',
          description: 'Old description',
          startDate: new Date(Date.now() + 86400000).toISOString(),
          endDate: new Date(Date.now() + 172800000).toISOString(),
          location: 'Old Location',
        })
        .expect(201);

      const eventId = createResponse.body.data.id;

      const response = await request(env.app.getHttpServer())
        .patch(`/event/${eventId}`)
        .set('Authorization', `Bearer ${token1}`)
        .send({
          title: 'New Event Title',
          location: 'New Location',
        })
        .expect(200);

      expect(response.body.message).toBe('Event updated successfully');
      expect(response.body.data.title).toBe('New Event Title');
      expect(response.body.data.location).toBe('New Location');
      expect(response.body.data.description).toBe('Old description');
    });

    it('should return 400 for invalid event id', async () => {
      await request(env.app.getHttpServer())
        .post('/event')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          title: 'Old Title',
          description: 'Old description',
          startDate: new Date(Date.now() + 86400000).toISOString(),
          endDate: new Date(Date.now() + 172800000).toISOString(),
          location: 'Old Location',
        })
        .expect(201);

      const eventId = 'invalid-id';

      const response = await request(env.app.getHttpServer())
        .patch(`/event/${eventId}`)
        .set('Authorization', `Bearer ${token1}`)
        .send({
          title: 'New Event Title',
          location: 'New Location',
        })
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toEqual(VALIDATION_MESSAGE);
    });

    it('should fail with 401 if no token provided', async () => {
      const createResponse = await request(env.app.getHttpServer())
        .post('/event')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          title: 'Specific Event',
          description: 'Find me by ID',
          startDate: new Date(Date.now() + 86400000).toISOString(),
          endDate: new Date(Date.now() + 172800000).toISOString(),
          location: 'Specific Location',
        })
        .expect(201);

      const eventId = createResponse.body.data.id;
      await request(env.app.getHttpServer())
        .patch(`/event/${eventId}`)
        .expect(401);
    });
  });

  describe('/event/:id (DELETE)', () => {
    it('should delete an event successfully', async () => {
      const createResponse = await request(env.app.getHttpServer())
        .post('/event')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          title: 'Event to Delete',
          description: 'This will be deleted',
          startDate: new Date(Date.now() + 86400000).toISOString(),
          endDate: new Date(Date.now() + 172800000).toISOString(),
          location: 'Nowhere',
        })
        .expect(201);

      const eventId = createResponse.body.data.id;

      const response = await request(env.app.getHttpServer())
        .delete(`/event/${eventId}`)
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      expect(response.body.message).toBe('Event deleted successfully');

      await request(env.app.getHttpServer())
        .get(`/event/${eventId}`)
        .set('Authorization', `Bearer ${token1}`)
        .expect(404);
    });

    it('should return 400 for invalid event id', async () => {
      const invalidEventId = 'invalid';
      const response = await request(env.app.getHttpServer())
        .delete(`/event/${invalidEventId}`)
        .set('Authorization', `Bearer ${token1}`)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toEqual(VALIDATION_MESSAGE);
    });

    it('should fail with 401 if no token provided', async () => {
      const createResponse = await request(env.app.getHttpServer())
        .post('/event')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          title: 'Specific Event',
          description: 'Find me by ID',
          startDate: new Date(Date.now() + 86400000).toISOString(),
          endDate: new Date(Date.now() + 172800000).toISOString(),
          location: 'Specific Location',
        })
        .expect(201);

      const eventId = createResponse.body.data.id;
      await request(env.app.getHttpServer())
        .delete(`/event/${eventId}`)
        .expect(401);
    });

    it('should fail with 404 if not found', async () => {
      const invalidEventId = randomUUID();
      await request(env.app.getHttpServer())
        .delete(`/event/${invalidEventId}`)
        .set('Authorization', `Bearer ${token1}`)
        .expect(HttpStatus.NOT_FOUND);
    });
  });
});
