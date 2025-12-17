import { TraitsService } from './traits.service';

describe('TraitsService', () => {
  const createPrismaMock = () => ({
    traitDefinition: {
      upsert: jest.fn(),
    },
  });

  it('upserts required system traits on module init', async () => {
    const prisma = createPrismaMock();

    const service = new TraitsService(prisma as any);
    await service.onModuleInit();

    expect(prisma.traitDefinition.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { code: 'gram_stain' },
        create: expect.objectContaining({
          name: 'Gram Stain',
          code: 'gram_stain',
        }),
      }),
    );
    expect(prisma.traitDefinition.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { code: 'amylase' },
      }),
    );
    expect(prisma.traitDefinition.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { code: 'antibiotic_activity' },
      }),
    );
  });
});
