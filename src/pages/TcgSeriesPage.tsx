// src/pages/TcgSeriesPage.tsx
import React from "react";
import SeriesList from "../components/ListComponens/SeriesListComponent";

const TcgSeriesPage: React.FC = () => {
  return (
    <div className="container mx-auto p-2">
      <h2 className="mb-2 text-xl">Series</h2>
      <SeriesList />
    </div>
  );
};

export default TcgSeriesPage;
