// src/components/Breadcrumbs.tsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FaBug } from "react-icons/fa";

interface BreadcrumbItem {
  label: string;
  originalIndex: number;
}

const Breadcrumbs: React.FC = () => {
  const location = useLocation();

  if (location.pathname === "/") {
    return null;
  }

  const originalSegments = location.pathname.split("/").filter(Boolean);

  const breadcrumbItems: BreadcrumbItem[] = originalSegments
    .map((segment, index) => {
      if (segment === "sets" || segment === "card") {
        return null;
      }
      const label = decodeURIComponent(segment);
      return { label, originalIndex: index };
    })
    .filter((item): item is BreadcrumbItem => item !== null);

  return (
    <nav className="my-2 text-sm">
      <ol className="list-reset flex items-center">
        <li>
          <Link to="/">
            <FaBug size={16} className="mb-1 inline-block" />
          </Link>
        </li>
        {breadcrumbItems.map((item, idx) => {
          const isLast = idx === breadcrumbItems.length - 1;

          const routeTo =
            "/" + originalSegments.slice(0, item.originalIndex + 1).join("/");
          return (
            <React.Fragment key={routeTo}>
              <span className="mx-2">/</span>
              <li>
                {isLast ? (
                  <span>{item.label}</span>
                ) : (
                  <Link to={routeTo}>{item.label}</Link>
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
