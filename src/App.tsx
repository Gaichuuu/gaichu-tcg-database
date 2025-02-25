// src/App.tsx (example)
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
// import BackgroundContainer from './components/BackgroundContainer';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import TcgSeriesPage from './pages/TcgSeriesPage';
import SeriesPage from './pages/SeriesPage';
import SetPage from './pages/SetPage';
import CardDetailPage from './pages/CardDetailPage';
import Layout from './components/Layout';
// ...other imports

const App: React.FC = () => {
  return (
    <BrowserRouter>
      {/* Header can be full width on its own if needed */}
      <Header />
      
      {/* Layout wraps the page content */}
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/cards" element={<TcgSeriesPage />} />
          <Route path="/cards/:seriesId" element={<SeriesPage />} />
          <Route path="/cards/:seriesId/sets/:setId" element={<SetPage />} />
          <Route path="/cards/:seriesId/sets/:setId/card/:cardId" element={<CardDetailPage />} />
            {/* Add other routes here */}
            </Routes>
      </Layout>
    </BrowserRouter>
  );
};

export default App;
