import { cardListMock } from "@/__test__/__mock__/cardJson.ts";
import { setJsonMock } from "@/__test__/__mock__/setJson.ts";
import { describe, expect, it, vi } from "vitest";

vi.mock("data/wm/cards.json", () => ({
  default: cardListMock,
}));

vi.mock("data/sets.json", () => ({
  default: setJsonMock,
}));

import { getJsonCardList } from "@/services/JsonCollectionCardService.tsx";

describe("test for getJsonCardList", () => {
  const cards = getJsonCardList("wm", "set1");
  expect(cards.length).toBeGreaterThan(1);
  it("should sort Cards by their sortBy value in ascending order", () => {
    expect(
      cards.every(
        (card, index) => index === 0 || card.sort_by > cards[index - 1].sort_by,
      ),
    ).toBe(true);
  });
});
