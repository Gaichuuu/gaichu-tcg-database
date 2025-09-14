import { SeriesAndSet } from "@/types/MergedCollection";
import seriesList from "data/series.json";
import setsList from "data/sets.json";

export const getJsonSeries = (): SeriesAndSet[] => {
  const result = seriesList
    .flatMap((series) => {
      return convertToSeriesAndSet(series);
    })
    .sort((a, b) => a.series.sortBy - b.series.sortBy);
  return result;
};
const convertToSeriesAndSet = (series: any): SeriesAndSet => ({
  series: {
    id: series.id,
    short_name: series.short_name,
    logo: series.logo,
    name: series.name,
    sortBy: series.sortBy,
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
      sortBy: set.sortBy,
      description: set.description,
      set_images: set.set_images?.map((image: any) => ({
        url: image.url,
        pathType: image.pathType,
        frontDescription: image.frontDescription,
        backDescription: image.backDescription,
        note: image.note,
        text: image.text,
        packs: image.packs?.map((pack: any) => ({
          url: pack.url,
          label: pack.label,
        })),
      })),
    })),
});
