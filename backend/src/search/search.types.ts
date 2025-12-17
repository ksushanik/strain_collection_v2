export type SearchSection =
  | 'strains'
  | 'samples'
  | 'storage'
  | 'media'
  | 'methods'
  | 'legend'
  | 'wiki';

export type SearchHit = {
  section: SearchSection;
  /** Unique within section */
  id: string;
  title: string;
  snippet?: string | null;
  href: string;
  metadata?: Record<string, unknown>;
};

export type GlobalSearchResponse = {
  query: string;
  mode: 'preview' | 'full';
  perSection: number;
  sections: Record<SearchSection, SearchHit[]>;
};

