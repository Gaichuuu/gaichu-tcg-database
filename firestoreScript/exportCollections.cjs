// scripts/exportCollections.cjs
const fs = require("fs");
const path = require("path");
const { db } = require("./scriptDatabase.cjs");
const { allCollections, jsonFilePath } = require("./databaseConstants.cjs");

/**
 * Export **only** the "cards" collection into two folders:
 *   - data/mz/cards.json
 *   - data/wm/cards.json
 *
 * NOTE: This example assumes each Firestore document in "cards" has a field
 * called "game" whose value is exactly "mz" or "wm". Adjust the field name
 * or filter logic (e.g. by set_short_name or another property) if yours differs.
 */
async function exportCardCollection() {
  // Ensure the subfolders exist (mz and wm)
  const subFolders = ["mz", "wm"];
  for (const folder of subFolders) {
    const dir = path.join(jsonFilePath, folder);
    fs.mkdirSync(dir, { recursive: true });
  }

  for (const folder of subFolders) {
    // Query Firestore for cards where `game == folder`
    const snapshot = await db
      .collection("cards")
      .where("series_short_name", "==", folder)
      .orderBy("sortBy", "asc")
      .get();

    // Map each document to a plain object { id, ...data }
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    // Write out to data/[folder]/cards.json
    const outPath = path.join(jsonFilePath, folder, "cards.json");
    fs.writeFileSync(outPath, JSON.stringify(data, null, 2), "utf8");

    console.log(
      `Exported ${snapshot.size} documents from "cards" (where game="${folder}") → ${outPath}`,
    );
  }
}

/**
 * Export any collection **except** "cards".
 * Writes data to data/[name].json
 */
async function exportOtherCollection(name) {
  if (name === "cards") {
    return; // skip here; handled by exportCardCollection()
  }

  // Make sure the top‐level data folder exists
  fs.mkdirSync(jsonFilePath, { recursive: true });

  const snapshot = await db.collection(name).get();
  const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  // Write out to data/[name].json
  const outPath = path.join(jsonFilePath, `${name}.json`);
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2), "utf8");

  console.log(
    `Exported ${snapshot.size} documents from "${name}" → ${outPath}`,
  );
}

/**
 * Run the full export:
 *   1. exportCardCollection()  → dumps cards into data/mz/cards.json & data/wm/cards.json
 *   2. exportOtherCollection() for every other collection in allCollections
 */
async function main() {
  try {
    console.log(">>> Exporting 'cards' into two subfolders...");
    await exportCardCollection();

    console.log("\n>>> Exporting all other collections...");
    for (const col of allCollections) {
      if (col === "cards") continue;
      await exportOtherCollection(col);
    }

    console.log("\nAll collections exported!");
  } catch (err) {
    console.error("Error exporting collections:", err);
    process.exit(1);
  }
}

main();
