import { Params, useNavigate, useParams } from 'react-router-dom';
import { getCards } from '../hooks/getCollection';
import Tile from './Tile';

const CardList = () => {
    const { seriesId, setShortName } = useParams<Params>();
    const { data: collectionCards, error } = getCards(setShortName);
    const navigate = useNavigate();

    if (error) return <p>Something went wrong...</p>;

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-8">
        {collectionCards?.map((card) => (
          <Tile
            key={card.id}
            onClick={() =>
              navigate(`/cards/${seriesId}/sets/${setShortName}/card/${card.id}`)
            }
          >
            <div className="flex w-full flex-col items-center">
              {/* Image with max height 400px that scales down while maintaining aspect ratio */}
              <div className="mb-2 w-full">
                <img
                  src={card.image}
                  alt={card.name}
                  className="max-h-[200px] w-full rounded-lg object-contain"
                />
              </div>
              {/* Flex row for card name and description */}
              <div className="flex items-center justify-center space-x-2">
                <h3 className="text-xl font-semibold">{card.name}</h3>
                <p className="text-secondaryText">{card.number}/{collectionCards.length}</p>
              </div>
            </div>
          </Tile>
        ))}
      </div>
    );
};
export default CardList;
