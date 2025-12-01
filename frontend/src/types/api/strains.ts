import { Media, StrainPhoto } from './media';

export interface StrainStorageCell {
  id: number;
  cellCode: string;
  box: {
    id: number;
    displayName: string;
  };
}

export interface StrainStorage {
  id: number;
  isPrimary: boolean;
  cell: StrainStorageCell;
}

export interface StrainMedia {
  mediaId: number;
  notes?: string | null;
  media: Media;
}

export interface StrainSampleRef {
  id: number;
  code: string;
  siteName?: string;
}

export interface Strain {
  id: number;
  identifier: string;
  sampleId: number;
  sample?: StrainSampleRef;
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
  storage?: StrainStorage[];
  media?: StrainMedia[];
  photos?: StrainPhoto[];
}
