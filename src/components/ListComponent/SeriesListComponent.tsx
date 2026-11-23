import React from "react";
import { Link } from "react-router-dom";
import { SeriesAndSet } from "@/types/MergedCollection";
import { getSetListPath } from "@/utils/RoutePathBuildUtils";
import { cdnResized, CDN_WIDTH } from "@/utils/cdnImage";

interface SeriesListProps {
  series: SeriesAndSet[];
}

export const SERIES_GRID_CLASSES =
  "grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";

const textShadow = "[text-shadow:1px_1px_0_rgba(0,0,0,0.5)]";

const SeriesList: React.FC<SeriesListProps> = ({ series }) => {
  if (!series?.length) {
    return (
      <div className="text-secondaryText py-12 text-center">
        No series found.
      </div>
    );
  }

  return (
    <div className={SERIES_GRID_CLASSES}>
      {series.map(({ series: s, sets }) => (
        <Link
          key={s.id}
          to={getSetListPath(s.short_name)}
          className="bevel-tile bevel-tile-tall font-normal"
        >
          <img
            src={cdnResized(s.logo, CDN_WIDTH.logo)}
            loading="lazy"
            decoding="async"
            alt=""
            className="max-h-18 w-full object-contain"
          />
          <span className="flex flex-wrap items-baseline justify-center gap-x-2 text-center">
            <span
              className={`text-primaryText text-sm leading-[1.3] font-extrabold ${textShadow}`}
            >
              {s.name}
            </span>
            {s.name_ja && (
              <span
                lang="ja"
                className={`font-jp text-accentAmber text-xs ${textShadow}`}
              >
                {s.name_ja}
              </span>
            )}
          </span>
          <span className="font-display text-seriesCode -mt-1.5 text-[10px] leading-none tracking-[0.06em] uppercase">
            {sets.length} {sets.length === 1 ? "release" : "releases"}
          </span>
        </Link>
      ))}
    </div>
  );
};

export default SeriesList;
