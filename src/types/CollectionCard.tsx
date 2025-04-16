export interface CollectionCard {
    id: string;
    name: string;
    number: number;
    parody: string;
    rarity_id: string;
    description: string;
    hp: number;
    image: string;
    rarity: string;
    illustrators:[string];
    attacks: [Attack];
    measurement: Measurement;
    sets: [Set];
    set_ids: [string];
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
    damage: number;
    costs: [string];
}
