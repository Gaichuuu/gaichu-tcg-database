// src/App.tsx
import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Layout from "./components/Layout";
import AboutPage from "./pages/AboutPage";
import CardBackPage from "./pages/CardBackPage";
import CardDetailPage from "./pages/CardDetailPage";
import HomePage from "./pages/HomePage";
import PackArtPage from "./pages/PackArtPage";
import SeriesPage from "./pages/SeriesPage";
import SetPage from "./pages/SetPage";
import TcgSeriesPage from "./pages/TcgSeriesPage";
import NewsIndex from "./pages/NewsIndex";
import NewsPostPage from "./pages/NewsPostPage";
import {
  AboutPagePath,
  CardBackPath,
  CardDetailPath,
  CardListPath,
  HomePagePath,
  PackArtPath,
  SeriesListPath,
  SetListPath,
} from "./utils/RoutePathBuildUtils";

export interface CollectionParams extends Record<string, string | undefined> {
  seriesShortName?: string;
  setShortName?: string;
  sortByAndCardName?: string;
}

export interface ArtParams extends Record<string, string | undefined> {
  seriesShortName?: string;
  setShortName?: string;
  pathType?: string; // e.g., "pack-art" or "card-back"
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
              <Route path={CardBackPath} element={<CardBackPage />} />
              <Route path={PackArtPath} element={<PackArtPage />} />
              <Route path="/" element={<HomePage />} />
              <Route path="news" element={<NewsIndex />} />
              <Route path="news/:slug" element={<NewsPostPage />} />
              <Route path="*" element={<div>Not found</div>} />
            </Routes>
          </Layout>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;
