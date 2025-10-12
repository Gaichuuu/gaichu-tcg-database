// src/components/Breadcrumbs.tsx
import React from "react";
import { FaBug } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import { getBreadcrumbItems } from "@/utils/RoutePathBuildUtils";
import { useNewsBySlug } from "@/hooks/useNews";

const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  if (location.pathname === "/") return null;

  const isNewsPost = /^\/news\/[^/]+$/.test(location.pathname);
  const slug = isNewsPost
    ? decodeURIComponent(location.pathname.split("/")[2] || "")
    : "";

  const { data: post } = useNewsBySlug(isNewsPost ? slug : "");

  const items = getBreadcrumbItems(location.pathname, { strict: false });

  if (post?.title && items.length) {
    items[items.length - 1] = {
      ...items[items.length - 1],
      label: post.title,
      routeTo: undefined,
    };
  }

  return (
    <nav className="my-2 text-sm">
      <ol className="list-reset flex items-center">
        <li>
          <Link to="/">
            <FaBug size={16} className="mb-1 inline-block" />
          </Link>
        </li>
        {items.map((item, idx) => (
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
