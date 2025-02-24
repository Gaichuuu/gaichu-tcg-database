// src/components/BackgroundContainer.tsx
import React from 'react';

interface BackgroundContainerProps {
  children: React.ReactNode;
}

const BackgroundContainer: React.FC<BackgroundContainerProps> = ({ children }) => {
  return (
    <div className="min-h-screen w-full bg-gray-900 text-white">
      {children}
    </div>
  );
};

export default BackgroundContainer;
