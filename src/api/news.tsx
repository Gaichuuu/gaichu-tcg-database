// src/api/news.tsx
import type { NewsPost } from "../types/news";
import { db } from "../lib/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  startAfter,
  limit as ql,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";

export type NewsPage = { items: NewsPost[]; nextCursor?: any };

// ---- helpers (single copy) ----
const toTokens = (s: string) =>
  Array.from(
    new Set(
      (s || "")
        .toLowerCase()
        .split(/[^a-z0-9]+/g)
        .filter(Boolean)
        .map((t) => t.slice(0, 10)),
    ),
  ).slice(0, 10);

const textHaystack = (p: any) =>
  [
    p.title ?? "",
    p.subtitle ?? "",
    Array.isArray(p.tags) ? p.tags.join(" ") : "",
    p.author ?? "",
  ]
    .join(" ")
    .toLowerCase();

// ---- API ----
export async function fetchLatestNews(limit = 3): Promise<NewsPost[]> {
  const col = collection(db, "news");
  const snap = await getDocs(
    query(col, orderBy("createdAt", "desc"), ql(limit)),
  );
  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as any),
  })) as NewsPost[];
}

export async function fetchNewsPage(opts: {
  limit: number;
  cursor?: any; // QueryDocumentSnapshot | undefined
  q: string;
}): Promise<NewsPage> {
  const col = collection(db, "news");
  const tokens = toTokens(opts.q);

  // primary query using searchPrefixes (fast path)
  const parts: any[] = [];
  if (tokens.length === 1) {
    parts.push(where("searchPrefixes", "array-contains", tokens[0]));
  } else if (tokens.length > 1) {
    parts.push(where("searchPrefixes", "array-contains-any", tokens));
  }
  parts.push(orderBy("createdAt", "desc"));
  if (opts.cursor) parts.push(startAfter(opts.cursor));
  parts.push(ql(opts.limit));

  try {
    const snap = await getDocs(query(col, ...parts));
    let items = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as any),
    })) as NewsPost[];

    // AND-filter multi-token matches in memory
    if (tokens.length > 1) {
      items = items.filter((p) =>
        tokens.every((t) => textHaystack(p).includes(t)),
      );
    }

    return { items, nextCursor: snap.docs.at(-1) };
  } catch (err) {
    console.warn(
      "[news] primary search query failed (likely missing index):",
      err,
    );

    // fallback: grab recent N and filter in memory (no index needed)
    const fallbackFetch = Math.max(opts.limit * 5, 50);
    const snap = await getDocs(
      query(col, orderBy("createdAt", "desc"), ql(fallbackFetch)),
    );
    let items = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as any),
    })) as NewsPost[];

    if (tokens.length > 0) {
      items = items.filter((p) =>
        tokens.every((t) => textHaystack(p).includes(t)),
      );
    }

    return { items: items.slice(0, opts.limit), nextCursor: undefined };
  }
}

export async function fetchNewsBySlug(slug: string): Promise<NewsPost | null> {
  if (!slug) return null;
  const ref = doc(db, "news", slug);
  const snap = await getDoc(ref);
  return snap.exists()
    ? ({ id: snap.id, ...(snap.data() as any) } as NewsPost)
    : null;
}
