const NEWS_CDN_BASE = "https://gaichu.b-cdn.net/news/";

/**
 * Resolves a hero_url to a full URL.
 * - Full URLs (starting with http) are returned as-is
 * - Shorthand filenames are prefixed with the news CDN base
 */
export function resolveHeroUrl(heroUrl?: string): string | undefined {
  if (!heroUrl) return undefined;
  if (heroUrl.startsWith("http")) return heroUrl;
  return NEWS_CDN_BASE + heroUrl;
}
