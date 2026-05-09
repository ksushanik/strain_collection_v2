export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export type ImportRowStatus = 'create' | 'update' | 'error';

export interface ImportRowError {
  field?: string;
  message: string;
}

export interface ImportRowResult {
  rowNum: number;
  identifier?: string;
  status: ImportRowStatus;
  errors: ImportRowError[];
}

export interface ImportSummary {
  total: number;
  toCreate: number;
  toUpdate: number;
  errors: number;
}

export interface ImportReport {
  summary: ImportSummary;
  rows: ImportRowResult[];
}
