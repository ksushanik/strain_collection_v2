import { ResourceWithOptions } from 'adminjs';
import { Prisma, PrismaClient, ProfileKey } from '@prisma/client';
import { configurationNavigation } from '../navigation';
import { SettingsService } from '../../settings/settings.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { logAudit } from '../helpers/audit';

type GetModelByName = (modelName: string) => any;

type UiBindingPayload = {
  id?: number;
  menuLabel: string;
  profileKey: ProfileKey;
  icon?: string;
  enabledFieldPacks?: string[];
  routeSlug: string;
  order?: number;
  legendId?: number;
};

export interface SettingsResourcesDeps {
  prisma: PrismaClient;
  getModelByName: GetModelByName;
  settingsService: SettingsService;
  auditLogService: AuditLogService;
}

export const buildSettingsResources = ({
  prisma,
  getModelByName,
  settingsService,
  auditLogService,
}: SettingsResourcesDeps): ResourceWithOptions[] => [
  {
    resource: { model: getModelByName('UiBinding'), client: prisma },
    options: {
      navigation: configurationNavigation,
      properties: {
        id: {
          isVisible: { list: true, filter: true, show: true, edit: false },
        },
        menuLabel: {
          isVisible: { list: true, filter: true, show: true, edit: true },
        },
        profileKey: {
          isVisible: { list: true, filter: true, show: true, edit: true },
          availableValues: [
            { value: 'SAMPLE', label: 'Sample' },
            { value: 'STRAIN', label: 'Strain' },
            { value: 'MEDIA', label: 'Media' },
            { value: 'STORAGE', label: 'Storage' },
          ],
        },
        order: {
          isVisible: { list: true, filter: true, show: true, edit: true },
        },
        legendId: {
          isVisible: { list: true, filter: true, show: true, edit: true },
        },
        routeSlug: {
          isVisible: { list: true, filter: true, show: true, edit: true },
        },
        icon: {
          isVisible: { list: true, filter: true, show: true, edit: true },
        },
        enabledFieldPacks: { type: 'mixed', isArray: true },
        updatedAt: {
          isVisible: {
            list: false,
            filter: false,
            show: true,
            edit: false,
          },
        },
      },
      actions: {
        new: {
          handler: async (request: any, response: any, context: any) => {
            const params = (request?.payload ?? {}) as UiBindingPayload;
            const created = await settingsService.createUiBinding({
              menuLabel: params.menuLabel,
              profileKey: params.profileKey,
              icon: params.icon,
              enabledFieldPacks: params.enabledFieldPacks,
              routeSlug: params.routeSlug,
              order: params.order,
              legendId: params.legendId,
            });
            await logAudit({
              context,
              prisma,
              auditLogService,
              entity: 'UiBinding',
              entityId: created.id,
              action: 'CONFIG',
              comment: 'AdminJS: create UiBinding',
              changes: params as Prisma.InputJsonValue,
              route: 'admin/ui-binding/new',
            });
            return {
              record: { params: { ...created } },
            };
          },
        },
        edit: {
          handler: async (request: any, response: any, context: any) => {
            const params = (request?.payload ??
              {}) as Partial<UiBindingPayload>;
            const id = Number(request?.params?.recordId ?? params.id ?? 0);
            const updated = await settingsService.updateUiBinding(id, params);
            await logAudit({
              context,
              prisma,
              auditLogService,
              entity: 'UiBinding',
              entityId: id,
              action: 'CONFIG',
              comment: 'AdminJS: edit UiBinding',
              changes: params as Prisma.InputJsonValue,
              route: 'admin/ui-binding/edit',
            });
            return {
              record: { params: { ...updated } },
            };
          },
        },
        delete: {
          handler: async (request: any, response: any, context: any) => {
            const id = Number(request?.params?.recordId ?? 0);
            await settingsService.deleteUiBinding(id);
            await logAudit({
              context,
              prisma,
              auditLogService,
              entity: 'UiBinding',
              entityId: id,
              action: 'CONFIG',
              comment: 'AdminJS: delete UiBinding',
              changes: {} as Prisma.InputJsonValue,
              route: 'admin/ui-binding/delete',
            });
            return {
              notice: { message: 'Deleted', type: 'success' },
            };
          },
        },
      },
    },
  } as ResourceWithOptions,

  {
    resource: { model: getModelByName('LegendContent'), client: prisma },
    options: {
      navigation: configurationNavigation,
      properties: {
        id: {
          isVisible: { list: true, filter: true, show: true, edit: false },
        },
        content: {
          isVisible: { list: false, filter: false, show: true, edit: true },
        },
        updatedAt: {
          isVisible: { list: true, filter: false, show: true, edit: false },
        },
      },
      actions: {
        new: {
          handler: async (request: any, response: any, context: any) => {
            const params = request?.payload ?? {};
            const created = await settingsService.updateLegend({
              content: params.content,
            });
            await logAudit({
              context,
              prisma,
              auditLogService,
              entity: 'LegendContent',
              entityId: created.id,
              action: 'CONFIG',
              comment: 'AdminJS: create LegendContent',
              changes: params as Prisma.InputJsonValue,
              route: 'admin/legend/new',
            });
            return { record: { params: { ...created } } };
          },
        },
        edit: {
          handler: async (request: any, response: any, context: any) => {
            const params = request?.payload ?? {};
            const updated = await settingsService.updateLegend({
              content: params.content,
            });
            await logAudit({
              context,
              prisma,
              auditLogService,
              entity: 'LegendContent',
              entityId: updated.id,
              action: 'CONFIG',
              comment: 'AdminJS: edit LegendContent',
              changes: params as Prisma.InputJsonValue,
              route: 'admin/legend/edit',
            });
            return { record: { params: { ...updated } } };
          },
        },
        delete: {
          handler: async (request: any, response: any, context: any) => {
            const id = Number(request?.params?.recordId ?? 0);
            await settingsService.deleteLegend(id);
            await logAudit({
              context,
              prisma,
              auditLogService,
              entity: 'LegendContent',
              entityId: id,
              action: 'CONFIG',
              comment: 'AdminJS: delete LegendContent',
              changes: {} as Prisma.InputJsonValue,
              route: 'admin/legend/delete',
            });
            return { notice: { message: 'Deleted', type: 'success' } };
          },
        },
      },
    },
  } as ResourceWithOptions,
];
