// scripts/exportCollections.cjs
const fs = require("fs");
const path = require("path");
const admin = require("firebase-admin");

const serviceAccount = require(
  path.join(__dirname, "../serviceAccountKey.json"),
);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const collections = [
  "cards",
  "illustrators",
  "rarity",
  "series",
  "sets",
  "type",
];

async function exportCollection(name) {
  const snapshot = await db.collection(name).get();
  const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  const outPath = path.join(__dirname, `../data/${name}.json`);
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2), "utf8");
  console.log(
    `Exported ${snapshot.size} documents from "${name}" → ${outPath}`,
  );
}

async function main() {
  fs.mkdirSync(path.join(__dirname, "../data"), { recursive: true });

  for (const col of collections) {
    await exportCollection(col);
  }
  console.log("All collections exported!");
}

main().catch((err) => {
  console.error("Error exporting collections:", err);
  process.exit(1);
});
