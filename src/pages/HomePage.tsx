// src/pages/HomePage.tsx
import React from "react";

const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <h1 className="mb-4 text-5xl font-bold">Welcome</h1>
      <p className="mb-8 max-w-xl text-lg">
        Your #2 source for bootleg and homemade card games.
      </p>
    </div>
  );
};

export default HomePage;
