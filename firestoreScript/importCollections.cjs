// firestoreScript/importCollections.cjs
const fs = require("fs");
const path = require("path");
const { database } = require("./scriptDatabase.cjs");
const { allCollections, jsonFilePath } = require("./databaseConstants.cjs");

const LIVE_PRICE_FIELDS = {
  cards: "average_price",
  sets: "pack_average_price",
};

async function readLivePrices(collection) {
  const field = LIVE_PRICE_FIELDS[collection];
  const prices = new Map();
  if (!field) return prices;
  const snapshot = await database.collection(collection).select(field).get();
  for (const doc of snapshot.docs) {
    const value = doc.get(field);
    if (typeof value === "number" && value > 0) prices.set(doc.id, value);
  }
  return prices;
}

function withLivePrice(collection, id, data, livePrices, counter) {
  const field = LIVE_PRICE_FIELDS[collection];
  if (!field || !livePrices.has(id)) return data;
  const live = livePrices.get(id);
  if (data[field] !== live) counter.kept++;
  return { ...data, [field]: live };
}

async function importCardCollection() {
  const subFolders = ["ash", "mz", "oz", "wm", "disgruntled", "tygadu", "sm"];
  let totalCount = 0;
  const batch = database.batch();
  const livePrices = await readLivePrices("cards");
  const kept = { kept: 0 };

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
      batch.set(docRef, withLivePrice("cards", id, data, livePrices, kept));
    });

    totalCount += documents.length;
    console.log(
      `Queued ${documents.length} documents from "${folder}/cards.json"`,
    );
  }

  if (totalCount > 0) {
    await batch.commit();
    console.log(`Imported a total of ${totalCount} documents into "cards"`);
    console.log(
      `  kept ${kept.kept} newer live average_price values from Firestore`,
    );
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
  const livePrices = await readLivePrices(name);
  const kept = { kept: 0 };
  documents.forEach((doc) => {
    const { id, ...data } = doc;
    const docRef = database.collection(name).doc(id);
    batch.set(docRef, withLivePrice(name, id, data, livePrices, kept));
  });

  await batch.commit();
  console.log(`Imported ${documents.length} documents into "${name}"`);
  if (LIVE_PRICE_FIELDS[name]) {
    console.log(
      `  kept ${kept.kept} newer live ${LIVE_PRICE_FIELDS[name]} values from Firestore`,
    );
  }
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
