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
│       └── 3653472444.json   # Generated mod (Workshop ID)
└── package.json
```

## How It Works

The mod generator:

1. Loads `3653472444.json` as a base template (preserves table layout, tokens, etc.)
2. Removes existing card decks from the template
3. Regenerates all decks fresh from card data
4. Outputs updated mod file

Card images load directly from the Gaichu CDN.

## Getting the Base Template

To get the latest version of the mod file:

1. Subscribe to the [OpenZoo TTS mod](https://steamcommunity.com/sharedfiles/filedetails/?id=3653472444) on Steam Workshop
2. The file will download to: `~/Library/Tabletop Simulator/Mods/Workshop/3653472444.json`
3. Copy it to `tts-mod/output/mods/` before running the build

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

## Utilities

**Card Sleever** - A panel for changing card back images. Place a deck on the panel, enter a URL or use a reference card, and click "Sleeve it!" to apply a uniform card back to all cards.

## Updating the Workshop Mod

1. Copy the latest `3653472444.json` from the Workshop folder (see above)
2. Run `npm run build` to regenerate the mod
3. Copy `output/mods/3653472444.json` to TTS Saves folder:
   - **Mac:** `~/Library/Tabletop Simulator/Saves/`
   - **Windows:** `Documents/My Games/Tabletop Simulator/Saves/`
4. Load in TTS and test
5. Upload to Steam Workshop (Games > Workshop Upload)

**Note:** You must be added as a Contributor on the Steam Workshop to update the mod.
