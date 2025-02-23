// src/pages/HomePage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="text-5xl font-bold text-gray-900 mb-4">
        Welcome to My TCG Showcase
      </h1>
      <p className="text-lg text-gray-700 mb-8 text-center max-w-xl">
        Explore your favorite trading card games, browse through series, and discover card details.
      </p>
      <Link 
        to="/cards" 
        className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
      >
        Browse Cards
      </Link>
    </div>
  );
};

export default HomePage;
