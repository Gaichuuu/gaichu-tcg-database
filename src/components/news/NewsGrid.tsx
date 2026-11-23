import { useEffect, useRef } from "react";
import { PageError } from "@/components/PageStates";
import { useInfiniteNews } from "@/hooks/useNews";
import { NewsCard, NewsCardSkeleton } from "./NewsCard";

export function NewsGrid({
  q,
  onCount,
}: {
  q: string;
  onCount?: (count: number) => void;
}) {
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

  const posts = data?.pages.flatMap((p) => p.items) ?? [];

  useEffect(() => {
    if (status === "success") onCount?.(posts.length);
  }, [status, posts.length, onCount]);

  if (status === "pending") {
    return (
      <div
        role="status"
        aria-busy="true"
        className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        <span className="sr-only">Loading news…</span>
        {Array.from({ length: 6 }).map((_, i) => (
          <NewsCardSkeleton key={i} />
        ))}
      </div>
    );
  }
  if (status === "error") return <PageError message="Failed to load news." />;

  if (posts.length === 0) {
    return (
      <div className="text-secondaryText py-12 text-center">
        {q ? `No news found for “${q}”.` : "No news available."}
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((p) => (
          <NewsCard key={p.id} post={p} headingLevel={2} />
        ))}
      </div>
      <div
        ref={sentinel}
        className="font-display flex h-20 items-center justify-center text-[13px]"
      >
        {isFetchingNextPage ? (
          <span className="text-secondaryText">Loading more…</span>
        ) : hasNextPage ? null : (
          <span className="text-mutedLabel">You’ve reached the end.</span>
        )}
      </div>
    </>
  );
}
