// src/components/Header.tsx
import React from "react";
import { Link } from "react-router-dom";

const Header: React.FC = () => {
  return (
    <header className="bg-navBg border-secondaryBorder/40 border-b-2 shadow-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1">
        <Link to="/" className="flex items-center space-x-2">
          <img
            src="https://gaichu.b-cdn.net/assets/logo.gif"
            alt="Logo"
            className="h-8 w-9"
          />
          <span className="text-lg tracking-wider">Gaichu</span>
        </Link>

        <nav>
          <Link to="/cards" className="tracking-wider">
            Cards
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
