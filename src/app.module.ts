import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { ResponseInterceptor } from './interceptors';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { globalPipe } from './pipes';
import { ErrorFilter, ExceptionFilter, GlobalFilter } from './filters';
import { HttpLoggerMiddleware } from './middlewares';
import { ConfigModule } from '@nestjs/config';
import { envSchema } from './schemas';
import { EventModule } from './modules/event/event.module';
import { CategoryModule } from './modules/category/category.module';
import { AuthModule } from './modules/auth/auth.module';
import { TokenModule } from './modules/token/token.module';
import { DatabaseModule } from './database/database.module';
import { AttendanceModule } from './modules/attendance/attendance.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envSchema,
    }),
    DatabaseModule,

    // <----MODULES---->
    UserModule,
    EventModule,
    CategoryModule,
    AuthModule,
    TokenModule,
    AttendanceModule,
  ],
  controllers: [AppController],
  providers: [
    // <----SERVICE---->
    AppService,

    // <----INTERCEPTOR---->
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },

    // <----PIPES---->
    {
      provide: APP_PIPE,
      useValue: globalPipe,
    },

    // <----FILTERS---->
    {
      provide: APP_FILTER,
      useClass: GlobalFilter,
    },
    {
      provide: APP_FILTER,
      useClass: ErrorFilter,
    },
    {
      provide: APP_FILTER,
      useClass: ExceptionFilter,
    },
  ],
})
export class AppModule {
  // <----MIDDLEWARE---->
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpLoggerMiddleware).forRoutes('*');
  }
}
