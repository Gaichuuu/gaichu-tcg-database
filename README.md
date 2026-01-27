# Trading Card Game Database by [Gaichu](https://www.gaichu.com)

This is an open-source trading card database and UI project for homemade, fan-made, and indie TCGs.

See the live project: https://gaichu.com/

<div><br/>
<img src="https://gaichu.b-cdn.net/assets/logo.gif"/>
<br/>
<a href="https://www.gaichu.com">Website</a> | <a href="https://www.youtube.com/@gaichuuu">YouTube</a> | <a href="https://www.instagram.com/gaichuuuu/">Instagram</a> | <a href="https://discord.gg/gTW9brGkQw">Discord</a>
</div><br/>

---

## Features

- **Card Database** - Browse and search cards from multiple TCG series
- **REST API** - Public API for accessing card data ([documentation](./gaichu-api/README.md))
- **Tabletop Simulator Mod** - Play with cards in TTS ([Steam Workshop](https://steamcommunity.com/sharedfiles/filedetails/?id=3653472444))
- **Multi-language Support** - English and Japanese card text
- **Price Tracking** - eBay market prices for select series

## Getting Started

Join the Gaichu family~<br/>
Participate however you want! Run locally, edit the database, make contributions to Gaichu, or build for your own project.

Clone the gaichu-tcg-database repo

```bash
git clone https://github.com/Gaichuuu/gaichu-tcg-database.git
cd gaichu-tcg-database
```

Install dependencies and run

```bash
npm install
npm run dev
```

This uses the local JSON files under `./data` for the database.

---

## Project Structure

| Directory     | Description                                                          |
| ------------- | -------------------------------------------------------------------- |
| `src/`        | React frontend application                                           |
| `data/`       | Card database (JSON files)                                           |
| `gaichu-api/` | REST API ([see README](./gaichu-api/README.md))                      |
| `tts-mod/`    | Tabletop Simulator mod generator ([see README](./tts-mod/README.md)) |

## API

The Gaichu API provides public access to card data. See the [API documentation](./gaichu-api/README.md) for endpoints and usage.

**Base URL:** `https://us-central1-gaichu-fe55f.cloudfunctions.net/api`

```bash
# Example: Get OpenZoo Legacy cards
curl "https://us-central1-gaichu-fe55f.cloudfunctions.net/api/v1/cards?series=oz&set=legacy"
```

## Tabletop Simulator

Play with OpenZoo cards in Tabletop Simulator.

**Steam Workshop:** https://steamcommunity.com/sharedfiles/filedetails/?id=3653472444

See the [TTS mod README](./tts-mod/README.md) for development instructions.

---

## Contributing

There are many ways to get involved~

- Fork the repo and contribute to Gaichu
- Add new TCG series, sets, or cards
- Make improvements to the layout and UI
- Create a [ticket](https://github.com/Gaichuuu/gaichu-tcg-database/issues) for any suggestions or issues
- Chat with us on [Discord](https://discord.gg/gTW9brGkQw)

---

## Development Tools

Feel free to use the same apps and plugins as us~

- Visual Studio Code (VS Code)
- Settings for VS Code can by found under `./.vscode/settings.json`
- Prettier code formatter (VS Code plugin)
- Tailwind CSS IntelliSense (VS Code plugin)

---

## License

This project is licensed under the [MIT License](./LICENSE)
