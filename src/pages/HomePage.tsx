// src/pages/HomePage.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-5xl font-bold mb-4">
        Welcome to Gaichu
      </h1>
      <p className="text-lg mb-8 text-center max-w-xl">
        Explore your favorite trading card games, browse through series, and discover card details.
      </p>

      <h1 className="bg-red-500">Hello World</h1>
      <Link 
        to="/cards" 
        className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
      >
        Cards
      </Link>
    </div>
  );
};

export default HomePage;
