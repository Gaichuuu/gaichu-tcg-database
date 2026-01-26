import { readFile, mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type {
  Card,
  SetInfo,
  TTSDeck,
  TTSCard,
  CustomDeckConfig,
} from "./types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = join(__dirname, "..", "..");
const OUTPUT_DIR = join(__dirname, "..", "output", "mods");
const TEMPLATE_PATH = join(OUTPUT_DIR, "OpenZoo_Mod.json");

// OpenZoo set IDs
const LEGACY_SET_ID = "0cd30841-399e-4043-ac72-bdf4d268d4b3";
const PROMO25_SET_ID = "a4ad7eb7-9361-44d5-b60a-eac571932d6c";

// MetaZoo card back URL
const METAZOO_CARD_BACK_URL =
  "https://gaichu.b-cdn.net/mz/sample/MZ_Card_Back.jpg";

// Simple card type for CDN-based cards (MetaZoo sets)
interface SimpleCard {
  filename: string;
  name: string;
  image: string;
  number?: number;
  sort_by: number;
}

// Deck nicknames to regenerate (these will be removed and recreated fresh)
const DECK_NICKNAMES_TO_REGENERATE = [
  "OpenZoo Legacy",
  "OpenZoo Promo 2025",
  "MetaZoo Cryptid Nation 2nd Edition",
  "MetaZoo Nightfall",
  "MetaZoo Wilderness",
  "MetaZoo UFO",
  "MetaZoo Seance",
];

interface TTSObject {
  GUID: string;
  Name: string;
  Nickname?: string;
  Description?: string;
  Transform: {
    posX: number;
    posY: number;
    posZ: number;
    rotX: number;
    rotY: number;
    rotZ: number;
    scaleX: number;
    scaleY: number;
    scaleZ: number;
  };
  ContainedObjects?: TTSObject[];
  [key: string]: unknown;
}

interface TTSModFile {
  SaveName: string;
  EpochTime?: number;
  Date: string;
  VersionNumber: string;
  GameMode: string;
  GameType: string;
  GameComplexity: string;
  Tags: string[];
  Gravity: number;
  PlayArea: number;
  Table: string;
  Sky: string;
  Note: string;
  TabStates: Record<string, unknown>;
  Grid?: Record<string, unknown>;
  Lighting?: Record<string, unknown>;
  Hands?: Record<string, unknown>;
  ComponentTags?: Record<string, unknown>;
  Turns?: Record<string, unknown>;
  CameraStates?: unknown[];
  DecalPallet?: unknown[];
  LuaScript: string;
  LuaScriptState: string;
  XmlUI: string;
  ObjectStates: TTSObject[];
}

async function loadTemplate(): Promise<TTSModFile> {
  const content = await readFile(TEMPLATE_PATH, "utf-8");
  return JSON.parse(content) as TTSModFile;
}

async function loadCards(): Promise<Card[]> {
  const cardsPath = join(ROOT_DIR, "data", "oz", "cards.json");
  const content = await readFile(cardsPath, "utf-8");
  return JSON.parse(content) as Card[];
}

async function loadSets(): Promise<SetInfo[]> {
  const setsPath = join(ROOT_DIR, "data", "sets.json");
  const content = await readFile(setsPath, "utf-8");
  return JSON.parse(content) as SetInfo[];
}

async function loadCN2Cards(): Promise<SimpleCard[]> {
  const cardsPath = join(__dirname, "..", "data", "cn2-cards.json");
  const content = await readFile(cardsPath, "utf-8");
  return JSON.parse(content) as SimpleCard[];
}

async function loadNFCards(): Promise<SimpleCard[]> {
  const cardsPath = join(__dirname, "..", "data", "nf-cards.json");
  const content = await readFile(cardsPath, "utf-8");
  return JSON.parse(content) as SimpleCard[];
}

async function loadWNCards(): Promise<SimpleCard[]> {
  const cardsPath = join(__dirname, "..", "data", "wn-cards.json");
  const content = await readFile(cardsPath, "utf-8");
  return JSON.parse(content) as SimpleCard[];
}

async function loadUFOCards(): Promise<SimpleCard[]> {
  const cardsPath = join(__dirname, "..", "data", "ufo-cards.json");
  const content = await readFile(cardsPath, "utf-8");
  return JSON.parse(content) as SimpleCard[];
}

async function loadSeanceCards(): Promise<SimpleCard[]> {
  const cardsPath = join(__dirname, "..", "data", "seance-cards.json");
  const content = await readFile(cardsPath, "utf-8");
  return JSON.parse(content) as SimpleCard[];
}

function getCardsBySet(cards: Card[], setId: string): Card[] {
  return cards
    .filter((card) => card.set_ids.includes(setId))
    .sort((a, b) => a.sort_by - b.sort_by);
}

function generateGuid(): string {
  return Math.random().toString(16).substring(2, 8);
}

function formatIconSyntax(text: string): string {
  return text.replace(/\{icon:([^}]+)\}/g, (_, iconName: string) => {
    return iconName
      .split(/[_\s]+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  });
}

function buildCardDescription(card: Card): string {
  const parts: string[] = [];

  if (card.type) {
    parts.push(`Type: ${card.type}`);
  }

  if (card.lp) {
    parts.push(`LP: ${card.lp}`);
  }

  if (card.traits && card.traits.length > 0) {
    parts.push(`Traits: ${card.traits.join(", ")}`);
  }

  if (card.cost && card.cost.length > 0) {
    const costStr = card.cost.map((c) => `${c.total} ${c.aura}`).join(" + ");
    parts.push(`Cost: ${costStr}`);
  }

  if (card.terra && card.terra.length > 0) {
    const terraStr = card.terra
      .map((t) => {
        const bonuses: string[] = [];
        if (t.attack) bonuses.push(t.attack);
        if (t.lp) bonuses.push(t.lp);
        return `${t.icon}: ${bonuses.join(", ") || "—"}`;
      })
      .join(" | ");
    parts.push(`Terra: ${terraStr}`);
  }

  if (card.effect) {
    parts.push("");
    parts.push(formatIconSyntax(card.effect));
  }

  if (card.zoo_attack && card.zoo_attack.length > 0) {
    parts.push("");
    for (const attack of card.zoo_attack) {
      let attackLine = `[${attack.name}]`;
      if (attack.damage) {
        attackLine += ` ${attack.damage} DMG`;
      }
      if (attack.status && attack.status.length > 0) {
        attackLine += ` (${attack.status.join(", ")})`;
      }
      parts.push(attackLine);
      if (attack.effect) {
        parts.push(`  ${formatIconSyntax(attack.effect)}`);
      }
    }
  }

  if (card.description) {
    parts.push("");
    parts.push("---");
    parts.push(card.description);
  }

  return parts.join("\n");
}

function createTTSCard(
  card: Card,
  index: number,
  cardBackUrl: string
): TTSCard {
  const deckId = index + 1;
  const cardId = deckId * 100;
  const cardImageUrl = card.image.replace(/\.jpg(\?.*)?$/, ".png");

  const customDeck: Record<string, CustomDeckConfig> = {
    [deckId.toString()]: {
      FaceURL: cardImageUrl,
      BackURL: cardBackUrl,
      NumWidth: 1,
      NumHeight: 1,
      BackIsHidden: true,
      UniqueBack: false,
      Type: 0,
    },
  };

  return {
    GUID: generateGuid(),
    Name: "Card",
    Transform: {
      posX: 0,
      posY: 0,
      posZ: 0,
      rotX: 0,
      rotY: 180.0,
      rotZ: 180.0,
      scaleX: 1.0,
      scaleY: 1.0,
      scaleZ: 1.0,
    },
    Nickname: card.name,
    Description: buildCardDescription(card),
    GMNotes: "",
    ColorDiffuse: { r: 0.713235259, g: 0.713235259, b: 0.713235259 },
    LayoutGroupSortIndex: 0,
    Value: 0,
    Locked: false,
    Grid: true,
    Snap: true,
    IgnoreFoW: false,
    MeasureMovement: false,
    DragSelectable: true,
    Autoraise: true,
    Sticky: true,
    Tooltip: true,
    GridProjection: false,
    HideWhenFaceDown: true,
    Hands: true,
    CardID: cardId,
    SidewaysCard: false,
    CustomDeck: customDeck,
    LuaScript: "",
    LuaScriptState: "",
    XmlUI: "",
  };
}

function createTTSDeck(
  setName: string,
  cards: Card[],
  cardBackUrl: string,
  position: { x: number; y: number; z: number }
): TTSDeck {
  const containedObjects = cards.map((card, index) =>
    createTTSCard(card, index, cardBackUrl)
  );

  const customDeck: Record<string, CustomDeckConfig> = {};
  for (const cardObj of containedObjects) {
    Object.assign(customDeck, cardObj.CustomDeck);
  }

  const deckIds = cards.map((_, index) => (index + 1) * 100);

  return {
    GUID: generateGuid(),
    Name: "Deck",
    Transform: {
      posX: position.x,
      posY: position.y,
      posZ: position.z,
      rotX: 0,
      rotY: 180.0,
      rotZ: 180.0,
      scaleX: 1.0,
      scaleY: 1.0,
      scaleZ: 1.0,
    },
    Nickname: `OpenZoo ${setName}`,
    Description: `${cards.length} community-made cards compatible with MetaZoo`,
    GMNotes: "",
    ColorDiffuse: { r: 0.713235259, g: 0.713235259, b: 0.713235259 },
    LayoutGroupSortIndex: 0,
    Value: 0,
    Locked: false,
    Grid: true,
    Snap: true,
    IgnoreFoW: false,
    MeasureMovement: false,
    DragSelectable: true,
    Autoraise: true,
    Sticky: true,
    Tooltip: true,
    GridProjection: false,
    HideWhenFaceDown: true,
    Hands: false,
    SidewaysCard: false,
    DeckIDs: deckIds,
    CustomDeck: customDeck,
    ContainedObjects: containedObjects,
    LuaScript: "",
    LuaScriptState: "",
    XmlUI: "",
  };
}

// Create a simple TTS card for CDN-based cards (no detailed metadata)
function createSimpleTTSCard(
  card: SimpleCard,
  index: number,
  cardBackUrl: string
): TTSCard {
  const deckId = index + 1;
  const cardId = deckId * 100;

  const customDeck: Record<string, CustomDeckConfig> = {
    [deckId.toString()]: {
      FaceURL: card.image,
      BackURL: cardBackUrl,
      NumWidth: 1,
      NumHeight: 1,
      BackIsHidden: true,
      UniqueBack: false,
      Type: 0,
    },
  };

  return {
    GUID: generateGuid(),
    Name: "Card",
    Transform: {
      posX: 0,
      posY: 0,
      posZ: 0,
      rotX: 0,
      rotY: 180.0,
      rotZ: 180.0,
      scaleX: 1.0,
      scaleY: 1.0,
      scaleZ: 1.0,
    },
    Nickname: card.name,
    Description: card.number ? `#${card.number}` : "",
    GMNotes: "",
    ColorDiffuse: { r: 0.713235259, g: 0.713235259, b: 0.713235259 },
    LayoutGroupSortIndex: 0,
    Value: 0,
    Locked: false,
    Grid: true,
    Snap: true,
    IgnoreFoW: false,
    MeasureMovement: false,
    DragSelectable: true,
    Autoraise: true,
    Sticky: true,
    Tooltip: true,
    GridProjection: false,
    HideWhenFaceDown: true,
    Hands: true,
    CardID: cardId,
    SidewaysCard: false,
    CustomDeck: customDeck,
    LuaScript: "",
    LuaScriptState: "",
    XmlUI: "",
  };
}

function createSimpleTTSDeck(
  deckName: string,
  description: string,
  cards: SimpleCard[],
  cardBackUrl: string,
  position: { x: number; y: number; z: number }
): TTSDeck {
  const containedObjects = cards.map((card, index) =>
    createSimpleTTSCard(card, index, cardBackUrl)
  );

  const customDeck: Record<string, CustomDeckConfig> = {};
  for (const cardObj of containedObjects) {
    Object.assign(customDeck, cardObj.CustomDeck);
  }

  const deckIds = cards.map((_, index) => (index + 1) * 100);

  return {
    GUID: generateGuid(),
    Name: "Deck",
    Transform: {
      posX: position.x,
      posY: position.y,
      posZ: position.z,
      rotX: 0,
      rotY: 180.0,
      rotZ: 180.0,
      scaleX: 1.0,
      scaleY: 1.0,
      scaleZ: 1.0,
    },
    Nickname: deckName,
    Description: description,
    GMNotes: "",
    ColorDiffuse: { r: 0.713235259, g: 0.713235259, b: 0.713235259 },
    LayoutGroupSortIndex: 0,
    Value: 0,
    Locked: false,
    Grid: true,
    Snap: true,
    IgnoreFoW: false,
    MeasureMovement: false,
    DragSelectable: true,
    Autoraise: true,
    Sticky: true,
    Tooltip: true,
    GridProjection: false,
    HideWhenFaceDown: true,
    Hands: false,
    SidewaysCard: false,
    DeckIDs: deckIds,
    CustomDeck: customDeck,
    ContainedObjects: containedObjects,
    LuaScript: "",
    LuaScriptState: "",
    XmlUI: "",
  };
}

// Check if object is a deck that should be regenerated
function isDeckToRegenerate(obj: TTSObject): boolean {
  if (obj.Name !== "Deck") return false;
  return DECK_NICKNAMES_TO_REGENERATE.includes(obj.Nickname ?? "");
}

// Filter out decks that will be regenerated fresh
function filterObjects(objects: TTSObject[]): TTSObject[] {
  return objects.filter((obj) => !isDeckToRegenerate(obj));
}

async function main(): Promise<void> {
  console.log("OpenZoo TTS Mod Generator");
  console.log("=========================\n");

  // Ensure output directory exists
  if (!existsSync(OUTPUT_DIR)) {
    await mkdir(OUTPUT_DIR, { recursive: true });
  }

  // Load template (uses existing mod as base)
  console.log("Loading base mod...");
  const template = await loadTemplate();

  // Remove existing card decks (they will be regenerated fresh)
  const filteredObjects = filterObjects(template.ObjectStates);
  const deckCount = template.ObjectStates.length - filteredObjects.length;
  console.log(`  Base objects: ${filteredObjects.length}`);
  console.log(`  Decks to regenerate: ${deckCount}`);

  // Load card data
  const cards = await loadCards();
  const sets = await loadSets();
  const cn2Cards = await loadCN2Cards();
  const nfCards = await loadNFCards();
  const wnCards = await loadWNCards();
  const ufoCards = await loadUFOCards();
  const seanceCards = await loadSeanceCards();
  console.log(`\nLoaded ${cards.length} OpenZoo cards`);
  console.log(`Loaded ${cn2Cards.length} MetaZoo CN2 cards`);
  console.log(`Loaded ${nfCards.length} MetaZoo Nightfall cards`);
  console.log(`Loaded ${wnCards.length} MetaZoo Wilderness cards`);
  console.log(`Loaded ${ufoCards.length} MetaZoo UFO cards`);
  console.log(`Loaded ${seanceCards.length} MetaZoo Seance cards`);

  // Create OpenZoo decks
  const legacySet = sets.find((s) => s.id === LEGACY_SET_ID);
  const promo25Set = sets.find((s) => s.id === PROMO25_SET_ID);

  if (!legacySet || !promo25Set) {
    throw new Error("Could not find OpenZoo sets");
  }

  const legacyCards = getCardsBySet(cards, LEGACY_SET_ID);
  const promo25Cards = getCardsBySet(cards, PROMO25_SET_ID);

  console.log(`\nCreating decks:`);
  console.log(`  OpenZoo Legacy: ${legacyCards.length} cards`);
  console.log(`  OpenZoo Promo 2025: ${promo25Cards.length} cards`);
  console.log(`  MetaZoo CN2: ${cn2Cards.length} cards`);
  console.log(`  MetaZoo Nightfall: ${nfCards.length} cards`);
  console.log(`  MetaZoo Wilderness: ${wnCards.length} cards`);
  console.log(`  MetaZoo UFO: ${ufoCards.length} cards`);
  console.log(`  MetaZoo Seance: ${seanceCards.length} cards`);

  // Create deck objects positioned on the table
  const legacyDeck = createTTSDeck(
    "Legacy",
    legacyCards,
    legacySet.card_back.url.replace(/\.jpg(\?.*)?$/, ".png"),
    { x: 0, y: 1.5, z: 0 } // Center of table
  );

  const promo25Deck = createTTSDeck(
    "Promo 2025",
    promo25Cards,
    promo25Set.card_back.url.replace(/\.jpg(\?.*)?$/, ".png"),
    { x: 5, y: 1.5, z: 0 } // Offset to the right
  );

  // Create MetaZoo CN2 deck
  const cn2Deck = createSimpleTTSDeck(
    "MetaZoo Cryptid Nation 2nd Edition",
    `${cn2Cards.length} cards from Cryptid Nation 2nd Edition`,
    cn2Cards,
    METAZOO_CARD_BACK_URL,
    { x: -5, y: 1.5, z: 0 } // Offset to the left
  );

  // Create MetaZoo Nightfall deck
  const nfDeck = createSimpleTTSDeck(
    "MetaZoo Nightfall",
    `${nfCards.length} cards from Nightfall`,
    nfCards,
    METAZOO_CARD_BACK_URL,
    { x: -10, y: 1.5, z: 0 } // Further left
  );

  // Create MetaZoo Wilderness deck
  const wnDeck = createSimpleTTSDeck(
    "MetaZoo Wilderness",
    `${wnCards.length} cards from Wilderness`,
    wnCards,
    METAZOO_CARD_BACK_URL,
    { x: -15, y: 1.5, z: 0 } // Even further left
  );

  // Create MetaZoo UFO deck
  const ufoDeck = createSimpleTTSDeck(
    "MetaZoo UFO",
    `${ufoCards.length} cards from UFO`,
    ufoCards,
    METAZOO_CARD_BACK_URL,
    { x: -20, y: 1.5, z: 0 }
  );

  // Create MetaZoo Seance deck
  const seanceDeck = createSimpleTTSDeck(
    "MetaZoo Seance",
    `${seanceCards.length} cards from Seance`,
    seanceCards,
    METAZOO_CARD_BACK_URL,
    { x: -25, y: 1.5, z: 0 }
  );

  // Build final mod
  const mod: TTSModFile = {
    ...template,
    SaveName: "OpenZoo PlayTesting and Deckbuilding Table",
    VersionNumber: "v1.0.0",
    Date: new Date().toLocaleString(),
    EpochTime: Math.floor(Date.now() / 1000),
    ObjectStates: [
      ...filteredObjects,
      legacyDeck as unknown as TTSObject,
      promo25Deck as unknown as TTSObject,
      cn2Deck as unknown as TTSObject,
      nfDeck as unknown as TTSObject,
      wnDeck as unknown as TTSObject,
      ufoDeck as unknown as TTSObject,
      seanceDeck as unknown as TTSObject,
    ],
  };

  // Write output
  const outputPath = join(OUTPUT_DIR, "OpenZoo_Mod.json");
  await writeFile(outputPath, JSON.stringify(mod, null, 2));

  console.log(`\nMod generated successfully!`);
  console.log(`  Output: ${outputPath}`);
  console.log(`  Total objects: ${mod.ObjectStates.length}`);

  console.log("\nNext steps:");
  console.log("  1. Copy to TTS Saves folder:");
  console.log("     - Mac: ~/Library/Tabletop Simulator/Saves/");
  console.log("     - Windows: Documents/My Games/Tabletop Simulator/Saves/");
  console.log("  2. Launch TTS and load from Games > Save & Load");
  console.log("  3. Test the mod, then publish to Steam Workshop");
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
