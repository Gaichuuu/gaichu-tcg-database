// src/components/Header.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-gray-800 text-white shadow">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
        {/* Left side: Logo & Title as a single link to home */}
        <Link to="/" className="flex items-center space-x-2">
          {/* Replace '/logo.svg' with your actual logo path */}
          <img
            src="/logo.svg"
            alt="Site_LogoGaichu"
            className="h-8 w-8"
          />
          <span className="font-bold text-xl">Gaichu</span>
        </Link>

        {/* Right side: Navigation Link */}
        <nav>
          <Link
            to="/cards"
            className="hover:text-gray-300 transition-colors"
          >
            Cards
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
