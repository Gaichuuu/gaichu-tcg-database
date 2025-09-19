// src/components/Breadcrumbs.tsx
import { getBreadcrumbItems } from "../utils/RoutePathBuildUtils";
import React from "react";
import { FaBug } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";

const Breadcrumbs: React.FC = () => {
  const location = useLocation();

  if (location.pathname === "/") {
    return null;
  }

  const breadcrumbItems = getBreadcrumbItems(location.pathname, {
    strict: false,
  });

  return (
    <nav className="my-2 text-sm">
      <ol className="list-reset flex items-center">
        <li>
          <Link to="/">
            <FaBug size={16} className="mb-1 inline-block" />
          </Link>
        </li>
        {breadcrumbItems.map((item, idx) => (
          <React.Fragment key={item.routeTo ?? `${idx}-${item.label}`}>
            <span className="mx-2">/</span>
            <li>
              {item.routeTo ? (
                <Link to={item.routeTo}>{item.label}</Link>
              ) : (
                <span>{item.label}</span>
              )}
            </li>
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
