/**
 * Generates sitemap.xml from static JSON data files.
 * Run with: npx tsx scripts/generate-sitemap.ts
 */

import fs from "fs";
import path from "path";

interface Series {
  id: string;
  short_name: string;
  name: string;
}

interface Set {
  id: string;
  short_name: string;
  series_short_name: string;
  name: string;
  pack_art?: { url: string };
  card_back?: { url: string };
}

interface Card {
  id: string;
  sort_by: number;
  name: string | { en?: string; ja?: string };
  set_ids: string[];
}

interface NewsItem {
  slug: string;
}

const BASE_URL = "https://gaichu.com";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getCardName(name: string | { en?: string; ja?: string }): string {
  if (typeof name === "string") return name;
  return name?.en || Object.values(name || {})[0] || "";
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function generateSitemap(): string {
  const urls: Array<{ loc: string; priority: string; changefreq: string }> = [];

  // Static pages
  urls.push({ loc: `${BASE_URL}/`, priority: "1.0", changefreq: "weekly" });
  urls.push({ loc: `${BASE_URL}/cards`, priority: "0.9", changefreq: "weekly" });
  urls.push({ loc: `${BASE_URL}/about`, priority: "0.5", changefreq: "monthly" });
  urls.push({ loc: `${BASE_URL}/news`, priority: "0.8", changefreq: "weekly" });

  // Load data files
  const dataDir = path.join(process.cwd(), "data");
  const seriesList: Series[] = JSON.parse(
    fs.readFileSync(path.join(dataDir, "series.json"), "utf-8")
  );
  const setsList: Set[] = JSON.parse(
    fs.readFileSync(path.join(dataDir, "sets.json"), "utf-8")
  );

  // Build set lookup by ID
  const setById = new Map<string, Set>();
  for (const set of setsList) {
    setById.set(set.id, set);
  }

  // Series pages
  for (const series of seriesList) {
    urls.push({
      loc: `${BASE_URL}/cards/${encodeURIComponent(series.short_name)}`,
      priority: "0.8",
      changefreq: "weekly",
    });
  }

  // Set pages
  for (const set of setsList) {
    const setPath = `/cards/${encodeURIComponent(set.series_short_name)}/sets/${encodeURIComponent(set.short_name)}`;
    urls.push({
      loc: `${BASE_URL}${setPath}`,
      priority: "0.7",
      changefreq: "weekly",
    });

    // Pack art and card back pages
    if (set.pack_art) {
      urls.push({
        loc: `${BASE_URL}${setPath}/pack-art`,
        priority: "0.5",
        changefreq: "monthly",
      });
    }
    if (set.card_back) {
      urls.push({
        loc: `${BASE_URL}${setPath}/card-back`,
        priority: "0.5",
        changefreq: "monthly",
      });
    }
  }

  // Card pages - load each series' cards
  for (const series of seriesList) {
    const cardsPath = path.join(dataDir, series.short_name, "cards.json");
    if (!fs.existsSync(cardsPath)) continue;

    const cards: Card[] = JSON.parse(fs.readFileSync(cardsPath, "utf-8"));

    for (const card of cards) {
      // Find the set for this card
      const setId = card.set_ids?.[0];
      if (!setId) continue;

      const set = setById.get(setId);
      if (!set) continue;

      const cardNameSlug = slugify(getCardName(card.name));
      const cardPath = `/cards/${encodeURIComponent(set.series_short_name)}/sets/${encodeURIComponent(set.short_name)}/card/${encodeURIComponent(`${card.sort_by}_${cardNameSlug}`)}`;

      urls.push({
        loc: `${BASE_URL}${cardPath}`,
        priority: "0.6",
        changefreq: "monthly",
      });
    }
  }

  // News pages
  const newsPath = path.join(dataDir, "news", "index.json");
  if (fs.existsSync(newsPath)) {
    const newsItems: NewsItem[] = JSON.parse(fs.readFileSync(newsPath, "utf-8"));
    for (const item of newsItems) {
      urls.push({
        loc: `${BASE_URL}/news/${encodeURIComponent(item.slug)}`,
        priority: "0.6",
        changefreq: "monthly",
      });
    }
  }

  // Generate XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${escapeXml(url.loc)}</loc>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return xml;
}

// Generate and write sitemap
const sitemap = generateSitemap();
const outputPath = path.join(process.cwd(), "sitemap.xml");
fs.writeFileSync(outputPath, sitemap, "utf-8");

console.log(`Sitemap generated at ${outputPath}`);
console.log(`Total URLs: ${(sitemap.match(/<url>/g) || []).length}`);
