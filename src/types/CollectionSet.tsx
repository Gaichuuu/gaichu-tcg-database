export interface CollectionSet {
  id: string;
  short_name: string;
  series_short_name: string;
  series_id: string;
  logo: string;
  name: string;
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
}
