// src/pages/TcgSeriesPage.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import SeriesList from "../components/ListComponens/SeriesListComponent";
import { getSeries } from "../hooks/useCollection";
import { getSetListPath } from "../utils/RoutePathBuildUtils";

const TcgSeriesPage: React.FC = () => {
  const result = getSeries();
  if (result.error) return <p>Something went wrong...</p>;
  const navigate = useNavigate();
  return (
    <div className="container mx-auto p-2">
      <h2 className="mb-2 text-xl">Series</h2>
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
