import { SamplePhoto } from './media';

export interface SampleStrainRef {
  id: number;
  identifier: string;
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
  strains?: SampleStrainRef[];
  _count?: {
    strains: number;
    photos: number;
  };

  // Audit timestamps (returned by export endpoint)
  createdAt?: string;
  updatedAt?: string;
}

export interface SampleTypeOption {
  id: number;
  name: string;
  slug: string;
}
