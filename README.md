# The Gitadel

A Quasar + Vue app that displays Houses and Characters of Westeros, backed by Directus.

## Prerequisites

- Node.js 22.12+ (or 24/26/28)
- pnpm 10+
- Directus running at `http://localhost:8056` (default for this repo's Docker compose)

## Install

```bash
pnpm install
```

## Run the app (development)

```bash
pnpm dev
```

The app will open in your browser automatically.

## Run the app (production build)

```bash
pnpm build
```

## Lint and format

```bash
pnpm lint
pnpm format
```

## Directus initial seed (recommended)

This project can run in local-only mode, but for full functionality you should seed the
Directus database with the initial data (houses, characters, and images).

1. In Directus, generate an Access Token for your user.
2. Run the seed script from the project root:

```bash
DIRECTUS_URL=http://localhost:8056 DIRECTUS_TOKEN=YOUR_TOKEN pnpm seed:all
```

Notes:

- The script performs upserts by name (creates or updates).
- It uploads local images from `public/brasoes` and `public/personagens`.
- Do not share tokens in chats; use them only in your terminal.

## Directus URL

If your Directus is running on a different URL, set `DIRECTUS_URL` when running the app
or the seed script. The provided `docker-compose.yml` maps `8056:8055`, so the default
URL is `http://localhost:8056`. Example:

```bash
DIRECTUS_URL=https://your-directus.example pnpm dev
```
