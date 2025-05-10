import seriesList from "../../data/series.json";
import setsList from "../../data/sets.json";
import { SeriesAndSet } from "../types/MergedCollection";

export const getJsonSeries = (): SeriesAndSet[] => {
  const result = seriesList.flatMap((series) => {
    // Filter sets that belong to the current series
    const matchingSets = setsList.filter((set) => set.series_id === series.id);

    // Create the SeriesAndSet object
    return [
      {
        series: {
          id: series.id,
          short_name: series.short_name,
          logo: series.logo,
          name: series.name,
        },
        sets: matchingSets.map((set) => ({
          id: set.id,
          short_name: set.short_name,
          series_id: set.series_id,
          logo: set.logo,
          name: set.name,
        })),
      },
    ];
  });

  return result;
};
