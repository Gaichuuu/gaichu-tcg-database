// firestoreScript/scriptDatabase.cjs
const path = require("path");
const admin = require("firebase-admin");

const serviceAccount = require(
  path.join(__dirname, "../config/serviceAccountKey.json"),
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

module.exports = { db };
