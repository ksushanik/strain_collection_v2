import { ResourceWithOptions } from 'adminjs';
import { PrismaClient } from '@prisma/client';

export const createAdminOptions = (prisma: PrismaClient, dmmf: any) => {
  return {
    rootPath: '/admin',
    branding: {
      companyName: 'Strain Collection',
      softwareBrothers: false,
    },
    resources: [
      // Users Management
      {
        resource: { model: dmmf.modelMap.User, client: prisma },
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
        resource: { model: dmmf.modelMap.Group, client: prisma },
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
        resource: { model: dmmf.modelMap.Strain, client: prisma },
        options: {
          navigation: {
            name: 'Коллекция',
            icon: 'Microscope',
          },
          properties: {
            id: {
              isVisible: { list: true, filter: true, show: true, edit: false },
            },
            catalogNumber: {
              isVisible: { list: true, filter: true, show: true, edit: true },
            },
            genus: {
              isVisible: { list: true, filter: true, show: true, edit: true },
            },
            species: {
              isVisible: { list: true, filter: true, show: true, edit: true },
            },
            strain: {
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
        resource: { model: dmmf.modelMap.Sample, client: prisma },
        options: {
          navigation: {
            name: 'Коллекция',
            icon: 'FlaskConical',
          },
          properties: {
            id: {
              isVisible: { list: true, filter: true, show: true, edit: false },
            },
            catalogNumber: {
              isVisible: { list: true, filter: true, show: true, edit: true },
            },
            sampleType: {
              isVisible: { list: true, filter: true, show: true, edit: true },
            },
            collectionDate: {
              isVisible: { list: true, filter: false, show: true, edit: true },
            },
            status: {
              isVisible: { list: true, filter: true, show: true, edit: true },
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

      // Storage Management
      {
        resource: { model: dmmf.modelMap.Storage, client: prisma },
        options: {
          navigation: {
            name: 'Хранение',
            icon: 'Box',
          },
          properties: {
            id: {
              isVisible: { list: true, filter: true, show: true, edit: false },
            },
            location: {
              isVisible: { list: true, filter: true, show: true, edit: true },
            },
            temperature: {
              isVisible: { list: true, filter: false, show: true, edit: true },
            },
            storageType: {
              isVisible: { list: true, filter: true, show: true, edit: true },
            },
            createdAt: {
              isVisible: { list: true, filter: false, show: true, edit: false },
            },
          },
        },
      } as ResourceWithOptions,

      // Photo Management
      {
        resource: { model: dmmf.modelMap.Photo, client: prisma },
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
            fileId: {
              isVisible: {
                list: false,
                filter: false,
                show: true,
                edit: false,
              },
            },
            description: {
              isVisible: { list: true, filter: false, show: true, edit: true },
            },
            uploadedAt: {
              isVisible: { list: true, filter: false, show: true, edit: false },
            },
          },
        },
      } as ResourceWithOptions,
    ],
    databases: [],
  };
};
