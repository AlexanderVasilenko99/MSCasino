# Casino Jackpot

A full-stack slot machine game. The house always wins.

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | React + TypeScript + Vite | Component model suits slot UI; Vite for fast dev |
| Backend | Node.js + Express + TypeScript | Unified language stack with shared types |
| Session cache | Redis | Sub-ms reads for every spin; built-in TTL for session cleanup |
| Persistent store | MongoDB | Document model fits session records; horizontal scaling for future user accounts |
| Infrastructure | Docker Compose | One-command environment setup, no local installs needed |

## Architecture

```
MSCasino/
├── shared/          # @casino/shared — TypeScript types used by both client and server
├── server/          # Express API (modular monolith)
│   └── src/
│       ├── modules/
│       │   ├── game/     # Pure spin logic + game service
│       │   ├── session/  # Redis-backed session service + MongoDB model
│       │   └── user/     # Stub for future user accounts
│       ├── api/routes/   # HTTP route handlers
│       ├── db/           # Mongo + Redis connection helpers
│       └── middleware/   # Error handler, session validator
└── client/          # React SPA
    └── src/
        ├── api/          # Typed fetch wrappers
        ├── hooks/        # useGame — all game state in one place
        └── components/   # SlotMachine, SlotBlock
```

**Session lifecycle**: active sessions live in Redis (24h TTL). On cash-out, the session is persisted to MongoDB and removed from Redis. This keeps the hot path fast while retaining history for analytics.

## Game Rules

- Each session starts with **10 credits**
- Each spin costs **1 credit**
- Match all 3 symbols to win:
  - `C` Cherry → +10 credits
  - `L` Lemon → +20 credits
  - `O` Orange → +30 credits
  - `W` Watermelon → +40 credits
- **The house cheats**:
  - ≥ 40 credits: 30% chance a winning spin is silently re-rolled
  - > 60 credits: 60% chance a winning spin is silently re-rolled

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) ≥ 18
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### 1. Start infrastructure

```bash
docker compose up -d
```

This starts MongoDB on `27017` and Redis on `6379`.

### 2. Configure the server

```bash
cp server/.env.example server/.env
```

Defaults work out of the box for the Docker Compose setup.

### 3. Install dependencies

```bash
npm install
```

### 4. Start the app

```bash
npm run dev
```

Opens:
- **Client** → http://localhost:5173
- **Server** → http://localhost:3001

## API Reference

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/session` | Create a new guest session |
| `GET` | `/api/session/:id` | Get current session state |
| `POST` | `/api/session/:id/spin` | Perform a spin |
| `POST` | `/api/session/:id/cashout` | Cash out and close the session |
| `GET` | `/health` | Health check |

## Running Tests

```bash
npm test
```

Runs unit tests for game logic and the game service (server only).

```
PASS tests/game.logic.test.ts  (randomSpin, isWin, getReward, rerollChance, applyCheatLogic)
PASS tests/game.service.test.ts (spin, cashOut)
```

## Future Work

- User accounts with persistent balance (MongoDB `User` model stub already in place)
- Authentication (JWT / session cookies)
- Migrate session cache to Redis Cluster for horizontal scale
- Extract services into microservices when team/scale demands it
- E2E tests with Playwright
