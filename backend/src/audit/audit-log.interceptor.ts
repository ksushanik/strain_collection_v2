import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditLogService } from './audit-log.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private auditLogService: AuditLogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<{
      user?: { userId?: number; id?: number };
      method: string;
      url: string;
      headers: Record<string, string | string[] | undefined>;
      params?: Record<string, unknown>;
      body?: unknown;
      ip?: string;
      get: (name: string) => string;
    }>();
    const user = request.user;
    const method = request.method;
    const url = request.url;
    const batchHeader = request.headers['x-batch-id'];
    const batchId =
      typeof batchHeader === 'string'
        ? batchHeader
        : Array.isArray(batchHeader)
          ? batchHeader[0]
          : undefined;
    const bodyObj =
      typeof request.body === 'object' && request.body !== null
        ? (request.body as Record<string, unknown>)
        : undefined;
    const commentHeader = request.headers['x-audit-comment'];
    const headerComment =
      typeof commentHeader === 'string'
        ? commentHeader
        : Array.isArray(commentHeader)
          ? commentHeader[0]
          : undefined;
    const bodyComment =
      typeof bodyObj?.comment === 'string' ? bodyObj?.comment : undefined;

    return next.handle().pipe(
      tap((data) => {
        // Логируем только действия изменения
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && user) {
          try {
            const action = this.mapMethodToAction(method, url);
            const entity = this.extractEntity(url);
            const dataObj =
              typeof data === 'object' && data !== null
                ? (data as Record<string, unknown>)
                : undefined;
            const paramsObj = request.params ?? {};
            const rawIdValue: unknown =
              typeof dataObj?.id === 'string' || typeof dataObj?.id === 'number'
                ? dataObj?.id
                : typeof paramsObj['id'] === 'string' ||
                    typeof paramsObj['id'] === 'number'
                  ? paramsObj['id']
                  : typeof paramsObj['cellCode'] === 'string'
                    ? paramsObj['cellCode']
                    : typeof bodyObj?.entityId === 'string' ||
                        typeof bodyObj?.entityId === 'number'
                      ? bodyObj?.entityId
                      : undefined;

            const entityId =
              typeof rawIdValue === 'string' || typeof rawIdValue === 'number'
                ? Number(rawIdValue)
                : undefined;

            if (entity && Number.isFinite(entityId)) {
              void this.auditLogService.log({
                userId:
                  typeof user?.userId === 'number'
                    ? user.userId
                    : typeof user?.id === 'number'
                      ? user.id
                      : 0,
                action,
                entity,
                entityId: entityId as number,
                batchId,
                comment: bodyComment ?? headerComment,
                changes:
                  method === 'DELETE'
                    ? undefined
                    : (bodyObj as unknown as Prisma.InputJsonValue),
                metadata: {
                  url: request.url,
                  method: request.method,
                  ip: request.ip ?? '',
                  userAgent: request.get('user-agent'),
                },
              });
            }
          } catch (error) {
            // Не прерываем основной поток при ошибке аудита
            console.error('Audit log error:', error);
          }
        }
      }),
    );
  }

  private mapMethodToAction(
    method: string,
    url: string,
  ):
    | 'CREATE'
    | 'UPDATE'
    | 'DELETE'
    | 'ALLOCATE'
    | 'UNALLOCATE'
    | 'BULK_ALLOCATE'
    | 'CONFIG' {
    if (url.includes('bulk-allocate')) return 'BULK_ALLOCATE';
    if (url.includes('unallocate')) return 'UNALLOCATE';
    if (url.includes('allocate')) return 'ALLOCATE';
    if (url.includes('settings')) return 'CONFIG';
    if (method === 'POST') return 'CREATE';
    if (method === 'DELETE') return 'DELETE';
    return 'UPDATE';
  }

  private extractEntity(url: string): string | null {
    // Извлекаем первую часть после /api/v1/
    const match = url.match(/\/api\/v1\/([^/?]+)/);
    if (match) {
      const entity = match[1];
      const singular = entity.endsWith('s') ? entity.slice(0, -1) : entity;
      return singular.charAt(0).toUpperCase() + singular.slice(1);
    }
    return null;
  }
}
