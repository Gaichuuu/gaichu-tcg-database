// scripts/exportCollections.cjs
const fs = require("fs");
const path = require("path");
const admin = require("firebase-admin");
const { db } = require("./scriptDatabase.cjs");
const { allCollections, jsonFilePath } = require("./databaseConstants.cjs");

async function exportCollection(name) {
  const snapshot = await db.collection(name).get();
  const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  const outPath = path.join(jsonFilePath, `/${name}.json`);
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2), "utf8");
  console.log(
    `Exported ${snapshot.size} documents from "${name}" → ${outPath}`,
  );
}

async function main() {
  fs.mkdirSync(jsonFilePath, { recursive: true });

  for (const col of allCollections) {
    await exportCollection(col);
  }
  console.log("All collections exported!");
}

main().catch((err) => {
  console.error("Error exporting collections:", err);
  process.exit(1);
});
