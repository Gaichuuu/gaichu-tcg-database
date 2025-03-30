import { useQuery } from '@tanstack/react-query';
import { fetchSeries } from '../services/CollectionSeriesService';
import { MergedCollectionSeries } from '../types/MergedCollectionSeries';

export const getSeries = () => {
    return useQuery<MergedCollectionSeries[]>({
        queryKey: ['SeriesList'],
        queryFn: fetchSeries,
        staleTime: 1000 * 60 * 5,
      });
}
