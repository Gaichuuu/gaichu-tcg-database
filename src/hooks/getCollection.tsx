import { useQuery } from '@tanstack/react-query';
import { fetchSeries } from '../services/CollectionSeriesService';
import { fetchSets } from '../services/CollectionSetService';
import { SeriesAndSet, SetAndCard } from '../types/MergedCollection';

export const getSeries = () => {
    return useQuery<SeriesAndSet[]>({
        queryKey: ['SeriesList'],
        queryFn: fetchSeries,
        staleTime: 1000 * 60 * 5,
      });
}

export const getSets = (shortName?: string) => {
  return useQuery<SetAndCard[]>({
      queryKey: ['SetsList'],
      enabled: !!shortName,
      queryFn: () => fetchSets(shortName!),
      staleTime: 1000 * 60 * 5,
    });
}
