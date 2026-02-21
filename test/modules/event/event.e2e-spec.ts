import request from 'supertest';
import { setupE2ETestEnvironment } from '../../utils/e2e-setup.util';
import { getAuthDetails } from '../../utils/e2e-helpers.util';

describe('EventController (e2e)', () => {
  const env = setupE2ETestEnvironment();

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
          endDate: new Date(Date.now() + 86400000).toISOString(), // Before start date
          location: 'Remote',
        })
        .expect(400);
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
        .expect(200);

      expect(response.body.message).toBe('Events retrieved successfully');
      expect(response.body.data.content.length).toBeGreaterThan(0);
      expect(response.body.data.content[0].title).toBeDefined();
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
        .expect(200);

      expect(response.body.message).toBe('Event found successfully');
      expect(response.body.data.id).toBe(eventId);
      expect(response.body.data.title).toBe('Specific Event');
    });

    it('should return 404 for non-existent event', async () => {
      await request(env.app.getHttpServer())
        .get('/event/123e4567-e89b-12d3-a456-426614174000')
        .expect(404);
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
      expect(response.body.data.description).toBe('Old description'); // unchanged
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

      // Verify deletion
      await request(env.app.getHttpServer())
        .get(`/event/${eventId}`)
        .expect(404);
    });
  });
});
