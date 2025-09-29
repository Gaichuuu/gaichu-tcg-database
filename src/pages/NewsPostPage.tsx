// src/pages/NewsPostPage.tsx
import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { useNewsBySlug } from "@/hooks/useNews";

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
      <div className="text-secondaryText mx-auto max-w-4xl px-4 py-2">
        Loading…
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="text-errorText mx-auto max-w-4xl px-4 py-2">
        Failed to load post. Check console for details.
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-secondaryText mx-auto max-w-4xl px-4 py-2">
        Post not found for slug: <code>{slug}</code>
      </div>
    );
  }

  return (
    <article className="mx-auto mb-2 max-w-4xl px-4 py-2">
      <h2 className="text-2xl tracking-wide">{post.title}</h2>
      {post.subtitle && (
        <p className="text-secondaryText mt-1">
          {new Date(post.createdAt).toLocaleDateString()}
          {" • "}
          {post.subtitle}
        </p>
      )}

      {post.heroUrl && (
        <img
          src={post.heroUrl}
          alt=""
          className="mt-4 w-full rounded-xl object-cover"
        />
      )}

      {post.bodyHtml ? (
        <div
          className="text-primaryText prose prose-invert mt-4 max-w-none"
          dangerouslySetInnerHTML={{ __html: post.bodyHtml }}
        />
      ) : (
        <p className="text-secondaryText mt-6">No content yet.</p>
      )}
    </article>
  );
}
