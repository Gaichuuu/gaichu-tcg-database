import { onSchedule } from "firebase-functions/v2/scheduler";
import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { archiveSnapshotsForAllCards } from "../services/priceService.js";
import { isTriggerAuthorized } from "./triggerAuth.js";

const triggerToken = defineSecret("TRIGGER_TOKEN");

export const scheduledPriceSnapshot = onSchedule(
  {
    schedule: "0 9 * * 1",
    region: "us-central1",
    memory: "512MiB",
    timeoutSeconds: 540,
  },
  async () => {
    const written = await archiveSnapshotsForAllCards(new Date());
    console.log(`Price snapshot complete: ${written} snapshots written.`);
  },
);

export const triggerPriceSnapshot = onRequest(
  {
    region: "us-central1",
    memory: "512MiB",
    timeoutSeconds: 540,
    secrets: [triggerToken],
  },
  async (req, res) => {
    if (!isTriggerAuthorized(req, triggerToken.value())) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const written = await archiveSnapshotsForAllCards(new Date());
    res.json({ message: "Snapshot complete", snapshotsWritten: written });
  },
);
