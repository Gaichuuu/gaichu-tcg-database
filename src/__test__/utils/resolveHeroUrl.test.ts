import { resolveHeroUrl } from "@/utils/resolveHeroUrl";

describe("resolveHeroUrl", () => {
  it("returns undefined for undefined input", () => {
    expect(resolveHeroUrl(undefined)).toBeUndefined();
  });

  it("returns undefined for empty string", () => {
    expect(resolveHeroUrl("")).toBeUndefined();
  });

  it("returns full http URL as-is", () => {
    const url = "http://example.com/image.jpg";
    expect(resolveHeroUrl(url)).toBe(url);
  });

  it("returns full https URL as-is", () => {
    const url = "https://example.com/image.jpg";
    expect(resolveHeroUrl(url)).toBe(url);
  });

  it("prepends CDN base to relative filename", () => {
    expect(resolveHeroUrl("hero.jpg")).toBe(
      "https://gaichu.b-cdn.net/news/hero.jpg",
    );
  });

  it("prepends CDN base to relative path", () => {
    expect(resolveHeroUrl("2024/hero.jpg")).toBe(
      "https://gaichu.b-cdn.net/news/2024/hero.jpg",
    );
  });
});
