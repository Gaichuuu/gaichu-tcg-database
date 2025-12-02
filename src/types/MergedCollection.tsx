//types/MergedCollection"
type LocaleKey = "en" | "ja";

import { CollectionSeries } from "./CollectionSeries";
import { CollectionSet } from "./CollectionSet";

export interface SeriesAndSet {
  series: CollectionSeries;
  sets: CollectionSet[];
}

export interface SetAndCard {
  set: {
    id: string;
    short_name: string;
    series_short_name: string;
    series_id: string;
    logo: string;
    name: string;
    print_file_url?: string;
    sort_by: number;
    description?: string;
    set_images?: Array<{
      url: string;
      pathType?: string;
      frontDescription?: string;
      backDescription?: string;
      note?: string;
      text?: string;
      illustrator?: string;
      packs?: Array<{ url: string; label: string }>;
    }>;
  };
  cards: Array<{
    id: string;
    total_cards_count: number;
    number: number;
    sort_by: number;

    name: Partial<Record<LocaleKey, string>>;
    description?: Partial<Record<LocaleKey, string>>;
    attacks?: Array<{
      name: Partial<Record<LocaleKey, string>>;
      effect: Partial<Record<LocaleKey, string>>;
      damage?: string;
      costs?: string[];
    }>;

    parody?: string;
    rarity: string;
    color?: string;
    set_short_name: string;
    series_short_name: string;
    image: string;
    thumb: string;
    variant: string;
    hp?: string;
    effect?: string;
    note?: string;
    illustrators: string[];
    zoo_attack?: any[];
    weakness?: Array<{ type?: string; value?: string }>;
    resistance?: Array<{ type?: string; value?: string }>;
    retreat?: Array<{ costs?: string[] }>;
    measurement?: { height?: string; weight?: string };
    stage?: Array<{ basic?: string; evolution?: string; description?: string }>;
    rule?: Array<{ name?: string; description?: string }>;
    sets: Array<{ name: string; image: string }>;
    set_ids: string[];
    traits?: string[];
    terra?: any[];
    metadata?: any;
    type?: string;
    limit?: number;
    cost?: Array<{ total: string; aura: string }>;
    lp?: string;
  }>;
}
