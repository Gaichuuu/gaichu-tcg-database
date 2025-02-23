// src/components/Header.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-gray-800 text-white p-4 shadow">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div>
          <Link to="/" className="text-2xl font-bold text-blue-300">
            TCG Showcase
          </Link>
        </div>
        <nav>
          <Link to="/" className="mr-6 hover:text-blue-300 transition duration-200">
            Home
          </Link>
          <Link to="/cards" className="hover:text-blue-300 transition duration-200">
            Cards
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
