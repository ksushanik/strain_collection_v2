export interface Media {
  id: number;
  name: string;
  composition?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SamplePhotoMeta {
  fileId: string;
  originalName: string;
  size: number;
  width?: number;
  height?: number;
  fileType?: string;
}

export interface SamplePhoto {
  id: number;
  sampleId: number;
  url: string;
  meta?: SamplePhotoMeta;
  createdAt: string;
}

export interface StrainPhotoMeta {
  originalName?: string;
  size?: number;
  width?: number;
  height?: number;
  fileType?: string;
  fileId?: string;
}

export interface StrainPhoto {
  id: number;
  strainId: number;
  url: string;
  meta?: StrainPhotoMeta;
  createdAt: string;
}
