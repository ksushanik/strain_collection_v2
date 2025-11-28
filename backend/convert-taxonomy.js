const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function convertTaxonomyData() {
    try {
        console.log('Starting taxonomy data conversion...');

        // Get all strains with JSON taxonomy
        const strains = await prisma.strain.findMany({
            where: {
                taxonomy16s: {
                    not: null
                }
            }
        });

        console.log(`Found ${strains.length} strains to convert`);

        for (const strain of strains) {
            const taxonomy = strain.taxonomy16s;

            // Check if it's already a string
            if (typeof taxonomy === 'string' && !taxonomy.includes('{')) {
                console.log(`Strain ${strain.id} already converted`);
                continue;
            }

            // Parse JSON and create string
            let taxonomyString = null;
            try {
                const taxObj = typeof taxonomy === 'string' ? JSON.parse(taxonomy) : taxonomy;
                const genus = taxObj.genus || '';
                const species = taxObj.species || '';
                taxonomyString = `${genus} ${species}`.trim();

                if (!taxonomyString) {
                    taxonomyString = null;
                }
            } catch (e) {
                console.log(`Could not parse taxonomy for strain ${strain.id}:`, taxonomy);
                continue;
            }

            // Update the strain
            await prisma.strain.update({
                where: { id: strain.id },
                data: { taxonomy16s: taxonomyString }
            });

            console.log(`Converted strain ${strain.id}: "${taxonomy}" -> "${taxonomyString}"`);
        }

        console.log('Conversion complete!');
    } catch (error) {
        console.error('Error during conversion:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

convertTaxonomyData();
