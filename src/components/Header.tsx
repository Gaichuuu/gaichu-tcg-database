// src/components/Header.tsx
import React from "react";
import { Link } from "react-router-dom";

const Header: React.FC = () => {
  return (
    <header className="bg-navBg shadow">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2">
        {/* Left side: Logo & Title as a single link to home */}
        <Link to="/" className="flex items-center space-x-2">
          {/* Replace '/logo.svg' with your actual logo path */}
          <img src="/images/home-page3.gif" alt="Logo" className="h-8 w-9" />
          <span className="text-xl font-bold">Gaichu</span>
        </Link>

        {/* Right side: Navigation Link */}
        <nav>
          <Link to="/cards">Cards</Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
