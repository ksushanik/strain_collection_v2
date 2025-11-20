import { Sample, Strain, UiBinding, StorageBox, StorageCell } from "@/types/domain";

// --- Mock Data ---

const MOCK_BINDINGS: UiBinding[] = [
    {
        menuLabel: "My Collection",
        profileKey: "strain",
        routeSlug: "my-collection",
        icon: "Microscope",
        enabledFieldPacks: ["basic_info", "taxonomy", "growth_characteristics"]
    },
    {
        menuLabel: "Field Samples",
        profileKey: "sample",
        routeSlug: "field-samples",
        icon: "Leaf",
        enabledFieldPacks: ["site_info"]
    },
    {
        menuLabel: "Storage",
        profileKey: "storage",
        routeSlug: "storage",
        icon: "Box",
        enabledFieldPacks: []
    }
];

const MOCK_SAMPLES: Sample[] = [
    {
        id: 1,
        code: "24-PL-Rose-01",
        sampleType: "PLANT",
        siteName: "Botanical Garden, Sector A",
        collectedAt: "2024-05-15T10:00:00Z",
        photoCount: 3,
        lat: 55.75,
        lng: 37.61
    },
    {
        id: 2,
        code: "24-SO-Forest-05",
        sampleType: "SOIL",
        siteName: "Pine Forest, Region 2",
        collectedAt: "2024-06-01T14:30:00Z",
        photoCount: 1,
        lat: 56.10,
        lng: 38.20
    }
];

const MOCK_STRAINS: Strain[] = [
    {
        id: 101,
        identifier: "STR-2024-001",
        sampleId: 1,
        sampleCode: "24-PL-Rose-01",
        taxonomy16s: { genus: "Pseudomonas", species: "fluorescens" },
        indexerInitials: "AK",
        seq: true,
        gramStain: "NEGATIVE",
        phosphates: true,
        siderophores: true,
        pigmentSecretion: true,
        features: "Strong fluorescence under UV"
    },
    {
        id: 102,
        identifier: "STR-2024-002",
        sampleId: 1,
        sampleCode: "24-PL-Rose-01",
        taxonomy16s: { genus: "Bacillus", species: "subtilis" },
        indexerInitials: "AK",
        seq: false,
        gramStain: "POSITIVE",
        phosphates: false,
        siderophores: false,
        pigmentSecretion: false,
        features: "Spore forming"
    },
    {
        id: 103,
        identifier: "STR-2024-003",
        sampleId: 2,
        sampleCode: "24-SO-Forest-05",
        taxonomy16s: { genus: "Streptomyces", species: "sp." },
        indexerInitials: "VB",
        seq: true,
        gramStain: "POSITIVE",
        phosphates: true,
        siderophores: true,
        pigmentSecretion: true,
        antibioticActivity: "High against E. coli"
    }
];

const MOCK_BOXES: StorageBox[] = [
    {
        id: 1,
        displayName: "Freezer 1 - Rack A - Box 1",
        rows: 9,
        cols: 9,
        occupancy: "5/81"
    },
    {
        id: 2,
        displayName: "Freezer 1 - Rack A - Box 2",
        rows: 10,
        cols: 10,
        occupancy: "85/100"
    }
];

// Generate some dummy cells for Box 1
const MOCK_CELLS_BOX_1: StorageCell[] = Array.from({ length: 81 }, (_, i) => {
    const row = Math.floor(i / 9) + 1;
    const col = (i % 9) + 1;
    // Occupy first 5 cells
    const isOccupied = i < 5;
    return {
        id: i + 1,
        boxId: 1,
        row,
        col,
        cellCode: `${String.fromCharCode(64 + row)}${col}`, // A1, A2...
        status: isOccupied ? 'OCCUPIED' : 'FREE',
        strainIdentifier: isOccupied ? `STR-2024-00${i + 1}` : undefined
    };
});

// --- Service ---

export const MockApiService = {
    getUiBindings: async (): Promise<UiBinding[]> => {
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
        return MOCK_BINDINGS;
    },

    getSamples: async (): Promise<Sample[]> => {
        await new Promise(resolve => setTimeout(resolve, 600));
        return MOCK_SAMPLES;
    },

    getStrains: async (): Promise<Strain[]> => {
        await new Promise(resolve => setTimeout(resolve, 700));
        return MOCK_STRAINS;
    },

    getStorageBoxes: async (): Promise<StorageBox[]> => {
        await new Promise(resolve => setTimeout(resolve, 400));
        return MOCK_BOXES;
    },

    getBoxCells: async (boxId: number): Promise<StorageCell[]> => {
        await new Promise(resolve => setTimeout(resolve, 300));
        if (boxId === 1) return MOCK_CELLS_BOX_1;
        return []; // Empty for others for now
    }
};
