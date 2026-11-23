import { describe, it, expect } from "vitest";
import { cdnResized } from "@/utils/cdnImage";

describe("cdnResized", () => {
  it("adds a width param to Bunny CDN URLs", () => {
    expect(cdnResized("https://gaichu.b-cdn.net/wm/set1/46.jpg", 420)).toBe(
      "https://gaichu.b-cdn.net/wm/set1/46.jpg?width=420",
    );
  });

  it("appends with & when the URL already has a query string", () => {
    expect(cdnResized("https://gaichu.b-cdn.net/wm/set1/00.jpg?v=2", 420)).toBe(
      "https://gaichu.b-cdn.net/wm/set1/00.jpg?v=2&width=420",
    );
  });

  it("leaves non-CDN URLs untouched", () => {
    const fav = "https://www.google.com/s2/favicons?sz=64&domain=x.com";
    expect(cdnResized(fav, 64)).toBe(fav);
    expect(cdnResized("/local.png", 64)).toBe("/local.png");
  });

  it("skips SVGs, even with a query string", () => {
    const svg = "https://gaichu.b-cdn.net/icons/a.svg?v=1";
    expect(cdnResized(svg, 64)).toBe(svg);
  });

  it("returns undefined for empty input", () => {
    expect(cdnResized(undefined, 64)).toBeUndefined();
    expect(cdnResized("", 64)).toBeUndefined();
  });
});
