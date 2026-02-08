import React from "react";
import { useLocation } from "react-router-dom";
import Breadcrumbs from "./Breadcrumbs";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { pathname } = useLocation();
  const canonicalUrl = `https://gaichu.com${pathname}`;

  return (
    <div className="bg-mainBg">
      <link rel="canonical" href={canonicalUrl} />
      <div className="container mx-auto px-4 pt-2 pb-8">
        <Breadcrumbs />

        <main>{children}</main>
      </div>
    </div>
  );
};

export default Layout;
