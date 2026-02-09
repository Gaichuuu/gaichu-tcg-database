// Mock Firebase before importing functions
vi.mock("@/lib/firebase", () => ({ database: {} }));
vi.mock("firebase/firestore/lite", () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  startAfter: vi.fn(),
  limit: vi.fn(),
  getDocs: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
}));

import { toTokens, stripHtml, textHaystack } from "@/api/news";
import { makeNewsPost } from "@/__test__/__mock__/newsPostMock";

describe("toTokens", () => {
  it("splits words and lowercases them", () => {
    const result = toTokens("Hello World");
    expect(result).toContain("hello");
    expect(result).toContain("world");
  });

  it("truncates tokens to 10 characters", () => {
    const result = toTokens("verylongwordthatexceedstenlimit");
    expect(result[0]).toBe("verylongwo");
    expect(result[0]).toHaveLength(10);
  });

  it("deduplicates tokens", () => {
    const result = toTokens("test test test");
    expect(result).toEqual(["test"]);
  });

  it("limits to 10 tokens", () => {
    const result = toTokens("one two three four five six seven eight nine ten eleven twelve");
    expect(result).toHaveLength(10);
  });

  it("returns empty array for empty string", () => {
    expect(toTokens("")).toEqual([]);
  });

  it("returns empty array for null input", () => {
    expect(toTokens(null as unknown as string)).toEqual([]);
  });

  it("returns empty array for undefined input", () => {
    expect(toTokens(undefined as unknown as string)).toEqual([]);
  });

  it("filters out non-alphanumeric separators", () => {
    const result = toTokens("hello,world!test@example");
    expect(result).toContain("hello");
    expect(result).toContain("world");
    expect(result).toContain("test");
    expect(result).toContain("example");
  });

  it("preserves alphanumeric characters", () => {
    const result = toTokens("test123 abc456");
    expect(result).toContain("test123");
    expect(result).toContain("abc456");
  });
});

describe("stripHtml", () => {
  it("removes HTML tags", () => {
    expect(stripHtml("<p>Hello</p>")).toBe(" Hello ");
  });

  it("handles nested tags", () => {
    expect(stripHtml("<div><p>Hello <strong>World</strong></p></div>")).toBe(
      "  Hello  World   ",
    );
  });

  it("returns space for falsy input", () => {
    expect(stripHtml("")).toBe("");
  });

  it("handles null input", () => {
    expect(stripHtml(null as unknown as string)).toBe("");
  });

  it("handles undefined input", () => {
    expect(stripHtml(undefined as unknown as string)).toBe("");
  });

  it("preserves text content", () => {
    expect(stripHtml("<a href='url'>Link Text</a>")).toBe(" Link Text ");
  });

  it("handles self-closing tags", () => {
    expect(stripHtml("Text <br/> More Text")).toBe("Text   More Text");
  });
});

describe("textHaystack", () => {
  it("combines title, excerpt, body, tags, and author", () => {
    const post = makeNewsPost({
      title: "Test Title",
      excerpt: "Test excerpt",
      body_html: "<p>Test body</p>",
      tags: ["tag1", "tag2"],
      author: "TestAuthor",
    });
    const result = textHaystack(post);
    expect(result).toContain("test title");
    expect(result).toContain("test excerpt");
    expect(result).toContain("test body");
    expect(result).toContain("tag1");
    expect(result).toContain("tag2");
    expect(result).toContain("testauthor");
  });

  it("lowercases all text", () => {
    const post = makeNewsPost({
      title: "UPPERCASE TITLE",
      excerpt: "MixedCase Excerpt",
    });
    const result = textHaystack(post);
    expect(result).toBe(result.toLowerCase());
  });

  it("truncates body_html to 200 characters", () => {
    const longBody = "<p>" + "a".repeat(300) + "</p>";
    const post = makeNewsPost({ body_html: longBody });
    const result = textHaystack(post);
    const bodyPart = result.split(" ").find((part) => part.includes("a"));
    expect(bodyPart?.length).toBeLessThanOrEqual(200);
  });

  it("strips HTML from body", () => {
    const post = makeNewsPost({
      body_html: "<div><strong>Bold</strong> text</div>",
    });
    const result = textHaystack(post);
    expect(result).toContain("bold");
    expect(result).toContain("text");
    expect(result).not.toContain("<div>");
    expect(result).not.toContain("<strong>");
  });

  it("handles missing optional fields", () => {
    const post = makeNewsPost({
      title: "Test",
      excerpt: undefined,
      body_html: undefined,
      tags: undefined,
      author: undefined,
    });
    const result = textHaystack(post);
    expect(result).toContain("test");
  });

  it("joins tags with space", () => {
    const post = makeNewsPost({ tags: ["expansion", "update", "news"] });
    const result = textHaystack(post);
    expect(result).toContain("expansion");
    expect(result).toContain("update");
    expect(result).toContain("news");
  });

  it("handles empty tags array", () => {
    const post = makeNewsPost({ tags: [] });
    const result = textHaystack(post);
    expect(result).toBeTruthy();
  });
});
