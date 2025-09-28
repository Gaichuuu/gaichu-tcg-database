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
          <div className="flex h-full flex-col items-center justify-center overflow-hidden">
            <img
              src={collection.set.logo}
              alt={collection.set.short_name}
              className="w-full object-contain transition group-hover:scale-[1.05]"
            />
            <h3 className="mt-2 text-lg">{collection.set.name}</h3>
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
