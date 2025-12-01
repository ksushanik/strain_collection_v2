export interface UiBinding {
  id: number;
  menuLabel: string;
  translationKey?: string;
  profileKey: string;
  icon: string;
  enabledFieldPacks: string[];
  routeSlug: string;
  order?: number;
  legendId?: number | null;
  legend?: { id: number; content: string } | null;
}

export interface LegendContent {
  id: number;
  content: string;
}
