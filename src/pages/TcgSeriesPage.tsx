// src/pages/TcgSeriesPage.tsx
import React from "react";
import SeriesList from "../components/SeriesListComponent";

const TcgSeriesPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h2 className="mb-6 text-2xl">Series</h2>
      <SeriesList />
    </div>
  );
};

export default TcgSeriesPage;
