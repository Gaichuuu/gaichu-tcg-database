import { onSchedule } from "firebase-functions/v2/scheduler";
import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { archiveSnapshotsForAllPacks } from "../services/packPriceService.js";
import { isTriggerAuthorized } from "./triggerAuth.js";

const triggerToken = defineSecret("TRIGGER_TOKEN");

export const scheduledPackPriceSnapshot = onSchedule(
  {
    schedule: "0 9 * * 1",
    region: "us-central1",
    memory: "512MiB",
    timeoutSeconds: 540,
  },
  async () => {
    const written = await archiveSnapshotsForAllPacks(new Date());
    console.log(`Pack price snapshot complete: ${written} snapshots written.`);
  },
);

export const triggerPackPriceSnapshot = onRequest(
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
    const written = await archiveSnapshotsForAllPacks(new Date());
    res.json({ message: "Pack snapshot complete", snapshotsWritten: written });
  },
);
