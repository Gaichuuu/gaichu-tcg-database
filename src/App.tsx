// src/App.tsx
import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Layout from "./components/Layout";
import AboutPage from "./pages/AboutPage";
import CardDetailPage from "./pages/CardDetailPage";
import HomePage from "./pages/HomePage";
import SeriesPage from "./pages/SeriesPage";
import SetPage from "./pages/SetPage";
import TcgSeriesPage from "./pages/TcgSeriesPage";
import { CardDetailPath } from "./utils/RoutePathBuildUtils";

export interface CollectionParams extends Record<string, string | undefined> {
  seriesShortName?: string;
  setShortName?: string;
  cardName?: string;
  variant?: string;
}

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="bg-mainBg flex min-h-screen w-screen flex-col">
        <Header />

        <main className="flex-grow">
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/cards" element={<TcgSeriesPage />} />
              <Route path="/cards/:seriesShortName" element={<SeriesPage />} />
              <Route
                path="/cards/:seriesShortName/sets/:setShortName"
                element={<SetPage />}
              />
              <Route path={CardDetailPath} element={<CardDetailPage />} />
              <Route path="/about" element={<AboutPage />} />
            </Routes>
          </Layout>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;
