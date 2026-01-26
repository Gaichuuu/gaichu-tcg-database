# Gaichu API

REST API for the Gaichu TCG Database.

**Base URL:** `https://us-central1-gaichu-fe55f.cloudfunctions.net/api`

## Quick Start

```bash
# Get all cards from OpenZoo Legacy set
curl "https://us-central1-gaichu-fe55f.cloudfunctions.net/api/v1/cards?series=oz&set=legacy"

# Search cards by name
curl "https://us-central1-gaichu-fe55f.cloudfunctions.net/api/v1/cards/search?q=dragon"

# Get database statistics
curl "https://us-central1-gaichu-fe55f.cloudfunctions.net/api/v1/stats"
```

## Endpoints

### Cards

| Endpoint                  | Description                              |
| ------------------------- | ---------------------------------------- |
| `GET /v1/cards`           | List cards with filtering and pagination |
| `GET /v1/cards/:id`       | Get single card by ID                    |
| `GET /v1/cards/search?q=` | Search cards by name/description/effect  |

**Query Parameters for `/v1/cards`:**

- `series` - Filter by series (e.g., `ash`, `disgruntled`, `mz`, `oz`, `wm`)
- `set` - Filter by set short name
- `rarity` - Filter by rarity
- `type` - Filter by card type
- `illustrator` - Filter by illustrator ID
- `name` - Filter by name (partial match)
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 50, max: 100)

### Series

| Endpoint                          | Description           |
| --------------------------------- | --------------------- |
| `GET /v1/series`                  | List all series       |
| `GET /v1/series/:shortName`       | Get single series     |
| `GET /v1/series/:shortName/sets`  | Get sets in a series  |
| `GET /v1/series/:shortName/cards` | Get cards in a series |

### Sets

| Endpoint                 | Description        |
| ------------------------ | ------------------ |
| `GET /v1/sets`           | List all sets      |
| `GET /v1/sets/:id`       | Get single set     |
| `GET /v1/sets/:id/cards` | Get cards in a set |

### Other

| Endpoint                         | Description              |
| -------------------------------- | ------------------------ |
| `GET /v1/illustrators`           | List all illustrators    |
| `GET /v1/illustrators/:id/cards` | Get cards by illustrator |
| `GET /v1/rarity`                 | List rarity types        |
| `GET /v1/stats`                  | Database statistics      |

## Response Format

All responses follow this structure:

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "totalPages": 3
  }
}
```

Single resource responses:

```json
{
  "data": { ... }
}
```

## Multi-language Support

WrennyMoo cards include Japanese translations. Text fields use a localized object format:

```json
{
  "name": { "en": "Skipper", "ja": "スキッパー" },
  "description": { "en": "This Pokémon spends most of its time hiding in the mud.", "ja": "このポケモンは、ほとんどの時間を泥の中に隠れて過ごしています。" }
}
```

Localized fields: `name`, `description`, attack `name`, attack `effect`.

## Price Data

Average sold prices from eBay are available for select series:

| Series | Price Data |
| ------ | ---------- |
| `wm`   | Yes        |
| `ash`  | Yes        |
| `oz`   | No         |
| `mz`   | No         |

Cards with price data include an `average_price` field (USD).

## Rate Limiting

The API is rate limited. If you exceed the limit, you'll receive a `429 Too Many Requests` response.

## Available Series

| Short Name    | Series            |
| ------------- | ----------------- |
| `ash`         | After Skool Hobby |
| `disgruntled` | Disgruntled Games |
| `mz`          | MetaZoo           |
| `oz`          | OpenZoo           |
| `wm`          | WrennyMoo         |

## Development

### Setup

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login to Firebase: `firebase login`
3. Install dependencies: `npm install`

### Local Development

```bash
npm run serve
# Test at: http://localhost:5001/gaichu-fe55f/us-central1/api/v1/cards
```

### Deploy

```bash
npm run build
npm run deploy
npm run deploy:staging
```

### Project Structure

```
gaichu-api/
├── src/
│   ├── index.ts          # Express app exported as Cloud Function
│   ├── config/           # CORS configuration
│   ├── functions/        # Firebase Cloud Functions (price sync)
│   ├── middleware/       # Error handling, rate limiting, cache headers
│   ├── routes/           # API route handlers
│   ├── services/         # Data access layer
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Response formatters, pagination, query parsing
├── data/                 # Card data (copied from main project during build)
└── package.json
```
