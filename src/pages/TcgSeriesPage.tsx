// src/pages/TcgSeriesPage.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import Tile from "../components/Tile";

interface SeriesData {
  id: string;
  name: string;
  logo: string;
  description: string;
}

const seriesData: SeriesData[] = [
  {
    id: "wm",
    name: "WrennyMoo",
    logo: "/images/wm-logo.png",
    description: "2 releases",
  },
  {
    id: "brainwash",
    name: "Brainwash TCG",
    logo: "/images/temp-logo.png",
    description: "1 release",
  },
  // add more series as needed
];

const TcgSeriesPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-4">
      <h2 className="mb-6 text-2xl font-bold">Series</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {seriesData.map((series) => (
          <Tile key={series.id} onClick={() => navigate(`/cards/${series.id}`)}>
            <div className="flex h-full flex-col items-center justify-center">
              <img
                src={series.logo}
                alt={series.name}
                className="mb-4 max-h-20 object-contain"
              />
              <h3 className="text-lg font-semibold">{series.name}</h3>
              <p className="text-secondaryText text-center">
                {series.description}
              </p>
            </div>
          </Tile>
        ))}
      </div>
    </div>
  );
};

export default TcgSeriesPage;
