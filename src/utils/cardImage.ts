import { CDN_BASE_URL } from "@/services/Constants";

export function isPlaceholderImage(url: string | null | undefined): boolean {
  return !url || url === "*" || url.endsWith("/00.jpg");
}

export function getCardBackUrl(
  seriesShortName: string,
  setShortName: string,
): string {
  return `${CDN_BASE_URL}/${seriesShortName}/${setShortName}/00.jpg?v=2`;
}
