const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface UiBinding {
    id: number;
    menuLabel: string;
    profileKey: string;
    icon: string;
    enabledFieldPacks: string[];
    routeSlug: string;
}

export interface Sample {
    id: number;
    code: string;
    sampleType: string;
    siteName: string;
    lat?: number;
    lng?: number;
    description?: string;
    collectedAt: string;
    _count?: {
        strains: number;
        photos: number;
    };
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
    taxonomy16s?: Record<string, any>;
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
}

export const ApiService = {
    async getUiBindings(): Promise<UiBinding[]> {
        const response = await fetch(`${API_BASE_URL}/api/v1/settings/ui-bindings`);
        if (!response.ok) {
            throw new Error(`Failed to fetch UI bindings: ${response.statusText}`);
        }
        return response.json();
    },

    async getSamples(): Promise<Sample[]> {
        const response = await fetch(`${API_BASE_URL}/api/v1/samples`);
        if (!response.ok) {
            throw new Error(`Failed to fetch samples: ${response.statusText}`);
        }
        const data = await response.json();
        return data.data;
    },

    async getSample(id: number): Promise<Sample> {
        const response = await fetch(`${API_BASE_URL}/api/v1/samples/${id}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch sample: ${response.statusText}`);
        }
        return response.json();
    },

    async getStrains(): Promise<Strain[]> {
        const response = await fetch(`${API_BASE_URL}/api/v1/strains`);
        if (!response.ok) {
            throw new Error(`Failed to fetch strains: ${response.statusText}`);
        }
        const data = await response.json();
        return data.data;
    },

    async getStrain(id: number): Promise<Strain> {
        const response = await fetch(`${API_BASE_URL}/api/v1/strains/${id}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch strain: ${response.statusText}`);
        }
        return response.json();
    },

    async getStorageBoxes(): Promise<any[]> {
        const response = await fetch(`${API_BASE_URL}/api/v1/storage/boxes`);
        if (!response.ok) {
            throw new Error(`Failed to fetch storage boxes: ${response.statusText}`);
        }
        return response.json();
    },

    async getBoxCells(boxId: number): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/api/v1/storage/boxes/${boxId}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch box cells: ${response.statusText}`);
        }
        return response.json();
    },

    async createStrain(data: Partial<Strain>): Promise<Strain> {
        const response = await fetch(`${API_BASE_URL}/api/v1/strains`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error(`Failed to create strain: ${response.statusText}`);
        return response.json();
    },

    async updateStrain(id: number, data: Partial<Strain>): Promise<Strain> {
        const response = await fetch(`${API_BASE_URL}/api/v1/strains/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error(`Failed to update strain: ${response.statusText}`);
        return response.json();
    },

    async createSample(data: Partial<Sample>): Promise<Sample> {
        const response = await fetch(`${API_BASE_URL}/api/v1/samples`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error(`Failed to create sample: ${response.statusText}`);
        return response.json();
    },

    async updateSample(id: number, data: Partial<Sample>): Promise<Sample> {
        const response = await fetch(`${API_BASE_URL}/api/v1/samples/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error(`Failed to update sample: ${response.statusText}`);
        return response.json();
    }
};
