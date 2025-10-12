// src/routes.tsx
import { createBrowserRouter } from "react-router-dom";
import Home from "./pages/HomePage";
import NewsIndex from "./pages/NewsIndex";
import NewsPostPage from "./pages/NewsPostPage";

export const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/news", element: <NewsIndex /> },
  { path: "/news/:slug", element: <NewsPostPage /> },
]);
