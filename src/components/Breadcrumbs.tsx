// src/components/Breadcrumbs.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Breadcrumbs: React.FC = () => {
  const location = useLocation();

  // If the current path is the home page, don't render breadcrumbs.
  if (location.pathname === "/") {
    return null;
  }

  // Split the pathname, filtering out any empty segments
  const pathnames = location.pathname.split('/').filter(Boolean);
  // e.g., "/cards/magic/sets/set1" => ["cards", "magic", "sets", "set1"]

  return (
    <nav className="text-sm my-2">
      <ol className="list-reset flex items-center">
        {/* Home link */}
        <li>
          <Link to="/" className="hover:underline">
            Home
          </Link>
        </li>

        {pathnames.map((segment, index) => {
          // Build a route to this segment
          const routeTo = '/' + pathnames.slice(0, index + 1).join('/');
          // Check if this segment is the last one
          const isLast = index === pathnames.length - 1;

          return (
            <React.Fragment key={routeTo}>
              {/* Separator */}
              <span className="mx-2 text-gray-400">/</span>

              <li>
                {isLast ? (
                  // Last segment: render as plain text
                  <span className="text-gray-300">{segment}</span>
                ) : (
                  // Not last: render as a clickable link
                  <Link to={routeTo} className="hover:underline">
                    {segment}
                  </Link>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
