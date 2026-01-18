// __tests__/services/CollectionSetService.test.ts
import { cardListMock } from "@/__test__/__mock__/cardJson";
import { setJsonMock } from "@/__test__/__mock__/setJson";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fakeDb = {} as any;
vi.mock("src/lib/firebase", () => ({
  database: fakeDb,
}));

vi.mock("firebase/firestore", () => ({
  getFirestore: vi.fn(() => fakeDb),
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  getDocs: vi.fn(),
}));

let fetchSets: (typeof import("@/services/CollectionSetService"))["fetchSets"];
let getDocs: (typeof import("firebase/firestore"))["getDocs"];

beforeEach(async () => {
  vi.clearAllMocks();
  const mod = await import("@/services/CollectionSetService");
  fetchSets = mod.fetchSets;
});
beforeEach(async () => {
  vi.clearAllMocks();
  // import mocks & the functions for TS/runtime
  const fs = await import("firebase/firestore");
  getDocs = fs.getDocs;
});

describe("fetchSets", () => {
  it("queries Firestore correctly and merges sets with their cards", async () => {
    // prepare our two snapshots
    (getDocs as Mock)
      .mockResolvedValueOnce({
        docs: setJsonMock.map((item) => ({
          id: item.id,
          data: () => item,
        })),
      })
      .mockResolvedValueOnce({
        docs: cardListMock.map((item) => ({
          id: item.id,
          data: () => item,
        })),
      });

    const seriesShortName = "wm";
    const result = await fetchSets(seriesShortName);
    const { collection, where, orderBy, query } = await import(
      "firebase/firestore"
    );
    expect(where).toHaveBeenCalledTimes(2);
    expect(query).toHaveBeenCalledTimes(2);
    expect(getDocs).toHaveBeenCalledTimes(2);

    expect(query).toHaveBeenCalledWith(
      collection(fakeDb, "sets"),
      where("series_short_name", "==", seriesShortName),
      orderBy("sort_by", "asc"),
    );
    expect(query).toHaveBeenCalledWith(
      collection(fakeDb, "cards"),
      where("series_short_name", "==", seriesShortName),
      orderBy("sort_by", "asc"),
    );

    // testing that merge logic still works
    const expected = setJsonMock.map((setItem) => ({
      set: setItem,
      cards: cardListMock.filter((c) => c.set_ids[0] === setItem.id),
    }));
    expect(result).toEqual(expected);
  });
});
