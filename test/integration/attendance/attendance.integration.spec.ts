import { NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { AttendanceService } from '@/modules/attendance/attendance.service';
import { AttendanceFilterDto } from '@/modules/attendance/dtos/attendance-filter.dto';
import { CreateAttendanceDto } from '@/modules/attendance/dtos/create-attendance.dto';
import { setupTestEnvironment } from 'test/utils/test-setup.util';

describe('AttendanceService (Integration)', () => {
  const env = setupTestEnvironment();
  let attendanceService: AttendanceService;

  let testUserId: string;
  let testEventId: string;
  let testCategoryId: string;

  beforeAll(async () => {
    attendanceService = env.app.get(AttendanceService);
  });

  beforeEach(async () => {
    const user = await env.dbEnv.prisma.user.create({
      data: {
        email: `attendee_${Date.now()}@example.com`,
        firstName: 'Attend',
        lastName: 'User',
        password: 'hashedpassword',
      },
    });
    testUserId = user.id;

    const category = await env.dbEnv.prisma.category.create({
      data: {
        name: `Tech_${Date.now()}`,
        description: 'Tech events',
        createdById: testUserId,
      },
    });
    testCategoryId = category.id;

    const event = await env.dbEnv.prisma.event.create({
      data: {
        title: 'Masterclass',
        description: 'Learning',
        startDate: new Date(),
        endDate: new Date(),
        location: 'Kyiv',
        categoryId: testCategoryId,
        createdById: testUserId,
      },
    });
    testEventId = event.id;
  });

  describe('createAttendance', () => {
    it('should successfully create specific attendance', async () => {
      const dto: CreateAttendanceDto = {
        userId: testUserId,
        eventId: testEventId,
      };

      const result = await attendanceService.createAttendance(dto);
      expect(result).toBeDefined();
      expect(result.userId).toBe(testUserId);
      expect(result.eventId).toBe(testEventId);

      const dbRes = await env.dbEnv.prisma.attendance.findUnique({
        where: { id: result.id },
      });
      expect(dbRes).toBeDefined();
      expect(dbRes?.userId).toBe(testUserId);
    });
  });

  describe('findAttendanceByIdOrThrow', () => {
    it('should return attendance by id', async () => {
      const created = await attendanceService.createAttendance({
        userId: testUserId,
        eventId: testEventId,
      });

      const found = await attendanceService.findAttendanceByIdOrThrow(
        created.id,
      );
      expect(found).toBeDefined();
      expect(found.id).toBe(created.id);
    });

    it('should throw NotFoundException for invalid id', async () => {
      await expect(
        attendanceService.findAttendanceByIdOrThrow(randomUUID()),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAllAttendance / specific find methods', () => {
    let secondUserId: string;
    let secondEventId: string;

    beforeEach(async () => {
      const user2 = await env.dbEnv.prisma.user.create({
        data: {
          email: `second_${Date.now()}@example.com`,
          firstName: 'Another',
          lastName: 'User',
          password: 'pw',
        },
      });
      secondUserId = user2.id;

      const event2 = await env.dbEnv.prisma.event.create({
        data: {
          title: 'Another Masterclass',
          description: 'Learning 2',
          startDate: new Date(),
          endDate: new Date(),
          location: 'Kyiv',
          categoryId: testCategoryId,
          createdById: testUserId,
        },
      });
      secondEventId = event2.id;

      await attendanceService.createAttendance({
        userId: testUserId,
        eventId: testEventId,
      });
      await attendanceService.createAttendance({
        userId: secondUserId,
        eventId: testEventId,
      });
      await attendanceService.createAttendance({
        userId: testUserId,
        eventId: secondEventId,
      });
    });

    it('should findAllAttendance with filters', async () => {
      const filter = new AttendanceFilterDto();
      filter.pageNumber = 1;
      filter.pageSize = 10;
      filter.eventId = testEventId;

      const res = await attendanceService.findAllAttendance(filter);
      expect(res.content.length).toBeGreaterThanOrEqual(2);
    });

    it('should findAttendanceByUserId', async () => {
      const res = await attendanceService.findAttendanceByUserId(testUserId);
      expect(res.length).toBeGreaterThanOrEqual(2);
    });

    it('should findAttendanceByEventId', async () => {
      const res =
        await attendanceService.findAttendanceByEventId(secondEventId);
      expect(res.length).toBeGreaterThanOrEqual(1);
    });

    it('should findUsersWhoAttendedEvents', async () => {
      const res = await attendanceService.findUsersWhoAttendedEvents([
        testEventId,
      ]);
      expect(res.length).toBeGreaterThanOrEqual(1);
      const userIds = res.map((u) => u.userId);
      expect(userIds).toContain(testUserId);
    });
  });

  describe('updateAttendance', () => {
    it('should successfully update attendance', async () => {
      const created = await attendanceService.createAttendance({
        userId: testUserId,
        eventId: testEventId,
      });

      const updated = await attendanceService.updateAttendance(created.id, {
        eventId: testEventId, // no other fields to update really, just simulating functionality
      });
      expect(updated.eventId).toBe(testEventId);
    });

    it('should throw NotFoundException when updating non-existent attendance', async () => {
      await expect(
        attendanceService.updateAttendance(randomUUID(), {
          eventId: testEventId,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteAttendance', () => {
    it('should delete attendance successfully', async () => {
      const created = await attendanceService.createAttendance({
        userId: testUserId,
        eventId: testEventId,
      });

      const deleted = await attendanceService.deleteAttendance(created.id);
      expect(deleted.id).toBe(created.id);

      const dbRes = await env.dbEnv.prisma.attendance.findUnique({
        where: { id: created.id },
      });
      expect(dbRes).toBeNull();
    });

    it('should throw NotFoundException when deleting non-existent attendance', async () => {
      await expect(
        attendanceService.deleteAttendance(randomUUID()),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
