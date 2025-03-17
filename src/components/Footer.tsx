// src/components/Footer.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaGithub, FaYoutube, FaInstagram, FaDiscord } from 'react-icons/fa';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-gray-400 py-4">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} Gaichu
        </p>
        <div className="flex items-center space-x-4 mt-2 md:mt-0">
          {/* About link */}
          <Link to="/about" className="hover:text-gray-300 transition-colors">
            About
          </Link>
          {/* Social media icon links */}
          <a
            href="https://github.com/CamelJR/gaichu"
            target="_blank"
            className="hover:text-gray-300 transition-colors"
          >
            <FaGithub size={20} />
          </a>
          <a
            href="https://www.youtube.com/@gaichuuu"
            target="_blank"
            className="hover:text-gray-300 transition-colors"
          >
            <FaYoutube size={20} />
          </a>
          <a
            href="https://www.instagram.com/gaichuuuu/"
            target="_blank"
            className="hover:text-gray-300 transition-colors"
          >
            <FaInstagram size={20} />
          </a>
          <a
            href="https://discord.gg/gTW9brGkQw"
            target="_blank"
            className="hover:text-gray-300 transition-colors"
          >
            <FaDiscord size={20} />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
