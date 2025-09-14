import { CollectionSet } from "../../types/CollectionSet";
import { SetAndCard } from "../../types/MergedCollection";
import Tile from "../TileComponents/Tile";

type SetListComponent = {
  collectionSet: SetAndCard[];
  onClickSet: (set: CollectionSet) => void;
};
const setsList: React.FC<SetListComponent> = ({
  collectionSet,
  onClickSet,
}) => {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {collectionSet.map((collection) => (
        <Tile
          key={collection.set.short_name}
          onClick={() => onClickSet(collection.set)}
        >
          <div className="flex h-full flex-col items-center justify-center">
            <img
              src={collection.set.logo}
              alt={collection.set.short_name}
              className="border-secondaryBorder mb-2 rounded border-1 object-contain"
            />
            <h3 className="text-lg">{collection.set.name}</h3>
            <p className="text-secondaryText text-center">
              {collection.cards.length}
            </p>
          </div>
        </Tile>
      ))}
    </div>
  );
};

export default setsList;
