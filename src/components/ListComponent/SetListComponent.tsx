// src/components/ListComponent/SetListComponent.tsx
import React from "react";
import Tile from "@/components/TileComponents/Tile";
import type { CollectionSet } from "@/types/CollectionSet";
import type { SetAndCard } from "@/types/MergedCollection";

type Props = {
  collectionSet: SetAndCard[];
  onClickSet: (set: CollectionSet) => void;
};

const SetListComponent: React.FC<Props> = ({ collectionSet, onClickSet }) => {
  if (!collectionSet?.length) {
    return <div className="text-errorText text-center">No sets found.</div>;
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {collectionSet.map(({ set, cards }) => (
        <Tile key={set.short_name} onClick={() => onClickSet(set)}>
          <div className="flex h-full flex-col items-center justify-center overflow-hidden">
            {set.logo ? (
              <img
                src={set.logo}
                alt={set.name}
                className="w-full object-contain transition group-hover:scale-[1.05]"
              />
            ) : (
              <div className="flex h-24 w-full items-center justify-center rounded bg-zinc-800/40">
                <span className="text-secondaryText text-sm">No logo</span>
              </div>
            )}
            <h4 className="mt-2 line-clamp-1 text-center font-bold">
              {set.name}
            </h4>
            <p className="text-secondaryText text-center">
              {cards.length.toLocaleString()}
            </p>
          </div>
        </Tile>
      ))}
    </div>
  );
};

export default SetListComponent;
