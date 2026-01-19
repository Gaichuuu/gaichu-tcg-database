export interface PackArt {
  url: string;
  frontDescription?: string;
  backDescription?: string;
  illustrator?: string;
  note?: string;
  packs?: Array<{
    label: string;
    url: string;
  }>;
}

export interface CardBack {
  url: string;
  text?: string;
  illustrator?: string;
  note?: string;
}

export interface Set {
  id: string;
  series_short_name: string;
  series_id: string;
  short_name: string;
  sort_by: number;
  name: string;
  logo: string;
  description?: string;
  printFileUrl?: string;
  pack_art?: PackArt;
  card_back?: CardBack;
  total_cards_count?: number;
}
