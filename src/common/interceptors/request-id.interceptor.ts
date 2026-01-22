import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RequestIdInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    
    const requestId = request.headers['x-request-id'] || uuidv4();
    request.requestId = requestId;
    response.setHeader('X-Request-Id', requestId);

    const { method, url, ip } = request;
    const userAgent = request.get('user-agent') || '';
    const startTime = Date.now();

    this.logger.log(
      `[${requestId}] ${method} ${url} - ${ip} - ${userAgent}`,
    );

    return next.handle().pipe(
      tap({
        next: () => {
          const { statusCode } = response;
          const contentLength = response.get('content-length') || 0;
          const elapsed = Date.now() - startTime;

          this.logger.log(
            `[${requestId}] ${method} ${url} ${statusCode} ${contentLength}b - ${elapsed}ms`,
          );
        },
        error: (error) => {
          const elapsed = Date.now() - startTime;
          this.logger.error(
            `[${requestId}] ${method} ${url} ${error.status || 500} - ${elapsed}ms - ${error.message}`,
          );
        },
      }),
    );
  }
}
