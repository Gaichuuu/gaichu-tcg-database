// src/components/Layout.tsx
import React from "react";
import Breadcrumbs from "./Breadcrumbs";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="bg-mainBg">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs />

        {children}
      </div>
    </div>
  );
};

export default Layout;
