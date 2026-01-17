// src/pages/NewsIndex.tsx
import { NewsSearch } from "@/components/news/NewsSearch";
import { useQueryParam } from "@/hooks/useQueryParam";
import { NewsGrid } from "@/components/news/NewsGrid";

export default function NewsIndex() {
  const [q] = useQueryParam("q", "");
  return (
    <>
      <NewsSearch />
      <NewsGrid q={q} />
    </>
  );
}
