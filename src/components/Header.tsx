import React from "react";
import { Link } from "react-router-dom";
import CardSearch from "./CardSearch";

const NAV_LINKS = [
  { to: "/cards", label: "CARDS" },
  { to: "/news", label: "NEWS" },
];

const Header: React.FC = () => {
  return (
    <header className="bg-navBg/90 border-tileBorder sticky top-0 z-30 border-b-2 shadow-[0_10px_24px_rgba(0,0,0,0.5)] backdrop-blur-[2px]">
      <div className="relative container mx-auto flex h-13.5 items-center justify-between gap-4 px-4">
        <Link
          to="/"
          className="group z-10 flex shrink-0 items-center gap-2"
          aria-label="Gaichu home"
        >
          <img
            src="https://gaichu.b-cdn.net/assets/logo.gif"
            alt=""
            className="border-windowBorder h-9 w-10 border-2 [image-rendering:pixelated]"
          />
          <span
            className="font-jp text-interactiveText group-hover:text-hoverText hidden text-2xl leading-none sm:inline"
            lang="ja"
          >
            害虫
          </span>
        </Link>

        <CardSearch />

        <nav className="z-10 flex shrink-0 items-center gap-2.5">
          {NAV_LINKS.map(({ to, label }) => (
            <Link key={to} to={to} className="btn-primary btn-nav">
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;
