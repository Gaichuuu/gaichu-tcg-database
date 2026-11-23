import React from "react";
import { Link } from "react-router-dom";
import { buttonClasses } from "@/components/ui";
import packageJson from "../../package.json";

const SOCIAL_LINKS = [
  { label: "GitHub", href: "https://github.com/Gaichuuu/gaichu-tcg-database" },
  { label: "YouTube", href: "https://www.youtube.com/@gaichuuu" },
  { label: "Instagram", href: "https://www.instagram.com/gaichuuuu/" },
  { label: "Discord", href: "https://discord.gg/gTW9brGkQw" },
];

const Footer: React.FC = () => {
  return (
    <footer className="bg-navBg/90 border-tileBorder relative z-2 border-t-2">
      <div className="container mx-auto flex flex-wrap items-center justify-between gap-4 px-4 py-3.5 sm:px-8">
        <div className="text-secondaryText text-xs">
          &copy; {new Date().getFullYear()}{" "}
          <b className="text-primaryText font-semibold">GAICHU</b>{" "}
          <span className="text-accentGreen">v{packageJson.version}</span>
        </div>
        <nav className="flex flex-wrap items-center gap-2">
          <Link to="/about" className={buttonClasses()}>
            About
          </Link>
          {SOCIAL_LINKS.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClasses()}
            >
              {s.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
