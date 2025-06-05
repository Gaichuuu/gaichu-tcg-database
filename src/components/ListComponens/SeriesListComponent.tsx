import { CollectionSeries } from "../../types/CollectionSeries";
import { SeriesAndSet } from "../../types/MergedCollection";
import Tile from "../TileComponents/Tile";

type SeriesListComponent = {
  series: SeriesAndSet[];
  onClickSeries: (series: CollectionSeries) => void;
};
const SeriesList: React.FC<SeriesListComponent> = ({
  series,
  onClickSeries,
}) => {
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
              className="mb-4 max-h-20 object-contain"
            />
            <h3 className="text-lg">{collection.series.name}</h3>
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
