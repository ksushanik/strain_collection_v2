import { ResourceWithOptions } from 'adminjs';
import { PrismaClient } from '@prisma/client';

export const createAdminOptions = (
  prisma: PrismaClient,
  getModelByName: (modelName: string) => any,
) => {
  return {
    rootPath: '/admin',
    branding: {
      companyName: 'Strain Collection',
      softwareBrothers: false,
    },
    resources: [
      // Users Management
      {
        resource: { model: getModelByName('User'), client: prisma },
        options: {
          navigation: {
            name: 'Управление пользователями',
            icon: 'User',
          },
          properties: {
            password: {
              isVisible: {
                list: false,
                filter: false,
                show: false,
                edit: true,
              },
            },
            id: {
              isVisible: { list: true, filter: true, show: true, edit: false },
            },
            email: {
              isVisible: { list: true, filter: true, show: true, edit: true },
            },
            name: {
              isVisible: { list: true, filter: true, show: true, edit: true },
            },
            role: {
              isVisible: { list: true, filter: true, show: true, edit: true },
              availableValues: [
                { value: 'USER', label: 'User' },
                { value: 'MANAGER', label: 'Manager' },
                { value: 'ADMIN', label: 'Admin' },
              ],
            },
            createdAt: {
              isVisible: { list: true, filter: false, show: true, edit: false },
            },
            updatedAt: {
              isVisible: {
                list: false,
                filter: false,
                show: true,
                edit: false,
              },
            },
          },
        },
      } as ResourceWithOptions,

      // Groups Management
      {
        resource: { model: getModelByName('Group'), client: prisma },
        options: {
          navigation: {
            name: 'Управление пользователями',
            icon: 'Users',
          },
          properties: {
            id: {
              isVisible: { list: true, filter: true, show: true, edit: false },
            },
            name: {
              isVisible: { list: true, filter: true, show: true, edit: true },
            },
            description: {
              isVisible: { list: true, filter: false, show: true, edit: true },
            },
          },
        },
      } as ResourceWithOptions,

      // Strains Management
      {
        resource: { model: getModelByName('Strain'), client: prisma },
        options: {
          navigation: {
            name: 'Коллекция',
            icon: 'Microscope',
          },
          properties: {
            id: {
              isVisible: { list: true, filter: true, show: true, edit: false },
            },
            identifier: {
              isVisible: { list: true, filter: true, show: true, edit: true },
            },
            cultivationConditions: {
              isVisible: { list: false, filter: false, show: true, edit: true },
            },
            notes: {
              isVisible: { list: false, filter: false, show: true, edit: true },
            },
            createdAt: {
              isVisible: { list: true, filter: false, show: true, edit: false },
            },
          },
        },
      } as ResourceWithOptions,

      // Samples Management
      {
        resource: { model: getModelByName('Sample'), client: prisma },
        options: {
          navigation: {
            name: 'Коллекция',
            icon: 'FlaskConical',
          },
          properties: {
            id: {
              isVisible: { list: true, filter: true, show: true, edit: false },
            },
            code: {
              isVisible: { list: true, filter: true, show: true, edit: true },
            },
            sampleType: {
              isVisible: { list: true, filter: true, show: true, edit: true },
            },
            siteName: {
              isVisible: { list: true, filter: true, show: true, edit: true },
            },
            lat: {
              isVisible: { list: true, filter: true, show: true, edit: true },
            },
            lng: {
              isVisible: { list: true, filter: true, show: true, edit: true },
            },
            description: {
              isVisible: { list: true, filter: false, show: true, edit: true },
            },
            collectedAt: {
              isVisible: { list: true, filter: false, show: true, edit: true },
            },
            createdAt: {
              isVisible: { list: true, filter: false, show: true, edit: false },
            },
          },
        },
      } as ResourceWithOptions,

      // Storage Management
      {
        resource: { model: getModelByName('StorageBox'), client: prisma },
        options: {
          navigation: {
            name: 'Хранение',
            icon: 'Box',
          },
          properties: {
            id: {
              isVisible: { list: true, filter: true, show: true, edit: false },
            },
            displayName: {
              isVisible: { list: true, filter: true, show: true, edit: true },
            },
            rows: {
              isVisible: { list: true, filter: true, show: true, edit: true },
            },
            cols: {
              isVisible: { list: true, filter: true, show: true, edit: true },
            },
            description: {
              isVisible: { list: true, filter: false, show: true, edit: true },
            },
            createdAt: {
              isVisible: { list: true, filter: false, show: true, edit: false },
            },
            updatedAt: {
              isVisible: {
                list: false,
                filter: false,
                show: true,
                edit: false,
              },
            },
          },
        },
      } as ResourceWithOptions,

      {
        resource: { model: getModelByName('StorageCell'), client: prisma },
        options: {
          navigation: {
            name: 'Хранение',
            icon: 'Package',
          },
          properties: {
            id: {
              isVisible: { list: true, filter: true, show: true, edit: false },
            },
            boxId: {
              isVisible: { list: true, filter: true, show: true, edit: true },
            },
            row: {
              isVisible: { list: true, filter: true, show: true, edit: true },
            },
            col: {
              isVisible: { list: true, filter: true, show: true, edit: true },
            },
            cellCode: {
              isVisible: { list: true, filter: true, show: true, edit: true },
            },
            status: {
              isVisible: { list: true, filter: true, show: true, edit: true },
            },
          },
        },
      } as ResourceWithOptions,

      // Photo Management
      {
        resource: { model: getModelByName('SamplePhoto'), client: prisma },
        options: {
          navigation: {
            name: 'Медиа',
            icon: 'Image',
          },
          properties: {
            id: {
              isVisible: { list: true, filter: true, show: true, edit: false },
            },
            url: {
              isVisible: { list: true, filter: false, show: true, edit: false },
            },
            meta: {
              isVisible: { list: false, filter: false, show: true, edit: true },
            },
            createdAt: {
              isVisible: { list: true, filter: false, show: true, edit: false },
            },
          },
        },
      } as ResourceWithOptions,
    ],
    databases: [],
  };
};
