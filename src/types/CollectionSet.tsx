export interface CollectionSet {
  id: string;
  short_name: string;
  sortBy: number;
  series_id: string;
  series_short_name: string;
  logo: string;
  name: string;
  description?: string;
  set_images?: Array<{
    url: string;
    pathType: string;
    frontDescription?: string;
    backDescription?: string;
    note?: string;
    text?: string;
    packs?: Array<{
      url: string;
      label: string;
    }>;
  }>;
}
