import { act } from "@testing-library/react";
import { renderHookWithProviders } from "../testUtils";
import { useCardSearch } from "@/hooks/useCardSearch";
import { makeCard } from "../__mock__/collectionCardMock";

vi.mock("@/hooks/useAllCards", () => ({
  useAllCards: vi.fn(() => ({ cards: [], isLoading: false })),
}));

const { useAllCards } = await import("@/hooks/useAllCards");

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe("useCardSearch", () => {
  it("returns empty results when query is empty string", () => {
    vi.mocked(useAllCards).mockReturnValue({
      cards: [makeCard({ name: { en: "Test Card" } })],
      isLoading: false,
    });

    const { result } = renderHookWithProviders(() => useCardSearch(""));

    expect(result.current.results).toEqual([]);
  });

  it("returns empty results for whitespace-only query", () => {
    vi.mocked(useAllCards).mockReturnValue({
      cards: [makeCard({ name: { en: "Test Card" } })],
      isLoading: false,
    });

    const { result } = renderHookWithProviders(() => useCardSearch("   "));

    act(() => {
      vi.advanceTimersByTime(250);
    });

    expect(result.current.results).toEqual([]);
  });

  it("debounces input by 250ms", () => {
    const testCard = makeCard({ name: { en: "Fire Dragon" } });
    vi.mocked(useAllCards).mockReturnValue({
      cards: [testCard],
      isLoading: false,
    });

    let query = "";
    const { result, rerender } = renderHookWithProviders(() =>
      useCardSearch(query),
    );

    expect(result.current.debouncedQuery).toBe("");
    expect(result.current.results).toEqual([]);

    query = "Fire";
    rerender();

    expect(result.current.debouncedQuery).toBe("");

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current.debouncedQuery).toBe("");

    act(() => {
      vi.advanceTimersByTime(150);
    });

    expect(result.current.debouncedQuery).toBe("Fire");
    expect(result.current.results.length).toBe(1);
    expect(result.current.results[0].name.en).toBe("Fire Dragon");
  });

  it("returns matching cards", () => {
    const card1 = makeCard({ name: { en: "Fire Dragon" } });
    const card2 = makeCard({ name: { en: "Water Turtle" } });
    vi.mocked(useAllCards).mockReturnValue({
      cards: [card1, card2],
      isLoading: false,
    });

    const { result } = renderHookWithProviders(() => useCardSearch("Dragon"));

    act(() => {
      vi.advanceTimersByTime(250);
    });

    expect(result.current.results.length).toBe(1);
    expect(result.current.results[0].name.en).toBe("Fire Dragon");
  });

  it("performs multi-word AND matching", () => {
    const card1 = makeCard({
      name: { en: "Fire Dragon" },
      type: "fire",
    });
    const card2 = makeCard({
      name: { en: "Water Dragon" },
      type: "water",
    });
    const card3 = makeCard({
      name: { en: "Fire Bird" },
      type: "fire",
    });
    vi.mocked(useAllCards).mockReturnValue({
      cards: [card1, card2, card3],
      isLoading: false,
    });

    const { result } = renderHookWithProviders(() =>
      useCardSearch("fire dragon"),
    );

    act(() => {
      vi.advanceTimersByTime(250);
    });

    expect(result.current.results.length).toBe(1);
    expect(result.current.results[0].name.en).toBe("Fire Dragon");
  });

  it("performs case-insensitive matching", () => {
    const testCard = makeCard({ name: { en: "Fire Dragon" } });
    vi.mocked(useAllCards).mockReturnValue({
      cards: [testCard],
      isLoading: false,
    });

    const { result } = renderHookWithProviders(() =>
      useCardSearch("FIRE dragon"),
    );

    act(() => {
      vi.advanceTimersByTime(250);
    });

    expect(result.current.results.length).toBe(1);
    expect(result.current.results[0].name.en).toBe("Fire Dragon");
  });

  it("limits results to MAX_RESULTS", () => {
    const cards = Array.from({ length: 30 }, (_, i) =>
      makeCard({
        id: `card-${i}`,
        name: { en: `Fire Card ${i}` },
        type: "fire",
      }),
    );
    vi.mocked(useAllCards).mockReturnValue({
      cards,
      isLoading: false,
    });

    const { result } = renderHookWithProviders(() => useCardSearch("fire"));

    act(() => {
      vi.advanceTimersByTime(250);
    });

    expect(result.current.results.length).toBe(20);
  });

  it("returns isLoading from useAllCards", () => {
    vi.mocked(useAllCards).mockReturnValue({
      cards: [],
      isLoading: true,
    });

    const { result } = renderHookWithProviders(() => useCardSearch("test"));

    expect(result.current.isLoading).toBe(true);
  });

  it("returns debouncedQuery reflecting debounced value", () => {
    vi.mocked(useAllCards).mockReturnValue({
      cards: [],
      isLoading: false,
    });

    let query = "";
    const { result, rerender } = renderHookWithProviders(() =>
      useCardSearch(query),
    );

    expect(result.current.debouncedQuery).toBe("");

    query = "dragon";
    rerender();

    expect(result.current.debouncedQuery).toBe("");

    act(() => {
      vi.advanceTimersByTime(250);
    });

    expect(result.current.debouncedQuery).toBe("dragon");
  });

  it("returns empty when no cards match query", () => {
    const card1 = makeCard({ name: { en: "Fire Dragon" } });
    const card2 = makeCard({ name: { en: "Water Turtle" } });
    vi.mocked(useAllCards).mockReturnValue({
      cards: [card1, card2],
      isLoading: false,
    });

    const { result } = renderHookWithProviders(() =>
      useCardSearch("Pikachu"),
    );

    act(() => {
      vi.advanceTimersByTime(250);
    });

    expect(result.current.results).toEqual([]);
  });
});
