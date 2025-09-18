// src/types/news.tsx
export type NewsPost = {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  author?: string;
  tags?: string[];
  heroUrl?: string;
  excerpt: string;
  bodyHtml?: string;
  createdAt: number;
  updatedAt?: number;
  searchPrefixes?: string[];
};
