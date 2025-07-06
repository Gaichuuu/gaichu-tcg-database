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
import {
  AboutPagePath,
  CardDetailPath,
  CardListPath,
  HomePagePath,
  SeriesListPath,
  SetListPath,
} from "./utils/RoutePathBuildUtils";
import CardBackMock from "./pages/CardBackMock";
import PackArtMock from "./pages/PackArtMock";

export interface CollectionParams extends Record<string, string | undefined> {
  seriesShortName?: string;
  setShortName?: string;
  sortByAndCardName?: string;
}

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="bg-mainBg flex min-h-screen w-screen flex-col">
        <Header />

        <main className="flex-grow">
          <Layout>
            <Routes>
              <Route path={HomePagePath} element={<HomePage />} />
              <Route path={SeriesListPath} element={<TcgSeriesPage />} />
              <Route path={SetListPath} element={<SeriesPage />} />
              <Route path={CardListPath} element={<SetPage />} />
              <Route path={CardDetailPath} element={<CardDetailPage />} />
              <Route path={AboutPagePath} element={<AboutPage />} />
              <Route path="/mock/card-back" element={<CardBackMock />} />
              <Route path="/mock/pack-art" element={<PackArtMock />} />
            </Routes>
          </Layout>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;
