import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const isPositiveLike = (value: string) => {
  const normalized = value.trim().toLowerCase();
  return (
    normalized === 'true' ||
    normalized === '+' ||
    normalized.includes('positive') ||
    normalized.includes('+')
  );
};

async function main() {
  const pigment = await prisma.traitDefinition.findUnique({
    where: { code: 'pigment_secretion' },
    select: { id: true, name: true },
  });

  if (!pigment) {
    throw new Error('Missing system traitDefinition: pigment_secretion');
  }

  const legacyRows = await prisma.strainPhenotype.findMany({
    where: {
      OR: [
        { traitName: { equals: 'Pigment Production', mode: 'insensitive' } },
        { traitName: { contains: 'Pigment Production', mode: 'insensitive' } },
      ],
    },
    select: { id: true, traitName: true, result: true },
  });

  const normalizedLegacy = legacyRows.filter(
    (r) => (r.traitName || '').trim().toLowerCase() === 'pigment production',
  );

  if (normalizedLegacy.length === 0) {
    console.log('No legacy Pigment Production rows found.');
    return;
  }

  const positiveIds = normalizedLegacy
    .filter((r) => isPositiveLike(r.result))
    .map((r) => r.id);
  const otherIds = normalizedLegacy
    .filter((r) => !isPositiveLike(r.result))
    .map((r) => r.id);

  const updates = [];
  if (positiveIds.length) {
    updates.push(
      prisma.strainPhenotype.updateMany({
        where: { id: { in: positiveIds } },
        data: {
          traitDefinitionId: pigment.id,
          traitName: pigment.name,
          result: 'true',
        },
      }),
    );
  }
  if (otherIds.length) {
    // For our current UX, negative/unknown pigment is not represented; remove legacy rows.
    updates.push(prisma.strainPhenotype.deleteMany({ where: { id: { in: otherIds } } }));
  }

  const [updated, deleted] = await prisma.$transaction(async (tx) => {
    const updatedRes = positiveIds.length
      ? await tx.strainPhenotype.updateMany({
          where: { id: { in: positiveIds } },
          data: {
            traitDefinitionId: pigment.id,
            traitName: pigment.name,
            result: 'true',
          },
        })
      : { count: 0 };

    const deletedRes = otherIds.length
      ? await tx.strainPhenotype.deleteMany({ where: { id: { in: otherIds } } })
      : { count: 0 };

    return [updatedRes.count, deletedRes.count] as const;
  });

  console.log(
    `Migrated Pigment Production -> pigment_secretion: updated=${updated}, deleted=${deleted}`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
