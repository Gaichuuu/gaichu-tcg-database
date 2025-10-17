import { SeriesAndSet } from "@/types/MergedCollection";
import seriesList from "data/series.json";
import setsList from "data/sets.json";

export const getJsonSeries = (): SeriesAndSet[] => {
  const result = seriesList
    .flatMap((series) => {
      return convertToSeriesAndSet(series);
    })
    .sort((a, b) => a.series.sort_by - b.series.sort_by);
  return result;
};
const convertToSeriesAndSet = (series: any): SeriesAndSet => ({
  series: {
    id: series.id,
    short_name: series.short_name,
    logo: series.logo,
    name: series.name,
    sort_by: series.sort_by,
  },
  sets: setsList
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
      set_images: set.set_images?.map((image: any) => ({
        url: image.url,
        pathType: image.pathType,
        frontDescription: image.frontDescription,
        backDescription: image.backDescription,
        note: image.note,
        text: image.text,
        illustrator: image.illustrator,
        packs: image.packs?.map((pack: any) => ({
          url: pack.url,
          label: pack.label,
        })),
      })),
    })),
});
