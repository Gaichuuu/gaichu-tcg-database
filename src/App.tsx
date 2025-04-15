// src/App.tsx
import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Layout from "./components/Layout";
import AboutPage from "./pages/AboutPage";
import CardDetailPage from "./pages/CardDetailPage";
import { Cowbell } from "./pages/Cowbell.tsx";
import HomePage from "./pages/HomePage";
import SeriesPage from "./pages/SeriesPage";
import SetPage from "./pages/SetPage";
import TcgSeriesPage from "./pages/TcgSeriesPage";
// ...other imports

const App: React.FC = () => {
  return (
    <BrowserRouter>
      {/* Outer flex container: ensures the entire viewport is used */}
      <div className="bg-mainBg flex min-h-screen w-screen flex-col">
        {/* Header stays at the top */}
        <Header />

        {/* Main content grows to fill remaining space */}
        <main className="flex-grow">
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/cards" element={<TcgSeriesPage />} />
              <Route path="/cards/:seriesShortName" element={<SeriesPage />} />
              <Route
                path="/cards/:seriesShortName/sets/:setId"
                element={<SetPage />}
              />
              <Route
                path="/cards/:seriesShortName/sets/:setId/card/:cardId"
                element={<CardDetailPage />}
              />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/cowbell" element={<Cowbell />} />
              {/* Add other routes here */}
            </Routes>
          </Layout>
        </main>

        {/* Footer remains at the bottom */}
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;
