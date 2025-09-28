// src/components/news/NewsCard.tsx
import { Link } from "react-router-dom";
import type { NewsPost } from "../../types/news";

export function NewsCard({ post }: { post: NewsPost }) {
  return (
    <article className="group border-secondaryBorder bg-mainBg hover:border-hoverBorder flex flex-col gap-3 rounded-2xl border-1 p-4 transition">
      {post.heroUrl && (
        <Link
          to={`/news/${post.slug}`}
          className="block overflow-hidden rounded-xl"
        >
          <img
            src={post.heroUrl}
            alt={post.title}
            loading="lazy"
            className="aspect-[16/9] w-full object-cover transition group-hover:scale-[1.05]"
          />
        </Link>
      )}
      <div className="flex-1">
        <Link to={`/news/${post.slug}`} className="no-underline">
          <h3 className="text-primaryText text-lg font-semibold tracking-wide">
            {post.title}
          </h3>
        </Link>
        {post.subtitle && (
          <p className="text-secondaryText mt-1">{post.subtitle}</p>
        )}
        <p className="text-secondaryText mt-2 line-clamp-3">{post.excerpt}</p>
      </div>
      <div className="text-secondaryText flex items-center justify-between text-xs">
        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
        {post.tags && (
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
