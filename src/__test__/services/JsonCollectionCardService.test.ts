import { cardListMock } from "@/__test__/__mock__/cardJson.ts";
import { describe, expect, it, vi } from "vitest";

vi.mock("data/wm/cards.json", () => ({
  default: cardListMock,
}));

import { getJsonCardList } from "@/services/JsonCollectionCardService.tsx";

describe("test for getJsonCardList", () => {
  const cards = getJsonCardList("wm", "set1");
  expect(cards.length).toBeGreaterThan(1);
  it("should sort Cards by their sortBy value in ascending order", () => {
    expect(
      cards.every(
        (card, index) => index === 0 || card.sortBy > cards[index - 1].sortBy,
      ),
    ).toBe(true);
  });
});
