export interface Method {
  id: number;
  name: string;
  description?: string | null;
  createdAt: string;
}

export enum TraitDataType {
  BOOLEAN = 'BOOLEAN',
  NUMERIC = 'NUMERIC',
  CATEGORICAL = 'CATEGORICAL',
  TEXT = 'TEXT',
}

export interface TraitDefinition {
  id: number;
  name: string;
  code: string;
  dataType: TraitDataType;
  category?: string | null;
  defaultMethod?: string | null;
  isSystem?: boolean;
  options?: string[] | null;
  units?: string | null;
  description?: string | null;
  materials?: string | null;
  createdAt: string;
  updatedAt: string;
}
