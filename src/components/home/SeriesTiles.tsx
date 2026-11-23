import React from "react";
import { useNavigate } from "react-router-dom";
import { useSeries } from "@/hooks/useCollection";
import { getSetListPath } from "@/utils/RoutePathBuildUtils";
import { cdnResized, CDN_WIDTH } from "@/utils/cdnImage";

const FEATURED_SERIES = ["ash", "sm", "mz", "oz", "wm", "tygadu"];

const MAX_FEATURED = 6;

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
      <div className="grid grid-cols-3 gap-3.5 sm:grid-cols-6">
        {Array.from({ length: MAX_FEATURED }).map((_, i) => (
          <div
            key={i}
            className="bevel-tile bevel-tile-static grid h-24 animate-pulse place-items-center p-2"
          >
            <div className="bg-secondaryBorder h-10 w-3/4" />
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

  const featured = FEATURED_SERIES.slice(0, MAX_FEATURED)
    .map((shortName) =>
      allSeries.find((c) => c.series.short_name === shortName),
    )
    .filter((c): c is NonNullable<typeof c> => c != null);

  return (
    <div className="grid grid-cols-3 gap-3.5 sm:grid-cols-6">
      {featured.map((collection) => (
        <button
          key={collection.series.id}
          type="button"
          onClick={() => navigate(getSetListPath(collection.series.short_name))}
          aria-label={collection.series.name}
          className="bevel-tile grid h-24 place-items-center p-2"
        >
          <img
            src={cdnResized(collection.series.logo, CDN_WIDTH.logo)}
            loading="lazy"
            decoding="async"
            alt=""
            className="max-h-12 w-full object-contain"
          />
          <span className="series-code" aria-hidden>
            {collection.series.short_name}
          </span>
        </button>
      ))}
    </div>
  );
};

export default SeriesTiles;
