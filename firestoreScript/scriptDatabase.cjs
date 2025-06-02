// firestoreScript/scriptDatabase.cjs
const path = require("path");
const admin = require("firebase-admin");

const serviceAccountPath =
  IS_USE_STAGING_DATA == true
    ? path.join(__dirname, "../config/stageServiceAccountKey.json")
    : path.join(__dirname, "../config/serviceAccountKey.json");

const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

module.exports = { db };
