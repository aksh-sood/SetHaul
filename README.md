# SetHaul

A driver portal for freight shipments, with a dispatch agent that drivers can chat with.
Drivers see their active shipment, book and change dock appointment slots, report
exceptions, and ask the agent for help. The agent runs on Amazon Bedrock AgentCore.

![Architecture](docs/architecture.png)

## How it fits together

- **Web app** (React + Vite, hosted on Vercel) is the driver-facing portal: login,
  active shipment, slot booking, shipment history, driver profile, issue reporting,
  and a chat widget.
- **API** (Express, deployed on Vercel from `api/index.ts`) sits between the portal,
  the database, and the agent.
- **Agent** runs on Amazon Bedrock AgentCore. The API calls it with
  `InvokeAgentRuntimeCommand`, passing the driver's message along with chat history,
  the active shipment, and the driver profile as context. The agent calls Gemini via
  OpenRouter, reads its API keys from AWS Secrets Manager, caches sessions in Upstash
  Redis, and sends traces to LangSmith and logs to CloudWatch. The agent code is
  not in this repository yet.
- **Database** is Supabase Postgres.

If AgentCore isn't configured or doesn't respond, `/api/chat` falls back to canned
replies, so the portal still works without it.

## Slot booking

Booking a dock slot takes two steps, **hold** and then **confirm**, and each step is a
Postgres function, so two drivers can never end up with the same slot:

- `hold_slot_atomic` holds a slot only if it's free, or if the previous hold on it has
  expired.
- `confirm_slot_atomic` confirms only if the calling driver still holds the slot.
- `release_hold_atomic` releases a hold when a driver changes their mind.
- `sweep_expired_holds` returns expired holds to the pool.

A unique index keeps one active appointment per shipment. When a driver confirms a
new slot, the old appointment is marked `superseded` instead of `cancelled`. The
migration is in `db_details.sql`.

## API

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/chat` | Send a message to the dispatch agent |
| GET | `/api/drivers/:driverId` | Get a driver's profile |
| GET | `/api/shipments/active/:driverId` | Get the driver's current shipment |
| GET | `/api/shipments/history/:driverId` | Get past shipments |
| PATCH | `/api/shipments/:shipmentId/status` | Update shipment status |
| POST | `/api/shipments/:shipmentId/exceptions` | Report an issue |
| PATCH | `/api/exceptions/:exceptionId/resolve` | Resolve an issue |
| GET | `/api/shipments/:shipmentId/slots` | List available slots |
| POST | `/api/slots/:slotId/hold` | Hold a slot |
| POST | `/api/slots/:slotId/confirm` | Confirm a held slot |
| POST | `/api/slots/:slotId/release` | Release a hold |

## Running locally

Prerequisites: Node.js, a Supabase project that already has the app's tables
(including `appointments` and `appointment_slots`), and optionally a deployed AgentCore runtime.
`db_details.sql` is a migration that adds the slot functions on top of those tables.
It doesn't create them.

```bash
npm install
cp .env.example .env   # fill in Supabase, AWS region/credentials, AgentCore runtime ARN
npm run dev
```

Without the AgentCore settings, chat falls back to canned replies.

## Stack

React · TypeScript · Vite · Tailwind · Express · Supabase (Postgres) ·
Amazon Bedrock AgentCore · Gemini via OpenRouter · Upstash Redis · LangSmith ·
AWS Secrets Manager · CloudWatch · Vercel
