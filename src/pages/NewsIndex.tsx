// src/pages/NewsIndex.tsx
import { NewsSearch } from "@/components/news/NewsSearch";
import { useQueryParam } from "@/hooks/useQueryParam";
import { NewsGrid } from "@/components/news/NewsGrid";

export default function NewsIndex() {
  const [q] = useQueryParam("q", "");
  return (
    <>
      {/* React 19 native metadata */}
      <title>News - Gaichu</title>
      <meta
        name="description"
        content="Latest news and updates about parody and bootleg card games from Gaichu."
      />
      <meta property="og:title" content="News - Gaichu" />
      <meta
        property="og:description"
        content="Latest news and updates about parody and bootleg card games from Gaichu."
      />

      <NewsSearch />
      <NewsGrid q={q} />
    </>
  );
}
