export interface CollectionCard {
  id: string;
  name: string;
  number: number;
  set_short_name: string;
  series_short_name: string;
  parody: string;
  description: string;
  hp: string;
  image: string;
  thumb: string;
  rarity: string;
  illustrators: string[];
  attacks: Attack[];
  measurement: Measurement;
  sets: Set[];
  set_ids: string[];
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
