// firestoreScript/databaseConstants.cjs
const path = require("path");

const allCollections = [
  "cards",
  "illustrators",
  "rarity",
  "series",
  "sets",
];

const jsonFilePath = path.join(__dirname, "../data");
module.exports = { allCollections, jsonFilePath };
