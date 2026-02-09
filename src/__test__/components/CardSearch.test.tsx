import React from "react";
import { screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CardSearch from "@/components/CardSearch";
import { renderWithProviders } from "@/__test__/testUtils";
import { makeCard } from "@/__test__/__mock__/collectionCardMock";
import type { CollectionCard } from "@/types/CollectionCard";

const mockResults: CollectionCard[] = [];
const mockUseCardSearch = vi.fn(() => ({
  results: mockResults,
  isLoading: false,
  debouncedQuery: "",
}));

vi.mock("@/hooks/useCardSearch", () => ({
  useCardSearch: (...args: unknown[]) => mockUseCardSearch(...args),
}));

vi.mock("@/i18n", async () => {
  const actual = await vi.importActual<typeof import("@/i18n")>("@/i18n");
  return {
    ...actual,
    useLocale: () => ({ locale: "en" as const }),
  };
});

describe("CardSearch", () => {
  beforeEach(() => {
    mockUseCardSearch.mockReturnValue({
      results: [],
      isLoading: false,
      debouncedQuery: "",
    });

    Element.prototype.scrollIntoView = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders desktop search input with placeholder", () => {
    renderWithProviders(<CardSearch />);
    const input = screen.getByPlaceholderText("Search cards…");
    expect(input).toBeInTheDocument();
  });

  it('input has role="combobox" and aria-label="Search cards"', () => {
    renderWithProviders(<CardSearch />);
    const inputs = screen.getAllByRole("combobox");
    expect(inputs.length).toBeGreaterThan(0);
    expect(inputs[0]).toHaveAttribute("aria-label", "Search cards");
  });

  it("shows clear button when user types text", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CardSearch />);

    const input = screen.getAllByRole("combobox")[0];
    await user.type(input, "dragon");

    const clearButton = screen.getAllByLabelText("Clear search")[0];
    expect(clearButton).toBeInTheDocument();
  });

  it("hides clear button when input is empty", () => {
    renderWithProviders(<CardSearch />);

    const clearButtons = screen.queryAllByLabelText("Clear search");
    expect(clearButtons).toHaveLength(0);
  });

  it("clear button clears the input", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CardSearch />);

    const input = screen.getAllByRole("combobox")[0] as HTMLInputElement;
    await user.type(input, "dragon");
    expect(input.value).toBe("dragon");

    const clearButton = screen.getAllByLabelText("Clear search")[0];
    await user.click(clearButton);

    expect(input.value).toBe("");
  });

  it("dropdown shows when debouncedQuery has value and results exist", async () => {
    const user = userEvent.setup();

    const mockCards = [
      makeCard({ id: "1", name: { en: "Fire Dragon" }, sort_by: 1 }),
    ];

    mockUseCardSearch.mockImplementation((query: string) => ({
      results: query ? mockCards : [],
      isLoading: false,
      debouncedQuery: query || "",
    }));

    renderWithProviders(<CardSearch />);

    const input = screen.getAllByRole("combobox")[0];
    expect(screen.queryByText("Fire Dragon")).not.toBeInTheDocument();

    await user.type(input, "fire");

    expect(screen.getByText("Fire Dragon")).toBeInTheDocument();
  });

  it("input updates as user types", async () => {
    const user = userEvent.setup();

    mockUseCardSearch.mockImplementation((query: string) => ({
      results: [],
      isLoading: false,
      debouncedQuery: query || "",
    }));

    renderWithProviders(<CardSearch />);

    const input = screen.getAllByRole("combobox")[0] as HTMLInputElement;
    expect(input.value).toBe("");

    await user.type(input, "fire");
    expect(input.value).toBe("fire");
  });

  it("shows result items when results are present", async () => {
    const user = userEvent.setup();

    const mockCards = [
      makeCard({ id: "1", name: { en: "Fire Dragon" }, sort_by: 1 }),
      makeCard({ id: "2", name: { en: "Thunder Mouse" }, sort_by: 2 }),
    ];

    mockUseCardSearch.mockImplementation((query: string) => ({
      results: query ? mockCards : [],
      isLoading: false,
      debouncedQuery: query || "",
    }));

    renderWithProviders(<CardSearch />);

    const input = screen.getAllByRole("combobox")[0];
    await user.type(input, "dragon");

    expect(screen.getByText("Fire Dragon")).toBeInTheDocument();
    expect(screen.getByText("Thunder Mouse")).toBeInTheDocument();
  });

  it("result items display card name", async () => {
    const user = userEvent.setup();

    const mockCards = [
      makeCard({
        id: "1",
        name: { en: "Fire Dragon" },
        series_short_name: "ash",
        set_short_name: "base",
        sort_by: 1,
      }),
    ];

    mockUseCardSearch.mockImplementation((query: string) => ({
      results: query ? mockCards : [],
      isLoading: false,
      debouncedQuery: query || "",
    }));

    renderWithProviders(<CardSearch />);

    const input = screen.getAllByRole("combobox")[0];
    await user.type(input, "fire");

    expect(screen.getByText("Fire Dragon")).toBeInTheDocument();
    expect(screen.getByText(/ash · base/i)).toBeInTheDocument();
  });

  it("ArrowDown/ArrowUp keyboard navigation changes active item", async () => {
    const user = userEvent.setup();

    const mockCards = [
      makeCard({ id: "1", name: { en: "Card One" }, sort_by: 1 }),
      makeCard({ id: "2", name: { en: "Card Two" }, sort_by: 2 }),
      makeCard({ id: "3", name: { en: "Card Three" }, sort_by: 3 }),
    ];

    mockUseCardSearch.mockImplementation((query: string) => ({
      results: query ? mockCards : [],
      isLoading: false,
      debouncedQuery: query || "",
    }));

    renderWithProviders(<CardSearch />);

    const input = screen.getAllByRole("combobox")[0];
    await user.type(input, "card");

    fireEvent.keyDown(input, { key: "ArrowDown" });
    const firstItem = screen.getByText("Card One").closest('[role="option"]');
    expect(firstItem).toHaveAttribute("aria-selected", "true");

    fireEvent.keyDown(input, { key: "ArrowDown" });
    const secondItem = screen.getByText("Card Two").closest('[role="option"]');
    expect(secondItem).toHaveAttribute("aria-selected", "true");

    fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(firstItem).toHaveAttribute("aria-selected", "true");
  });

  it("Escape key closes dropdown", async () => {
    const user = userEvent.setup();

    const mockCards = [
      makeCard({ id: "1", name: { en: "Fire Dragon" }, sort_by: 1 }),
    ];

    mockUseCardSearch.mockImplementation((query: string) => ({
      results: query ? mockCards : [],
      isLoading: false,
      debouncedQuery: query || "",
    }));

    renderWithProviders(<CardSearch />);

    const input = screen.getAllByRole("combobox")[0];
    await user.type(input, "fire");

    expect(screen.getByText("Fire Dragon")).toBeInTheDocument();

    fireEvent.keyDown(input, { key: "Escape" });

    expect(screen.queryByText("Fire Dragon")).not.toBeInTheDocument();
  });

  it("mobile search pill button is in the DOM", () => {
    renderWithProviders(<CardSearch />);
    const mobileButton = screen.getByLabelText("Open search");
    expect(mobileButton).toBeInTheDocument();
  });
});
