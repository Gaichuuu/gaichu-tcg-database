// firestoreScript/importNews.cjs
const fs = require("fs");
const path = require("path");
const { database: db } = require("./scriptDatabase.cjs");

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function validateSlug(slug, title, idx, seen) {
  if (!slug)
    throw new Error(`Missing "slug" at index ${idx} (title: "${title}")`);
  const s = String(slug).trim().toLowerCase();
  if (!SLUG_RE.test(s)) {
    throw new Error(
      `Invalid slug "${slug}" at index ${idx} (title: "${title}"). ` +
        `Use lowercase letters/numbers and hyphens only (e.g. "openzoo-legacy-set-page-is-live").`,
    );
  }
  if (seen.has(s))
    throw new Error(
      `Duplicate slug "${s}" at index ${idx}. Slugs must be unique.`,
    );
  seen.add(s);
  return s;
}

function prefixes(s) {
  const out = new Set();
  for (const tok of (s || "")
    .toLowerCase()
    .split(/[^a-z0-9]+/g)
    .filter(Boolean)) {
    for (let i = 1; i <= Math.min(tok.length, 10); i++)
      out.add(tok.slice(0, i));
  }
  return [...out];
}

function stripHtml(html) {
  return String(html || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
const MAX_BODY_CHARS = 400;

function toMillis(v) {
  if (v == null) return Date.now();
  if (typeof v === "number") return v;
  const t = Date.parse(v);
  return Number.isFinite(t) ? t : Date.now();
}

function clampScore(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return undefined;
  return Math.max(1, Math.min(10, Math.round(n)));
}

async function main() {
  const file = path.resolve(__dirname, "..", "data", "news", "index.json");
  if (!fs.existsSync(file)) {
    console.error(`Missing ${file}`);
    process.exit(1);
  }

  const posts = JSON.parse(fs.readFileSync(file, "utf8"));
  if (!Array.isArray(posts)) {
    console.error("index.json must be an array of posts");
    process.exit(1);
  }

  console.log(`Importing ${posts.length} news post(s)…`);

  const seen = new Set();
  const CHUNK = 400;

  for (let i = 0; i < posts.length; i += CHUNK) {
    const batch = db.batch();

    posts.slice(i, i + CHUNK).forEach((p, offset) => {
      const idx = i + offset;

      const slug = validateSlug(p.slug, p.title, idx, seen);
      const created_at = toMillis(p.created_at);
      const score = clampScore(p.score);

      const searchText = [
        p.title,
        p.subtitle,
        stripHtml(p.body_html).slice(0, MAX_BODY_CHARS),
        (p.tags || []).join(" "),
        p.author || "",
      ]
        .filter(Boolean)
        .join(" ");

      const doc = {
        ...p,
        id: slug,
        slug,
        created_at,
        search_prefixes: prefixes(searchText),
      };

      if (typeof score === "number") doc.score = score;
      else delete doc.score;

      delete doc.createdAt;
      delete doc.bodyHtml;
      delete doc.heroUrl;
      delete doc.searchPrefixes;

      const ref = db.collection("news").doc(slug);
      batch.set(ref, doc, { merge: false });
      console.log(` → news/${slug}`);
    });

    await batch.commit();
  }

  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
