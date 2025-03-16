// src/pages/HomePage.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <h1 className="text-5xl font-bold mb-4">
        Welcome
      </h1>
      <p className="text-lg mb-8 text-center max-w-xl">
        Your #2 source for bootleg and homemade card games.
      </p>
      <Link 
        to="/cards" 
        className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-gray-300 transition"
      >
        Cards
      </Link>
    </div>
  );
};

export default HomePage;
