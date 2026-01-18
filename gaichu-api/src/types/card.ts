type LocaleKey = "en" | "ja";

export type I18nMap = Partial<Record<LocaleKey, string>>;

export interface CardSet {
  name: string;
  image: string;
}

export interface Terra {
  attack: string;
  icon: string;
  lp: string;
}

export interface Metadata {
  height?: string;
  weight?: string;
  gps?: string;
  discovered?: string;
  length?: string;
  type?: string;
  measurement?: string;
}

export interface Attack {
  name: I18nMap;
  effect: I18nMap;
  damage?: string;
  costs?: string[];
}

export interface ZooAttack {
  name: string;
  effect?: string;
  damage: string;
  status?: string[];
  multiplier?: string;
  bonus?: string;
}

export interface Cost {
  total: string;
  aura: string;
}

export interface WeaknessEntry {
  type?: string;
  value?: string;
}

export interface ResistanceEntry {
  type?: string;
  value?: string;
}

export interface RetreatEntry {
  costs?: string[];
}

export interface Stage {
  basic?: string;
  evolution?: string;
  description?: string;
}

export interface Rule {
  name?: string;
  description?: string;
}

export interface Measurement {
  height?: string;
  weight?: string;
}

export interface Card {
  id: string;
  total_cards_count: number;
  number: number;
  sort_by: number;
  name: I18nMap | string;
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
  description?: I18nMap | string;
  attacks?: Attack[];
  zoo_attack?: ZooAttack[];
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
  lp_alt?: string;
  traits?: string[];
  terra?: Terra[];
  type?: string;
  limit?: number;
  cost?: Cost[];
  effect?: string;
  note?: string;
}
