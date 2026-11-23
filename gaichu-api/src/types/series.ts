export interface SeriesLink {
  type: string;
  url: string;
  label: string;
}

export interface Series {
  id: string;
  short_name: string;
  name: string;
  name_ja?: string;
  logo: string;
  sort_by: number;
  description?: string;
  website?: string;
  patreon?: string;
  instagram?: string;
  discord?: string;
  twitter?: string;
  youtube?: string;
  links?: SeriesLink[];
}
