// src/components/Footer.tsx
import React from "react";
import { Link } from "react-router-dom";
import { FaGithub, FaYoutube, FaInstagram, FaDiscord } from "react-icons/fa";

const Footer: React.FC = () => {
  return (
    <footer className="bg-navBg border-secondaryBorder/40 text-secondaryText border-t-2 py-2.5">
      <div className="container mx-auto flex flex-col items-center justify-between px-4 md:flex-row">
        <p>
          &copy;{" "}
          <span className="text-sm">
            {new Date().getFullYear()} Gaichu v1.4.0
          </span>
        </p>
        <div className="mt-2 flex items-center space-x-5 md:mt-0">
          <Link to="/about" className="tracking-wider">
            About
          </Link>

          <a
            href="https://github.com/Gaichuuu/gaichu-tcg-database"
            target="_blank"
          >
            <FaGithub size={20} />
          </a>
          <a href="https://www.youtube.com/@gaichuuu" target="_blank">
            <FaYoutube size={20} />
          </a>
          <a href="https://www.instagram.com/gaichuuuu/" target="_blank">
            <FaInstagram size={20} />
          </a>
          <a href="https://discord.gg/gTW9brGkQw" target="_blank">
            <FaDiscord size={20} />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
