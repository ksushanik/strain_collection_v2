export type StorageCellStatus = 'FREE' | 'OCCUPIED';

export interface StorageBox {
  id: number;
  displayName: string;
  rows: number;
  cols: number;
  description?: string;
  _count?: { cells: number };
  occupiedCells?: number;
  freeCells?: number;
}

export interface StorageCellStrainRef {
  id: number;
  identifier: string;
  seq: boolean;
}

export interface StorageCell {
  id: number;
  row: number;
  col: number;
  cellCode: string;
  status: StorageCellStatus;
  strain?: { strain?: StorageCellStrainRef } | null;
}

export interface StorageBoxWithCells extends StorageBox {
  cells: StorageCell[];
}
