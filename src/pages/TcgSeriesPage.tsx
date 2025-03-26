// src/pages/TcgSeriesPage.tsx
import React from "react";
import CollectionList from '../components/CollectionList';

const TcgSeriesPage: React.FC = () => {

  return (
    <div className="container mx-auto p-4">
    <h2 className="mb-6 text-2xl font-bold">Series</h2>
    <CollectionList />
    </div>
  );
};

export default TcgSeriesPage;
