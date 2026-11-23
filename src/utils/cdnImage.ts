export const CDN_WIDTH = {
  thumb: 120,
  card: 420,
  logo: 480,
  newsThumb: 240,
  newsTile: 800,
} as const;

export function cdnResized(
  url: string | null | undefined,
  width: number,
): string | undefined {
  if (!url) return undefined;
  if (!url.includes(".b-cdn.net/")) return url;
  const [path] = url.split(/[?#]/);
  if (path.toLowerCase().endsWith(".svg")) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}width=${width}`;
}
