// src/components/Breadcrumbs.tsx
import React from "react";
import { FaBug } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import { getBreadcrumbItems } from "@/utils/RoutePathBuildUtils";
import { useNewsBySlug } from "@/hooks/useNews";

function prettifyBreadcrumbLabel(label: string): string {
  if (!label) return label;
  const deslug = /[-_]/.test(label)
    ? label.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim()
    : label;
  return deslug.toLowerCase();
}

const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const isNewsPost = /^\/news\/[^/]+$/.test(location.pathname);
  const slug = isNewsPost
    ? decodeURIComponent(location.pathname.split("/")[2] || "")
    : "";

  const { data: post } = useNewsBySlug(isNewsPost ? slug : "");

  if (location.pathname === "/") return null;

  const rawItems = getBreadcrumbItems(location.pathname, { strict: false });
  const items = rawItems.map((it) => ({
    ...it,
    label: prettifyBreadcrumbLabel(it.label),
  }));

  if (post?.title && items.length) {
    items[items.length - 1] = {
      ...items[items.length - 1],
      label: prettifyBreadcrumbLabel(post.title),
      routeTo: undefined,
    };
  }

  return (
    <nav className="mb-2 overflow-hidden text-sm">
      <ol className="list-reset flex items-center gap-2 whitespace-nowrap">
        <li className="shrink-0">
          <Link to="/">
            <FaBug size={16} className="mb-1 inline-block" />
          </Link>
        </li>

        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <React.Fragment key={item.routeTo ?? `${idx}-${item.label}`}>
              <span className="shrink-0">/</span>
              <li className={isLast ? "min-w-0 flex-1" : "shrink-0"}>
                {item.routeTo && !isLast ? (
                  <Link to={item.routeTo} className="hover:underline">
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className={isLast ? "block truncate" : ""}
                    title={item.label}
                  >
                    {item.label}
                  </span>
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
