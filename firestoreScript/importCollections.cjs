// scripts/importCollections.cjs
const fs = require("fs");
const path = require("path");
const { db } = require("./scriptDatabase.cjs");
const { allCollections, jsonFilePath } = require("./databaseConstants.cjs");

/**
 * Import ONLY the "cards" collection by reading two separate JSON files:
 *   - data/mz/cards.json
 *   - data/wm/cards.json
 */
async function importCardCollection() {
  const subFolders = ["mz", "wm"];
  let totalCount = 0;
  const batch = db.batch();

  for (const folder of subFolders) {
    const filePath = path.join(jsonFilePath, folder, "cards.json");
    if (!fs.existsSync(filePath)) {
      console.warn(`No cards.json found in "${folder}" at ${filePath}`);
      continue;
    }

    const rawData = fs.readFileSync(filePath, "utf8");
    let documents;
    try {
      documents = JSON.parse(rawData);
    } catch (err) {
      console.error(`Failed to parse JSON in ${filePath}:`, err);
      continue;
    }

    documents.forEach((doc) => {
      const { id, ...data } = doc;
      // If you need to avoid ID collisions between mz/ and wm/, consider prefixing:
      // const docRef = db.collection("cards").doc(`${folder}_${id}`);
      const docRef = db.collection("cards").doc(id);
      batch.set(docRef, data);
    });

    totalCount += documents.length;
    console.log(
      `Queued ${documents.length} documents from "${folder}/cards.json"`,
    );
  }

  if (totalCount > 0) {
    await batch.commit();
    console.log(`Imported a total of ${totalCount} documents into "cards"`);
  } else {
    console.warn(`No "cards" documents found in any subfolder.`);
  }
}

/**
 * Import any collection EXCEPT "cards".
 * Reads from data/[name].json and writes into the Firestore collection [name].
 */
async function importOtherCollection(name) {
  if (name === "cards") {
    // Skip here, since we handle cards separately in importCardCollection()
    return;
  }

  const filePath = path.join(jsonFilePath, `${name}.json`);
  if (!fs.existsSync(filePath)) {
    console.warn(`No data file found for collection "${name}" at ${filePath}`);
    return;
  }

  const rawData = fs.readFileSync(filePath, "utf8");
  let documents;
  try {
    documents = JSON.parse(rawData);
  } catch (err) {
    console.error(`Failed to parse JSON in ${filePath}:`, err);
    return;
  }

  const batch = db.batch();
  documents.forEach((doc) => {
    const { id, ...data } = doc;
    const docRef = db.collection(name).doc(id);
    batch.set(docRef, data);
  });

  await batch.commit();
  console.log(`Imported ${documents.length} documents into "${name}"`);
}

/**
 * Main execution:
 *   1. importCardCollection()
 *   2. import every other collection (skipping "cards")
 */
async function main() {
  try {
    console.log(">>> Starting import data to DB...");
    await importCardCollection();

    for (const col of allCollections) {
      if (col === "cards") continue;
      await importOtherCollection(col);
    }

    console.log("\nAll collections imported!");
  } catch (err) {
    console.error("Error importing collections:", err);
    process.exit(1);
  }
}

main();
