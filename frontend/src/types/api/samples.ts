import { SamplePhoto } from './media';

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

export interface SampleTypeOption {
  id: number;
  name: string;
  slug: string;
}
