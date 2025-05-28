export interface CollectionCard {
  // basic properties
  id: string;
  number: number;
  name: string;
  image: string;
  rarity: string;
  set_short_name: string;
  series_short_name: string;
  illustrators: string[];
  set_ids: string[];
  sets: Set[];
  thumb: string;

  // optional properties
  description?: string;
  attacks?: Attack[];
  measurement?: Measurement;
  parody?: string;
  hp?: string;
  type?: string[];
  limit?: number;
  cost?: Cost[];
  effect?: string;
  note?: string;
}

interface Set {
  name: string;
  image: string;
}

interface Measurement {
  height: string;
  weight: string;
}

interface Attack {
  name: string;
  effect: string;
  damage: string | undefined;
  costs: string[] | undefined;
}
interface Cost {
  total: string;
  aura: string[];
}
