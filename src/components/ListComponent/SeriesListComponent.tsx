import { CollectionSeries } from "@/types/CollectionSeries";
import { SeriesAndSet } from "@/types/MergedCollection";
import Tile from "@/components/TileComponents/Tile";

interface SeriesListProps {
  series: SeriesAndSet[];
  onClickSeries: (series: CollectionSeries) => void;
}

const SeriesList: React.FC<SeriesListProps> = ({ series, onClickSeries }) => {
  if (!series?.length) {
    return (
      <div className="text-errorText text-center">No series found.</div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {series?.map((collection) => (
        <Tile
          key={collection.series.id}
          onClick={() => onClickSeries(collection.series)}
        >
          <div className="flex h-full flex-col items-center justify-center">
            <img
              src={collection.series.logo}
              alt={collection.series.name}
              className="max-h-20 w-full object-contain transition group-hover:scale-[1.05]"
            />
            <h4 className="mt-4 font-bold">{collection.series.name}</h4>
            <p className="text-secondaryText text-center">
              {collection.sets.length} releases
            </p>
          </div>
        </Tile>
      ))}
    </div>
  );
};
export default SeriesList;
