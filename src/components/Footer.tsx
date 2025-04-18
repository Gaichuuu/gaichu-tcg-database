// src/components/Footer.tsx
import React from "react";
import { Link } from "react-router-dom";
import { FaGithub, FaYoutube, FaInstagram, FaDiscord } from "react-icons/fa";

const Footer: React.FC = () => {
  return (
    <footer className="bg-navBg border-secondaryBorder text-secondaryText border-t py-4">
      <div className="container mx-auto flex flex-col items-center justify-between px-4 md:flex-row">
        <p className="text-sm">&copy; {new Date().getFullYear()} Gaichu</p>
        <div className="mt-2 flex items-center space-x-4 md:mt-0">
          <Link to="/about">About</Link>

          <a href="https://github.com/CamelJR/gaichu" target="_blank">
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
