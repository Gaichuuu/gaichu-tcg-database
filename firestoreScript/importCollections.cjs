// scripts/importCollections.cjs
const fs = require("fs");
const path = require("path");
const admin = require("firebase-admin");
const { db } = require("./scriptDatabase.cjs");
const { allCollections } = require("./databaseConstants.cjs");

async function importCollection(name) {
  const filePath = path.join(__dirname, `../data/${name}.json`);
  if (!fs.existsSync(filePath)) {
    console.warn(`No data file found for collection "${name}"`);
    return;
  }

  const rawData = fs.readFileSync(filePath, "utf8");
  const documents = JSON.parse(rawData);

  const batch = db.batch();

  documents.forEach((doc) => {
    const { id, ...data } = doc;
    const docRef = db.collection(name).doc(id);
    batch.set(docRef, data);
  });

  await batch.commit();
  console.log(`Imported ${documents.length} documents into "${name}"`);
}

async function main() {
  for (const col of allCollections) {
    await importCollection(col);
  }
  console.log("All collections imported!");
}

main().catch((err) => {
  console.error("Error importing collections:", err);
  process.exit(1);
});
