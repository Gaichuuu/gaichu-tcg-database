import React from "react";
import { Link } from "react-router-dom";
import CardSearch from "./CardSearch";

const Header: React.FC = () => {
  return (
    <header className="bg-navBg border-secondaryBorder/20 relative z-20 border-b">
      <div className="relative mx-auto flex h-10.25 max-w-7xl translate-y-px items-center justify-between px-4">
        <Link to="/" className="z-10 flex shrink-0 items-center space-x-2">
          <img
            src="https://gaichu.b-cdn.net/assets/logo.gif"
            alt="Logo"
            className="h-8 w-9"
          />
          <span className="text-lg tracking-wider">Gaichu</span>
        </Link>

        <CardSearch />

        <nav className="z-10 shrink-0">
          <Link to="/cards" className="tracking-wider">
            Cards
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
