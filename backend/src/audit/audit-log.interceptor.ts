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
    constructor(private auditLogService: AuditLogService) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const method = request.method;

        return next.handle().pipe(
            tap(async (data) => {
                // Логируем только CUD операции
                if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && user) {
                    try {
                        const action = this.mapMethodToAction(method);
                        const entity = this.extractEntity(request.url);
                        const entityId = data?.id || request.params?.id;

                        if (entity && entityId) {
                            await this.auditLogService.log({
                                userId: user.userId || user.id,
                                action,
                                entity,
                                entityId: parseInt(entityId),
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
                        // Не прерываем выполнение если логирование упало
                        console.error('Audit log error:', error);
                    }
                }
            }),
        );
    }

    private mapMethodToAction(method: string): 'CREATE' | 'UPDATE' | 'DELETE' {
        if (method === 'POST') return 'CREATE';
        if (method === 'DELETE') return 'DELETE';
        return 'UPDATE';
    }

    private extractEntity(url: string): string | null {
        // Извлекаем имя сущности из URL (/api/strains -> Strain)
        const match = url.match(/\/([^\/\?]+)/);
        if (match) {
            const entity = match[1];
            // Удаляем множественное число (strains -> strain)
            const singular = entity.endsWith('s') ? entity.slice(0, -1) : entity;
            // Делаем первую букву заглавной
            return singular.charAt(0).toUpperCase() + singular.slice(1);
        }
        return null;
    }
}
