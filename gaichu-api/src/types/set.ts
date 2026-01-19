export interface SetImage {
  url: string;
  pathType: string;
  frontDescription?: string;
  backDescription?: string;
  text?: string;
  illustrator?: string;
  note?: string;
  packs?: Array<{
    label: string;
    url: string;
  }>;
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
  set_images?: SetImage[];
  total_cards_count?: number;
}
