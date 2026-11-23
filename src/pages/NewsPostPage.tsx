import { Link, useParams } from "react-router-dom";
import { useMemo, useState } from "react";
import DOMPurify from "dompurify";
import { PageError, PageNotFound } from "@/components/PageStates";
import { useNewsBySlug, useLatestNews } from "@/hooks/useNews";
import Scale from "@/components/news/Scale";
import { Button, SectionHeading, buttonClasses } from "@/components/ui";
import { NewsTag } from "@/components/news/NewsCard";
import { expandTokens } from "@/utils/expandTokens";
import { resolveHeroUrl } from "@/utils/resolveHeroUrl";
import { formatNewsDate } from "@/utils/formatNewsDate";
import { cdnResized, CDN_WIDTH } from "@/utils/cdnImage";

export default function NewsPostPage() {
  const { slug = "" } = useParams();
  const { data: post, status } = useNewsBySlug(slug);
  const { data: latest } = useLatestNews(4);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">(
    "idle",
  );

  const sanitizedHtml = useMemo(() => {
    if (!post?.body_html) return "";

    const expanded = expandTokens(post.body_html);

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

    DOMPurify.addHook("afterSanitizeAttributes", (node) => {
      if (node.tagName === "A") {
        node.setAttribute("target", "_blank");
        node.setAttribute("rel", "noopener noreferrer");
      }
    });

    const clean = DOMPurify.sanitize(expanded, {
      ADD_TAGS: ["iframe"],
      ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "scrolling"],
    });

    DOMPurify.removeHook("uponSanitizeElement");
    DOMPurify.removeHook("afterSanitizeAttributes");
    return clean;
  }, [post?.body_html]);

  if (status === "pending") {
    return (
      <div
        role="status"
        aria-busy="true"
        className="mx-auto flex max-w-210 animate-pulse flex-col"
      >
        <span className="sr-only">Loading post…</span>
        <div className="bg-secondaryBorder h-9 w-4/5" />
        <div className="bg-secondaryBorder mt-3 mb-6 h-4 w-60" />
        <div className="bg-secondaryBorder border-tileBorder mb-8 aspect-video w-full border-2" />
        <div className="flex flex-col gap-3">
          <div className="bg-secondaryBorder h-4 w-full" />
          <div className="bg-secondaryBorder h-4 w-11/12" />
          <div className="bg-secondaryBorder h-4 w-4/5" />
        </div>
      </div>
    );
  }
  if (status === "error") return <PageError message="Failed to load post." />;
  if (!post) return <PageNotFound message={`Post not found: ${slug}`} />;

  const pageTitle = `${post.title} - Gaichu`;
  const pageDescription = post.excerpt || post.title;
  const heroUrl = resolveHeroUrl(post.hero_url);
  const dateLabel = formatNewsDate(post.created_at);

  const moreNews = (latest ?? []).filter((p) => p.slug !== slug).slice(0, 3);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopyState("copied");
    } catch (err) {
      console.error("Copy link failed", err);
      setCopyState("failed");
    }
    setTimeout(() => setCopyState("idle"), 2000);
  };

  const share = async () => {
    if (!navigator.share) {
      copyLink();
      return;
    }
    try {
      await navigator.share({ title: post.title, url: window.location.href });
    } catch (err) {
      // Dismissing the share sheet rejects with AbortError: not a failure.
      if (err instanceof DOMException && err.name === "AbortError") return;
      console.error("Share failed", err);
      copyLink();
    }
  };

  const tag = post.tags?.[0];

  return (
    <div className="pb-2">
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:type" content="article" />
      {heroUrl && <meta property="og:image" content={heroUrl} />}
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      {heroUrl && <meta name="twitter:image" content={heroUrl} />}

      <article className="mx-auto flex max-w-210 flex-col">
        <header className="mb-6 flex flex-col gap-3">
          <h1 className="text-primaryText leading-[1.3]">{post.title}</h1>
          <div className="text-secondaryText flex flex-wrap items-center gap-2.5 text-[13px]">
            <span className="font-display text-xs">{dateLabel}</span>
            <span className="text-mutedLabel" aria-hidden>
              ·
            </span>
            <span>
              by <b className="text-primaryText">{post.author}</b>
            </span>
            {tag && (
              <span className="ml-1">
                <NewsTag>{tag}</NewsTag>
              </span>
            )}
          </div>
        </header>

        {heroUrl ? (
          <figure className="border-tileBorder bg-mainBg relative mb-8 aspect-video overflow-hidden border-2 shadow-[7px_8px_0_rgba(0,0,0,0.55)]">
            <img
              src={heroUrl}
              alt=""
              className="block h-full w-full object-cover"
            />
            {typeof post.score === "number" && (
              <Scale
                score={Math.max(1, Math.min(10, Math.round(post.score)))}
                className="bg-navBg text-primaryText pointer-events-none absolute bottom-2 left-2 z-8 px-2 py-0.5 text-xs leading-none"
              />
            )}
          </figure>
        ) : (
          <div
            className="border-tileBorder mb-8 aspect-video border-2 shadow-[7px_8px_0_rgba(0,0,0,0.55)]"
            style={{
              background:
                "repeating-linear-gradient(45deg,var(--color-navBg) 0 13px,var(--color-tileSurface) 13px 26px)",
            }}
            aria-hidden
          />
        )}

        {sanitizedHtml ? (
          <div
            className="news-prose"
            dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
          />
        ) : (
          <p className="text-errorText">No content yet.</p>
        )}

        <div className="border-mutedLabel mt-9 flex flex-wrap items-center justify-between gap-3.5 border-t-2 border-dashed pt-5">
          <Link to="/news" className={buttonClasses()}>
            ‹ See all
          </Link>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={share}>
              Share
            </Button>
            <Button
              variant="ghost"
              onClick={copyLink}
              aria-live="polite"
              className={copyState === "copied" ? "anim-confirm" : ""}
            >
              {copyState === "copied"
                ? "Copied"
                : copyState === "failed"
                  ? "Copy failed"
                  : "Copy link"}
            </Button>
          </div>
        </div>

        {moreNews.length > 0 && (
          <section className="mt-12 flex flex-col gap-1.5">
            <SectionHeading label="More news" className="mb-1.5">
              その他のニュース
            </SectionHeading>
            {moreNews.map((p) => {
              const thumb = resolveHeroUrl(p.hero_url);
              return (
                <Link
                  key={p.id}
                  to={`/news/${p.slug}`}
                  className="tile tile-link text-primaryText hover:text-primaryText flex items-center gap-4 px-3 py-2.5 font-normal"
                >
                  {thumb ? (
                    <img
                      src={cdnResized(thumb, CDN_WIDTH.newsThumb)}
                      alt=""
                      loading="lazy"
                      className="border-secondaryBorder aspect-video w-24 shrink-0 border object-cover"
                    />
                  ) : (
                    <span className="bg-secondaryBorder aspect-video w-24 shrink-0" />
                  )}
                  <span className="min-w-0 flex-1 text-sm font-bold">
                    {p.title}
                  </span>
                  <span className="font-display text-secondaryText text-[11px] whitespace-nowrap">
                    {formatNewsDate(p.created_at)}
                  </span>
                </Link>
              );
            })}
          </section>
        )}
      </article>
    </div>
  );
}
