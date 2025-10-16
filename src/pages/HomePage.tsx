// src/pages/HomePage.tsx
import React from "react";
import { useLatestNews } from "@/hooks/useNews";
import { NewsCard } from "@/components/news/NewsCard";
import { Link } from "react-router-dom";
import type { NewsPost } from "@/types/news";

const HomePage: React.FC = () => {
  const { data: latest } = useLatestNews(3);

  return (
    <div className="mt-1 flex flex-col items-center justify-center p-0">
      <p className="mb-4 text-5xl tracking-wide">Welcome</p>
      <p className="mb-4 max-w-xl text-lg">
        Your #2 source for parody and bootleg card games.
      </p>
      <Link to="/cards" className="button">
        Browse Cards
      </Link>
      <section className="mx-auto mt-8 max-w-6xl px-0">
        <div className="mb-2 flex items-baseline justify-between">
          <h3>Latest News</h3>
          {/* <Link to="/news" className="text-interactiveText">
            See all //disabled until more posts
          </Link> */}
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {latest?.map((p: NewsPost) => <NewsCard key={p.id} post={p} />)}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
