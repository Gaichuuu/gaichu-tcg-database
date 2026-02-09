import SeriesList from "@/components/ListComponent/SeriesListComponent";
import { PageError } from "@/components/PageStates";
import { useSeries } from "@/hooks/useCollection";
import { getSetListPath } from "@/utils/RoutePathBuildUtils";
import React from "react";
import { useNavigate } from "react-router-dom";

const SeriesGridSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
    {Array.from({ length: 5 }).map((_, i) => (
      <div
        key={i}
        className="bg-tileBg border-primaryBorder flex animate-pulse items-center justify-center rounded-lg border p-4 shadow-lg"
      >
        <div className="flex w-full flex-col items-center">
          <div className="bg-secondaryBorder h-20 w-full rounded" />
          <div className="bg-secondaryBorder mt-4 h-5 w-1/2 rounded" />
          <div className="bg-secondaryBorder mt-2 h-4 w-1/3 rounded" />
        </div>
      </div>
    ))}
  </div>
);

const TcgSeriesPage: React.FC = () => {
  const { data, isLoading, error } = useSeries();
  const navigate = useNavigate();

  if (error) return <PageError message="Failed to load series." />;

  return (
    <div className="container mx-auto p-0">
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

      <h3 className="mb-2">Series</h3>
      {isLoading && !data ? (
        <SeriesGridSkeleton />
      ) : (
        <SeriesList
          series={data ?? []}
          onClickSeries={(series) => {
            navigate(getSetListPath(series.short_name));
          }}
        />
      )}
    </div>
  );
};

export default TcgSeriesPage;
