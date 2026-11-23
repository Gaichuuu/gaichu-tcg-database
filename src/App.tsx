import React, { Suspense, lazy } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Layout from "./components/Layout";
import ScrollToTop from "./components/ScrollToTop";
import RouteTransitionCommit from "./components/RouteTransitionCommit";
import CardBackRedirect from "./components/CardBackRedirect";
import { PageLoading, PageNotFound } from "./components/PageStates";

const AboutPage = lazy(() => import("./pages/AboutPage"));
const CardDetailPage = lazy(() => import("./pages/CardDetailPage"));
const HomePage = lazy(() => import("./pages/HomePage"));
const PackArtPage = lazy(() => import("./pages/PackArtPage"));
const SeriesBrowsePage = lazy(() => import("./pages/SeriesBrowsePage"));
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
      <ScrollToTop />
      <RouteTransitionCommit />
      <LocaleProvider>
        <div className="bg-mainBg bg-scanlines flex min-h-screen w-screen flex-col">
          <Header />
          <main className="grow">
            <Layout>
              <ErrorBoundary>
                <Suspense fallback={<PageLoading />}>
                  <Routes>
                    <Route path={HomePagePath} element={<HomePage />} />
                    <Route path={SeriesListPath} element={<TcgSeriesPage />} />
                    <Route path={SetListPath} element={<SeriesBrowsePage />} />
                    <Route path={CardListPath} element={<SeriesBrowsePage />} />
                    <Route path={CardDetailPath} element={<CardDetailPage />} />
                    <Route path={AboutPagePath} element={<AboutPage />} />
                    <Route path={PackArtPath} element={<PackArtPage />} />
                    <Route path={CardBackPath} element={<CardBackRedirect />} />
                    <Route path="news" element={<NewsIndex />} />
                    <Route path="news/:slug" element={<NewsPostPage />} />
                    <Route path="*" element={<PageNotFound />} />
                  </Routes>
                </Suspense>
              </ErrorBoundary>
            </Layout>
          </main>
          <Footer />
        </div>
      </LocaleProvider>
    </BrowserRouter>
  );
};

export default App;
