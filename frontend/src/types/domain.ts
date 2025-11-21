export type ProfileKey = 'sample' | 'strain' | 'media' | 'storage';

export interface UiBinding {
    menuLabel: string;
    profileKey: ProfileKey;
    routeSlug: string;
    icon: string; // Lucide icon name
    enabledFieldPacks: string[];
}

export interface Sample {
    id: number;
    code: string;
    sampleType: 'PLANT' | 'ANIMAL' | 'WATER' | 'SOIL' | 'OTHER';
    siteName: string;
    lat?: number;
    lng?: number;
    description?: string;
    collectedAt: string; // ISO Date
    photoCount: number;
}

export interface Strain {
    id: number;
    identifier: string;
    sampleId: number;
    sampleCode: string; // Denormalized for display
    taxonomy16s?: Record<string, any>;
    otherTaxonomy?: string;
    indexerInitials?: string;
    collectionRcam?: string;
    seq: boolean;
    biochemistry?: string;
    genome?: string;
    antibioticActivity?: string;
    gramStain?: 'POSITIVE' | 'NEGATIVE' | 'VARIABLE';
    phosphates: boolean;
    siderophores: boolean;
    pigmentSecretion: boolean;
    amylase?: 'POSITIVE' | 'NEGATIVE';
    isolationRegion?: 'RHIZOSPHERE' | 'ENDOSPHERE' | 'PHYLLOSPHERE' | 'SOIL' | 'OTHER';
    features?: string;
    comments?: string;
}

export interface Media {
    id: number;
    name: string;
    composition?: string;
}

export interface StorageBox {
    id: number;
    displayName: string;
    rows: number;
    cols: number;
    occupancy: string; // e.g. "10/81"
}

export interface StorageCell {
    id: number;
    boxId: number;
    row: number;
    col: number;
    cellCode: string;
    status: 'FREE' | 'OCCUPIED' | 'RESERVED';
    strainIdentifier?: string;
}

export type Role = 'ADMIN' | 'MANAGER' | 'USER';

export interface User {
    id: number;
    email: string;
    name?: string;
    role: Role;
    groupId?: number;
}
