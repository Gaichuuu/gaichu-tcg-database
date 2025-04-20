// src/pages/SetPage.tsx
import React from "react";
import { useParams } from "react-router-dom";
import CardList from "../components/ListComponens/CardListComponent";

const SetPage: React.FC = () => {
  const { setShortName } = useParams();

  return (
    <div className="container mx-auto p-4">
      <h2 className="mb-6 text-2xl">{setShortName} cards</h2>
      <CardList />
    </div>
  );
};

export default SetPage;
