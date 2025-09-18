// firestoreScript/importNews.cjs
const fs = require("fs");
const path = require("path");
const { db } = require("./scriptDatabase.cjs");

function slugify(title) {
  return String(title || "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
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

  const CHUNK = 400; // batch safety
  for (let i = 0; i < posts.length; i += CHUNK) {
    const batch = db.batch();
    for (const p of posts.slice(i, i + CHUNK)) {
      const slug = p.slug || slugify(p.title);
      const createdAt = Number(p.createdAt ?? Date.now());
      const doc = {
        ...p,
        id: slug,
        slug,
        createdAt,
        updatedAt: Date.now(),
        searchPrefixes: prefixes(
          [p.title, p.subtitle, (p.tags || []).join(" "), p.author || ""].join(
            " ",
          ),
        ),
      };
      batch.set(db.collection("news").doc(slug), doc, { merge: true });
      console.log(` → news/${slug}`);
    }
    await batch.commit();
  }
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
