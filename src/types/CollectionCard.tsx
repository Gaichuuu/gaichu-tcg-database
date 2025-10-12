export interface CollectionCard {
  id: string;
  total_cards_count: number;
  number: number;
  sortBy: number;
  name: string;
  image: string;
  rarity: string;
  set_short_name: string;
  series_short_name: string;
  illustrators: string[];
  set_ids: string[];
  sets: Set[];
  thumb: string;
  variant: string;

  color?: string;
  description?: string;
  attacks?: Attack[];
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
}

interface Set {
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
  weight: string;
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
  weight: string;
  gps: string;
  discovered: string;
  length?: string;
  type?: string;
  measurement?: string;
}

interface Attack {
  name: string;
  effect?: string;
  damage: string | undefined;
  costs: string[] | undefined;
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

interface ResistanceEntry {
  type?: string;
  value?: string;
}

interface RetreatEntry {
  costs?: string[];
}
