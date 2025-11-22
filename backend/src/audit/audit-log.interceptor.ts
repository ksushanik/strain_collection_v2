import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditLogService } from './audit-log.service';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private auditLogService: AuditLogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const method = request.method;
    const url = request.url;
    const batchId = request.headers['x-batch-id'] as string | undefined;
    const comment =
      (request.body && request.body.comment) ||
      (request.headers['x-audit-comment'] as string | undefined);

    return next.handle().pipe(
      tap(async (data) => {
        // Логируем только действия изменения
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && user) {
          try {
            const action = this.mapMethodToAction(method, url);
            const entity = this.extractEntity(url);
            const rawId =
              data?.id ||
              request.params?.id ||
              request.params?.cellCode ||
              request.body?.entityId;

            const entityId =
              typeof rawId === 'string' || typeof rawId === 'number'
                ? Number(rawId)
                : undefined;

            if (entity && Number.isFinite(entityId)) {
              await this.auditLogService.log({
                userId: user.userId || user.id,
                action,
                entity,
                entityId: entityId as number,
                batchId,
                comment,
                changes: method === 'DELETE' ? null : request.body,
                metadata: {
                  url: request.url,
                  method: request.method,
                  ip: request.ip,
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
    const match = url.match(/\/api\/v1\/([^\/\?]+)/);
    if (match) {
      const entity = match[1];
      const singular = entity.endsWith('s') ? entity.slice(0, -1) : entity;
      return singular.charAt(0).toUpperCase() + singular.slice(1);
    }
    return null;
  }
}
