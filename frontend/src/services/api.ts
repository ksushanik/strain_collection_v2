const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010';

function authHeaders() {
    if (typeof window === 'undefined') return {};
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function request(path: string, options: RequestInit = {}) {
    const headers = {
        ...(options.headers || {}),
        ...authHeaders(),
    } as Record<string, string>;
    const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });

    if (response.status === 401) {
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
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
        const response = await request(`/api/v1/admin-sso/sso/start`, { method: 'POST' });
        if (!response.ok) {
            throw new Error(`Failed to start SSO: ${response.statusText}`);
        }
        return response.json();
    },
    async getUiBindings(): Promise<UiBinding[]> {
        const response = await request(`/api/v1/settings/ui-bindings`);
        if (!response.ok) {
            throw new Error(`Failed to fetch UI bindings: ${response.statusText}`);
        }
        return response.json();
    },

    async updateUiBindings(bindings: UiBinding[]): Promise<{ updated: number }> {
        const response = await request(`/api/v1/settings/ui-bindings`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bindings),
        });
        if (!response.ok) {
            throw new Error(`Failed to update UI bindings: ${response.statusText}`);
        }
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
    }): Promise<PaginatedResponse<Sample>> {
        const query = new URLSearchParams();
        if (params?.search) query.set('search', params.search);
        if (params?.sampleType) query.set('sampleType', params.sampleType);
        if (params?.site) query.set('site', params.site);
        if (params?.dateFrom) query.set('dateFrom', params.dateFrom);
        if (params?.dateTo) query.set('dateTo', params.dateTo);
        if (params?.page) query.set('page', params.page.toString());
        if (params?.limit) query.set('limit', params.limit.toString());
        const qs = query.toString();
        const response = await request(`/api/v1/samples${qs ? `?${qs}` : ''}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch samples: ${response.statusText}`);
        }
        return response.json();
    },

    async getSample(id: number): Promise<Sample> {
        const response = await request(`/api/v1/samples/${id}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch sample: ${response.statusText}`);
        }
        return response.json();
    },

    async getSampleTypes(): Promise<Array<{ id: number; name: string; slug: string }>> {
        const response = await request('/api/v1/samples/types');
        if (!response.ok) {
            throw new Error(`Failed to fetch sample types: ${response.statusText}`);
        }
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
    }): Promise<PaginatedResponse<Strain>> {
        const query = new URLSearchParams();
        if (params?.search) query.set('search', params.search);
        if (params?.sampleCode) query.set('sampleCode', params.sampleCode);
        if (params?.taxonomy) query.set('taxonomy', params.taxonomy);
        if (params?.genome) query.set('genome', params.genome);
        if (params?.hasGenome !== undefined) query.set('hasGenome', String(params.hasGenome));
        if (params?.antibioticActivity) query.set('antibioticActivity', params.antibioticActivity);
        if (params?.seq !== undefined) query.set('seq', String(params.seq));
        if (params?.gramStain) query.set('gramStain', params.gramStain);
        if (params?.phosphates !== undefined) query.set('phosphates', String(params.phosphates));
        if (params?.siderophores !== undefined) query.set('siderophores', String(params.siderophores));
        if (params?.pigmentSecretion !== undefined) query.set('pigmentSecretion', String(params.pigmentSecretion));
        if (params?.amylase) query.set('amylase', params.amylase);
        if (params?.isolationRegion) query.set('isolationRegion', params.isolationRegion);
        if (params?.biochemistry) query.set('biochemistry', params.biochemistry);
        if (params?.iuk) query.set('iuk', params.iuk);
        if (params?.page) query.set('page', params.page.toString());
        if (params?.limit) query.set('limit', params.limit.toString());
        const qs = query.toString();
        const response = await request(`/api/v1/strains${qs ? `?${qs}` : ''}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch strains: ${response.statusText}`);
        }
        return response.json();
    },

    async getStrain(id: number): Promise<Strain> {
        const response = await request(`/api/v1/strains/${id}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch strain: ${response.statusText}`);
        }
        return response.json();
    },

    async getLegend(): Promise<{ id: number; content: string } | null> {
        const response = await request(`/api/v1/settings/legend`);
        if (!response.ok) {
            throw new Error(`Failed to fetch legend: ${response.statusText}`);
        }
        // Backend может вернуть пустой ответ, обрабатываем 204 / пустое тело
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
        if (!response.ok) {
            throw new Error(`Failed to update legend: ${response.statusText}`);
        }
        return response.json();
    },


    async getStorageBoxes(): Promise<{
        id: number;
        displayName: string;
        rows: number;
        cols: number;
        description?: string;
        _count?: { cells: number };
        occupiedCells?: number;
        freeCells?: number;
    }[]> {
        const response = await request(`/api/v1/storage/boxes`);
        if (!response.ok) {
            throw new Error(`Failed to fetch storage boxes: ${response.statusText}`);
        }
        return response.json();
    },

    async createStorageBox(data: { displayName: string; rows: number; cols: number; description?: string }) {
        const response = await request(`/api/v1/storage/boxes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error(`Failed to create storage box: ${response.statusText}`);
        }
        return response.json();
    },

    async updateStorageBox(id: number, data: { displayName?: string; description?: string; storageType?: string }) {
        const response = await request(`/api/v1/storage/boxes/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error(`Failed to update storage box: ${response.statusText}`);
        }
        return response.json();
    },

    async deleteStorageBox(id: number) {
        const response = await request(`/api/v1/storage/boxes/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            const errorText = await response.text();
            // Пытаемся распарсить JSON ошибку если есть
            try {
                const errorJson = JSON.parse(errorText);
                throw new Error(errorJson.message || `Failed to delete storage box`);
            } catch {
                throw new Error(`Failed to delete storage box: ${errorText || response.statusText}`);
            }
        }
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
        if (!response.ok) {
            throw new Error(`Failed to fetch box cells: ${response.statusText}`);
        }
        return response.json();
    },

    async allocateCell(boxId: number, cellCode: string, data: { strainId: number; isPrimary?: boolean }) {
        const response = await request(`/api/v1/storage/boxes/${boxId}/cells/${cellCode}/allocate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ strainId: data.strainId, isPrimary: data.isPrimary ?? false }),
        });
        if (!response.ok) {
            throw new Error(`Failed to allocate cell: ${response.statusText}`);
        }
        return response.json();
    },

    async unallocateCell(boxId: number, cellCode: string) {
        const response = await request(`/api/v1/storage/boxes/${boxId}/cells/${cellCode}/unallocate`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error(`Failed to unallocate cell: ${response.statusText}`);
        }
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
        if (!response.ok) throw new Error(`Failed to fetch analytics: ${response.statusText}`);
        return response.json();
    },

    async getMedia(params?: { search?: string; page?: number; limit?: number }): Promise<PaginatedResponse<Media>> {
        const query = new URLSearchParams();
        if (params?.search) query.set('search', params.search);
        if (params?.page) query.set('page', params.page.toString());
        if (params?.limit) query.set('limit', params.limit.toString());
        const qs = query.toString();
        const response = await request(`/api/v1/media${qs ? `?${qs}` : ''}`);
        if (!response.ok) throw new Error(`Failed to fetch media: ${response.statusText}`);
        return response.json();
    },

    async createMedia(payload: { name: string; composition?: string }): Promise<Media> {
        const response = await request(`/api/v1/media`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error(`Failed to create media: ${response.statusText}`);
        return response.json();
    },

    async updateMedia(id: number, payload: { name: string; composition?: string }): Promise<Media> {
        const response = await request(`/api/v1/media/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error(`Failed to update media: ${response.statusText}`);
        return response.json();
    },

    async deleteMedia(id: number): Promise<void> {
        const response = await request(`/api/v1/media/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error(`Failed to delete media: ${response.statusText}`);
    },

    async createStrain(data: Partial<Strain>): Promise<Strain> {
        const response = await request(`/api/v1/strains`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error(`Failed to create strain: ${response.statusText}`);
        return response.json();
    },

    async updateStrain(id: number, data: Partial<Strain>): Promise<Strain> {
        const response = await request(`/api/v1/strains/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error(`Failed to update strain: ${response.statusText}`);
        return response.json();
    },

    async createSample(data: Partial<Sample>): Promise<Sample> {
        const response = await request(`/api/v1/samples`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error(`Failed to create sample: ${response.statusText}`);
        return response.json();
    },

    async updateSample(id: number, data: Partial<Sample>): Promise<Sample> {
        const response = await request(`/api/v1/samples/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error(`Failed to update sample: ${response.statusText}`);
        return response.json();
    },

    async deleteSample(id: number): Promise<void> {
        const response = await request(`/api/v1/samples/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error(`Failed to delete sample: ${response.statusText}`);
        }
    },

    async uploadSamplePhoto(sampleId: number, file: File): Promise<SamplePhoto> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await request(`/api/v1/samples/${sampleId}/photos`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to upload photo: ${errorText}`);
        }
        return response.json();
    },

    async deleteSamplePhoto(photoId: number): Promise<void> {
        const response = await request(`/api/v1/samples/photos/${photoId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error(`Failed to delete photo: ${response.statusText}`);
        }
    },

    async linkMediaToStrain(strainId: number, payload: { mediaId: number; notes?: string }) {
        const response = await request(`/api/v1/strains/${strainId}/media`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            throw new Error(`Failed to link media: ${response.statusText}`);
        }
        return response.json();
    },

    async unlinkMediaFromStrain(strainId: number, mediaId: number) {
        const response = await request(`/api/v1/strains/${strainId}/media/${mediaId}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error(`Failed to unlink media: ${response.statusText}`);
        }
        return response.json();
    },

    async searchTaxonomy(query: string): Promise<Array<{ taxId: string; name: string; rank: string }>> {
        const response = await request(`/api/v1/taxonomy/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) return [];
        return response.json();
    },
};
