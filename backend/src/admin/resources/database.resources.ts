import { ResourceWithOptions } from 'adminjs';
import { Prisma, PrismaClient, CellStatus } from '@prisma/client';
import { AuditLogService } from '../../audit/audit-log.service';
import { logAudit } from '../helpers/audit';

export interface DatabaseResourcesDeps {
  prisma: PrismaClient;
  getModelByName: (modelName: string) => any;
  auditLogService: AuditLogService;
  restoreComponent: string;
  backupComponent: string;
}

type BackupPayload = {
  // Dictionaries / Config
  sampleTypeDictionary: Prisma.SampleTypeDictionaryUncheckedCreateInput[];
  traitDefinitions: Prisma.TraitDefinitionUncheckedCreateInput[];
  methods: Prisma.MethodUncheckedCreateInput[];
  uiBindings: Prisma.UiBindingUncheckedCreateInput[];
  legendContent: Prisma.LegendContentUncheckedCreateInput[];

  // Samples
  samples: Prisma.SampleUncheckedCreateInput[];
  samplePhotos: Prisma.SamplePhotoUncheckedCreateInput[];

  // Strains
  strains: Prisma.StrainUncheckedCreateInput[];
  strainPhenotypes: Prisma.StrainPhenotypeUncheckedCreateInput[];
  strainGenetics: Prisma.StrainGeneticsUncheckedCreateInput[];
  strainPhotos: Prisma.StrainPhotoUncheckedCreateInput[];
  strainMedia: Prisma.StrainMediaUncheckedCreateInput[];
  strainStorage: Prisma.StrainStorageUncheckedCreateInput[];

  // Storage / Media
  storageBoxes: Prisma.StorageBoxUncheckedCreateInput[];
  storageCells: Prisma.StorageCellUncheckedCreateInput[];
  media: Prisma.MediaUncheckedCreateInput[];
};

const buildBackup = async (prisma: PrismaClient): Promise<BackupPayload> => {
  const [
    sampleTypeDictionary,
    traitDefinitions,
    methods,
    uiBindings,
    legendContent,
    samples,
    samplePhotos,
    strains,
    strainPhenotypes,
    strainGenetics,
    strainPhotos,
    strainMedia,
    strainStorage,
    storageBoxes,
    storageCells,
    media,
  ] = await prisma.$transaction([
    prisma.sampleTypeDictionary.findMany(),
    prisma.traitDefinition.findMany(),
    prisma.method.findMany(),
    prisma.uiBinding.findMany(),
    prisma.legendContent.findMany(),
    prisma.sample.findMany(),
    prisma.samplePhoto.findMany(),
    prisma.strain.findMany(),
    prisma.strainPhenotype.findMany(),
    prisma.strainGenetics.findMany(),
    prisma.strainPhoto.findMany(),
    prisma.strainMedia.findMany(),
    prisma.strainStorage.findMany(),
    prisma.storageBox.findMany(),
    prisma.storageCell.findMany(),
    prisma.media.findMany(),
  ]);

  return {
    sampleTypeDictionary,
    traitDefinitions,
    methods,
    uiBindings,
    legendContent,
    samples,
    samplePhotos,
    strains,
    strainPhenotypes,
    strainGenetics,
    strainPhotos,
    strainMedia,
    strainStorage,
    storageBoxes,
    storageCells,
    media,
  } as BackupPayload;
};

const wipeAll = async (tx: Prisma.TransactionClient) => {
  await tx.strainStorage.deleteMany();
  await tx.storageCell.deleteMany();
  await tx.storageBox.deleteMany();
  await tx.strainMedia.deleteMany();
  await tx.strainPhoto.deleteMany();
  await tx.strainPhenotype.deleteMany();
  await tx.strainGenetics.deleteMany();
  await tx.strain.deleteMany();
  await tx.samplePhoto.deleteMany();
  await tx.sample.deleteMany();
  await tx.sampleTypeDictionary.deleteMany();
  await tx.media.deleteMany();
  await tx.method.deleteMany();
  await tx.traitDefinition.deleteMany();
  await tx.uiBinding.deleteMany();
  await tx.legendContent.deleteMany();
};

const restoreBackup = async (prisma: PrismaClient, payload: BackupPayload) => {
  await prisma.$transaction(async (tx) => {
    await wipeAll(tx);

    if (payload.legendContent?.length) {
      await tx.legendContent.createMany({ data: payload.legendContent });
    }
    if (payload.uiBindings?.length) {
      await tx.uiBinding.createMany({ data: payload.uiBindings });
    }
    if (payload.sampleTypeDictionary?.length) {
      await tx.sampleTypeDictionary.createMany({
        data: payload.sampleTypeDictionary,
      });
    }
    if (payload.methods?.length) {
      await tx.method.createMany({ data: payload.methods });
    }
    if (payload.traitDefinitions?.length) {
      await tx.traitDefinition.createMany({ data: payload.traitDefinitions });
    }
    if (payload.media?.length) {
      await tx.media.createMany({ data: payload.media });
    }
    if (payload.samples?.length) {
      await tx.sample.createMany({ data: payload.samples });
    }
    if (payload.samplePhotos?.length) {
      await tx.samplePhoto.createMany({ data: payload.samplePhotos });
    }
    if (payload.strains?.length) {
      await tx.strain.createMany({ data: payload.strains });
    }
    if (payload.strainGenetics?.length) {
      await tx.strainGenetics.createMany({ data: payload.strainGenetics });
    }
    if (payload.strainPhenotypes?.length) {
      await tx.strainPhenotype.createMany({ data: payload.strainPhenotypes });
    }
    if (payload.strainPhotos?.length) {
      await tx.strainPhoto.createMany({ data: payload.strainPhotos });
    }
    if (payload.strainMedia?.length) {
      await tx.strainMedia.createMany({ data: payload.strainMedia });
    }
    if (payload.storageBoxes?.length) {
      await tx.storageBox.createMany({ data: payload.storageBoxes });
    }
    if (payload.storageCells?.length) {
      await tx.storageCell.createMany({ data: payload.storageCells });
    }
    if (payload.strainStorage?.length) {
      await tx.strainStorage.createMany({ data: payload.strainStorage });
      const occupiedCellIds = payload.strainStorage.map((s) => s.cellId);
      if (occupiedCellIds.length) {
        await tx.storageCell.updateMany({
          where: { id: { in: occupiedCellIds } },
          data: { status: CellStatus.OCCUPIED },
        });
      }
    }
  });
};

export const buildDatabaseResources = ({
  prisma,
  getModelByName,
  auditLogService,
  restoreComponent,
  backupComponent,
}: DatabaseResourcesDeps): ResourceWithOptions[] => [
  {
    resource: { model: getModelByName('SampleTypeDictionary'), client: prisma },
    options: {
      id: 'DatabaseMaintenance',
      navigation: { name: 'Maintenance', icon: 'Settings' },
      properties: {
        id: { isVisible: false },
        name: { isVisible: false },
        slug: { isVisible: false },
      },
      actions: {
        list: {
          actionType: 'resource',
          component: restoreComponent,
          showInDrawer: false,
          isVisible: true,
          guard: 'Backup/restore/wipe tools',
        },
        edit: { isVisible: false },
        delete: { isVisible: false },
        new: { isVisible: false },
        show: { isVisible: false },
        backup: {
          actionType: 'resource',
          icon: 'Archive',
          guard: 'Create backup of the database?',
          isVisible: true,
          component: backupComponent,
          showInDrawer: true,
          handler: async () => {
            const backup = await buildBackup(prisma);
            const json = JSON.stringify(backup, null, 2);
            return {
              notice: {
                message: 'Backup created',
                type: 'success',
              },
              backup: json,
            };
          },
        },
        restore: {
          actionType: 'resource',
          icon: 'Undo',
          component: restoreComponent,
          showInDrawer: true,
          guard: 'Restore will overwrite existing data. Continue?',
          handler: async (request, _response, context) => {
            if (request.method !== 'post') {
              return {
                notice: { message: 'Upload backup to restore', type: 'info' },
              };
            }
            const backupJson = (request.payload?.backupJson as string) || '';
            if (!backupJson.trim()) {
              return {
                notice: { message: 'No backup data provided', type: 'error' },
              };
            }
            let data: BackupPayload;
            try {
              data = JSON.parse(backupJson) as BackupPayload;
            } catch {
              return {
                notice: { message: 'Invalid JSON', type: 'error' },
              };
            }

            await restoreBackup(prisma, data);
            await logAudit({
              context,
              prisma,
              auditLogService,
              entity: 'Database',
              entityId: 0,
              action: 'UPDATE',
              comment: 'AdminJS: restore from backup',
              changes: {},
              route: 'admin/database/restore',
            });

            return {
              notice: {
                message: 'Database restored from backup',
                type: 'success',
              },
            };
          },
        },
        wipe: {
          actionType: 'resource',
          icon: 'Trash',
          guard: 'This will delete ALL data (except auth). Continue?',
          component: false,
          showInDrawer: false,
          handler: async (_req, _res, context) => {
            await prisma.$transaction(async (tx) => wipeAll(tx));
            await logAudit({
              context,
              prisma,
              auditLogService,
              entity: 'Database',
              entityId: 0,
              action: 'DELETE',
              comment: 'AdminJS: full wipe',
              changes: {},
              route: 'admin/database/wipe',
            });
            return {
              notice: { message: 'Database wiped', type: 'success' },
            };
          },
        },
      },
    },
  } as ResourceWithOptions,
];
