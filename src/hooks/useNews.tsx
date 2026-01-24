import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  fetchLatestNews,
  fetchNewsPage,
  fetchNewsBySlug,
  type NewsPage,
} from "@/api/news";

export const useLatestNews = (count = 3) =>
  useQuery({
    queryKey: ["news", "latest", count],
    queryFn: () => fetchLatestNews(count),
    staleTime: 60_000,
  });

export const useInfiniteNews = (q: string, pageSize = 12) =>
  useInfiniteQuery<NewsPage>({
    queryKey: ["news", "infinite", q, pageSize],
    initialPageParam: undefined,
    queryFn: ({ pageParam }) =>
      fetchNewsPage({
        limit: pageSize,
        cursor: pageParam as NewsPage["nextCursor"],
        q,
      }),
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    staleTime: 60_000,
  });

export const useNewsBySlug = (slug: string) =>
  useQuery({
    queryKey: ["news", "bySlug", slug],
    queryFn: () => fetchNewsBySlug(slug),
    enabled: !!slug,
  });
