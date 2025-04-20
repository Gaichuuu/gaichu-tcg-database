import { Params, useNavigate, useParams } from "react-router-dom";
import { getCards } from "../../hooks/getCollection";
import CardsListTile from "../TileComponents/CardsListTile";

const CardList = () => {
  const { seriesShortName, setShortName } = useParams<Params>();
  const { data: collectionCards, error } = getCards(setShortName);
  const navigate = useNavigate();

  if (error) return <p>Something went wrong...</p>;

  return (
    <div className="grid grid-cols-1 gap-0 sm:grid-cols-2 md:grid-cols-10">
      {collectionCards?.map((card) => (
        <CardsListTile
          key={card.id}
          onClick={() =>
            navigate(
              `/cards/${seriesShortName}/sets/${setShortName}/card/${card.name}`,
            )
          }
        >
          <div className="flex w-full flex-col items-center">
            <div className="mb-0 w-full">
              <img
                src={card.image}
                alt={card.name}
                className="max-h-[200px] w-full rounded-lg object-contain border-4 border-mainBg hover:border-primaryBorder "
              />
            </div>

            <div className="flex items-center justify-center space-x-2">
              <h3 className="text-sm mb-2">{card.name}</h3>
            </div>
          </div>
        </CardsListTile>
      ))}
    </div>
  );
};
export default CardList;
