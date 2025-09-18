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
const norm = (s: string) => (s ?? "").trim().toLowerCase();

export async function fetchLatestNews(limit = 3): Promise<NewsPost[]> {
  const qref = query(
    collection(db, "news"),
    orderBy("createdAt", "desc"),
    ql(limit),
  );
  const snap = await getDocs(qref);
  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as any),
  })) as NewsPost[];
}

export async function fetchNewsPage(opts: {
  limit: number;
  cursor?: any; // Firestore QueryDocumentSnapshot | undefined
  q: string;
}): Promise<NewsPage> {
  const qstr = norm(opts.q);
  const parts: any[] = [];
  if (qstr) parts.push(where("searchPrefixes", "array-contains", qstr));
  parts.push(orderBy("createdAt", "desc"));
  if (opts.cursor) parts.push(startAfter(opts.cursor));
  parts.push(ql(opts.limit));

  const qref = query(collection(db, "news"), ...parts);
  const snap = await getDocs(qref);

  return {
    items: snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as any),
    })) as NewsPost[],
    nextCursor: snap.docs.at(-1),
  };
}

export async function fetchNewsBySlug(slug: string): Promise<NewsPost | null> {
  if (!slug) return null;
  const ref = doc(db, "news", slug); // doc id == slug
  const snap = await getDoc(ref);
  return snap.exists()
    ? ({ id: snap.id, ...(snap.data() as any) } as NewsPost)
    : null;
}
