import { useQuery } from '@tanstack/react-query';
import { fetchSeries } from '../services/CollectionSeriesService';
import { SeriesAndSet } from '../types/MergedCollection';

export const getSeries = () => {
    return useQuery<SeriesAndSet[]>({
        queryKey: ['SeriesList'],
        queryFn: fetchSeries,
        staleTime: 1000 * 60 * 5,
      });
}
