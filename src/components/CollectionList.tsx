import { useNavigate } from 'react-router-dom';
import Tile from '../components/Tile';
import { getSeries } from '../hooks/getCollection';

const CollectionList = () => {
    const { data: collectionSeries, error } = getSeries();
    const navigate = useNavigate();
  
    if (error) return <p>Something went wrong...</p>;
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {collectionSeries?.map((collection) => (
          <Tile key={collection.series.id} onClick={() => navigate(`/cards/${collection.series.custom_id}`)}>
            <div className="flex h-full flex-col items-center justify-center">
              <img
                src={collection.series.logo}
                alt={collection.series.name}
                className="mb-4 max-h-20 object-contain"
              />
              <h3 className="text-lg font-semibold">{collection.series.name}</h3>
              <p className="text-secondaryText text-center">
                {collection.sets.length} releases
              </p>
            </div>
          </Tile>
        ))}
      </div>
    );
  };
  export default CollectionList;