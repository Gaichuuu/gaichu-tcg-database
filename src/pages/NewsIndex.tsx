// src/pages/NewsIndex.tsx
import { NewsSearch, useQueryParam } from "../components/news/NewsSearch";
import { NewsGrid } from "../components/news/NewsGrid";

export default function NewsIndex() {
  const [q] = useQueryParam("q", "");
  return (
    <>
      <title>News — Gaichu</title>

      <header className="mx-auto max-w-6xl px-4 pt-10 pb-6">
        <h1 className="text-3xl font-semibold">News</h1>
        <p className="mt-1 text-zinc-400">
          Releases, site updates, and spicy takes.
        </p>
      </header>

      <NewsSearch />
      <NewsGrid q={q} />
    </>
  );
}
