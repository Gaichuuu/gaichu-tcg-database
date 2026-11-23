export const OUTAGE_MIN_CARDS = 10;

export function isLikelySourceOutage(
  cardsProcessed: number,
  success: number,
): boolean {
  return cardsProcessed >= OUTAGE_MIN_CARDS && success === 0;
}

export function outageMessage(cardsProcessed: number): string {
  return (
    `Price source outage: 0 of ${cardsProcessed} cards returned eBay sales. ` +
    "The sold-listings API (RapidAPI /search) or the search queries likely broke; no new prices were recorded."
  );
}
