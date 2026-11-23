import type { NewsPost } from "@/types/news";
import { textHaystack, toTokens } from "@/api/news";

interface RawNewsPost extends Omit<NewsPost, "id" | "created_at"> {
  id?: string;
  created_at?: string | number;
}

const toMillis = (v: string | number | undefined): number => {
  if (typeof v === "number") return v;
  const t = Date.parse(v ?? "");
  return Number.isFinite(t) ? t : Date.now();
};

let cache: Promise<NewsPost[]> | null = null;

export function loadLocalNews(): Promise<NewsPost[]> {
  cache ??= import("../../data/news/index.json").then(({ default: raw }) =>
    (raw as RawNewsPost[])
      .map((p) => ({
        ...p,
        id: p.slug,
        created_at: toMillis(p.created_at),
      }))
      .sort((a, b) => b.created_at - a.created_at),
  );
  return cache;
}

export async function searchLocalNews(q: string): Promise<NewsPost[]> {
  const posts = await loadLocalNews();
  const tokens = toTokens(q);
  if (tokens.length === 0) return posts;
  return posts.filter((p) => tokens.every((t) => textHaystack(p).includes(t)));
}
