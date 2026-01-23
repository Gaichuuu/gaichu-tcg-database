type LocaleKey = "en" | "ja";

type I18nInput = string | Partial<Record<LocaleKey, string>>;

export function toI18nMap(
  v: I18nInput | undefined,
): Partial<Record<LocaleKey, string>> {
  if (v == null) return {};
  return typeof v === "string" ? { en: v } : v;
}

// ---------- Types ----------

export interface RawCollectionCard {
  id: string;
  total_cards_count: number;
  number: number;
  sort_by: number;

  name: I18nInput;
  image: string;
  rarity: string;
  set_short_name: string;
  series_short_name: string;
  illustrators: string[];
  set_ids: string[];

  sets: CardSet[];
  thumb: string;
  variant: string;

  color?: string;
  description?: I18nInput;
  attacks?: Array<{
    name: I18nInput;
    effect: I18nInput;
    damage?: string;
    costs?: string[];
  }>;
  zoo_attack?: Zoo_Attack[];
  measurement?: Measurement;
  stage?: Stage[];
  rule?: Rule[];
  metadata?: Metadata;
  weakness?: WeaknessEntry[];
  resistance?: ResistanceEntry[];
  retreat?: RetreatEntry[];
  parody?: string;
  hp?: string;
  lp?: string;
  traits?: string[];
  terra?: Terra[];
  type?: string;
  limit?: number;
  cost?: Cost[];
  effect?: string;
  note?: string;

  /** Average eBay sale price (USD), 0 if no data */
  average_price?: number;
}

export interface CollectionCard {
  id: string;
  total_cards_count: number;
  number: number;
  sort_by: number;
  name: Partial<Record<LocaleKey, string>>;
  image: string;
  rarity: string;
  set_short_name: string;
  series_short_name: string;
  illustrators: string[];
  set_ids: string[];
  sets: CardSet[];
  thumb: string;
  variant: string;

  color?: string;
  description?: Partial<Record<LocaleKey, string>>;
  attacks?: Attack[];
  zoo_attack?: Zoo_Attack[];
  measurement?: Measurement;
  stage?: Stage[];
  rule?: Rule[];
  metadata?: Metadata;
  weakness?: WeaknessEntry[];
  resistance?: ResistanceEntry[];
  retreat?: RetreatEntry[];
  strength?: StrengthEntry[];
  parody?: string;
  hp?: string;
  lp?: string;
  lp_alt?: string;
  traits?: string[];
  terra?: Terra[];
  type?: string;
  limit?: number;
  cost?: Cost[];
  effect?: string;
  note?: string;

  /** Average eBay sale price (USD), 0 if no data */
  average_price?: number;
}

interface CardSet {
  name: string;
  image: string;
}

interface Terra {
  attack: string;
  icon: string;
  lp: string;
}

interface Measurement {
  height?: string;
  weight?: string;
}

interface Stage {
  basic?: string;
  evolution?: string;
  description?: string;
}

interface Rule {
  name?: string;
  description?: string;
}

interface Metadata {
  height?: string;
  weight?: string;
  gps?: string;
  discovered?: string;
  length?: string;
  type?: string;
  measurement?: string;
}

interface Attack {
  name: Partial<Record<LocaleKey, string>>;
  effect: Partial<Record<LocaleKey, string>>;
  damage?: string;
  costs?: string[];
}

interface Zoo_Attack {
  name: string;
  effect?: string;
  damage: string;
  status?: string[];
  multiplier?: string;
  bonus?: string;
}

interface Cost {
  total: string;
  aura: string;
}

interface WeaknessEntry {
  type?: string;
  value?: string;
}

interface StrengthEntry {
  type?: string[];
  value?: string;
}

interface ResistanceEntry {
  type?: string;
  value?: string;
}

interface RetreatEntry {
  costs?: string[];
}

// ---------- Normalizers ----------

export function normalizeCollectionCard(
  raw: RawCollectionCard,
): CollectionCard {
  return {
    ...raw,
    name: toI18nMap(raw.name),
    description: toI18nMap(raw.description),

    attacks: (raw.attacks ?? []).map((a) => ({
      name: toI18nMap(a.name),
      effect: toI18nMap(a.effect),
      damage: a.damage,
      costs: a.costs ?? [],
    })),
  };
}

export function normalizeCollectionList(
  raws: RawCollectionCard[],
): CollectionCard[] {
  return raws.map(normalizeCollectionCard);
}
