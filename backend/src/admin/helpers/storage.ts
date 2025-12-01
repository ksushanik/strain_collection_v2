import { PrismaClient } from '@prisma/client';

export const syncStorageBoxCells = async (
  prisma: PrismaClient,
  boxId: number,
  rows: number,
  cols: number,
) => {
  const normalizedRows = Number(rows);
  const normalizedCols = Number(cols);
  if (![9, 10].includes(normalizedRows) || ![9, 10].includes(normalizedCols)) {
    throw new Error('Rows and cols must be 9 or 10');
  }

  const existingCells = await prisma.storageCell.findMany({
    where: { boxId },
    select: { id: true, cellCode: true },
  });

  const existingByCode = new Map(existingCells.map((c) => [c.cellCode, c]));

  const desired = Array.from(
    { length: normalizedRows * normalizedCols },
    (_, i) => {
      const row = Math.floor(i / normalizedCols) + 1;
      const col = (i % normalizedCols) + 1;
      return {
        row,
        col,
        cellCode: `${String.fromCharCode(65 + Math.floor(i / normalizedCols))}${(i % normalizedCols) + 1}`,
      };
    },
  );
  const desiredCodes = new Set(desired.map((d) => d.cellCode));

  const toDeleteIds = existingCells
    .filter((c) => !desiredCodes.has(c.cellCode))
    .map((c) => c.id);

  if (toDeleteIds.length) {
    await prisma.strainStorage.deleteMany({
      where: { cellId: { in: toDeleteIds } },
    });
    await prisma.storageCell.deleteMany({
      where: { id: { in: toDeleteIds } },
    });
  }

  const toCreate = desired.filter((d) => !existingByCode.has(d.cellCode));
  if (toCreate.length) {
    await prisma.storageCell.createMany({
      data: toCreate.map((d) => ({ ...d, boxId })),
    });
  }
};
