import { loadAllCards, loadSeries, loadSets, loadIllustrators } from "./dataLoader.js";

export interface Stats {
  totalCards: number;
  totalSeries: number;
  totalSets: number;
  totalIllustrators: number;
  cardsBySeries: Record<string, number>;
  cardsByRarity: Record<string, number>;
}

export function getStats(): Stats {
  const cards = loadAllCards();
  const series = loadSeries();
  const sets = loadSets();
  const illustrators = loadIllustrators();

  const cardsBySeries: Record<string, number> = {};
  const cardsByRarity: Record<string, number> = {};

  for (const card of cards) {
    cardsBySeries[card.series_short_name] =
      (cardsBySeries[card.series_short_name] || 0) + 1;
    cardsByRarity[card.rarity] = (cardsByRarity[card.rarity] || 0) + 1;
  }

  return {
    totalCards: cards.length,
    totalSeries: series.length,
    totalSets: sets.length,
    totalIllustrators: illustrators.length,
    cardsBySeries,
    cardsByRarity,
  };
}
