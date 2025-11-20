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
    photoCount?: number;
}

export interface Strain {
    id: number;
    identifier: string;
    sampleId: number;
    sampleCode?: string;
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
        // TODO: Implement when Samples API is ready
        // const response = await fetch(`${API_BASE_URL}/api/v1/samples`);
        // return response.json();
        return [];
    },

    async getStrains(): Promise<Strain[]> {
        // TODO: Implement when Strains API is ready
        // const response = await fetch(`${API_BASE_URL}/api/v1/strains`);
        // return response.json();
        return [];
    },

    async getStorageBoxes(): Promise<any[]> {
        // TODO: Implement when Storage API is ready
        return [];
    },

    async getBoxCells(boxId: number): Promise<any[]> {
        // TODO: Implement when Storage API is ready
        return [];
    }
};
