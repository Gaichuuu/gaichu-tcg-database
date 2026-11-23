import { useNavigate } from "react-router-dom";
import type { NewsPost } from "@/types/news";
import Scale from "@/components/news/Scale";
import { resolveHeroUrl } from "@/utils/resolveHeroUrl";
import { formatNewsDate } from "@/utils/formatNewsDate";
import { cdnResized, CDN_WIDTH } from "@/utils/cdnImage";

export function NewsCard({
  post,
  headingLevel = 3,
}: {
  post: NewsPost;
  headingLevel?: 2 | 3;
}) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const navigate = useNavigate();

  const dateMs =
    typeof post.created_at === "number" ? post.created_at : Date.now();

  const go = () => navigate(`/news/${post.slug}`);
  const heroUrl = resolveHeroUrl(post.hero_url);

  const dateLabel = formatNewsDate(dateMs);
  const tag = post.tags?.[0];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      go();
    }
  };

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={go}
      onKeyDown={handleKeyDown}
      aria-label={post.title}
      className="group tile tile-link relative flex h-full flex-col"
    >
      {heroUrl && (
        <div className="border-tileBorder relative overflow-hidden border-b-2">
          {typeof post.score === "number" && (
            <Scale
              score={post.score}
              className="bg-mainBg text-primaryText pointer-events-none absolute bottom-2 left-2 z-8 px-2 py-0.5 text-[11px] leading-none font-medium"
            />
          )}
          <img
            src={cdnResized(heroUrl, CDN_WIDTH.newsTile)}
            alt=""
            loading="lazy"
            className="block aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-[1.04] group-focus-visible:scale-[1.04]"
          />
        </div>
      )}

      <div className="flex-1 px-4 pt-3.5">
        <Heading className="text-primaryText line-clamp-2 text-[15px] leading-[1.3] font-extrabold">
          {post.title}
        </Heading>
        {post.excerpt && (
          <p className="text-secondaryText mt-1.5 line-clamp-3 text-[12.5px] leading-relaxed text-pretty">
            {post.excerpt}
          </p>
        )}
      </div>

      <div className="flex items-end justify-between gap-2.5 px-4 pt-3 pb-3.5">
        <span className="text-secondaryText font-display -mb-px block text-[11px] leading-none">
          {dateLabel}
        </span>
        {tag && <NewsTag>{tag}</NewsTag>}
      </div>
    </article>
  );
}

export function NewsTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-secondaryText border-mutedLabel inline-flex h-5 shrink-0 items-center border px-1.75 text-[10.5px] leading-none font-bold tracking-[0.025em]">
      {children}
    </span>
  );
}

export function NewsCardSkeleton() {
  return (
    <div
      className="tile flex animate-pulse flex-col overflow-hidden"
      aria-hidden
    >
      <div className="bg-secondaryBorder border-tileBorder aspect-video w-full border-b-2" />
      <div className="flex-1 space-y-2 px-4 pt-3.5">
        <div className="bg-secondaryBorder h-4 w-3/4" />
        <div className="bg-secondaryBorder h-3 w-full" />
        <div className="bg-secondaryBorder h-3 w-2/3" />
      </div>
      <div className="flex items-end justify-between px-4 pt-3 pb-3.5">
        <div className="bg-secondaryBorder h-3 w-16" />
        <div className="bg-secondaryBorder h-5 w-20" />
      </div>
    </div>
  );
}
