// src/components/Layout.tsx
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    // Use w-screen or w-full + min-h-screen to cover the entire viewport
    <div className="min-h-screen w-screen bg-gray-900 text-white">
      {/* If you want to center your content, do it in a nested div */}
      {children}
    </div>
  );
};

export default Layout;
