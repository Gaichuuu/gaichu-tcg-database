// src/pages/SeriesPage.tsx
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import Tile from "../components/Tile";

interface Params extends Record<string, string | undefined> {
  seriesId?: string;
}

interface SetData {
  id: string;
  name: string;
  logo: string;
  description: string;
}

const setsData: SetData[] = [
  {
    id: "set1",
    name: "Set One",
    logo: "/src/assets/wmSet1.jpg",
    description: "70 cards",
  },
  {
    id: "set2",
    name: "Set Two",
    logo: "/src/assets/wmSet2.jpg",
    description: "50 cards",
  },
  // Add more sets as needed
];

const SeriesPage: React.FC = () => {
  const { seriesId } = useParams<Params>();
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-4">
      <h2 className="mb-6 text-2xl font-bold">{seriesId} sets</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {setsData.map((set) => (
          <Tile
            key={set.id}
            onClick={() => navigate(`/cards/${seriesId}/sets/${set.id}`)}
          >
            <div className="flex h-full flex-col items-center justify-center">
              <img
                src={set.logo}
                alt={set.name}
                className="mb-4 max-h-16 rounded object-contain"
              />
              <h3 className="text-lg font-semibold">{set.name}</h3>
              <p className="text-secondaryText text-center">
                {set.description}
              </p>
            </div>
          </Tile>
        ))}
      </div>
    </div>
  );
};

export default SeriesPage;
