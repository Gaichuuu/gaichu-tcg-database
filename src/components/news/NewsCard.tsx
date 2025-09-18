// src/components/news/NewsCard.tsx
import { Link } from "react-router-dom";
import type { NewsPost } from "../../types/news";

export function NewsCard({ post }: { post: NewsPost }) {
  return (
    <article className="group flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 transition hover:border-zinc-700">
      {post.heroUrl && (
        <Link
          to={`/news/${post.slug}`}
          className="block overflow-hidden rounded-xl"
        >
          <img
            src={post.heroUrl}
            alt={post.title}
            loading="lazy"
            className="aspect-[16/9] w-full object-cover transition group-hover:scale-[1.01]"
          />
        </Link>
      )}
      <div className="flex-1">
        <Link to={`/news/${post.slug}`} className="no-underline">
          <h3 className="text-lg font-semibold tracking-wide text-zinc-100">
            {post.title}
          </h3>
        </Link>
        {post.subtitle && <p className="mt-1 text-zinc-400">{post.subtitle}</p>}
        <p className="mt-2 line-clamp-3 text-zinc-400">{post.excerpt}</p>
      </div>
      <div className="flex items-center justify-between text-xs text-zinc-500">
        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
        {post.tags && (
          <div className="flex flex-wrap gap-1">
            {post.tags.slice(0, 3).map((t) => (
              <span
                key={t}
                className="rounded bg-zinc-800 px-2 py-0.5 text-zinc-300"
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
