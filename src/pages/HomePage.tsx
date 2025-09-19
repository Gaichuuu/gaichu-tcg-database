// src/pages/HomePage.tsx
import React from "react";
import { useLatestNews } from "../hooks/useNews";
import { NewsCard } from "../components/news/NewsCard";
import { Link } from "react-router-dom";
import type { NewsPost } from "../types/news";

const HomePage: React.FC = () => {
  const { data: latest } = useLatestNews(3);

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <h1 className="mb-4 text-5xl">Welcome</h1>
      <p className="mb-8 max-w-xl text-lg">
        Your #2 source for parody and homemade card games.
      </p>
      <Link to="/cards" className="button">
        Browse Cards
      </Link>
      <section className="mx-auto mt-16 max-w-6xl px-4">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-2xl font-semibold tracking-wide">Latest News</h2>
          <Link to="/news" className="text-indigo-400 hover:underline">
            See all
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {latest?.map((p: NewsPost) => <NewsCard key={p.id} post={p} />) ?? (
            <div className="text-zinc-500">No posts yet.</div>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
