// src/App.tsx
import React, { Suspense, lazy } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Layout from "./components/Layout";

const AboutPage = lazy(() => import("./pages/AboutPage"));
const CardBackPage = lazy(() => import("./pages/CardBackPage"));
const CardDetailPage = lazy(() => import("./pages/CardDetailPage"));
const HomePage = lazy(() => import("./pages/HomePage"));
const PackArtPage = lazy(() => import("./pages/PackArtPage"));
const SeriesPage = lazy(() => import("./pages/SeriesPage"));
const SetPage = lazy(() => import("./pages/SetPage"));
const TcgSeriesPage = lazy(() => import("./pages/TcgSeriesPage"));
const NewsIndex = lazy(() => import("./pages/NewsIndex"));
const NewsPostPage = lazy(() => import("./pages/NewsPostPage"));
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
import { LocaleProvider } from "@/i18n";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <LocaleProvider>
        <div className="bg-mainBg flex min-h-screen w-screen flex-col">
          <Header />
          <main className="grow">
            <Layout>
              <Suspense fallback={<div className="p-4">Loading...</div>}>
                <Routes>
                  <Route path={HomePagePath} element={<HomePage />} />
                  <Route path={SeriesListPath} element={<TcgSeriesPage />} />
                  <Route path={SetListPath} element={<SeriesPage />} />
                  <Route path={CardListPath} element={<SetPage />} />
                  <Route path={CardDetailPath} element={<CardDetailPage />} />
                  <Route path={AboutPagePath} element={<AboutPage />} />
                  <Route path={CardBackPath} element={<CardBackPage />} />
                  <Route path={PackArtPath} element={<PackArtPage />} />
                  <Route path="news" element={<NewsIndex />} />
                  <Route path="news/:slug" element={<NewsPostPage />} />
                  <Route path="*" element={<div>Not found</div>} />
                </Routes>
              </Suspense>
            </Layout>
          </main>
          <Footer />
        </div>
      </LocaleProvider>
    </BrowserRouter>
  );
};

export default App;
