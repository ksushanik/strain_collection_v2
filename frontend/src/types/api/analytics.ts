export interface AnalyticsOverview {
  totalStrains: number;
  totalSamples: number;
  totalBoxes: number;
  occupiedCells: number;
  freeCells: number;
  recentAdditions: {
    id: number;
    identifier: string;
    createdAt: string;
    sample?: { id: number; code: string | null };
  }[];
}
