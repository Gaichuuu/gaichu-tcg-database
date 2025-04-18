// src/components/Header.tsx
import React from "react";
import { Link } from "react-router-dom";

const Header: React.FC = () => {
  return (
    <header className="bg-navBg border-secondaryBorder border-b shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2">
        <Link to="/" className="flex items-center space-x-2">
          <img
            src="https://gaichu.b-cdn.net/assets/logo.gif"
            alt="Logo"
            className="h-8 w-9"
          />
          <span className="text-xl">Gaichu</span>
        </Link>

        <nav>
          <Link to="/cards">Cards</Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
