import type { NewsPost } from "@/types/news";
import { database } from "@/lib/firebase";
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
  QueryConstraint,
  DocumentSnapshot,
  DocumentData,
} from "firebase/firestore/lite";

export type NewsPage = { items: NewsPost[]; nextCursor?: DocumentSnapshot };

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

const stripHtml = (s: string) => String(s || "").replace(/<[^>]+>/g, " ");
const textHaystack = (p: NewsPost) =>
  [
    p.title ?? "",
    p.excerpt ?? "",
    stripHtml(p.body_html ?? "").slice(0, 200),
    (p.tags ?? []).join(" "),
    p.author ?? "",
  ]
    .join(" ")
    .toLowerCase();

function docToNewsPost(d: DocumentSnapshot<DocumentData>): NewsPost {
  const data = d.data() as Omit<NewsPost, "id">;
  return { id: d.id, ...data };
}

export async function fetchLatestNews(limit = 3): Promise<NewsPost[]> {
  const col = collection(database, "news");
  const snap = await getDocs(
    query(col, orderBy("created_at", "desc"), ql(limit)),
  );
  return snap.docs.map(docToNewsPost);
}

export async function fetchNewsPage(opts: {
  limit: number;
  cursor?: DocumentSnapshot;
  q: string;
}): Promise<NewsPage> {
  const col = collection(database, "news");
  const tokens = toTokens(opts.q);

  const parts: QueryConstraint[] = [];
  if (tokens.length === 1) {
    parts.push(where("searchPrefixes", "array-contains", tokens[0]));
  } else if (tokens.length > 1) {
    parts.push(where("searchPrefixes", "array-contains-any", tokens));
  }
  parts.push(orderBy("created_at", "desc"));
  if (opts.cursor) parts.push(startAfter(opts.cursor));
  parts.push(ql(opts.limit));

  try {
    const snap = await getDocs(query(col, ...parts));
    let items = snap.docs.map(docToNewsPost);

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

    const fallbackFetch = Math.max(opts.limit * 5, 50);
    const snap = await getDocs(
      query(col, orderBy("created_at", "desc"), ql(fallbackFetch)),
    );
    let items = snap.docs.map(docToNewsPost);

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
  const ref = doc(database, "news", slug);
  const snap = await getDoc(ref);
  return snap.exists() ? docToNewsPost(snap) : null;
}
