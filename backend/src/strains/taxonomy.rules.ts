export interface TaxonomyRule {
  genus: string;
  gramStain?: 'positive' | 'negative';
  autoGramStain?: boolean;
}

export const TAXONOMY_RULES: TaxonomyRule[] = [
  {
    genus: 'stenotrophomonas',
    gramStain: 'negative',
    autoGramStain: true,
  },
];
