// firestoreScript/importCollections.cjs
const fs = require("fs");
const path = require("path");
const { database } = require("./scriptDatabase.cjs");
const { allCollections, jsonFilePath } = require("./databaseConstants.cjs");

async function importCardCollection() {
  const subFolders = ["ash", "mz", "oz", "wm", "disgruntled"];
  let totalCount = 0;
  const batch = database.batch();

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
      const docRef = database.collection("cards").doc(id);
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

async function importOtherCollection(name) {
  if (name === "cards") {
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

  const batch = database.batch();
  documents.forEach((doc) => {
    const { id, ...data } = doc;
    const docRef = database.collection(name).doc(id);
    batch.set(docRef, data);
  });

  await batch.commit();
  console.log(`Imported ${documents.length} documents into "${name}"`);
}

async function main() {
  try {
    console.log(">>> Starting import data to database...");
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
