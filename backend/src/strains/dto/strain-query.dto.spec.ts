import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { StrainQueryDto } from './strain-query.dto';

// Mirror the production global ValidationPipe options (see main.ts).
// enableImplicitConversion must stay OFF — see the negative-filters regression below.
async function transformAndValidate(payload: Record<string, unknown>) {
    const obj = plainToInstance(StrainQueryDto, payload);
    const errors = await validate(obj);
    return { obj, errors };
}

describe('StrainQueryDto transform — production setup (no implicit conversion)', () => {
    it.each([
        ['phosphateSolubilization', 'true', true],
        ['phosphateSolubilization', 'false', false],
        ['amylase', 'true', true],
        ['amylase', 'false', false],
        ['siderophoreProduction', 'true', true],
        ['siderophoreProduction', 'false', false],
        ['pigmentSecretion', 'true', true],
        ['pigmentSecretion', 'false', false],
        ['hasGenome', 'true', true],
        ['hasGenome', 'false', false],
    ])('coerces %s=%s (string) to boolean %s', async (field, raw, expected) => {
        const { obj, errors } = await transformAndValidate({ [field]: raw });
        expect(errors).toEqual([]);
        expect(obj[field as keyof StrainQueryDto]).toBe(expected);
    });

    it('coerces page/limit via explicit @Type(() => Number)', async () => {
        const { obj, errors } = await transformAndValidate({ page: '2', limit: '25' });
        expect(errors).toEqual([]);
        expect(obj.page).toBe(2);
        expect(obj.limit).toBe(25);
    });

    it('passes string filters through untouched', async () => {
        const { obj, errors } = await transformAndValidate({
            sampleCode: 'KSU-001',
            taxonomy: 'Bacillus',
            search: 'foo',
            isolationRegion: 'SOIL',
            gramStain: 'positive',
            sortBy: 'identifier',
            sortOrder: 'asc',
        });
        expect(errors).toEqual([]);
        expect(obj.sampleCode).toBe('KSU-001');
        expect(obj.taxonomy).toBe('Bacillus');
        expect(obj.search).toBe('foo');
        expect(obj.isolationRegion).toBe('SOIL');
        expect(obj.gramStain).toBe('positive');
        expect(obj.sortBy).toBe('identifier');
        expect(obj.sortOrder).toBe('asc');
    });
});

describe('StrainQueryDto transform — regression: implicit conversion is a trap for booleans', () => {
    // This block documents WHY enableImplicitConversion stays OFF in main.ts.
    // If anyone re-enables it, these expectations should change — but they
    // would also silently invert every "No" filter in production. Don't.
    function withImplicit(payload: Record<string, unknown>) {
        return plainToInstance(StrainQueryDto, payload, { enableImplicitConversion: true });
    }

    it('Boolean("false") truthy-cast wins over @Transform — DO NOT enable implicit conversion', () => {
        const obj = withImplicit({ phosphateSolubilization: 'false' });
        // Bug: should be false, but JS Boolean('false') is true and runs before @Transform.
        expect(obj.phosphateSolubilization).toBe(true);
    });
});
