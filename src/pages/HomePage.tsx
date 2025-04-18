// src/pages/HomePage.tsx
import React from "react";
import { Link } from "react-router-dom";

const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <h1 className="mb-4 text-5xl">Welcome</h1>
      <p className="mb-8 max-w-xl text-lg">
        Your #2 source for bootleg and homemade card games.
      </p>
      <Link to="/cards" className="button">
        Browse Cards
      </Link>
    </div>
  );
};

export default HomePage;
