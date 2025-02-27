// src/components/Footer.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-gray-400 py-4">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} Your Company. All rights reserved.
        </p>
        <div className="flex space-x-4 mt-2 md:mt-0">
          <Link to="/privacy" className="hover:text-white text-sm">
            Privacy Policy
          </Link>
          <Link to="/terms" className="hover:text-white text-sm">
            Terms of Service
          </Link>
          <Link to="/contact" className="hover:text-white text-sm">
            Contact Us
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
