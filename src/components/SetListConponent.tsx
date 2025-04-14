import { useNavigate, useParams } from 'react-router-dom';
import { getSets } from '../hooks/getCollection';
import Tile from './Tile';

const setsList = () => {
    const navigate = useNavigate();
    const { shortName } = useParams();
    const { data: collectionSet, error } = getSets(shortName);

    if (error) return <p>Something went wrong...</p>;
    return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {collectionSet?.map((set) => (
          <Tile
            key={set.set.short_name}
            onClick={() => navigate(`/cards/${shortName}/sets/${set.set.short_name}`)}
          >
            <div className="flex h-full flex-col items-center justify-center">
              <img
                src={set.set.logo}
                alt={set.set.short_name}
                className="mb-4 max-h-16 rounded object-contain"
              />
              <h3 className="text-lg font-semibold">{set.set.name}</h3>
              <p className="text-secondaryText text-center">
                {set.cards.length}
              </p>
            </div>
          </Tile>
        ))}
      </div>
    );
  };

export default setsList;
