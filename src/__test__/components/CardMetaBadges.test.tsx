import { screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { renderWithProviders } from "@/__test__/testUtils";
import CardMetaBadges from "@/components/CardDetail/CardMetaBadges";
import type { CollectionCard } from "@/types/CollectionCard";

const card = (over: Partial<CollectionCard>): CollectionCard =>
  ({
    id: "x",
    number: 1,
    sort_by: 1,
    name: { en: "x" },
    set_ids: [],
    sets: [],
    ...over,
  }) as unknown as CollectionCard;

describe("CardMetaBadges", () => {
  it("renders number, variant and rarity even when total_cards_count and sets are absent", () => {
    renderWithProviders(
      <CardMetaBadges
        card={card({ variant: "Holo", rarity: "Rare", number: 31 })}
      />,
    );
    expect(screen.getByText("31")).toBeInTheDocument();
    expect(screen.getByText(/Holo/)).toBeInTheDocument();
    expect(screen.getByText("Rare")).toBeInTheDocument();
  });

  it("renders the N / total badge when total_cards_count is present", () => {
    renderWithProviders(
      <CardMetaBadges
        card={card({ number: 5, total_cards_count: 60, variant: "Normal" })}
      />,
    );
    expect(screen.getByText("5 / 60")).toBeInTheDocument();
  });

  it("renders the set chip when a set is present", () => {
    renderWithProviders(
      <CardMetaBadges
        card={card({
          variant: "Normal",
          sets: [{ name: "Set One", image: "x.jpg" }],
        })}
      />,
    );
    expect(screen.getByText("Set One")).toBeInTheDocument();
  });
});
