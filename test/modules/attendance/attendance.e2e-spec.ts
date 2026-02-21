import request from 'supertest';
import { setupE2ETestEnvironment } from '../../utils/e2e-setup.util';
import { getAuthDetails, createEvent } from '../../utils/e2e-helpers.util';

describe('AttendanceController (e2e)', () => {
  const env = setupE2ETestEnvironment();

  let token1: string;
  let userId1: string;
  let eventId1: string;

  beforeEach(async () => {
    const authDetails = await getAuthDetails(env.app);
    token1 = authDetails.token;
    userId1 = authDetails.userId;
    eventId1 = await createEvent(env.app, token1);
  });

  describe('/attendance (POST)', () => {
    it('should create a new attendance record', async () => {
      const response = await request(env.app.getHttpServer())
        .post('/attendance')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          eventId: eventId1,
          userId: userId1,
        })
        .expect(201);

      expect(response.body.message).toBe(
        'Attendance record created successfully',
      );
      expect(response.body.data.eventId).toBe(eventId1);
      expect(response.body.data.userId).toBe(userId1);
    });

    it('should fail with validation error for invalid UUID', async () => {
      await request(env.app.getHttpServer())
        .post('/attendance')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          eventId: eventId1,
          userId: 'invalid-uuid-format',
        })
        .expect(400);
    });
  });

  describe('/attendance (GET)', () => {
    it('should retrieve all attendance records', async () => {
      // Create a record first
      await request(env.app.getHttpServer())
        .post('/attendance')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          eventId: eventId1,
          userId: userId1,
        })
        .expect(201);

      const response = await request(env.app.getHttpServer())
        .get('/attendance')
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      expect(response.body.message).toBe(
        'Attendance records retrieved successfully',
      );
      expect(response.body.data.content.length).toBeGreaterThan(0);
      expect(response.body.data.content[0].eventId).toBe(eventId1);
    });
  });

  describe('/attendance/user/:userId (GET)', () => {
    it('should retrieve attendance records for a specific user', async () => {
      await request(env.app.getHttpServer())
        .post('/attendance')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          eventId: eventId1,
          userId: userId1,
        })
        .expect(201);

      const response = await request(env.app.getHttpServer())
        .get(`/attendance/user/${userId1}`)
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      expect(response.body.message).toBe(
        'User attendance records retrieved successfully',
      );
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0].userId).toBe(userId1);
    });
  });

  describe('/attendance/:id (DELETE)', () => {
    it('should delete a specific attendance record', async () => {
      const createResponse = await request(env.app.getHttpServer())
        .post('/attendance')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          eventId: eventId1,
          userId: userId1,
        })
        .expect(201);

      const attendanceId = createResponse.body.data.id;

      const deleteResponse = await request(env.app.getHttpServer())
        .delete(`/attendance/${attendanceId}`)
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      expect(deleteResponse.body.message).toBe(
        'Attendance record deleted successfully',
      );

      // Verify deletion
      await request(env.app.getHttpServer())
        .get(`/attendance/${attendanceId}`)
        .set('Authorization', `Bearer ${token1}`)
        .expect(404);
    });
  });
});
