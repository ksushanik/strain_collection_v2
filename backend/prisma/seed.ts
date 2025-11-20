import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // 1. Clear existing data
    await prisma.uiBinding.deleteMany();
    await prisma.strain.deleteMany();
    await prisma.sample.deleteMany();

    // 2. Create UI Bindings
    console.log('Creating UI bindings...');
    await prisma.uiBinding.createMany({
        data: [
            {
                menuLabel: 'My Collection',
                profileKey: 'STRAIN',
                routeSlug: 'my-collection',
                icon: 'Microscope',
                enabledFieldPacks: ['basic_info', 'taxonomy', 'growth_characteristics'],
            },
            {
                menuLabel: 'Field Samples',
                profileKey: 'SAMPLE',
                routeSlug: 'field-samples',
                icon: 'Leaf',
                enabledFieldPacks: ['site_info'],
            },
            {
                menuLabel: 'Storage',
                profileKey: 'STORAGE',
                routeSlug: 'storage',
                icon: 'Box',
                enabledFieldPacks: [],
            },
        ],
    });

    // 3. Create Samples
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
            lat: 56.10,
            lng: 38.20,
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

    // 5. Create Storage Boxes with Cells
    console.log('Creating storage boxes...');
    const box1 = await prisma.storageBox.create({
        data: {
            displayName: 'Freezer Box -80°C #1',
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
            displayName: 'Fridge Box +4°C #1',
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

    // 6. Allocate strains to storage cells
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

    console.log('✅ Seeding completed!');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
