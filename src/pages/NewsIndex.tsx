import { useState } from "react";
import { NewsSearch } from "@/components/news/NewsSearch";
import { useQueryParam } from "@/hooks/useQueryParam";
import { NewsGrid } from "@/components/news/NewsGrid";

export default function NewsIndex() {
  const [q] = useQueryParam("q", "");
  const [count, setCount] = useState<number | null>(null);

  return (
    <>
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

      <div className="flex flex-col gap-6">
        <h1 className="sr-only">News</h1>
        <div className="flex items-center gap-5">
          <NewsSearch count={count} />
        </div>
        <NewsGrid q={q} onCount={setCount} />
      </div>
    </>
  );
}
