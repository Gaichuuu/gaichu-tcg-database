import { describe, it, expect, vi, beforeEach } from "vitest";

type Doc = Record<string, unknown>;
const histStore = new Map<string, Doc>(); // `${cardId}/${week}` -> snapshot
const priceStore = new Map<string, Doc>(); // card_prices docs

vi.mock("firebase-admin", () => {
  const snapshotsColl = (cardId: string, fromDate?: string) => ({
    doc: (week: string) => ({
      set: async (data: Doc) => {
        histStore.set(`${cardId}/${week}`, { ...data });
      },
    }),
    where: (_field: string, _op: string, value: string) =>
      snapshotsColl(cardId, value),
    orderBy: () => ({
      get: async () => {
        const rows = [...histStore.entries()]
          .filter(([k]) => k.startsWith(`${cardId}/`))
          .map(([, v]) => v)
          .filter((v) => !fromDate || String(v.snapshot_date) >= fromDate)
          .sort((a, b) =>
            String(a.snapshot_date).localeCompare(String(b.snapshot_date)),
          );
        return { docs: rows.map((d) => ({ data: () => d })) };
      },
    }),
  });

  const allPriceDocs = async () => ({
    docs: [...priceStore.entries()].map(([id, d]) => ({ id, data: () => d })),
  });

  const firestore = () => ({
    collection: (name: string) => {
      if (name === "card_price_history") {
        return {
          doc: (cardId: string) => ({
            collection: () => snapshotsColl(cardId),
          }),
        };
      }
      // card_prices
      return { get: allPriceDocs, select: () => ({ get: allPriceDocs }) };
    },
    batch: () => {
      const writes: Array<() => Promise<void>> = [];
      return {
        set: (ref: { set: (d: Doc) => Promise<void> }, data: Doc) => {
          writes.push(() => ref.set(data));
        },
        commit: async () => {
          for (const w of writes) await w();
        },
      };
    },
  });

  return {
    default: {
      apps: [{}],
      initializeApp: () => {},
      firestore,
    },
  };
});

import {
  archiveWeeklySnapshot,
  getWeeklyPriceHistory,
  archiveSnapshotsForAllCards,
} from "./priceService.js";
import type { WeeklyPriceSnapshot } from "../types/index.js";

const snap = (over: Partial<WeeklyPriceSnapshot>): WeeklyPriceSnapshot => ({
  card_id: "c1",
  series_short_name: "tygadu",
  week: "2026-W20",
  snapshot_date: "2026-05-11",
  average_price: 10,
  median_price: 10,
  min_price: 8,
  max_price: 12,
  sample_size: 5,
  source: "git-backfill",
  created_at: "2026-05-31T00:00:00.000Z",
  ...over,
});

describe("price history service", () => {
  beforeEach(() => {
    histStore.clear();
    priceStore.clear();
  });

  it("archives a snapshot and reads it back", async () => {
    await archiveWeeklySnapshot(snap({ week: "2026-W20" }));
    const history = await getWeeklyPriceHistory("c1");
    expect(history).toHaveLength(1);
    expect(history[0].week).toBe("2026-W20");
  });

  it("returns snapshots ordered by date and filters by fromDate", async () => {
    await archiveWeeklySnapshot(
      snap({ week: "2026-W22", snapshot_date: "2026-05-25" }),
    );
    await archiveWeeklySnapshot(
      snap({ week: "2026-W20", snapshot_date: "2026-05-11" }),
    );
    expect((await getWeeklyPriceHistory("c1")).map((s) => s.week)).toEqual([
      "2026-W20",
      "2026-W22",
    ]);
    expect(
      (await getWeeklyPriceHistory("c1", "2026-05-20")).map((s) => s.week),
    ).toEqual(["2026-W22"]);
  });

  it("snapshots all card_prices into the current week", async () => {
    priceStore.set("c1", {
      card_id: "c1",
      series_short_name: "tygadu",
      prices: {
        average_price: 19.99,
        median_price: 18,
        min_price: 14,
        max_price: 20,
        sample_size: 7,
      },
    });
    const written = await archiveSnapshotsForAllCards(
      new Date("2026-05-25T00:00:00Z"),
    );
    expect(written).toBe(1);
    const history = await getWeeklyPriceHistory("c1");
    expect(history[0]).toMatchObject({
      week: "2026-W22",
      average_price: 19.99,
      source: "sync",
    });
  });
});

describe("newestSaleDate", () => {
  it("returns the newest eBay sale date as ISO", async () => {
    const { newestSaleDate } = await import("./priceService.js");
    const iso = newestSaleDate([
      { date_sold: "Apr 3, 2026" },
      { date_sold: "Jul 9, 2026" },
      { date_sold: "not a date" },
    ]);
    expect(iso?.slice(0, 10)).toBe(
      new Date("Jul 9, 2026").toISOString().slice(0, 10),
    );
  });
  it("returns null with no sales", async () => {
    const { newestSaleDate } = await import("./priceService.js");
    expect(newestSaleDate([])).toBeNull();
    expect(newestSaleDate(undefined)).toBeNull();
  });
});
