// src/pages/NewsIndex.tsx
import { NewsSearch, useQueryParam } from "../components/news/NewsSearch";
import { NewsGrid } from "../components/news/NewsGrid";

export default function NewsIndex() {
  const [q] = useQueryParam("q", "");
  return (
    <>
      <NewsSearch />
      <NewsGrid q={q} />
    </>
  );
}
