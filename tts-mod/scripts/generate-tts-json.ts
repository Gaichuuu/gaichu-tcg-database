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
const OUTPUT_DIR = join(__dirname, "..", "output", "saved-objects");

// OpenZoo set IDs
const LEGACY_SET_ID = "0cd30841-399e-4043-ac72-bdf4d268d4b3";
const PROMO25_SET_ID = "a4ad7eb7-9361-44d5-b60a-eac571932d6c";


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
    const costStr = card.cost
      .map((c) => `${c.total} ${c.aura}`)
      .join(" + ");
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
  cardBackUrl: string
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
      posX: 0,
      posY: 1.0,
      posZ: 0,
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

interface TTSSaveFile {
  SaveName: string;
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
  LuaScript: string;
  LuaScriptState: string;
  XmlUI: string;
  ObjectStates: TTSDeck[];
}

function createTTSSaveFile(deck: TTSDeck): TTSSaveFile {
  return {
    SaveName: "",
    Date: "",
    VersionNumber: "",
    GameMode: "",
    GameType: "",
    GameComplexity: "",
    Tags: [],
    Gravity: 0.5,
    PlayArea: 0.5,
    Table: "",
    Sky: "",
    Note: "",
    TabStates: {},
    LuaScript: "",
    LuaScriptState: "",
    XmlUI: "",
    ObjectStates: [deck],
  };
}

interface DeckConfig {
  setId: string;
  shortName: string;
  displayName: string;
}

async function generateDeckJson(
  cards: Card[],
  sets: SetInfo[],
  config: DeckConfig
): Promise<void> {
  const set = sets.find((s) => s.id === config.setId);
  if (!set) {
    throw new Error(`Could not find set with ID: ${config.setId}`);
  }

  const setCards = getCardsBySet(cards, config.setId);

  console.log(`\nGenerating TTS JSON for ${config.displayName}...`);
  console.log(`  Cards: ${setCards.length}`);

  const cardBackUrl = set.card_back.url.replace(/\.jpg(\?.*)?$/, ".png");

  const deck = createTTSDeck(config.displayName, setCards, cardBackUrl);

  const saveFile = createTTSSaveFile(deck);

  const outputPath = join(OUTPUT_DIR, `OpenZoo_${config.displayName.replace(/\s+/g, "_")}.json`);
  await writeFile(outputPath, JSON.stringify(saveFile, null, 2));

  console.log(`  Saved: ${outputPath}`);
}

async function main(): Promise<void> {
  console.log("OpenZoo TTS JSON Generator");
  console.log("==========================\n");

  // Ensure output directory exists
  if (!existsSync(OUTPUT_DIR)) {
    await mkdir(OUTPUT_DIR, { recursive: true });
  }

  // Load data
  const cards = await loadCards();
  const sets = await loadSets();

  console.log(`Loaded ${cards.length} cards`);

  // Generate Legacy deck
  await generateDeckJson(cards, sets, {
    setId: LEGACY_SET_ID,
    shortName: "legacy",
    displayName: "Legacy",
  });

  // Generate Promo 2025 deck
  await generateDeckJson(cards, sets, {
    setId: PROMO25_SET_ID,
    shortName: "promo25",
    displayName: "Promo 2025",
  });

  console.log("\nDone! Copy JSON files to TTS Saved Objects folder to test.");
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
