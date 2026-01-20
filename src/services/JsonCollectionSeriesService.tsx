import { SeriesLink } from "@/types/CollectionSeries";
import { SeriesAndSet } from "@/types/MergedCollection";
import seriesList from "data/series.json";
import setsList from "data/sets.json";

interface JsonSeries {
  id: string;
  short_name: string;
  logo: string;
  name: string;
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

interface JsonPackArt {
  url: string;
  frontDescription?: string;
  backDescription?: string;
  illustrator?: string;
  note?: string;
  packs?: Array<{ url: string; label: string }>;
}

interface JsonCardBack {
  url: string;
  text?: string;
  illustrator?: string;
  note?: string;
}

interface JsonSet {
  id: string;
  short_name: string;
  series_short_name: string;
  series_id: string;
  logo: string;
  name: string;
  sort_by: number;
  description?: string;
  pack_art?: JsonPackArt;
  card_back?: JsonCardBack;
  total_cards_count?: number;
}

export const getJsonSeries = (): SeriesAndSet[] => {
  const result = (seriesList as JsonSeries[])
    .flatMap((series) => {
      return convertToSeriesAndSet(series);
    })
    .sort((a, b) => a.series.sort_by - b.series.sort_by);
  return result;
};

const convertToSeriesAndSet = (series: JsonSeries): SeriesAndSet => ({
  series: {
    id: series.id,
    short_name: series.short_name,
    logo: series.logo,
    name: series.name,
    sort_by: series.sort_by,
    description: series.description,
    website: series.website,
    patreon: series.patreon,
    instagram: series.instagram,
    discord: series.discord,
    twitter: series.twitter,
    youtube: series.youtube,
    links: series.links,
  },
  sets: (setsList as JsonSet[])
    .filter((set) => set.series_id === series.id)
    .sort((a, b) => a.sort_by - b.sort_by)
    .map((set) => ({
      id: set.id,
      short_name: set.short_name,
      series_short_name: set.series_short_name,
      series_id: set.series_id,
      logo: set.logo,
      name: set.name,
      sort_by: set.sort_by,
      description: set.description,
      pack_art: set.pack_art,
      card_back: set.card_back,
      total_cards_count: set.total_cards_count,
    })),
});
