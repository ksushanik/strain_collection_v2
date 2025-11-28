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
  await prisma.samplePhoto.deleteMany();
  await prisma.sample.deleteMany();
  await prisma.sampleTypeDictionary.deleteMany();

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



  // 5. Create Sample Types
  console.log('Creating sample types...');
  const sampleTypes = await Promise.all([
    prisma.sampleTypeDictionary.create({ data: { name: 'Plant', slug: 'plant' } }),
    prisma.sampleTypeDictionary.create({ data: { name: 'Animal', slug: 'animal' } }),
    prisma.sampleTypeDictionary.create({ data: { name: 'Water', slug: 'water' } }),
    prisma.sampleTypeDictionary.create({ data: { name: 'Soil', slug: 'soil' } }),
    prisma.sampleTypeDictionary.create({ data: { name: 'Other', slug: 'other' } }),
  ]);

  // 6. Create Samples (40 items)
  console.log('Creating 40 samples...');
  const samples = [];
  for (let i = 1; i <= 40; i++) {
    const typeIndex = i % 5;
    const type = sampleTypes[typeIndex];
    const subject = `Subject ${i}`;
    const sample = await prisma.sample.create({
      data: {
        code: `${i}_${type.slug}_${subject.replace(/\s+/g, '-')}`,
        sampleType: 'OTHER', // Deprecated, keeping for now to avoid validation errors if any
        sampleTypeId: type.id,
        subject: subject,
        siteName: `Site ${Math.floor((i - 1) / 5) + 1}`,
        lat: 55.0 + Math.random(),
        lng: 37.0 + Math.random(),
        description: `Generated sample ${i}`,
        collectedAt: new Date(),
      },
    });
    samples.push(sample);
  }

  // 7. Create Strains (20 items)
  console.log('Creating 20 strains...');
  const strains = [];
  for (let i = 1; i <= 20; i++) {
    const strain = await prisma.strain.create({
      data: {
        identifier: `STR-2024-${String(i).padStart(3, '0')}`,
        sampleId: samples[i % samples.length].id,
        taxonomy16s: `Bacterium species_${i}`,
        indexerInitials: 'TEST',
        seq: Math.random() > 0.5,
        gramStain: Math.random() > 0.5 ? 'POSITIVE' : 'NEGATIVE',
        phosphates: Math.random() > 0.5,
        siderophores: Math.random() > 0.5,
        pigmentSecretion: Math.random() > 0.5,
        features: `Feature description for strain ${i}`,
      },
    });
    strains.push(strain);
  }

  // 8. Create Media
  console.log('Creating media...');
  await prisma.media.createMany({
    data: [
      { name: 'LB Agar', composition: 'Lysogeny broth agar' },
      { name: 'ISP2', composition: 'International Streptomyces Project medium 2' },
    ],
  });

  // 9. Create Storage Boxes (16 items)
  console.log('Creating 16 storage boxes...');
  const boxes = [];
  for (let i = 1; i <= 16; i++) {
    const is9x9 = i % 2 !== 0;
    const rows = is9x9 ? 9 : 10;
    const cols = is9x9 ? 9 : 10;
    const box = await prisma.storageBox.create({
      data: {
        displayName: `Box ${i} (${rows}x${cols})`,
        rows,
        cols,
        description: `Generated storage box ${i}`,
        cells: {
          create: Array.from({ length: rows * cols }, (_, k) => ({
            row: Math.floor(k / cols) + 1,
            col: (k % cols) + 1,
            cellCode: `${String.fromCharCode(65 + Math.floor(k / cols))}${(k % cols) + 1}`,
          })),
        },
      },
      include: { cells: true },
    });
    boxes.push(box);
  }

  // 10. Allocate strains to storage
  console.log('Allocating strains to storage...');
  // Allocate first 15 strains to the first box
  const box1Cells = boxes[0].cells;
  for (let i = 0; i < 15 && i < strains.length && i < box1Cells.length; i++) {
    await prisma.strainStorage.create({
      data: {
        strainId: strains[i].id,
        cellId: box1Cells[i].id,
        isPrimary: true,
      },
    });
    await prisma.storageCell.update({
      where: { id: box1Cells[i].id },
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
