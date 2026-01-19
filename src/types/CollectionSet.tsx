export interface SetImage {
  url: string;
  pathType?: string;
  frontDescription?: string;
  backDescription?: string;
  note?: string;
  text?: string;
  illustrator?: string;
  packs?: Array<{ url: string; label: string }>;
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
  set_images?: SetImage[];
}
