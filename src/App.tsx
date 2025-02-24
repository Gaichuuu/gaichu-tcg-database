// src/App.tsx (example)
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import BackgroundContainer from './components/BackgroundContainer';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import SeriesPage from './pages/SeriesPage';

// ...other imports

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <BackgroundContainer>
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/cards/:seriesId" element={<SeriesPage />} />
            {/* Add other routes here */}
          </Routes>
        </main>
      </BackgroundContainer>
    </BrowserRouter>
  );
};

export default App;
