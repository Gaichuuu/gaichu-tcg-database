// src/pages/TcgSeriesPage.tsx
import SeriesList from "@/components/ListComponent/SeriesListComponent";
import { PageError } from "@/components/PageStates";
import { useSeries } from "@/hooks/useCollection";
import { getSetListPath } from "@/utils/RoutePathBuildUtils";
import React from "react";
import { useNavigate } from "react-router-dom";

const TcgSeriesPage: React.FC = () => {
  const result = useSeries();
  const navigate = useNavigate();

  if (result.error) return <PageError message="Failed to load series." />;

  return (
    <div className="container mx-auto p-0">
      <h3 className="mb-2">Series</h3>
      <SeriesList
        series={result?.data ?? []}
        onClickSeries={(series) => {
          navigate(getSetListPath(series.short_name));
        }}
      />
    </div>
  );
};

export default TcgSeriesPage;
