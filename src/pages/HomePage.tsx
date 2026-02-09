import React from "react";
import { Link } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";
import { useLatestNews } from "@/hooks/useNews";
import { NewsCard } from "@/components/news/NewsCard";
import CardMarquee from "@/components/home/CardMarquee";
import SeriesTiles from "@/components/home/SeriesTiles";
import FriendsSection from "@/components/home/FriendsSection";
import type { NewsPost } from "@/types/news";

const HomePage: React.FC = () => {
  const { data: latest, isLoading, error } = useLatestNews(3);

  return (
    <div className="space-y-10">
      <title>Gaichu TCG Database</title>
      <meta
        name="description"
        content="Your #2 source for parody and bootleg card games. Browse cards from WrennyMoo, OpenZoo, MetaZoo, and more."
      />
      <meta property="og:title" content="Gaichu TCG Database" />
      <meta
        property="og:description"
        content="Your #2 source for parody and bootleg card games."
      />

      <section>
        <p className="text-secondaryText mt-2 mb-4 text-center text-sm">
          Your #2 source for parody and bootleg card games.
        </p>
        <CardMarquee />
      </section>

      <section>
        <div className="mb-2 flex items-baseline justify-between">
          <h3>Browse by Series</h3>
          <Link
            to="/cards"
            className="text-interactiveText inline-flex items-center gap-0.5 text-sm"
          >
            See all
            <FiChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <SeriesTiles />
      </section>

      <section>
        <div className="mb-2 flex items-baseline justify-between">
          <h3>Latest News</h3>
          <Link
            to="/news"
            className="text-interactiveText inline-flex items-center gap-0.5 text-sm"
          >
            See all
            <FiChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {error ? (
            <div className="text-errorText col-span-3 py-4 text-center">
              Failed to load news.
            </div>
          ) : isLoading && !latest ? (
            <>
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="border-secondaryBorder bg-mainBg flex animate-pulse flex-col rounded-2xl border p-4"
                >
                  <div className="bg-secondaryBorder aspect-video w-full rounded-xl" />
                  <div className="mt-3 flex-1 space-y-2">
                    <div className="bg-secondaryBorder h-5 w-3/4 rounded" />
                    <div className="bg-secondaryBorder h-4 w-full rounded" />
                    <div className="bg-secondaryBorder h-4 w-2/3 rounded" />
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="bg-secondaryBorder h-3 w-20 rounded" />
                    <div className="bg-secondaryBorder h-4 w-12 rounded" />
                  </div>
                </div>
              ))}
            </>
          ) : latest?.length === 0 ? (
            <div className="text-secondaryText col-span-3 py-4 text-center">
              No news available.
            </div>
          ) : (
            latest?.map((p: NewsPost) => <NewsCard key={p.id} post={p} />)
          )}
        </div>
      </section>

      <section>
        <div className="mb-2">
          <h3>Trusted Links</h3>
        </div>
        <FriendsSection />
      </section>
    </div>
  );
};

export default HomePage;
