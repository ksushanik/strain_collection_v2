import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Clear existing data in FK-safe order
  await prisma.auditLog.deleteMany();
  await prisma.user.deleteMany();
  await prisma.group.deleteMany();
  await prisma.role.deleteMany();
  await prisma.strainStorage.deleteMany();
  await prisma.storageCell.deleteMany();
  await prisma.storageBox.deleteMany();
  await prisma.uiBinding.deleteMany();
  await prisma.legendContent.deleteMany();
  await prisma.strainMedia.deleteMany();
  await prisma.media.deleteMany();
  await prisma.strain.deleteMany();
  await prisma.sample.deleteMany();

  // 2. Create legend and UI bindings
  console.log('Creating UI bindings and legend...');
  const legend = await prisma.legendContent.create({
    data: {
      content: '# Legend\n\n- Green: free cell\n- Red: occupied\n- Yellow: primary allocation',
    },
  });

  await prisma.uiBinding.createMany({
    data: ([
      {
        menuLabel: 'My Collection',
        profileKey: 'STRAIN',
        routeSlug: 'my-collection',
        icon: 'Microscope',
        enabledFieldPacks: ['basic_info', 'taxonomy', 'growth_characteristics'],
        order: 1,
        legendId: legend.id,
      },
      {
        menuLabel: 'Field Samples',
        profileKey: 'SAMPLE',
        routeSlug: 'field-samples',
        icon: 'Leaf',
        enabledFieldPacks: ['site_info'],
        order: 2,
        legendId: legend.id,
      },
      {
        menuLabel: 'Storage',
        profileKey: 'STORAGE',
        routeSlug: 'storage',
        icon: 'Box',
        enabledFieldPacks: [],
        order: 3,
        legendId: legend.id,
      },
    ] as any[]),
  });

  // 3. Roles
  console.log('Creating roles...');
  const [adminRole, managerRole, viewerRole] = await Promise.all([
    prisma.role.create({
      data: {
        key: 'ADMIN',
        name: 'Администратор',
        description: 'Полный доступ',
        permissions: { all: ['manage'] },
      },
    }),
    prisma.role.create({
      data: {
        key: 'MANAGER',
        name: 'Менеджер',
        description: 'CRUD доменов + чтение настроек/легенды',
        permissions: {
          Strain: ['read', 'create', 'update', 'delete'],
          Sample: ['read', 'create', 'update', 'delete'],
          Storage: ['read', 'create', 'update', 'delete'],
          Photo: ['read', 'create', 'update', 'delete'],
          Media: ['read', 'create', 'update', 'delete'],
          Settings: ['read'],
          Legend: ['read'],
          Analytics: ['read'],
          User: ['read'],
          Group: ['read'],
        },
      },
    }),
    prisma.role.create({
      data: {
        key: 'USER',
        name: 'Пользователь',
        description: 'Чтение основных разделов + ограниченный CRUD штаммов/проб/фото',
        permissions: {
          Strain: ['read', 'create', 'update'],
          Sample: ['read', 'create', 'update'],
          Photo: ['read', 'create', 'update'],
          Storage: ['read'],
          Media: ['read'],
          Analytics: ['read'],
          Legend: ['read'],
          Settings: ['read'],
        },
      },
    }),
  ]);

  // 4. Groups & Users with permissions
  console.log('Creating groups and users...');
  const adminGroup = await prisma.group.create({
    data: {
      name: 'Admins',
      description: 'Полный доступ к системе',
      permissions: { all: ['manage'] },
    },
  });

  const managerGroup = await prisma.group.create({
    data: {
      name: 'Managers',
      description: 'CRUD по штаммам/пробам/хранению/медиа, чтение настроек',
      permissions: {
        Strain: ['read', 'create', 'update', 'delete'],
        Sample: ['read', 'create', 'update', 'delete'],
        Storage: ['read', 'create', 'update', 'delete'],
        Photo: ['read', 'create', 'update', 'delete'],
        Media: ['read', 'create', 'update', 'delete'],
        Settings: ['read'],
        Legend: ['read'],
        Analytics: ['read'],
        User: ['read'],
        Group: ['read'],
      },
    },
  });

  const viewerGroup = await prisma.group.create({
    data: {
      name: 'Viewers',
      description: 'Только чтение основных разделов',
      permissions: {
        Strain: ['read'],
        Sample: ['read'],
        Storage: ['read'],
        Photo: ['read'],
        Media: ['read'],
        Analytics: ['read'],
        Legend: ['read'],
        Settings: ['read'],
      },
    },
  });

  const passwordAdmin = await bcrypt.hash('admin123', 10);
  const passwordManager = await bcrypt.hash('manager123', 10);
  const passwordViewer = await bcrypt.hash('viewer123', 10);

  await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Super Admin',
      password: passwordAdmin,
      roleId: adminRole.id,
      groupId: adminGroup.id,
    },
  });

  await prisma.user.create({
    data: {
      email: 'manager@example.com',
      name: 'Lab Manager',
      password: passwordManager,
      roleId: managerRole.id,
      groupId: managerGroup.id,
    },
  });

  await prisma.user.create({
    data: {
      email: 'viewer@example.com',
      name: 'Read Only',
      password: passwordViewer,
      roleId: viewerRole.id,
      groupId: viewerGroup.id,
    },
  });

  // 5. Create Samples
  console.log('Creating samples...');
  const sample1 = await prisma.sample.create({
    data: {
      code: '24-PL-Rose-01',
      sampleType: 'PLANT',
      siteName: 'Botanical Garden, Sector A',
      lat: 55.75,
      lng: 37.61,
      description: 'Rose rhizosphere sample',
      collectedAt: new Date('2024-05-15T10:00:00Z'),
    },
  });

  const sample2 = await prisma.sample.create({
    data: {
      code: '24-SO-Forest-05',
      sampleType: 'SOIL',
      siteName: 'Pine Forest, Region 2',
      lat: 56.1,
      lng: 38.2,
      description: 'Forest soil sample',
      collectedAt: new Date('2024-06-01T14:30:00Z'),
    },
  });

  // 4. Create Strains
  console.log('Creating strains...');
  await prisma.strain.createMany({
    data: [
      {
        identifier: 'STR-2024-001',
        sampleId: sample1.id,
        taxonomy16s: { genus: 'Pseudomonas', species: 'fluorescens' },
        indexerInitials: 'AK',
        seq: true,
        gramStain: 'NEGATIVE',
        phosphates: true,
        siderophores: true,
        pigmentSecretion: true,
        features: 'Strong fluorescence under UV',
      },
      {
        identifier: 'STR-2024-002',
        sampleId: sample1.id,
        taxonomy16s: { genus: 'Bacillus', species: 'subtilis' },
        indexerInitials: 'AK',
        seq: false,
        gramStain: 'POSITIVE',
        phosphates: false,
        siderophores: false,
        pigmentSecretion: false,
        features: 'Spore forming',
      },
      {
        identifier: 'STR-2024-003',
        sampleId: sample2.id,
        taxonomy16s: { genus: 'Streptomyces', species: 'sp.' },
        indexerInitials: 'VB',
        seq: true,
        gramStain: 'POSITIVE',
        phosphates: true,
        siderophores: true,
        pigmentSecretion: true,
        antibioticActivity: 'High against E. coli',
      },
    ],
  });

  // 5. Seed media and link to strains
  console.log('Creating media...');
  const media = await prisma.media.createMany({
    data: [
      { name: 'LB Agar', composition: 'Lysogeny broth agar' },
      { name: 'ISP2', composition: 'International Streptomyces Project medium 2' },
    ],
  });

  const strainList = await prisma.strain.findMany({ select: { id: true } });
  if (strainList.length && media.count) {
    await prisma.strainMedia.create({
      data: {
        strainId: strainList[0].id,
        mediaId: 1,
        notes: 'Routine isolation',
      },
    });
  }

  // 6. Create Storage Boxes with Cells
  console.log('Creating storage boxes...');
  const box1 = await prisma.storageBox.create({
    data: {
      displayName: 'Freezer Box -80C #1',
      rows: 9,
      cols: 9,
      description: 'Main freezer storage for long-term preservation',
      cells: {
        create: Array.from({ length: 81 }, (_, i) => ({
          row: Math.floor(i / 9) + 1,
          col: (i % 9) + 1,
          cellCode: `${String.fromCharCode(65 + Math.floor(i / 9))}${(i % 9) + 1}`,
        })),
      },
    },
  });

  const box2 = await prisma.storageBox.create({
    data: {
      displayName: 'Fridge Box +4C #1',
      rows: 10,
      cols: 10,
      description: 'Working collection for active research',
      cells: {
        create: Array.from({ length: 100 }, (_, i) => ({
          row: Math.floor(i / 10) + 1,
          col: (i % 10) + 1,
          cellCode: `${String.fromCharCode(65 + Math.floor(i / 10))}${(i % 10) + 1}`,
        })),
      },
    },
  });

  // 7. Allocate strains to storage cells
  console.log('Allocating strains to storage...');
  const strains = await prisma.strain.findMany();
  const box1Cells = await prisma.storageCell.findMany({
    where: { boxId: box1.id },
    take: 2,
  });

  if (strains.length >= 2 && box1Cells.length >= 2) {
    // Allocate first strain to A1
    await prisma.strainStorage.create({
      data: {
        strainId: strains[0].id,
        cellId: box1Cells[0].id,
        isPrimary: true,
      },
    });

    await prisma.storageCell.update({
      where: { id: box1Cells[0].id },
      data: { status: 'OCCUPIED' },
    });

    // Allocate second strain to A2
    await prisma.strainStorage.create({
      data: {
        strainId: strains[1].id,
        cellId: box1Cells[1].id,
        isPrimary: true,
      },
    });

    await prisma.storageCell.update({
      where: { id: box1Cells[1].id },
      data: { status: 'OCCUPIED' },
    });
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
