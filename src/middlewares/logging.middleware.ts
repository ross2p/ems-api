import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction, Send } from 'express';

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl, headers } = req;
    const body = req.body as unknown;
    const userAgent = req.get('user-agent') || '';
    const ip = req.ip;
    const isDebug = this.isDebugMode();
    const start = Date.now();

    this.logger.log(
      `Request: ${method} ${originalUrl} | IP: ${ip} | User-Agent: ${userAgent}`,
    );

    if (isDebug) {
      this.logger.debug(`Headers: ${JSON.stringify(headers)}`);
      if (body && typeof body === 'object') {
        const safeBody = this.sanitizeBody(body as Record<string, unknown>);
        this.logger.debug(`Body: ${JSON.stringify(safeBody)}`);
      }
    }

    const originalSend = res.send.bind(res) as Send;
    let responseBody: unknown;

    res.send = (body: unknown): Response => {
      responseBody = body;
      return originalSend(body);
    };

    res.on('finish', () => {
      const duration = Date.now() - start;
      this.logger.log(
        `Response: ${method} ${originalUrl} ${res.statusCode} - ${duration}ms`,
      );
      if (isDebug) {
        this.logger.debug(
          `Response Headers: ${JSON.stringify(res.getHeaders())}`,
        );
        this.logger.debug(`Response Body: ${JSON.stringify(responseBody)}`);
      }
    });

    next();
  }

  private isDebugMode(): boolean {
    return process.env.NODE_ENV === 'debug';
  }

  private sanitizeBody(body: Record<string, unknown>): Record<string, unknown> {
    const safeBody = { ...body };
    if (typeof safeBody.password === 'string') safeBody.password = '[REDACTED]';
    if (typeof safeBody.token === 'string') safeBody.token = '[REDACTED]';
    return safeBody;
  }
}
