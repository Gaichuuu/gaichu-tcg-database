// src/pages/NewsPostPage.tsx
import { Link, useParams } from "react-router-dom";
import { useEffect } from "react";
import { useNewsBySlug } from "../hooks/useNews";

export default function NewsPostPage() {
  const { slug = "" } = useParams();
  const { data: post, status, error } = useNewsBySlug(slug);

  useEffect(() => {
    console.log(
      "[NewsPostPage] slug:",
      slug,
      "status:",
      status,
      "error:",
      error,
      "post:",
      post,
    );
  }, [slug, status, error, post]);

  if (status === "pending") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-zinc-400">Loading…</div>
    );
  }

  if (status === "error") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-red-400">
        Failed to load post. Check console for details.
      </div>
    );
  }

  if (!post) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-zinc-400">
        Post not found for slug: <code>{slug}</code>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <Link to="/news" className="text-indigo-400 hover:underline">
        ← All news
      </Link>

      <h1 className="mt-4 text-3xl font-semibold">{post.title}</h1>
      {post.subtitle && <p className="mt-1 text-zinc-400">{post.subtitle}</p>}
      <div className="mt-2 text-sm text-zinc-500">
        {new Date(post.createdAt).toLocaleDateString()}{" "}
        {post.author && `• ${post.author}`}
      </div>

      {post.heroUrl && (
        <img
          src={post.heroUrl}
          alt=""
          className="mt-6 w-full rounded-xl object-cover"
        />
      )}

      {post.bodyHtml ? (
        <div
          className="prose prose-invert mt-6 max-w-none"
          dangerouslySetInnerHTML={{ __html: post.bodyHtml }}
        />
      ) : (
        <p className="mt-6 text-zinc-400">No content yet.</p>
      )}
    </article>
  );
}
