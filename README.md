# MS Casino Jackpot

A full-stack slot machine game built as a home assignment. The house always wins — by design.

---

## Dev Journey

### Step 1 — Project foundation (`1775bcb`)

Started by establishing the monorepo structure with npm workspaces: a shared types package (`@casino/shared`), an Express + TypeScript server, and a React + TypeScript + Vite client. The goal was a single language across the entire stack with shared types so the client and server can never drift out of sync on API shapes.

Key early decisions:
- **Redis for active sessions** — every spin needs a sub-millisecond read/write. Redis's built-in TTL also handles session expiry automatically without a cron job.
- **MongoDB for archived sessions** — on cash-out, the session moves from Redis to Mongo. Documents fit the free-form session record; this also sets up a history trail for analytics.
- **`express-async-errors`** — monkey-patches Express so async route handlers propagate errors to the global error handler without needing explicit `try/catch` wrapping in every route.
- **Docker Compose** — single command to spin up Mongo and Redis locally. No manual installs, no version conflicts.

The house cheat logic was implemented in a pure, side-effect-free module (`game.logic.ts`) isolated from the service layer — easier to unit test and reason about independently.

### Step 2 — User accounts and JWT authentication (`7a80dcd`)

Added persistent user accounts backed by MongoDB. The auth design question was: *when* does a player need to be authenticated?

**Decision: auth only at cash-out.** A player can spin without an account. Authentication is only demanded at the moment they want to transfer their credits to a persistent wallet. This removes all friction to start playing while still protecting the balance transfer.

Implementation:
- `bcryptjs` for password hashing — plain-text passwords never touch the database
- JWT signed with a 7-day expiry — stateless, no session table needed
- `authenticate` middleware reads the `Authorization: Bearer` header and attaches `req.user` to the request, but only applied to the `/cashout` route atm
- Client stores the token in `localStorage`; all requests include it via a shared `getAuthHeaders()` helper
- `$inc` MongoDB operator for atomic balance updates — prevents race conditions if two cash-out requests somehow arrived simultaneously

### Step 3 — Cash-out flow and auto-logout (`768674c`)

The cash-out UX required careful sequencing:

1. Player clicks "Cash Out" → if not logged in(all sessions atm), show an auth modal overlay
2. Player logs in/registers → `useEffect` detects `isLoggedIn && cashOutPending` → auto-fires the queued cash-out
3. Cash-out completes → `phase` transitions to `cashed_out` → a second `useEffect` auto-calls `logout()`

The auto-logout on cash-out was a deliberate product decision: since auth only matters for the cash-out transaction itself, keeping the user logged in afterwards serves no purpose and would leave a dangling token in localStorage.

The `message` state is cleared when a new game starts, so the cash-out confirmation text disappears cleanly on the next session.

### Challenges and Solutions

**Orphaned Node processes on Windows**

During development, stopping the dev server with Ctrl+C killed `concurrently` but left the child `tsx watch` processes running as orphans. The next server start silently failed to bind port 3001 (already taken), so the old code kept serving — making it look like changes weren't taking effect.

Solution: added `--kill-others` to the `concurrently` command so all child processes are killed when the parent exits. For already-orphaned processes: `taskkill /F /IM node.exe` or targeting by PID via `netstat -ano | findstr :3001`.

**Dead code from architectural pivots**

Several things were added then removed as the design evolved:
- `userId` was briefly added to `ActiveSession` before being removed (sessions are anonymous)
- `GET /me` endpoint was added to restore auth state on page reload, then removed once we realised the auto-logout means the token is always cleared before any reload — making the endpoint permanently unreachable
- `accountBalance` was tracked client-side but never rendered; removed along with `refreshBalance`

The pattern: build a basic working version, containing the obvious thing first, then build & add upon that infrastructure and pivot if required.

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | React + TypeScript + Vite | Component model suits slot UI; Vite for fast HMR |
| Backend | Node.js + Express + TypeScript | Unified language stack with shared types |
| Session cache | Redis | Sub-ms reads for every spin; built-in TTL for session cleanup |
| Persistent store | MongoDB | Document model fits session records; scales horizontally |
| Auth | JWT (`jsonwebtoken`) + `bcryptjs` | Stateless, no session table; passwords never stored in plain text |
| Infrastructure | Docker Compose | One-command environment setup |

---

## Architecture

```
MSCasino/
├── shared/               # @casino/shared — TypeScript types used by both client and server
├── server/
│   └── src/
│       ├── modules/
│       │   ├── game/     # Pure spin logic (game.logic.ts) + orchestration (game.service.ts)
│       │   ├── session/  # Redis-backed active sessions + MongoDB archived sessions
│       │   └── user/     # User model, JWT signing, bcrypt hashing, balance credits
│       ├── api/routes/   # auth.routes, session.routes, game.routes
│       ├── db/           # Mongo + Redis connection helpers
│       └── middleware/   # authenticate (JWT), validateSession (Redis lookup), errorHandler
└── client/
    └── src/
        ├── api/          # gameApi — typed fetch wrappers with shared auth headers
        ├── hooks/
        │   ├── useGame   # Full game state machine: session, spin, reveal animation, cashout
        │   └── useAuth   # Login, register, logout — token stored in localStorage
        └── components/   # SlotMachine (table layout), SlotBlock, AuthForm
```

**Session lifecycle:**
1. `POST /api/session` → create Redis key with 24h TTL, return `sessionId`
2. Each spin reads and writes the Redis session; TTL is preserved on every write
3. `POST /api/session/:id/cashout` → archive to MongoDB, delete from Redis, credit user balance

**Cheat logic** (`game.logic.ts`):
- ≥ 40 credits: 30% chance a winning spin is silently re-rolled
- > 60 credits: 60% chance a winning spin is silently re-rolled
- The player never sees this happen

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) ≥ 18
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### 1. Start infrastructure

```bash
docker compose up -d
```

Starts MongoDB on port `27017` and Redis on port `6379`.

### 2. Configure the server

```bash
cp server/.env.example server/.env
```

Defaults work out of the box for the Docker Compose setup. **`JWT_SECRET` is required** — set it to any non-empty string for local development. The server will refuse to start without it.

### 3. Install dependencies

```bash
npm install
```

### 4. Start the app

**Development** — two servers with hot reload:

```bash
npm run dev
```

- **Client** → http://localhost:5173
- **API** → http://localhost:3001

**Production** — build once, then run a single server:

```bash
npm run build
npm start
```

- **App** → http://localhost:3001 (Express serves the built client and the API)

---

## API Reference

### Auth

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | — | Create account, returns JWT |
| `POST` | `/api/auth/login` | — | Verify credentials, returns JWT |

### Session

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/session` | — | Create a new anonymous session |
| `GET` | `/api/session/:id` | — | Get current session state |

### Game

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/session/:id/spin` | — | Perform a spin |
| `POST` | `/api/session/:id/cashout` | Bearer token | Cash out and transfer balance to account |

### Health

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Server health check |

---

## Running Tests

```bash
npm test
```

Runs unit tests for game logic and the game service.

```
PASS tests/game.logic.test.ts  (randomSpin, isWin, getReward, rerollChance, applyCheatLogic)
PASS tests/game.service.test.ts (spin, cashOut)
```
