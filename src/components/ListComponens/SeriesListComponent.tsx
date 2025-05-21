import { useNavigate } from "react-router-dom";
import { getSeries } from "../../hooks/useCollection";
import { CollectionSeries } from "../../types/CollectionSeries";
import Tile from "../TileComponents/Tile";

const seriesList = () => {
  const result = getSeries();
  const navigate = useNavigate();
  const handleClick = (series: CollectionSeries) => {
    navigate(`/cards/${series.short_name}`);
  };
  if (result.error) return <p>Something went wrong...</p>;
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {result.data?.map((collection) => (
        <Tile
          key={collection.series.id}
          onClick={() => handleClick(collection.series)}
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
export default seriesList;
