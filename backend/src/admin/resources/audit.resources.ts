import { ResourceWithOptions } from 'adminjs';
import { PrismaClient } from '@prisma/client';
import { auditNavigation } from '../navigation';

type GetModelByName = (modelName: string) => any;

export interface AuditResourcesDeps {
  prisma: PrismaClient;
  getModelByName: GetModelByName;
  jsonShowComponent: string;
}

export const buildAuditResources = ({
  prisma,
  getModelByName,
  jsonShowComponent,
}: AuditResourcesDeps): ResourceWithOptions[] => [
  {
    resource: { model: getModelByName('AuditLog'), client: prisma },
    options: {
      navigation: auditNavigation,
      actions: {
        new: { isAccessible: () => false },
        edit: { isAccessible: () => false },
        delete: { isAccessible: () => false },
      },
      properties: {
        id: {
          isVisible: { list: true, filter: true, show: true, edit: false },
        },
        userId: {
          isVisible: { list: true, filter: true, show: true, edit: false },
          reference: 'User',
        },
        action: {
          isVisible: { list: true, filter: true, show: true, edit: false },
        },
        entity: {
          isVisible: { list: true, filter: true, show: true, edit: false },
        },
        entityId: {
          isVisible: { list: true, filter: true, show: true, edit: false },
        },
        batchId: {
          isVisible: { list: false, filter: true, show: true, edit: false },
        },
        comment: {
          isVisible: { list: true, filter: true, show: true, edit: false },
        },
        changes: {
          type: 'mixed',
          isVisible: { list: false, filter: false, show: true, edit: false },
          components: {
            show: jsonShowComponent,
          },
        },
        metadata: {
          type: 'mixed',
          isVisible: { list: false, filter: false, show: true, edit: false },
          components: {
            show: jsonShowComponent,
          },
        },
        createdAt: {
          isVisible: { list: true, filter: true, show: true, edit: false },
        },
      },
    },
  } as ResourceWithOptions,
];
