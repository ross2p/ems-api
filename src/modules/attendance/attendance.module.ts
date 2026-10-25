import { forwardRef, Module } from '@nestjs/common';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { AttendanceRepository } from './attendance.repository';
import { UserModule } from '../user/user.module';
import { EventModule } from '../event/event.module';

@Module({
  imports: [UserModule, forwardRef(() => EventModule)],
  controllers: [AttendanceController],
  providers: [AttendanceService, AttendanceRepository],
  exports: [AttendanceService],
})
export class AttendanceModule {}
