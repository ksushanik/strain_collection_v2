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
  stockType?: "MASTER" | "WORKING" | "DISTRIBUTION";
  passageNumber?: number;
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

export interface StrainPhenotype {
    id: number
    traitName: string
    result: string
    method?: string
}

export type StrainPhenotypeInput = Omit<StrainPhenotype, 'id'> & { id?: number };

export interface StrainGenetics {
    id: number
    wgsStatus: "NONE" | "PLANNED" | "SEQUENCED" | "ASSEMBLED" | "PUBLISHED"
    assemblyAccession?: string
    marker16sSequence?: string
    marker16sAccession?: string
}

export interface Strain {
  id: number;
  identifier: string;
  sampleId: number;
  sample?: StrainSampleRef;
  
  // New V2 Fields
  ncbiScientificName?: string;
  ncbiTaxonomyId?: number;
  biosafetyLevel?: "BSL_1" | "BSL_2" | "BSL_3" | "BSL_4";
  stockType?: "MASTER" | "WORKING" | "DISTRIBUTION";
  passageNumber?: number;
  phenotypes?: StrainPhenotype[];
  genetics?: StrainGenetics | null;
  gramStainLabel?: string | null;

  // Legacy / Fallback Fields
  taxonomy16s?: string;
  otherTaxonomy?: string;
  indexerInitials?: string;
  collectionRcam?: string;
  isolationRegion?: string;
  features?: string;
  comments?: string;
  
  // Relations
  storage?: StrainStorage[];
  media?: StrainMedia[];
  photos?: StrainPhoto[];
}

export interface CreateStrainInput extends Omit<Partial<Strain>, 'phenotypes' | 'genetics'> {
    phenotypes?: StrainPhenotypeInput[];
    genetics?: Partial<StrainGenetics> | null;
}
