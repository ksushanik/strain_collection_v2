import { PrismaClient } from '@prisma/client';
import { ResourceWithOptions } from 'adminjs';
import { SettingsService } from '../settings/settings.service';
import { AuditLogService } from '../audit/audit-log.service';
import {
  buildAccessControlResources,
  buildAuditResources,
  buildCatalogResources,
  buildMediaResources,
  buildSettingsResources,
  buildStorageResources,
  buildDatabaseResources,
} from './resources';

export const createAdminOptions = (
  prisma: PrismaClient,
  getModelByName: (modelName: string) => any,
  settingsService: SettingsService,
  auditLogService: AuditLogService,
  permissionsComponent: any,
  jsonShowComponent: string,
  restoreComponent: string,
) => {
  const resources: ResourceWithOptions[] = [
    ...buildAccessControlResources({
      prisma,
      getModelByName,
      auditLogService,
      permissionsComponent,
    }),
    ...buildCatalogResources({
      prisma,
      getModelByName,
      auditLogService,
    }),
    ...buildSettingsResources({
      prisma,
      getModelByName,
      settingsService,
      auditLogService,
    }),
    ...buildAuditResources({
      prisma,
      getModelByName,
      jsonShowComponent,
    }),
    ...buildStorageResources({
      prisma,
      getModelByName,
      auditLogService,
    }),
    ...buildMediaResources({
      prisma,
      getModelByName,
      auditLogService,
    }),
    ...buildDatabaseResources({
      prisma,
      getModelByName,
      auditLogService,
      restoreComponent,
    }),
  ];

  return {
    rootPath: '/admin',
    branding: {
      companyName: 'Strain Collection',
      softwareBrothers: false,
    },
    resources,
    databases: [],
  };
};
