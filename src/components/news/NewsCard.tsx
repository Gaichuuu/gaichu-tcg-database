import { useNavigate } from "react-router-dom";
import type { NewsPost } from "@/types/news";
import Scale from "@/components/news/Scale";

export function NewsCard({ post }: { post: NewsPost }) {
  const navigate = useNavigate();

  const dateMs =
    typeof post.created_at === "number" ? post.created_at : Date.now();

  const go = () => navigate(`/news/${post.slug}`);

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
      className="group border-secondaryBorder bg-mainBg hover:border-hoverBorder focus-visible:ring-primaryBorder flex h-full cursor-pointer flex-col rounded-2xl border p-4 transition focus:outline-none focus-visible:ring-2"
    >
      {post.hero_url && (
        <div className="relative overflow-hidden rounded-xl">
          {typeof post.score === "number" && (
            <Scale
              score={post.score}
              className="bg-mainBg text-primaryText pointer-events-none absolute bottom-2 left-2 z-8 rounded px-2 py-0.5 text-[11px] leading-none font-medium"
            />
          )}
          <img
            src={post.hero_url}
            alt=""
            loading="lazy"
            className="block aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-[1.05]"
          />
        </div>
      )}

      <div className="mt-2 mb-4 flex-1">
        <h4 className="text-primaryText line-clamp-2 font-bold">
          {post.title}
        </h4>
        {post.excerpt && (
          <p className="text-secondaryText mt-2 line-clamp-3">{post.excerpt}</p>
        )}
      </div>

      <div className="text-secondaryText mt-auto flex items-center justify-between text-xs">
        <span>{new Date(dateMs).toLocaleDateString()}</span>
        {!!post.tags?.length && (
          <div className="flex flex-wrap gap-1">
            {post.tags.slice(0, 3).map((t) => (
              <span
                key={t}
                className="bg-navBg text-primaryText rounded px-2 py-0.5"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
