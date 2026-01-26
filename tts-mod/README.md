# OpenZoo TTS Mod

This is the Tabletop Simulator mod generator used for OpenZoo.

**Steam Workshop:** https://steamcommunity.com/sharedfiles/filedetails/?id=3653472444

## Quick Start

```bash
cd tts-mod
npm install
npm run build
```

## Scripts

| Command         | Description                    |
| --------------- | ------------------------------ |
| `npm run build` | Regenerate the full mod        |
| `npm run mod`   | Same as build                  |
| `npm run json`  | Generate individual deck files |

## Project Structure

```
tts-mod/
├── scripts/
│   ├── build.ts           # Build orchestrator
│   ├── generate-mod.ts    # Full mod generator
│   ├── generate-tts-json.ts # Individual deck generator
│   └── types.ts           # TypeScript types
├── data/                  # MetaZoo card lists (CN2, Nightfall, etc.)
├── output/
│   └── mods/
│       └── OpenZoo_Mod.json  # Generated mod (also used as template)
└── package.json
```

## How It Works

The mod generator:

1. Loads `OpenZoo_Mod.json` as a base template (preserves table layout, tokens, etc.)
2. Removes existing card decks from the template
3. Regenerates all decks fresh from card data
4. Outputs updated mod file

Card images load directly from the Gaichu CDN.

## Included Decks

**OpenZoo (community cards):**

- Legacy (36 cards)
- Promo 2025 (3 cards)

**MetaZoo:**

- Cryptid Nation 2nd Edition (189 cards)
- Nightfall (193 cards)
- Wilderness (200 cards)
- UFO (193 cards)
- Seance (230 cards)

## Updating the Workshop Mod

1. Run `npm run build` to regenerate the mod
2. Copy `output/mods/OpenZoo_Mod.json` to TTS Saves folder:
   - **Mac:** `~/Library/Tabletop Simulator/Saves/`
   - **Windows:** `Documents/My Games/Tabletop Simulator/Saves/`
3. Load in TTS and test
4. Upload to Steam Workshop (Games > Workshop Upload)

Note: If you want to make updates to the existing Workshop file, contact us and you'll be added as a Contributor.
