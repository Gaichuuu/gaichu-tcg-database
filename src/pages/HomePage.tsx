import React from "react";
import { Link } from "react-router-dom";
import { useLatestNews } from "@/hooks/useNews";
import { NewsCard, NewsCardSkeleton } from "@/components/news/NewsCard";
import CardMarquee from "@/components/home/CardMarquee";
import SeriesTiles from "@/components/home/SeriesTiles";
import FriendsSection from "@/components/home/FriendsSection";
import { SectionHeading, buttonClasses } from "@/components/ui";
import type { NewsPost } from "@/types/news";

const HomePage: React.FC = () => {
  const { data: latest, isLoading, error } = useLatestNews(3);

  return (
    <div className="flex flex-col gap-10">
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

      <section className="pt-5.5 text-center">
        <p className="text-primaryText font-display mx-auto text-[15px] text-balance sm:text-[17px] sm:whitespace-nowrap">
          Your <span className="text-accentAmber">No.2</span> source for
          parody&nbsp;&amp; bootleg card games.
        </p>
      </section>

      <section className="-mt-8">
        <CardMarquee />
      </section>

      <section className="flex flex-col gap-4">
        <SectionHeading
          label="Series"
          action={
            <Link to="/cards" className={buttonClasses()}>
              See all…
            </Link>
          }
        >
          シリーズ
        </SectionHeading>
        <SeriesTiles />
      </section>

      <section className="flex flex-col gap-4">
        <SectionHeading
          label="News"
          action={
            <Link to="/news" className={buttonClasses()}>
              See all…
            </Link>
          }
        >
          ニュース
        </SectionHeading>
        <div className="grid gap-5 md:grid-cols-3">
          {error ? (
            <div className="text-errorText col-span-3 py-4 text-center">
              Failed to load news.
            </div>
          ) : isLoading && !latest ? (
            <>
              {Array.from({ length: 3 }).map((_, i) => (
                <NewsCardSkeleton key={i} />
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

      <section className="flex flex-col gap-4">
        <SectionHeading label="Trusted links">リンク</SectionHeading>
        <FriendsSection />
      </section>
    </div>
  );
};

export default HomePage;
