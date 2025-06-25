// src/pages/SeriesPage.tsx
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import SetsList from "../components/ListComponent/SetListConponent";
import { useSets } from "../hooks/useCollection";
import { getCardListPath } from "../utils/RoutePathBuildUtils";

const SeriesPage: React.FC = () => {
  const { seriesShortName } = useParams();
  const { data: collectionSet, error } = useSets(seriesShortName);
  const navigate = useNavigate();
  if (error) return <p>Something went wrong...</p>;
  return (
    <div className="container mx-auto p-2">
      <h2 className="mb-2 text-xl">{seriesShortName} sets</h2>
      <SetsList
        collectionSet={collectionSet ?? []}
        onClickSet={(set) => {
          // Navigate to the set page or perform any action with the set
          navigate(getCardListPath(seriesShortName ?? "", set));
        }}
      />
    </div>
  );
};

export default SeriesPage;
