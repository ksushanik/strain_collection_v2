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
