export type TraitTranslations = (key: string) => string;

const traitKeyByCode = {
  gram_stain: 'gramStain',
  amylase: 'amylase',
  iuk_iaa: 'iukIaa',
  antibiotic_activity: 'antibioticActivity',
  sequenced_seq: 'sequenced',
  phosphate_solubilization: 'phosphates',
  siderophore_production: 'siderophores',
  pigment_secretion: 'pigmentSecretion',
} as const;

const traitCodeByLegacyName: Record<string, keyof typeof traitKeyByCode> = {
  'gram stain': 'gram_stain',
  amylase: 'amylase',
  'iuk / iaa': 'iuk_iaa',
  'antibiotic activity': 'antibiotic_activity',
  'sequenced (seq)': 'sequenced_seq',
  'phosphate solubilization': 'phosphate_solubilization',
  'siderophore production': 'siderophore_production',
  'pigment secretion': 'pigment_secretion',
  'pigment production': 'pigment_secretion',
};

const traitKeyByCanonicalName: Record<string, (typeof traitKeyByCode)[keyof typeof traitKeyByCode]> =
  {
    'Gram Stain': 'gramStain',
    Amylase: 'amylase',
    'IUK / IAA': 'iukIaa',
    'Antibiotic Activity': 'antibioticActivity',
    'Sequenced (SEQ)': 'sequenced',
    'Phosphate Solubilization': 'phosphates',
    'Siderophore Production': 'siderophores',
    'Pigment Secretion': 'pigmentSecretion',
    'Pigment Production': 'pigmentSecretion',
  };

export function resolveTraitCodeFromName(name: string | null | undefined): string | null {
  const normalized = (name || '').trim().toLowerCase();
  if (!normalized) return null;
  return traitCodeByLegacyName[normalized] || null;
}

export function getTraitDisplayName(
  traitCode: string | null | undefined,
  fallbackName: string,
  tStrains: TraitTranslations,
) {
  if (traitCode) {
    const key = traitKeyByCode[traitCode as keyof typeof traitKeyByCode];
    return key ? tStrains(key) : fallbackName;
  }

  const nameKey = traitKeyByCanonicalName[fallbackName];
  return nameKey ? tStrains(nameKey) : fallbackName;
}

export function getTraitOptionLabel(
  traitCode: string | null | undefined,
  optionValue: string,
  tStrains: TraitTranslations,
) {
  if (!traitCode) return optionValue;

  if (traitCode === 'gram_stain' || traitCode === 'amylase') {
    if (optionValue === '+' || optionValue.includes('+')) return tStrains('positive');
    if (optionValue === '-' || optionValue.includes('-')) return tStrains('negative');
  }

  if (traitCode === 'gram_stain' && optionValue.toLowerCase() === 'variable') {
    return tStrains('variable');
  }

  return optionValue;
}

export function isPositiveLike(result: string | null | undefined) {
  if (!result) return false;
  const normalized = result.trim().toLowerCase();
  return normalized === '+' || normalized === 'true' || normalized.includes('positive');
}
