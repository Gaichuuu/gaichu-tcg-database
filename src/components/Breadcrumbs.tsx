// src/components/Breadcrumbs.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  originalIndex: number;
}

const Breadcrumbs: React.FC = () => {
  const location = useLocation();

  // Don't render breadcrumbs on the home page
  if (location.pathname === '/') {
    return null;
  }

  // Split the pathname into segments (ignoring empty segments)
  const originalSegments = location.pathname.split('/').filter(Boolean);
  // Build breadcrumb items: skip segments "sets" and "card"
  const breadcrumbItems: BreadcrumbItem[] = originalSegments
    .map((segment, index) => {
      if (segment === 'sets' || segment === 'card') {
        return null;
      }
      return { label: segment, originalIndex: index };
    })
    .filter((item): item is BreadcrumbItem => item !== null);

  return (
    <nav className="text-sm my-2">
      <ol className="list-reset flex items-center">
        {/* Always start with Home */}
        <li>
          <Link to="/" className="hover:underline">
            Home
          </Link>
        </li>
        {breadcrumbItems.map((item, idx) => {
          const isLast = idx === breadcrumbItems.length - 1;
          // Construct the route by joining the original segments up to the current item's originalIndex + 1
          const routeTo = '/' + originalSegments.slice(0, item.originalIndex + 1).join('/');
          return (
            <React.Fragment key={routeTo}>
              <span className="mx-2 text-gray-400">/</span>
              <li>
                {isLast ? (
                  // Last item: show plain text
                  <span className="text-gray-300">{item.label}</span>
                ) : (
                  // Not last: clickable link
                  <Link to={routeTo} className="hover:underline">
                    {item.label}
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
