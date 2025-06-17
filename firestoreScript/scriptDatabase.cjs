// firestoreScript/scriptDatabase.cjs
const path = require("path");
const admin = require("firebase-admin");
const dotenv = require("dotenv");

const mode = process.env.NODE_ENV || "dev";

dotenv.config({
  path: path.resolve(__dirname, `../.env.${mode}`),
});
const serviceAccountPath =
  process.env.VITE_USE_STAGING_DATA == true
    ? path.join(__dirname, "../config/stageServiceAccountKey.json")
    : path.join(__dirname, "../config/serviceAccountKey.json");

const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

module.exports = { db };
