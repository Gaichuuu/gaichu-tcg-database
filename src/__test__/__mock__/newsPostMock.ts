import type { NewsPost } from "@/types/news";

const defaults: NewsPost = {
  id: "default-post",
  slug: "default-post",
  title: "Default Post",
  excerpt: "A default excerpt",
  created_at: 1700000000000,
};

export function makeNewsPost(
  overrides?: Partial<NewsPost>,
): NewsPost {
  return { ...defaults, ...overrides };
}

export const newsPostMocks: NewsPost[] = [
  makeNewsPost({
    id: "post-1",
    slug: "new-expansion",
    title: "New Expansion Released",
    author: "Admin",
    tags: ["expansion", "update"],
    excerpt: "Check out the latest cards!",
    body_html: "<p>We are excited to announce <strong>50 new cards</strong>.</p>",
    created_at: 1700000000000,
  }),
  makeNewsPost({
    id: "post-2",
    slug: "tournament-results",
    title: "Tournament Results",
    tags: ["tournament"],
    excerpt: "The finals were intense.",
    created_at: 1699000000000,
  }),
  makeNewsPost({
    id: "post-3",
    slug: "price-update",
    title: "Price Update",
    author: "PriceBot",
    excerpt: "Weekly price changes.",
    body_html: "<div>Prices went <em>up</em> this week.</div>",
    created_at: 1698000000000,
  }),
];
