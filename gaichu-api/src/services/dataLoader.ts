import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import type { Card } from "../types/card.js";
import type { Series } from "../types/series.js";
import type { Set } from "../types/set.js";
import type { Illustrator } from "../types/illustrator.js";
import type { Rarity } from "../types/rarity.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_DIR = join(__dirname, "../../data");

const SERIES_LIST = ["ash", "disgruntled", "mz", "oz", "wm"] as const;

function loadJson<T>(filePath: string): T {
  const content = readFileSync(filePath, "utf-8");
  return JSON.parse(content) as T;
}

let cachedCards: Card[] | null = null;
let cachedSeries: Series[] | null = null;
let cachedSets: Set[] | null = null;
let cachedIllustrators: Illustrator[] | null = null;
let cachedRarity: Rarity[] | null = null;

export function loadAllCards(): Card[] {
  if (cachedCards) return cachedCards;

  const allCards: Card[] = [];
  for (const series of SERIES_LIST) {
    const filePath = join(DATA_DIR, series, "cards.json");
    try {
      const cards = loadJson<Card[]>(filePath);
      allCards.push(...cards);
    } catch (err) {
      console.warn(`Failed to load cards for series ${series}:`, err);
    }
  }
  cachedCards = allCards;
  return allCards;
}

export function loadSeries(): Series[] {
  if (cachedSeries) return cachedSeries;
  cachedSeries = loadJson<Series[]>(join(DATA_DIR, "series.json"));
  return cachedSeries;
}

export function loadSets(): Set[] {
  if (cachedSets) return cachedSets;
  cachedSets = loadJson<Set[]>(join(DATA_DIR, "sets.json"));
  return cachedSets;
}

export function loadIllustrators(): Illustrator[] {
  if (cachedIllustrators) return cachedIllustrators;
  cachedIllustrators = loadJson<Illustrator[]>(
    join(DATA_DIR, "illustrators.json"),
  );
  return cachedIllustrators;
}

export function loadRarity(): Rarity[] {
  if (cachedRarity) return cachedRarity;
  cachedRarity = loadJson<Rarity[]>(join(DATA_DIR, "rarity.json"));
  return cachedRarity;
}
