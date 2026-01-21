// __tests__/services/CollectionSetService.test.ts
import { cardListMock } from "@/__test__/__mock__/cardJson";
import { setJsonMock } from "@/__test__/__mock__/setJson";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fakeDb = {} as any;
vi.mock("src/lib/firebase", () => ({
  database: fakeDb,
}));

vi.mock("firebase/firestore/lite", () => ({
  getFirestore: vi.fn(() => fakeDb),
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  getDocs: vi.fn(),
}));

let fetchSets: (typeof import("@/services/CollectionSetService"))["fetchSets"];
let getDocs: (typeof import("firebase/firestore/lite"))["getDocs"];

beforeEach(async () => {
  vi.clearAllMocks();
  const mod = await import("@/services/CollectionSetService");
  fetchSets = mod.fetchSets;
});
beforeEach(async () => {
  vi.clearAllMocks();
  // import mocks & the functions for TS/runtime
  const fs = await import("firebase/firestore/lite");
  getDocs = fs.getDocs;
});

describe("fetchSets", () => {
  it("queries Firestore correctly and merges sets with their cards", async () => {
    // New implementation: 1 query for sets + N queries for cards (one per set using array-contains)
    // First call returns sets, subsequent calls return cards for each set
    (getDocs as Mock)
      // First call: return all sets
      .mockResolvedValueOnce({
        docs: setJsonMock.map((item) => ({
          id: item.id,
          data: () => item,
        })),
      })
      // Subsequent calls: return cards filtered by set_id
      // Each set query returns only cards that belong to that set
      .mockImplementation(async () => ({
        docs: cardListMock.map((item) => ({
          id: item.id,
          data: () => item,
        })),
      }));

    const seriesShortName = "wm";
    const result = await fetchSets(seriesShortName);
    const { collection, where, orderBy, query } = await import(
      "firebase/firestore/lite"
    );

    // 1 where for sets query + 1 where per set for cards query (3 sets = 4 total)
    expect(where).toHaveBeenCalledTimes(1 + setJsonMock.length);
    // 1 query for sets + 1 query per set for cards
    expect(query).toHaveBeenCalledTimes(1 + setJsonMock.length);
    // 1 getDocs for sets + 1 getDocs per set for cards
    expect(getDocs).toHaveBeenCalledTimes(1 + setJsonMock.length);

    // Verify sets query
    expect(query).toHaveBeenCalledWith(
      collection(fakeDb, "sets"),
      where("series_short_name", "==", seriesShortName),
      orderBy("sort_by", "asc"),
    );

    // Verify cards queries use array-contains for each set
    for (const setItem of setJsonMock) {
      expect(where).toHaveBeenCalledWith(
        "set_ids",
        "array-contains",
        setItem.id,
      );
    }

    // Verify result structure - each set should have cards with derived fields
    expect(result.length).toBe(setJsonMock.length);
    for (const setAndCard of result) {
      expect(setAndCard.set).toBeDefined();
      // Cards should have derived fields from the set
      for (const card of setAndCard.cards) {
        expect(card.set_short_name).toBe(setAndCard.set.short_name);
        expect(card.series_short_name).toBe(setAndCard.set.series_short_name);
        expect(card.total_cards_count).toBe(
          setAndCard.set.total_cards_count ?? 0,
        );
        expect(card.sets).toEqual([
          { name: setAndCard.set.name, image: setAndCard.set.logo },
        ]);
      }
    }
  });
});
