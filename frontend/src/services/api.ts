const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010';

function authHeaders() {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export type ApiError = {
  message: string;
  status?: number;
  details?: unknown;
};

export function toApiError(
  error: unknown,
  fallback: string,
  status?: number,
): ApiError {
  if (error instanceof Error) {
    return { message: error.message || fallback, status };
  }
  if (typeof error === 'string') {
    return { message: error, status };
  }
  return { message: fallback, status, details: error };
}

export async function request(path: string, options: RequestInit = {}) {
  const headers = {
    ...(options.headers || {}),
    ...authHeaders(),
  } as Record<string, string>;
  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });

  if (response.status === 401) {
    if (
      typeof window !== 'undefined' &&
      !window.location.pathname.startsWith('/login')
    ) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
  }

  return response;
}

async function parseJsonSafe(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function assertOk(response: Response, fallback: string) {
  if (!response.ok) {
    const json = await parseJsonSafe(response);
    const message =
      (json && (json as any).message) ||
      (json && (json as any).error) ||
      response.statusText ||
      fallback;
    throw toApiError(json || message, fallback, response.status);
  }
  return response;
}

export interface UiBinding {
  id: number;
  menuLabel: string;
  profileKey: string;
  icon: string;
  enabledFieldPacks: string[];
  routeSlug: string;
  order?: number;
  legendId?: number | null;
  legend?: { id: number; content: string } | null;
}

export interface Sample {
  id: number;
  code: string;
  sampleType: string;
  sampleTypeId?: number;
  subject?: string;
  siteName: string;
  lat?: number;
  lng?: number;
  description?: string;
  collectedAt: string;
  photos?: SamplePhoto[];
  _count?: {
    strains: number;
    photos: number;
  };
}

export interface SamplePhoto {
  id: number;
  sampleId: number;
  url: string;
  meta?: {
    fileId: string;
    originalName: string;
    size: number;
    width?: number;
    height?: number;
    fileType?: string;
  };
  createdAt: string;
}

export interface Strain {
  id: number;
  identifier: string;
  sampleId: number;
  sample?: {
    id: number;
    code: string;
    siteName?: string;
  };
  taxonomy16s?: string;
  otherTaxonomy?: string;
  indexerInitials?: string;
  collectionRcam?: string;
  seq: boolean;
  biochemistry?: string;
  genome?: string;
  antibioticActivity?: string;
  gramStain?: string;
  phosphates: boolean;
  siderophores: boolean;
  pigmentSecretion: boolean;
  amylase?: string;
  isolationRegion?: string;
  iuk?: string;
  features?: string;
  comments?: string;
  storage?: {
    id: number;
    isPrimary: boolean;
    cell: {
      id: number;
      cellCode: string;
      box: {
        id: number;
        displayName: string;
      };
    };
  }[];
  media?: {
    mediaId: number;
    notes?: string | null;
    media: Media;
  }[];
  photos?: StrainPhoto[];
}

export interface StrainPhoto {
  id: number;
  strainId: number;
  url: string;
  meta?: {
    originalName?: string;
    size?: number;
    width?: number;
    height?: number;
    fileType?: string;
    fileId?: string;
  };
  createdAt: string;
}

export interface Media {
  id: number;
  name: string;
  composition?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const ApiService = {
  async startAdminSso(): Promise<{ nonce: string }> {
    const response = await request(`/api/v1/admin-sso/sso/start`, {
      method: 'POST',
    });
    await assertOk(response, 'Failed to start SSO');
    return response.json();
  },

  async getUiBindings(): Promise<UiBinding[]> {
    const response = await request(`/api/v1/settings/ui-bindings`);
    await assertOk(response, 'Failed to fetch UI bindings');
    return response.json();
  },

  async updateUiBindings(
    bindings: UiBinding[],
  ): Promise<{ updated: number }> {
    const response = await request(`/api/v1/settings/ui-bindings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bindings),
    });
    await assertOk(response, 'Failed to update UI bindings');
    return response.json();
  },

  async getSamples(params?: {
    search?: string;
    page?: number;
    limit?: number;
    sampleType?: string;
    site?: string;
    dateFrom?: string;
    dateTo?: string;
    sortBy?: 'createdAt' | 'collectedAt' | 'code' | 'siteName';
    sortOrder?: 'asc' | 'desc';
  }): Promise<PaginatedResponse<Sample>> {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.sampleType) query.set('sampleType', params.sampleType);
    if (params?.site) query.set('site', params.site);
    if (params?.dateFrom) query.set('dateFrom', params.dateFrom);
    if (params?.dateTo) query.set('dateTo', params.dateTo);
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.sortBy) query.set('sortBy', params.sortBy);
    if (params?.sortOrder) query.set('sortOrder', params.sortOrder);
    const qs = query.toString();
    const response = await request(`/api/v1/samples${qs ? `?${qs}` : ''}`);
    await assertOk(response, 'Failed to fetch samples');
    return response.json();
  },

  async getSample(id: number): Promise<Sample> {
    const response = await request(`/api/v1/samples/${id}`);
    await assertOk(response, 'Failed to fetch sample');
    return response.json();
  },

  async getSampleTypes(): Promise<
    Array<{ id: number; name: string; slug: string }>
  > {
    const response = await request('/api/v1/samples/types');
    await assertOk(response, 'Failed to fetch sample types');
    return response.json();
  },

  async getStrains(params?: {
    search?: string;
    sampleCode?: string;
    taxonomy?: string;
    genome?: string;
    hasGenome?: boolean;
    antibioticActivity?: string;
    seq?: boolean;
    gramStain?: string;
    phosphates?: boolean;
    siderophores?: boolean;
    pigmentSecretion?: boolean;
    amylase?: string;
    isolationRegion?: string;
    biochemistry?: string;
    iuk?: string;
    page?: number;
    limit?: number;
    sortBy?: 'createdAt' | 'identifier' | 'sampleCode' | 'taxonomy16s';
    sortOrder?: 'asc' | 'desc';
  }): Promise<PaginatedResponse<Strain>> {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.sampleCode) query.set('sampleCode', params.sampleCode);
    if (params?.taxonomy) query.set('taxonomy', params.taxonomy);
    if (params?.genome) query.set('genome', params.genome);
    if (params?.hasGenome !== undefined)
      query.set('hasGenome', String(params.hasGenome));
    if (params?.antibioticActivity)
      query.set('antibioticActivity', params.antibioticActivity);
    if (params?.seq !== undefined) query.set('seq', String(params.seq));
    if (params?.gramStain) query.set('gramStain', params.gramStain);
    if (params?.phosphates !== undefined)
      query.set('phosphates', String(params.phosphates));
    if (params?.siderophores !== undefined)
      query.set('siderophores', String(params.siderophores));
    if (params?.pigmentSecretion !== undefined)
      query.set('pigmentSecretion', String(params.pigmentSecretion));
    if (params?.amylase) query.set('amylase', params.amylase);
    if (params?.isolationRegion)
      query.set('isolationRegion', params.isolationRegion);
    if (params?.biochemistry)
      query.set('biochemistry', params.biochemistry);
    if (params?.iuk) query.set('iuk', params.iuk);
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.sortBy) query.set('sortBy', params.sortBy);
    if (params?.sortOrder) query.set('sortOrder', params.sortOrder);
    const qs = query.toString();
    const response = await request(`/api/v1/strains${qs ? `?${qs}` : ''}`);
    await assertOk(response, 'Failed to fetch strains');
    return response.json();
  },

  async getStrain(id: number): Promise<Strain> {
    const response = await request(`/api/v1/strains/${id}`);
    await assertOk(response, 'Failed to fetch strain');
    return response.json();
  },

  async getLegend(): Promise<{ id: number; content: string } | null> {
    const response = await request(`/api/v1/settings/legend`);
    await assertOk(response, 'Failed to fetch legend');
    const text = await response.text();
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  },

  async updateLegend(content: string): Promise<{ id: number; content: string }> {
    const response = await request(`/api/v1/settings/legend`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
    await assertOk(response, 'Failed to update legend');
    return response.json();
  },

  async getStorageBoxes(): Promise<
    {
      id: number;
      displayName: string;
      rows: number;
      cols: number;
      description?: string;
      _count?: { cells: number };
      occupiedCells?: number;
      freeCells?: number;
    }[]
  > {
    const response = await request(`/api/v1/storage/boxes`);
    await assertOk(response, 'Failed to fetch storage boxes');
    return response.json();
  },

  async createStorageBox(data: {
    displayName: string;
    rows: number;
    cols: number;
    description?: string;
  }) {
    const response = await request(`/api/v1/storage/boxes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    await assertOk(response, 'Failed to create storage box');
    return response.json();
  },

  async updateStorageBox(
    id: number,
    data: { displayName?: string; description?: string },
  ) {
    const response = await request(`/api/v1/storage/boxes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    await assertOk(response, 'Failed to update storage box');
    return response.json();
  },

  async deleteStorageBox(id: number) {
    const response = await request(`/api/v1/storage/boxes/${id}`, {
      method: 'DELETE',
    });
    await assertOk(response, 'Failed to delete storage box');
    return response.json();
  },

  async getBoxCells(boxId: number): Promise<{
    id: number;
    displayName: string;
    rows: number;
    cols: number;
    description?: string;
    cells: {
      id: number;
      row: number;
      col: number;
      cellCode: string;
      status: 'FREE' | 'OCCUPIED';
      strain?: { strain?: { id: number; identifier: string; seq: boolean } } | null;
    }[];
  }> {
    const response = await request(`/api/v1/storage/boxes/${boxId}`);
    await assertOk(response, 'Failed to fetch box cells');
    return response.json();
  },

  async allocateCell(
    boxId: number,
    cellCode: string,
    data: { strainId: number; isPrimary?: boolean },
  ) {
    const response = await request(
      `/api/v1/storage/boxes/${boxId}/cells/${cellCode}/allocate`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          strainId: data.strainId,
          isPrimary: data.isPrimary ?? false,
        }),
      },
    );
    await assertOk(response, 'Failed to allocate cell');
    return response.json();
  },

  async unallocateCell(boxId: number, cellCode: string) {
    const response = await request(
      `/api/v1/storage/boxes/${boxId}/cells/${cellCode}/unallocate`,
      {
        method: 'DELETE',
      },
    );
    await assertOk(response, 'Failed to unallocate cell');
    return response.json();
  },

  async getAnalyticsOverview(): Promise<{
    totalStrains: number;
    totalSamples: number;
    totalBoxes: number;
    occupiedCells: number;
    freeCells: number;
    recentAdditions: {
      id: number;
      identifier: string;
      createdAt: string;
      sample?: { id: number; code: string | null };
    }[];
  }> {
    const response = await request(`/api/v1/analytics/overview`);
    await assertOk(response, 'Failed to fetch analytics');
    return response.json();
  },

  async getMedia(params?: {
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Media>> {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());
    const qs = query.toString();
    const response = await request(`/api/v1/media${qs ? `?${qs}` : ''}`);
    await assertOk(response, 'Failed to fetch media');
    return response.json();
  },

  async createMedia(payload: { name: string; composition?: string }): Promise<Media> {
    const response = await request(`/api/v1/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    await assertOk(response, 'Failed to create media');
    return response.json();
  },

  async updateMedia(
    id: number,
    payload: { name: string; composition?: string },
  ): Promise<Media> {
    const response = await request(`/api/v1/media/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    await assertOk(response, 'Failed to update media');
    return response.json();
  },

  async deleteMedia(id: number): Promise<void> {
    const response = await request(`/api/v1/media/${id}`, { method: 'DELETE' });
    await assertOk(response, 'Failed to delete media');
  },

  async createStrain(data: Partial<Strain>): Promise<Strain> {
    const response = await request(`/api/v1/strains`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    await assertOk(response, 'Failed to create strain');
    return response.json();
  },

  async updateStrain(id: number, data: Partial<Strain>): Promise<Strain> {
    const response = await request(`/api/v1/strains/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    await assertOk(response, 'Failed to update strain');
    return response.json();
  },

  async createSample(data: Partial<Sample>): Promise<Sample> {
    const response = await request(`/api/v1/samples`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    await assertOk(response, 'Failed to create sample');
    return response.json();
  },

  async updateSample(id: number, data: Partial<Sample>): Promise<Sample> {
    const response = await request(`/api/v1/samples/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    await assertOk(response, 'Failed to update sample');
    return response.json();
  },

  async deleteSample(id: number): Promise<void> {
    const response = await request(`/api/v1/samples/${id}`, {
      method: 'DELETE',
    });
    await assertOk(response, 'Failed to delete sample');
  },

  async uploadSamplePhoto(sampleId: number, file: File): Promise<SamplePhoto> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await request(`/api/v1/samples/${sampleId}/photos`, {
      method: 'POST',
      body: formData,
    });

    await assertOk(response, 'Failed to upload photo');
    return response.json();
  },

  async deleteSamplePhoto(photoId: number): Promise<void> {
    const response = await request(`/api/v1/samples/photos/${photoId}`, {
      method: 'DELETE',
    });
    await assertOk(response, 'Failed to delete photo');
  },

  async linkMediaToStrain(
    strainId: number,
    payload: { mediaId: number; notes?: string },
  ) {
    const response = await request(`/api/v1/strains/${strainId}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    await assertOk(response, 'Failed to link media');
    return response.json();
  },

  async unlinkMediaFromStrain(strainId: number, mediaId: number) {
    const response = await request(`/api/v1/strains/${strainId}/media/${mediaId}`, {
      method: 'DELETE',
    });
    await assertOk(response, 'Failed to unlink media');
    return response.json();
  },

  async searchTaxonomy(
    query: string,
  ): Promise<Array<{ taxId: string; name: string; rank: string }>> {
    const response = await request(
      `/api/v1/taxonomy/search?q=${encodeURIComponent(query)}`,
    );
    if (!response.ok) return [];
    return response.json();
  },

  async uploadStrainPhoto(strainId: number, file: File): Promise<StrainPhoto> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await request(`/api/v1/strains/${strainId}/photos`, {
      method: 'POST',
      body: formData,
    });

    await assertOk(response, 'Failed to upload strain photo');
    return response.json();
  },

  async deleteStrainPhoto(photoId: number): Promise<void> {
    const response = await request(`/api/v1/strains/photos/${photoId}`, {
      method: 'DELETE',
    });
    await assertOk(response, 'Failed to delete strain photo');
  },
};
