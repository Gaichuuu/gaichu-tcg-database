import SeriesList, {
  SERIES_GRID_CLASSES,
} from "@/components/ListComponent/SeriesListComponent";
import { PageError } from "@/components/PageStates";
import { useSeries } from "@/hooks/useCollection";
import React from "react";

const SeriesGridSkeleton: React.FC = () => (
  <div className={SERIES_GRID_CLASSES} aria-hidden>
    {Array.from({ length: 7 }).map((_, i) => (
      <div
        key={i}
        className="bevel-tile bevel-tile-static bevel-tile-tall animate-pulse"
      >
        <div className="bg-secondaryBorder h-18 w-full" />
        <div className="bg-secondaryBorder h-3.5 w-1/2" />
        <div className="bg-secondaryBorder -mt-1.5 h-2.5 w-[30%]" />
      </div>
    ))}
  </div>
);

const TcgSeriesPage: React.FC = () => {
  const { data, isLoading, error } = useSeries();

  if (error) return <PageError message="Failed to load series." />;

  return (
    <div className="flex flex-col gap-6 pb-2">
      <title>Card Series - Gaichu</title>
      <meta
        name="description"
        content="Browse all card series including WrennyMoo, OpenZoo, MetaZoo, After Skool Hobby, and more parody card games."
      />
      <meta property="og:title" content="Card Series - Gaichu" />
      <meta
        property="og:description"
        content="Browse all card series including WrennyMoo, OpenZoo, MetaZoo, and more."
      />

      <h1 className="font-jp text-accentAmber text-[30px] leading-[1.2] font-normal text-shadow-none">
        <span aria-hidden lang="ja">
          シリーズ
        </span>
        <span className="sr-only">Card series</span>
      </h1>

      {isLoading && !data ? (
        <SeriesGridSkeleton />
      ) : (
        <SeriesList series={data ?? []} />
      )}
    </div>
  );
};

export default TcgSeriesPage;
