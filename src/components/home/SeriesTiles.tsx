import React from "react";
import { useNavigate } from "react-router-dom";
import { useSeries } from "@/hooks/useCollection";
import { getSetListPath } from "@/utils/RoutePathBuildUtils";
import Tile from "@/components/TileComponents/Tile";

const SeriesTiles: React.FC = () => {
  const { data: allSeries, isLoading, error } = useSeries();
  const navigate = useNavigate();

  if (error) {
    return (
      <div className="text-errorText py-4 text-center">
        Failed to load series.
      </div>
    );
  }

  if (isLoading && !allSeries) {
    return (
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="bg-tileBg border-primaryBorder flex animate-pulse items-center justify-center rounded-lg border p-4 shadow-lg"
          >
            <div className="bg-secondaryBorder h-10 w-full rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!allSeries?.length) {
    return (
      <div className="text-secondaryText py-4 text-center">
        No series available.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
      {allSeries.map((collection) => (
        <Tile
          key={collection.series.id}
          onClick={() => navigate(getSetListPath(collection.series.short_name))}
        >
          <img
            src={collection.series.logo}
            alt={collection.series.name}
            className="max-h-10 w-full object-contain transition-transform duration-200 group-hover:scale-105"
          />
        </Tile>
      ))}
    </div>
  );
};

export default SeriesTiles;
