import { useParams } from "react-router-dom";
import { useMemo } from "react";
import DOMPurify from "dompurify";
import { PageLoading, PageError, PageNotFound } from "@/components/PageStates";
import { useNewsBySlug } from "@/hooks/useNews";
import Scale from "@/components/news/Scale";

export default function NewsPostPage() {
  const { slug = "" } = useParams();
  const { data: post, status } = useNewsBySlug(slug);

  const sanitizedHtml = useMemo(() => {
    if (!post?.body_html) return "";

    DOMPurify.addHook("uponSanitizeElement", (node, data) => {
      if (data.tagName === "iframe" && node instanceof HTMLIFrameElement) {
        const src = node.getAttribute("src") || "";
        const allowedHosts = [
          "youtube.com",
          "www.youtube.com",
          "youtube-nocookie.com",
          "www.youtube-nocookie.com",
          "player.vimeo.com",
        ];
        try {
          const url = new URL(src);
          if (!allowedHosts.includes(url.hostname)) {
            node.parentNode?.removeChild(node);
          }
        } catch {
          node.parentNode?.removeChild(node);
        }
      }
    });

    const clean = DOMPurify.sanitize(post.body_html, {
      ADD_TAGS: ["iframe"],
      ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "scrolling"],
    });

    DOMPurify.removeHook("uponSanitizeElement");
    return clean;
  }, [post?.body_html]);

  if (status === "pending") return <PageLoading />;
  if (status === "error") return <PageError message="Failed to load post." />;
  if (!post) return <PageNotFound message={`Post not found: ${slug}`} />;

  const pageTitle = `${post.title} - Gaichu`;
  const pageDescription = post.excerpt || post.title;

  return (
    <article className="mx-auto mb-2 max-w-4xl px-4 py-2">
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:type" content="article" />
      {post.hero_url && <meta property="og:image" content={post.hero_url} />}
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      {post.hero_url && <meta name="twitter:image" content={post.hero_url} />}

      <h2>{post.title}</h2>
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
            className="block aspect-video w-full object-cover"
          />

          {typeof post.score === "number" && (
            <Scale
              score={Math.max(1, Math.min(10, Math.round(post.score)))}
              className="bg-navBg text-primaryText pointer-events-none absolute bottom-2 left-2 z-8 rounded px-2 py-0.5 text-xs leading-none"
            />
          )}
        </div>
      )}

      {sanitizedHtml ? (
        <div
          className="mt-4 max-w-none space-y-4 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        />
      ) : (
        <p className="text-errorText mt-6">No content yet.</p>
      )}
    </article>
  );
}
