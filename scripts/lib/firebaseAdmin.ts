import admin from "firebase-admin";
import { existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const CONFIG_DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../config",
);

export function initFirebase(): admin.firestore.Firestore {
  if (admin.apps.length > 0) return admin.firestore();

  const keyFile =
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    join(
      CONFIG_DIR,
      process.env.NODE_ENV === "staging"
        ? "stageServiceAccountKey.json"
        : "serviceAccountKey.json",
    );

  if (existsSync(keyFile)) {
    try {
      admin.initializeApp({ credential: admin.credential.cert(keyFile) });
      console.log(`Firebase: service account key ${keyFile}`);
      return admin.firestore();
    } catch (err) {
      console.warn(`Firebase: couldn't use ${keyFile}:`, err);
    }
  } else {
    console.warn(`Firebase: no key at ${keyFile}`);
  }

  admin.initializeApp();
  console.log("Firebase: default application credentials");
  return admin.firestore();
}
