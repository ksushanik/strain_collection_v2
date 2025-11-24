import { request, PaginatedResponse } from './api';

export interface AuditLog {
    id: number;
    userId: number;
    user?: {
        id: number;
        name?: string;
        email: string;
        role: string;
    };
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'ALLOCATE' | 'UNALLOCATE' | 'BULK_ALLOCATE' | 'CONFIG';
    entity: string;
    entityId: number;
    batchId?: string;
    comment?: string;
    changes?: Record<string, any>;
    metadata?: Record<string, any>;
    createdAt: string;
}

export const AuditService = {
    async getLogs(params?: {
        userId?: number;
        entity?: string;
        startDate?: string;
        endDate?: string;
        page?: number;
        limit?: number;
    }): Promise<AuditLog[]> {
        const query = new URLSearchParams();
        if (params?.userId) query.set('userId', params.userId.toString());
        if (params?.entity) query.set('entity', params.entity);
        if (params?.startDate) query.set('startDate', params.startDate);
        if (params?.endDate) query.set('endDate', params.endDate);

        // Note: The backend currently returns an array, not a paginated response object with meta.
        // If pagination is added later, this will need to be updated.
        const qs = query.toString();
        const response = await request(`/api/v1/audit-logs${qs ? `?${qs}` : ''}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch audit logs: ${response.statusText}`);
        }
        return response.json();
    },

    async getLogsByEntity(entity: string, entityId: number): Promise<AuditLog[]> {
        const query = new URLSearchParams();
        query.set('entity', entity);
        query.set('entityId', entityId.toString());

        const response = await request(`/api/v1/audit-logs/by-entity?${query.toString()}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch entity logs: ${response.statusText}`);
        }
        return response.json();
    }
};
