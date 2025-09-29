// firestoreScript/databaseConstants.cjs
const path = require("path");

const allCollections = [
  "cards",
  "illustrators",
  "rarity",
  "series",
  "sets",
  "type",
];

const jsonFilePath = path.join(__dirname, "../data");
module.exports = { allCollections, jsonFilePath };
