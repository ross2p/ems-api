import { INestApplication } from '@nestjs/common';
import { Server } from 'http';

export interface ApiBody<T = unknown> {
  message: string;
  statusCode: number;
  data: T;
  name: string;
  isError: boolean;
}

export interface PageData<T> {
  content: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  pageCount: number;
}

export function httpServer(app: INestApplication): Server {
  return app.getHttpServer() as Server;
}
