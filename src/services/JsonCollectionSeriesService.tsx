import { SeriesAndSet } from "@/types/MergedCollection";
import seriesList from "data/series.json";
import setsList from "data/sets.json";

interface JsonSeries {
  id: string;
  short_name: string;
  logo: string;
  name: string;
  sort_by: number;
}

interface JsonSetImage {
  url: string;
  pathType?: string;
  frontDescription?: string;
  backDescription?: string;
  note?: string;
  text?: string;
  illustrator?: string;
  packs?: Array<{ url: string; label: string }>;
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
  set_images?: JsonSetImage[];
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
  },
  sets: (setsList as JsonSet[])
    .filter((set) => set.series_id === series.id)
    .map((set) => ({
      id: set.id,
      short_name: set.short_name,
      series_short_name: set.series_short_name,
      series_id: set.series_id,
      logo: set.logo,
      name: set.name,
      sort_by: set.sort_by,
      description: set.description,
      set_images: set.set_images?.map((image) => ({
        url: image.url,
        pathType: image.pathType,
        frontDescription: image.frontDescription,
        backDescription: image.backDescription,
        note: image.note,
        text: image.text,
        illustrator: image.illustrator,
        packs: image.packs?.map((pack) => ({
          url: pack.url,
          label: pack.label,
        })),
      })),
    })),
});
