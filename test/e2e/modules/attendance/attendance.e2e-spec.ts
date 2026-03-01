import request from 'supertest';
import { setupTestEnvironment } from '../../../utils/test-setup.util';
import { getAuthDetails } from '../../../e2e/utils/get-auth-details.utils';
import { createEvent } from '../../utils/create-event.utils';
import { VALIDATION_MESSAGE } from '../../utils/constants';
import { randomUUID } from 'node:crypto';
import { HttpStatus } from '@nestjs/common';
import { ApiBody, httpServer, PageData } from '../../utils/typed-request.utils';

interface AttendanceData {
  id: string;
  eventId: string;
  userId: string;
}

describe('AttendanceController (e2e)', () => {
  const env = setupTestEnvironment();

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
      const response = await request(httpServer(env.app))
        .post('/attendance')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          eventId: eventId1,
          userId: userId1,
        })
        .expect(201);

      const body = response.body as ApiBody<AttendanceData>;
      expect(body.message).toBe('Attendance record created successfully');
      expect(body.data.eventId).toBe(eventId1);
      expect(body.data.userId).toBe(userId1);
    });

    it('should fail with validation error for invalid UUID', async () => {
      const response = await request(httpServer(env.app))
        .post('/attendance')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          eventId: eventId1,
          userId: 'invalid-uuid-format',
        })
        .expect(400);

      const body = response.body as ApiBody<unknown>;
      expect(body.message).toBe(VALIDATION_MESSAGE);
      expect(JSON.stringify(body.data)).toContain(
        'User ID must be a valid UUID',
      );
    });

    it('should fail with validation error when required fields are missing', async () => {
      const response = await request(httpServer(env.app))
        .post('/attendance')
        .set('Authorization', `Bearer ${token1}`)
        .send({})
        .expect(400);

      const body = response.body as ApiBody<unknown>;
      expect(body.message).toBe(VALIDATION_MESSAGE);
      const str = JSON.stringify(body);
      expect(str).toContain('userId');
      expect(str).toContain('eventId');
    });

    it('should fail with 401 if no token provided', async () => {
      await request(httpServer(env.app)).post('/attendance').expect(401);
    });
  });

  describe('/attendance (GET)', () => {
    it('should retrieve all attendance records', async () => {
      await request(httpServer(env.app))
        .post('/attendance')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          eventId: eventId1,
          userId: userId1,
        })
        .expect(201);

      const response = await request(httpServer(env.app))
        .get('/attendance')
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      const body = response.body as ApiBody<PageData<AttendanceData>>;
      expect(body.message).toBe('Attendance records retrieved successfully');
      expect(body.data.content.length).toBeGreaterThan(0);
      expect(body.data.content[0].eventId).toBe(eventId1);
    });
    it('should fail with 401 if no token provided', async () => {
      await request(httpServer(env.app)).get('/attendance').expect(401);
    });
  });

  describe('/attendance/:id (GET)', () => {
    it('should retrieve a specific attendance record by ID', async () => {
      const createResponse = await request(httpServer(env.app))
        .post('/attendance')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          eventId: eventId1,
          userId: userId1,
        })
        .expect(201);

      const createBody = createResponse.body as ApiBody<AttendanceData>;
      const attendanceId = createBody.data.id;

      const response = await request(httpServer(env.app))
        .get(`/attendance/${attendanceId}`)
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      const body = response.body as ApiBody<AttendanceData>;
      expect(body.message).toBe('Attendance record found successfully');
      expect(body.data.id).toBe(attendanceId);
      expect(body.data.eventId).toBe(eventId1);
    });
    it('should fail with 400 if uuid is incorrect', async () => {
      await request(httpServer(env.app))
        .get('/attendance/invalid-uuid')
        .set('Authorization', `Bearer ${token1}`)
        .expect(400);
    });

    it('should return 404 for non-existent attendance record', async () => {
      await request(httpServer(env.app))
        .get('/attendance/123e4567-e89b-12d3-a456-426614174000')
        .set('Authorization', `Bearer ${token1}`)
        .expect(404);
    });

    it('should fail with 401 if no token provided', async () => {
      const createResponse = await request(httpServer(env.app))
        .post('/attendance')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          eventId: eventId1,
          userId: userId1,
        })
        .expect(201);

      const createBody = createResponse.body as ApiBody<AttendanceData>;
      const attendanceId = createBody.data.id;

      await request(httpServer(env.app))
        .get(`/attendance/${attendanceId}`)
        .expect(401);
    });
  });

  describe('/attendance/user/:userId (GET)', () => {
    it('should retrieve attendance records for a specific user', async () => {
      await request(httpServer(env.app))
        .post('/attendance')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          eventId: eventId1,
          userId: userId1,
        })
        .expect(201);

      const response = await request(httpServer(env.app))
        .get(`/attendance/user/${userId1}`)
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      const body = response.body as ApiBody<AttendanceData[]>;
      expect(body.message).toBe(
        'User attendance records retrieved successfully',
      );
      expect(body.data.length).toBeGreaterThan(0);
      expect(body.data[0].userId).toBe(userId1);
    });

    it('should return empty array if user not found (or non-existent user)', async () => {
      const response = await request(httpServer(env.app))
        .get('/attendance/user/123e4567-e89b-12d3-a456-426614174000')
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);
      const body = response.body as ApiBody<AttendanceData[]>;
      expect(body.data).toEqual([]);
    });

    it('should fail with 401 if no token provided', async () => {
      await request(httpServer(env.app))
        .get(`/attendance/user/${userId1}`)
        .expect(401);
    });
  });

  describe('/attendance/event/:eventId (GET)', () => {
    it('should retrieve attendance records for a specific event', async () => {
      await request(httpServer(env.app))
        .post('/attendance')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          eventId: eventId1,
          userId: userId1,
        })
        .expect(201);

      const response = await request(httpServer(env.app))
        .get(`/attendance/event/${eventId1}`)
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      const body = response.body as ApiBody<AttendanceData[]>;
      expect(body.message).toBe(
        'Event attendance records retrieved successfully',
      );
      expect(body.data.length).toBeGreaterThan(0);
      expect(body.data[0].eventId).toBe(eventId1);
    });

    it('should fail with 400 if eventId is incorrect', async () => {
      await request(httpServer(env.app))
        .get('/attendance/event/invalid-uuid')
        .set('Authorization', `Bearer ${token1}`)
        .expect(400);
    });

    it('should fail with 401 if user unauthorized', async () => {
      await request(httpServer(env.app))
        .get(`/attendance/event/${eventId1}`)
        .expect(401);
    });

    it('should return empty array if event not found', async () => {
      const response = await request(httpServer(env.app))
        .get('/attendance/event/123e4567-e89b-12d3-a456-426614174000')
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);
      const body = response.body as ApiBody<AttendanceData[]>;
      expect(body.data).toEqual([]);
    });
  });

  describe('/attendance/:id (PATCH)', () => {
    it('should update an attendance record', async () => {
      const createResponse = await request(httpServer(env.app))
        .post('/attendance')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          eventId: eventId1,
          userId: userId1,
        })
        .expect(201);

      const createBody = createResponse.body as ApiBody<AttendanceData>;
      const attendanceId = createBody.data.id;
      const eventId2 = await createEvent(env.app, token1);

      const updateResponse = await request(httpServer(env.app))
        .patch(`/attendance/${attendanceId}`)
        .set('Authorization', `Bearer ${token1}`)
        .send({
          eventId: eventId2,
        })
        .expect(HttpStatus.OK);

      const updateBody = updateResponse.body as ApiBody<AttendanceData>;
      expect(updateBody.message).toBe('Attendance record updated successfully');
      expect(updateBody.data.eventId).toBe(eventId2);
    });

    it('should fail update when no fields provided', async () => {
      const createResponse = await request(httpServer(env.app))
        .post('/attendance')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          eventId: eventId1,
          userId: userId1,
        })
        .expect(201);

      const createBody = createResponse.body as ApiBody<AttendanceData>;
      const attendanceId = createBody.data.id;

      const response = await request(httpServer(env.app))
        .patch(`/attendance/${attendanceId}`)
        .set('Authorization', `Bearer ${token1}`)
        .send({})
        .expect(400);

      const body = response.body as ApiBody<unknown>;
      expect(body.message).toBe(VALIDATION_MESSAGE);
      expect(JSON.stringify(body.data)).toContain(
        'At least one field must be provided for update',
      );
    });
    it('should fail with 400 if eventId is incorrect in body', async () => {
      const attendanceId = 'invalid-uuid';

      await request(httpServer(env.app))
        .patch(`/attendance/${attendanceId}`)
        .set('Authorization', `Bearer ${token1}`)
        .send({ eventId: 'invalid-uuid' })
        .expect(400);
    });

    it('should fail with 404 if attendance event not found', async () => {
      const invalidAttendaceId = randomUUID();
      await request(httpServer(env.app))
        .patch(`/attendance/${invalidAttendaceId}`)
        .set('Authorization', `Bearer ${token1}`)
        .send({ eventId: eventId1 })
        .expect(404);
    });

    it('should fail with 401 if user unauthorized', async () => {
      const createResponse = await request(httpServer(env.app))
        .post('/attendance')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          eventId: eventId1,
          userId: userId1,
        })
        .expect(201);

      const createBody = createResponse.body as ApiBody<AttendanceData>;
      const attendanceId = createBody.data.id;
      await request(httpServer(env.app))
        .patch(`/attendance/${attendanceId}`)
        .send({ eventId: eventId1 })
        .expect(401);
    });
  });

  describe('/attendance/:id (DELETE)', () => {
    it('should delete a specific attendance record', async () => {
      const createResponse = await request(httpServer(env.app))
        .post('/attendance')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          eventId: eventId1,
          userId: userId1,
        })
        .expect(201);

      const createBody = createResponse.body as ApiBody<AttendanceData>;
      const attendanceId = createBody.data.id;

      const deleteResponse = await request(httpServer(env.app))
        .delete(`/attendance/${attendanceId}`)
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      const deleteBody = deleteResponse.body as ApiBody<unknown>;
      expect(deleteBody.message).toBe('Attendance record deleted successfully');

      await request(httpServer(env.app))
        .get(`/attendance/${attendanceId}`)
        .set('Authorization', `Bearer ${token1}`)
        .expect(404);
    });
    it('should fail with 400 if attendance id is incorrect', async () => {
      await request(httpServer(env.app))
        .delete('/attendance/invalid-uuid')
        .set('Authorization', `Bearer ${token1}`)
        .expect(400);
    });

    it('should fail with 404 if attendance not found', async () => {
      const invalidAttendaceId = randomUUID();
      await request(httpServer(env.app))
        .delete(`/attendance/${invalidAttendaceId}`)
        .set('Authorization', `Bearer ${token1}`)
        .expect(404);
    });

    it('should fail with 401 if user unauthorized', async () => {
      const createResponse = await request(httpServer(env.app))
        .post('/attendance')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          eventId: eventId1,
          userId: userId1,
        })
        .expect(201);

      const createBody = createResponse.body as ApiBody<AttendanceData>;
      const attendanceId = createBody.data.id;
      await request(httpServer(env.app))
        .delete(`/attendance/${attendanceId}`)
        .expect(401);
    });
  });
});
