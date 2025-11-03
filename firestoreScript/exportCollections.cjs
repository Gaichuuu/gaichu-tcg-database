// firestoreScript/exportCollections.cjs
const fs = require("fs");
const path = require("path");
const { database } = require("./scriptDatabase.cjs");
const { allCollections, jsonFilePath } = require("./databaseConstants.cjs");

async function exportCardCollection() {
  const subFolders = ["ash", "mz", "oz", "wm", "disgruntled"];
  for (const folder of subFolders) {
    const dir = path.join(jsonFilePath, folder);
    fs.mkdirSync(dir, { recursive: true });
  }

  for (const folder of subFolders) {
    const snapshot = await database
      .collection("cards")
      .where("series_short_name", "==", folder)
      .orderBy("sort_by", "asc")
      .get();

    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    const outPath = path.join(jsonFilePath, folder, "cards.json");
    fs.writeFileSync(outPath, JSON.stringify(data, null, 2), "utf8");

    console.log(
      `Exported ${snapshot.size} documents from "cards" (where game="${folder}") → ${outPath}`,
    );
  }
}

async function exportOtherCollection(name) {
  if (name === "cards") {
    return;
  }

  fs.mkdirSync(jsonFilePath, { recursive: true });

  const snapshot = await database.collection(name).get();
  const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  const outPath = path.join(jsonFilePath, `${name}.json`);
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2), "utf8");

  console.log(
    `Exported ${snapshot.size} documents from "${name}" → ${outPath}`,
  );
}

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
