import { describe, it, expect, beforeEach, vi } from 'vitest';
import { uploadSamplePhoto, deleteSamplePhoto, uploadStrainPhoto, deleteStrainPhoto } from '../uploads';
import { request, assertOk } from '../http';

vi.mock('../http', () => ({
  request: vi.fn(),
  assertOk: vi.fn(),
}));

const mockRequest = request as unknown as ReturnType<typeof vi.fn>;
const mockAssertOk = assertOk as unknown as ReturnType<typeof vi.fn>;

describe('uploads service', () => {
  beforeEach(() => {
    (mockRequest as unknown as { mockReset: () => void }).mockReset();
    (mockAssertOk as unknown as { mockReset: () => void }).mockReset();
  });

  it('uploads sample photo', async () => {
    const sampleResponse = { json: vi.fn().mockResolvedValue({ id: 1 }) };
    (mockRequest as unknown as { mockResolvedValue: (v: unknown) => void }).mockResolvedValue(sampleResponse);
    const file = new File(['x'], 'photo.png', { type: 'image/png' });

    const result = await uploadSamplePhoto(5, file);

    expect(mockRequest).toHaveBeenCalledWith('/api/v1/samples/5/photos', expect.objectContaining({ method: 'POST' }));
    expect(mockAssertOk).toHaveBeenCalledWith(sampleResponse, 'Failed to upload photo');
    expect(result).toEqual({ id: 1 });
  });

  it('deletes sample photo', async () => {
    const sampleResponse = {};
    (mockRequest as unknown as { mockResolvedValue: (v: unknown) => void }).mockResolvedValue(sampleResponse);

    await deleteSamplePhoto(10);

    expect(mockRequest).toHaveBeenCalledWith('/api/v1/samples/photos/10', expect.objectContaining({ method: 'DELETE' }));
    expect(mockAssertOk).toHaveBeenCalledWith(sampleResponse, 'Failed to delete photo');
  });

  it('uploads strain photo', async () => {
    const strainResponse = { json: vi.fn().mockResolvedValue({ id: 2 }) };
    (mockRequest as unknown as { mockResolvedValue: (v: unknown) => void }).mockResolvedValue(strainResponse);
    const file = new File(['y'], 'photo.png', { type: 'image/png' });

    const result = await uploadStrainPhoto(7, file);

    expect(mockRequest).toHaveBeenCalledWith('/api/v1/strains/7/photos', expect.objectContaining({ method: 'POST' }));
    expect(mockAssertOk).toHaveBeenCalledWith(strainResponse, 'Failed to upload strain photo');
    expect(result).toEqual({ id: 2 });
  });

  it('deletes strain photo', async () => {
    const strainResponse = {};
    (mockRequest as unknown as { mockResolvedValue: (v: unknown) => void }).mockResolvedValue(strainResponse);

    await deleteStrainPhoto(11);

    expect(mockRequest).toHaveBeenCalledWith('/api/v1/strains/photos/11', expect.objectContaining({ method: 'DELETE' }));
    expect(mockAssertOk).toHaveBeenCalledWith(strainResponse, 'Failed to delete strain photo');
  });
});
