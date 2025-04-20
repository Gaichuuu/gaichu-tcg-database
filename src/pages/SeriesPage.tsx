// src/pages/SeriesPage.tsx
import React from "react";
import { useParams } from "react-router-dom";
import SetsList from "../components/ListComponens/SetListConponent";

const SeriesPage: React.FC = () => {
  const { seriesShortName } = useParams();

  return (
    <div className="container mx-auto p-2">
      <h2 className="mb-2 text-xl">{seriesShortName} sets</h2>
      <SetsList />
    </div>
  );
};

export default SeriesPage;
