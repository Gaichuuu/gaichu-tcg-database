import { onSchedule } from "firebase-functions/v2/scheduler";
import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { publishGridPrices } from "../services/gridPricePublisher.js";
import { isTriggerAuthorized } from "./triggerAuth.js";

const triggerToken = defineSecret("TRIGGER_TOKEN");

export const scheduledGridPricePublish = onSchedule(
  {
    schedule: "30 9 * * 1",
    region: "us-central1",
    memory: "512MiB",
    timeoutSeconds: 300,
  },
  async () => {
    const { cards, packs } = await publishGridPrices();
    console.log(
      `Grid price publish complete: ${cards.updates.length} cards, ` +
        `${packs.updates.length} packs updated.`,
    );
  },
);

export const triggerGridPricePublish = onRequest(
  {
    region: "us-central1",
    memory: "512MiB",
    timeoutSeconds: 300,
    secrets: [triggerToken],
  },
  async (req, res) => {
    if (!isTriggerAuthorized(req, triggerToken.value())) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const { cards, packs } = await publishGridPrices();
    res.json({
      message: "Grid prices published",
      cardsUpdated: cards.updates.length,
      packsUpdated: packs.updates.length,
    });
  },
);
