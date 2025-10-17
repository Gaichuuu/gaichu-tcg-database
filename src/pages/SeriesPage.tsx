// src/pages/SeriesPage.tsx
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import SetsList from "@/components/ListComponent/SetListComponent";
import { useSets } from "@/hooks/useCollection";
import { getCardListPath } from "@/utils/RoutePathBuildUtils";

const SeriesPage: React.FC = () => {
  const { seriesShortName = "" } = useParams<"seriesShortName">();
  const seriesKey = decodeURIComponent(seriesShortName);

  const { data: collectionSet, error } = useSets(seriesKey);
  const navigate = useNavigate();
  if (error) return <p>Something went wrong... {error.message}</p>;
  return (
    <div className="container mx-auto p-0">
      <h3 className="mb-2">{seriesKey} sets</h3>
      <SetsList
        collectionSet={collectionSet ?? []}
        onClickSet={(set) => {
          navigate(getCardListPath(seriesKey, set));
        }}
      />
    </div>
  );
};

export default SeriesPage;
