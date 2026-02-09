import { waitFor } from "@testing-library/react";
import { renderHookWithProviders } from "../testUtils";
import { useAllCards } from "@/hooks/useAllCards";
import { makeCard } from "../__mock__/collectionCardMock";
import type { SeriesAndSet } from "@/types/MergedCollection";

vi.mock("@/hooks/useCollection", () => ({
  useSeries: vi.fn(),
}));
vi.mock("@/services/CollectionSetService", () => ({
  fetchSets: vi.fn(),
}));
vi.mock("@/services/JsonCollectionSetService", () => ({
  getJsonSet: vi.fn(),
}));
vi.mock("@/services/Constants", () => ({
  IS_USE_LOCAL_DATA: true,
}));

const { useSeries } = await import("@/hooks/useCollection");
const { getJsonSet } = await import("@/services/JsonCollectionSetService");

afterEach(() => {
  vi.clearAllMocks();
});

describe("useAllCards", () => {
  it("returns empty cards and isLoading true when series haven't loaded", () => {
    vi.mocked(useSeries).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as unknown as ReturnType<typeof useSeries>);

    const { result } = renderHookWithProviders(() => useAllCards());

    expect(result.current.cards).toEqual([]);
    expect(result.current.isLoading).toBe(true);
  });

  it("returns isLoading true when series loaded but card queries still loading", async () => {
    const mockSeries: SeriesAndSet[] = [
      {
        series: { short_name: "ash" } as unknown as SeriesAndSet["series"],
        sets: [],
      },
    ];

    vi.mocked(useSeries).mockReturnValue({
      data: mockSeries,
      isLoading: false,
    } as unknown as ReturnType<typeof useSeries>);

    vi.mocked(getJsonSet).mockImplementation(
      () => new Promise(() => {}), // Never resolves
    );

    const { result } = renderHookWithProviders(() => useAllCards());

    expect(result.current.isLoading).toBe(true);
  });

  it("flattens cards from all series/sets into single array", async () => {
    const card1 = makeCard({ id: "card-1", name: { en: "Card 1" } });
    const card2 = makeCard({ id: "card-2", name: { en: "Card 2" } });
    const card3 = makeCard({ id: "card-3", name: { en: "Card 3" } });

    const mockSeries: SeriesAndSet[] = [
      {
        series: { short_name: "ash" } as unknown as SeriesAndSet["series"],
        sets: [],
      },
      {
        series: { short_name: "wm" } as unknown as SeriesAndSet["series"],
        sets: [],
      },
    ];

    vi.mocked(useSeries).mockReturnValue({
      data: mockSeries,
      isLoading: false,
    } as unknown as ReturnType<typeof useSeries>);

    vi.mocked(getJsonSet).mockImplementation((seriesName: string) => {
      if (seriesName === "ash") {
        return Promise.resolve([
          {
            set: { short_name: "base" } as unknown as SeriesAndSet["sets"][0],
            cards: [card1, card2],
          },
        ]);
      }
      if (seriesName === "wm") {
        return Promise.resolve([
          {
            set: { short_name: "promo" } as unknown as SeriesAndSet["sets"][0],
            cards: [card3],
          },
        ]);
      }
      return Promise.resolve([]);
    });

    const { result } = renderHookWithProviders(() => useAllCards());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.cards).toHaveLength(3);
    expect(result.current.cards.map((c) => c.id)).toEqual([
      "card-1",
      "card-2",
      "card-3",
    ]);
  });

  it("returns isLoading false when all data ready", async () => {
    const card1 = makeCard({ id: "card-1", name: { en: "Card 1" } });

    const mockSeries: SeriesAndSet[] = [
      {
        series: { short_name: "ash" } as unknown as SeriesAndSet["series"],
        sets: [],
      },
    ];

    vi.mocked(useSeries).mockReturnValue({
      data: mockSeries,
      isLoading: false,
    } as unknown as ReturnType<typeof useSeries>);

    vi.mocked(getJsonSet).mockResolvedValue([
      {
        set: { short_name: "base" } as unknown as SeriesAndSet["sets"][0],
        cards: [card1],
      },
    ]);

    const { result } = renderHookWithProviders(() => useAllCards());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.cards).toHaveLength(1);
    expect(result.current.cards[0].id).toBe("card-1");
  });

  it("handles empty series list", () => {
    vi.mocked(useSeries).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof useSeries>);

    const { result } = renderHookWithProviders(() => useAllCards());

    expect(result.current.cards).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });
});
