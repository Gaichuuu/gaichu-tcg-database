// src/components/news/NewsGrid.tsx
import { useEffect, useRef } from "react";
import { useInfiniteNews } from "../../hooks/useNews";
import { NewsCard } from "./NewsCard";

export function NewsGrid({ q }: { q: string }) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteNews(q, 12);
  const sentinel = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hasNextPage || !sentinel.current) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) fetchNextPage();
      },
      { rootMargin: "800px" },
    );
    io.observe(sentinel.current);
    return () => io.disconnect();
  }, [hasNextPage, fetchNextPage]);

  if (status === "pending")
    return <p className="px-4 py-10 text-zinc-400">Loading…</p>;
  if (status === "error")
    return <p className="px-4 py-10 text-red-400">Couldn’t load news.</p>;

  const posts = data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <>
      <div className="mx-auto grid max-w-6xl gap-4 px-4 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((p) => (
          <NewsCard key={p.id} post={p} />
        ))}
      </div>
      <div ref={sentinel} className="flex h-24 items-center justify-center">
        {isFetchingNextPage ? (
          <span className="text-zinc-500">Loading more…</span>
        ) : hasNextPage ? null : (
          <span className="text-zinc-500">No more posts.</span>
        )}
      </div>
    </>
  );
}
