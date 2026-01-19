export interface SeriesLink {
  type: string;
  url: string;
  label: string;
}

export interface CollectionSeries {
  id: string;
  sort_by: number;
  short_name: string;
  name: string;
  logo: string;
  description?: string;
  website?: string;
  patreon?: string;
  instagram?: string;
  discord?: string;
  twitter?: string;
  youtube?: string;
  links?: SeriesLink[];
}
