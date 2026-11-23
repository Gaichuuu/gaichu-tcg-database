import { onSchedule } from "firebase-functions/v2/scheduler";
import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { loadSets } from "../services/dataLoader.js";
import {
  fetchEbayPackPrice,
  buildPackPriceDocument,
  delay,
} from "../services/ebayPriceService.js";
import {
  savePackPrice,
  getAllPricedSetIds,
  getStaleSetIds,
  logPackSyncRun,
} from "../services/packPriceService.js";
import type { Set } from "../types/index.js";
import { isTriggerAuthorized } from "./triggerAuth.js";
import { PRICED_SERIES } from "../config/pricedSeries.js";

const rapidApiKey = defineSecret("RAPIDAPI_KEY");
const triggerToken = defineSecret("TRIGGER_TOKEN");

const SYNC_CONFIG = {
  staleDays: 7,
  maxPacksPerRun: 50,
  delayBetweenCalls: 250,
  enabledSeries: PRICED_SERIES,
};

function isPackEligible(set: Set): boolean {
  return (
    SYNC_CONFIG.enabledSeries.includes(set.series_short_name) && !!set.pack_art
  );
}

function eligiblePacks(): Set[] {
  return loadSets().filter(isPackEligible);
}

async function getPacksToSync(): Promise<Set[]> {
  const sets = eligiblePacks();
  const pricedSetIds = await getAllPricedSetIds();
  const staleSetIds = new Set(await getStaleSetIds(SYNC_CONFIG.staleDays));

  const withoutPrices = sets.filter((s) => !pricedSetIds.has(s.id));
  const stale = sets.filter(
    (s) => pricedSetIds.has(s.id) && staleSetIds.has(s.id),
  );

  return [...withoutPrices, ...stale].slice(0, SYNC_CONFIG.maxPacksPerRun);
}

async function syncPackPrices(
  sets: Set[],
  apiKey: string,
): Promise<{
  success: number;
  noResults: number;
  errors: number;
  details: Array<{ setId: string; packName: string; status: string }>;
}> {
  const results = {
    success: 0,
    noResults: 0,
    errors: 0,
    details: [] as Array<{ setId: string; packName: string; status: string }>,
  };

  for (let i = 0; i < sets.length; i++) {
    const set = sets[i];
    const packName = `${set.name} pack`;
    console.log(
      `[${i + 1}/${sets.length}] Fetching pack price for: ${packName} (${set.series_short_name})`,
    );

    try {
      const fetchResult = await fetchEbayPackPrice(set, apiKey);
      const priceDoc = buildPackPriceDocument(set, fetchResult);
      await savePackPrice(priceDoc);

      if (fetchResult.status === "success") results.success++;
      else if (fetchResult.status === "no_results") results.noResults++;
      else results.errors++;

      results.details.push({
        setId: set.id,
        packName,
        status: fetchResult.status,
      });
    } catch (error) {
      results.errors++;
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      console.error(`  ✗ Exception: ${errorMsg}`);
      results.details.push({
        setId: set.id,
        packName,
        status: `error: ${errorMsg}`,
      });
    }

    if (i < sets.length - 1) await delay(SYNC_CONFIG.delayBetweenCalls);
  }

  return results;
}

export const scheduledPackPriceSync = onSchedule(
  {
    schedule: "30 8 * * 1",
    region: "us-central1",
    memory: "512MiB",
    timeoutSeconds: 540,
    secrets: [rapidApiKey],
  },
  async () => {
    const apiKey = rapidApiKey.value();
    if (!apiKey) {
      console.error("RAPIDAPI_KEY secret not configured");
      return;
    }

    const packsToSync = await getPacksToSync();
    console.log(`Found ${packsToSync.length} packs needing price updates`);

    const results =
      packsToSync.length > 0
        ? await syncPackPrices(packsToSync, apiKey)
        : { success: 0, noResults: 0, errors: 0, details: [] };

    await logPackSyncRun({
      timestamp: new Date().toISOString(),
      trigger: "scheduled",
      packsProcessed: packsToSync.length,
      success: results.success,
      noResults: results.noResults,
      errors: results.errors,
      updatedPacks: results.details
        .filter((d) => d.status === "success")
        .map((d) => ({ setId: d.setId, packName: d.packName })),
    });
  },
);

export const triggerPackPriceSync = onRequest(
  {
    region: "us-central1",
    memory: "512MiB",
    timeoutSeconds: 540,
    secrets: [rapidApiKey, triggerToken],
  },
  async (req, res) => {
    if (!isTriggerAuthorized(req, triggerToken.value())) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const apiKey = rapidApiKey.value();
    if (!apiKey) {
      res.status(500).json({ error: "RAPIDAPI_KEY not configured" });
      return;
    }

    const maxPacks = Math.min(
      parseInt(req.query.max as string) || SYNC_CONFIG.maxPacksPerRun,
      SYNC_CONFIG.maxPacksPerRun,
    );
    const forceRefresh = req.query.forceRefresh === "true";
    const seriesFilter = req.query.series as string | undefined;
    if (seriesFilter && !SYNC_CONFIG.enabledSeries.includes(seriesFilter)) {
      res.status(400).json({
        error: `Invalid series: ${seriesFilter}. Valid: ${SYNC_CONFIG.enabledSeries.join(", ")}`,
      });
      return;
    }

    let packs: Set[];
    if (forceRefresh) {
      packs = eligiblePacks();
      if (seriesFilter) {
        packs = packs.filter((s) => s.series_short_name === seriesFilter);
      }
      packs = packs.slice(0, maxPacks);
    } else {
      const toSync = await getPacksToSync();
      packs = (
        seriesFilter
          ? toSync.filter((s) => s.series_short_name === seriesFilter)
          : toSync
      ).slice(0, maxPacks);
    }

    if (packs.length === 0) {
      res.json({ message: "No packs need updating", packsProcessed: 0 });
      return;
    }

    const results = await syncPackPrices(packs, apiKey);
    res.json({
      message: "Pack price sync complete",
      packsProcessed: packs.length,
      results: {
        success: results.success,
        noResults: results.noResults,
        errors: results.errors,
      },
      details: results.details,
    });
  },
);

export const syncSinglePackPrice = onRequest(
  {
    region: "us-central1",
    memory: "256MiB",
    timeoutSeconds: 30,
    secrets: [rapidApiKey, triggerToken],
  },
  async (req, res) => {
    if (!isTriggerAuthorized(req, triggerToken.value())) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const setId = req.query.setId as string;
    if (!setId) {
      res.status(400).json({ error: "setId query parameter required" });
      return;
    }

    const apiKey = rapidApiKey.value();
    if (!apiKey) {
      res.status(500).json({ error: "RAPIDAPI_KEY not configured" });
      return;
    }

    const set = loadSets().find((s) => s.id === setId);
    if (!set) {
      res.status(404).json({ error: "Set not found" });
      return;
    }
    if (!set.pack_art) {
      res.status(400).json({ error: "Set has no pack art" });
      return;
    }

    const fetchResult = await fetchEbayPackPrice(set, apiKey);
    const priceDoc = buildPackPriceDocument(set, fetchResult);
    await savePackPrice(priceDoc);

    res.json({
      setId: set.id,
      packName: `${set.name} pack`,
      status: fetchResult.status,
      prices: fetchResult.priceData,
      searchQuery: fetchResult.searchQuery,
      recentSales: fetchResult.recentSales.slice(0, 5),
    });
  },
);
