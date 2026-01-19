export interface PackArt {
  url: string;
  frontDescription?: string;
  backDescription?: string;
  illustrator?: string;
  note?: string;
  packs?: Array<{ url: string; label: string }>;
}

export interface CardBack {
  url: string;
  text?: string;
  illustrator?: string;
  note?: string;
}

export interface CollectionSet {
  id: string;
  short_name: string;
  series_short_name: string;
  series_id: string;
  logo: string;
  name: string;
  sort_by: number;
  total_cards_count?: number;
  description?: string;
  print_file_url?: string;
  buy_url?: string;
  pack_art?: PackArt;
  card_back?: CardBack;
}
