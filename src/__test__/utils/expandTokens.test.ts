import { expandTokens } from "@/utils/expandTokens";

describe("expandTokens", () => {
  it("returns empty string for empty input", () => {
    expect(expandTokens("")).toBe("");
  });

  it("returns empty string for null input", () => {
    expect(expandTokens(null as unknown as string)).toBe("");
  });

  it("returns empty string for undefined input", () => {
    expect(expandTokens(undefined as unknown as string)).toBe("");
  });

  it("expands youtube token correctly", () => {
    const result = expandTokens("{youtube:dQw4w9WgXcQ}");
    expect(result).toContain('src="https://www.youtube.com/embed/dQw4w9WgXcQ"');
    expect(result).toContain("position:relative");
    expect(result).toContain("padding-bottom:56.25%");
  });

  it("expands img token with relative URL using CDN prefix", () => {
    const result = expandTokens("{img:hero.jpg}");
    expect(result).toBe(
      '<img src="https://gaichu.b-cdn.net/news/hero.jpg" alt="">',
    );
  });

  it("expands img token with absolute http URL without CDN prefix", () => {
    const result = expandTokens("{img:https://example.com/image.png}");
    expect(result).toBe('<img src="https://example.com/image.png" alt="">');
  });

  it("expands img token with alt text", () => {
    const result = expandTokens("{img:hero.jpg|A hero image}");
    expect(result).toBe(
      '<img src="https://gaichu.b-cdn.net/news/hero.jpg" alt="A hero image">',
    );
  });

  it("expands link token correctly", () => {
    const result = expandTokens("{link:https://gaichu.com|Visit Gaichu}");
    expect(result).toBe(
      '<a href="https://gaichu.com" target="_blank">Visit Gaichu</a>',
    );
  });

  it("expands code block token correctly", () => {
    const result = expandTokens("{code}const x = 42;{/code}");
    expect(result).toContain("<pre");
    expect(result).toContain("<code>const x = 42;</code>");
    expect(result).toContain("background:var(--color-codeBg)");
  });

  it("expands indent block token correctly", () => {
    const result = expandTokens("{indent}Indented text{/indent}");
    expect(result).toBe(
      '<div style="margin-left:1.25rem;">Indented text</div>',
    );
  });

  it("handles multiple tokens in one string", () => {
    const content =
      "Check this out: {youtube:abc123} and {img:test.jpg|Test} and {link:https://example.com|Click here}";
    const result = expandTokens(content);
    expect(result).toContain("youtube.com/embed/abc123");
    expect(result).toContain("gaichu.b-cdn.net/news/test.jpg");
    expect(result).toContain("alt=\"Test\"");
    expect(result).toContain('href="https://example.com"');
    expect(result).toContain("Click here");
  });

  it("leaves unrecognized patterns untouched", () => {
    const content = "{unknown:value} and {notAToken}";
    const result = expandTokens(content);
    expect(result).toBe("{unknown:value} and {notAToken}");
  });

  it("handles nested content in code blocks", () => {
    const content = "{code}function test() {\n  return 42;\n}{/code}";
    const result = expandTokens(content);
    expect(result).toContain("function test() {\n  return 42;\n}");
  });

  it("handles multiline content in indent blocks", () => {
    const content = "{indent}Line 1\nLine 2{/indent}";
    const result = expandTokens(content);
    expect(result).toContain("Line 1\nLine 2");
  });
});
