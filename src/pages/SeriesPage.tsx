// src/pages/SeriesPage.tsx
import React from "react";
import { useParams } from "react-router-dom";
import SetsList from '../components/SetListConponent';

const SeriesPage: React.FC = () => {
  const { seriesShortName } = useParams();

  return (
    <div className="container mx-auto p-4">
      <h2 className="mb-6 text-2xl font-bold">{seriesShortName} sets</h2>
      <SetsList />
    </div>
  );
};

export default SeriesPage;
