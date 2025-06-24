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
      series_id: set.series_id,
      logo: set.logo,
      name: set.name,
      sortBy: set.sortBy,
    })),
});
