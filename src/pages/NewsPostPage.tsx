// src/pages/NewsPostPage.tsx
import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { useNewsBySlug } from "@/hooks/useNews";
import Scale from "@/components/news/Scale";

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
      <p className="text-secondaryText mt-1">
        {new Date(post.created_at).toLocaleDateString()}
        {" • "}
        {post.author}
      </p>

      {post.hero_url && (
        <div className="relative mt-4 w-full overflow-hidden rounded-xl">
          <img
            src={post.hero_url}
            alt=""
            className="block aspect-[16/9] w-full object-cover"
          />

          {typeof post.score === "number" && (
            <Scale
              score={Math.max(1, Math.min(10, Math.round(post.score)))}
              className="bg-navBg text-primaryText pointer-events-none absolute bottom-2 left-2 z-10 rounded px-2 py-0.5 text-[11px] leading-none font-medium"
            />
          )}
        </div>
      )}

      {post.body_html ? (
        <div
          className="text-primaryText mt-4 max-w-none space-y-4 leading-relaxed [&_dd]:ml-8 [&_dt]:ml-8"
          dangerouslySetInnerHTML={{ __html: post.body_html }}
        />
      ) : (
        <p className="text-secondaryText mt-6">No content yet.</p>
      )}
    </article>
  );
}
