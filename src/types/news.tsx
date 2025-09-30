export type NewsPost = {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  author?: string;
  tags?: string[];
  hero_url?: string;
  excerpt: string;
  body_html?: string;
  created_at: number;
  searchPrefixes?: string[];
};
