<![CDATA[<div align="center">

# 🧠 OpenBrain

### Your AI Memory. Your Server. Your Data.

*A self-hosted personal AI assistant with persistent memory, a Personal CRM, Obsidian vault integration, and a calendar — all running on your own hardware.*

[![SvelteKit](https://img.shields.io/badge/SvelteKit-5-FF3E00?logo=svelte&logoColor=white)](https://kit.svelte.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://postgresql.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://docker.com)
[![MCP](https://img.shields.io/badge/MCP-Compatible-8B5CF6)](https://modelcontextprotocol.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

---

## The Problem

Every AI session starts from zero. No memory of last week's conversation. No idea who your contacts are. No context about your life, projects, or decisions. And the "solutions" — cloud AI assistants, SaaS memory tools — all require you to hand over your most personal data to someone else's server.

**OpenBrain is the alternative.** A local-first brain for AI and humans alike.

---

## The Idea: Two Doors, One Source of Truth

OpenBrain is built around a single insight: **AI agents and humans should share the same data store** — with no sync layers, no middleware, no cloud databases.

```
          You                          Your AI
           │                              │
     ┌─────▼──────┐               ┌──────▼──────┐
     │ Human Door │               │ Agent Door  │
     │            │               │             │
     │ SvelteKit  │               │ MCP Server  │
     │  Web App   │               │ 12 Tools    │
     └─────┬──────┘               └──────┬──────┘
           │                              │
           └──────────────┬───────────────┘
                          │
              ┌───────────▼────────────┐
              │   PostgreSQL Database  │
              │   + Obsidian Vault     │
              │   + Radicale CalDAV    │
              │                        │
              │  Your Proxmox Server   │
              └────────────────────────┘
```

When the AI writes a note, it instantly appears in your web app and Obsidian. When you update a contact, the AI sees it in the next message. No cloud. No subscriptions. No one watching.

---

## Features

### 🤖 AI Chat with Persistent Memory
- Powered by **Gemini 2.5 Flash** via OpenRouter (swappable to any model)
- **Function calling** with 12 tools: read/write your DB, vault, and calendar
- **Audio dictation** — record voice messages, auto-transcribed before the AI processes them
- **Daily Note workflow** — dictate your day, AI structures it and writes it to your Obsidian vault
- Conversation history stored in PostgreSQL (not lost between sessions)

### 👥 Personal CRM
- Import contacts from **iPhone (.vcf)** and **LinkedIn (.csv)**
- **VIP tracking** with "Hit Them Up" reminders (>90 days since last contact)
- **Birthday dashboard** with upcoming birthday alerts
- Private + business email, phone, address fields
- Interaction history log per contact
- Warmth score (0–100), relationship type, preferred platform

### 📓 Obsidian Vault Integration
- AI can **read, write, search, and list** vault files
- Creates Daily Notes, meeting notes, and project docs directly in your vault
- Synced to your Mac via **Syncthing** — changes appear in Obsidian instantly
- No Obsidian Sync subscription needed

### 📅 Calendar (iOS Sync)
- Self-hosted **Radicale CalDAV** server
- Bidirectional sync with iOS Calendar via `cal.yourdomain.com`
- AI can create and manage events directly from chat

### 🏠 Household Knowledge Base
- Paint colors, Wi-Fi passwords, appliance info — all searchable
- Maintenance logs with warranty expiry alerts on dashboard

### 🔌 MCP Server (Claude Desktop Integration)
- Expose your entire brain to Claude Desktop or any MCP-compatible agent
- 12 tools across DB, vault, and calendar
- Runs via stdio — drop it into your Claude Desktop config

---

## Architecture

OpenBrain runs as a **Docker Compose stack** inside a Proxmox LXC container:

| Container | Purpose | Port |
|-----------|---------|------|
| `openbrain-db` | PostgreSQL 16 | `127.0.0.1:5432` |
| `openbrain-web` | SvelteKit webapp | `127.0.0.1:3000` |
| `openbrain-cal` | Radicale CalDAV | `127.0.0.1:5232` |
| `openbrain-proxy` | Caddy reverse proxy | `0.0.0.0:8080` |

**Remote access** via Cloudflare Tunnel — no open ports, no exposed IP.

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | SvelteKit 2 + Svelte 5 (runes) + Tailwind CSS v4 |
| Backend | SvelteKit server routes + Node.js adapter |
| Database | PostgreSQL 16 (Alpine) |
| AI | OpenRouter API → Gemini 2.5 Flash (function calling) |
| MCP Server | Node.js/TypeScript + `@modelcontextprotocol/sdk` |
| Vault Sync | Syncthing |
| Calendar | Radicale CalDAV |
| Proxy | Caddy 2 |
| Tunnel | Cloudflare Tunnel |
| Auth | JWT + bcrypt (httpOnly cookie) |

---

## Database Schema

All tables share: `id UUID`, `created_at`, `updated_at`, `created_by` (human/ai), `tags TEXT[]`, `notes TEXT`

| Table | Purpose |
|-------|---------|
| `contacts` | Personal CRM — email, phone, birthday, warmth, VIP, interactions |
| `interactions` | Interaction log per contact (meetings, calls, messages) |
| `household_items` | Paint colors, passwords, appliance info |
| `maintenance_logs` | Home/car maintenance with warranty tracking |
| `reminders` | Follow-ups, recurring reminders, priorities |
| `memories` | AI memory catch-all — anything that doesn't fit elsewhere |
| `chat_messages` | Persistent conversation history |

---

## Quick Start

### Prerequisites
- A Linux server or VM (Proxmox LXC recommended, any Docker host works)
- Docker + Docker Compose
- A domain with Cloudflare (for remote access) — optional

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/arturkoko/openbrain.git
cd openbrain

# 2. Create your .env file
cp .env.example .env
# Edit .env with your passwords and API keys

# 3. Create the vault directory (mount your Obsidian vault here via Syncthing)
mkdir -p vault

# 4. Start the stack
docker compose up -d

# 5. Open the web app
open http://localhost:8080
# Default login: admin / change-me-on-first-login (set via .env)
```

### Environment Variables

```bash
# PostgreSQL
POSTGRES_USER=openbrain
POSTGRES_PASSWORD=your-strong-password
POSTGRES_DB=openbrain

# Web App
SESSION_SECRET=your-random-64-char-string
DEFAULT_ADMIN_USER=admin
DEFAULT_ADMIN_PASSWORD=your-password

# AI (get a free key at openrouter.ai)
OPENROUTER_API_KEY=sk-or-v1-...
AI_MODEL=google/gemini-2.5-flash

# CalDAV
RADICALE_USER=your-username
RADICALE_PASSWORD=your-password
```

### Claude Desktop (MCP)

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "openbrain": {
      "command": "node",
      "args": ["/path/to/openbrain/mcp-server/dist/index.js"],
      "env": {
        "DB_HOST": "127.0.0.1",
        "DB_USER": "openbrain",
        "DB_PASSWORD": "your-password",
        "DB_NAME": "openbrain",
        "VAULT_PATH": "/path/to/your/vault",
        "RADICALE_URL": "http://127.0.0.1:5232",
        "RADICALE_USER": "your-username",
        "RADICALE_PASSWORD": "your-password"
      }
    }
  }
}
```

---

## Why Self-Hosted?

**Your life data is the most sensitive data there is.** Who you know, where you live, your daily thoughts, your health, your finances — all of this flows through a personal AI assistant naturally over time.

Cloud AI assistants are convenient. But:
- They train on your data (or might in the future)
- They can shut down, change pricing, or get acquired
- You have no control over what they store or share
- Every sync adds another company that has access

OpenBrain keeps everything on your hardware. The AI model runs in the cloud (OpenRouter), but **no personal data leaves your server** — only your questions do. The answers come back and stay with you.

This is the **"Own Your Data"** principle applied to AI memory.

---

## Use Cases

### Daily Note Dictation
> *"Hey, dictate my daily note: Today was intense. Had a strategy session with Gerald about the KI project, we decided to go with fine-tuning instead of RAG. Ran 8km in the evening. Feeling good about the direction."*

→ AI transcribes audio → structures as Obsidian daily note → writes to `reviews/daily/2026-03-16.md` → synced to your Mac instantly.

### Personal CRM
> *"Who haven't I talked to in a while that I should reconnect with?"*

→ AI queries `contacts WHERE is_vip = true AND last_contact < now() - 90 days` → shows your VIP contacts sorted by most overdue.

### Household Intelligence
> *"What's the paint color for the living room?"*

→ AI queries `household_items WHERE category = 'paint'` → instant answer, no digging through notes.

### Calendar via Chat
> *"Block Thursday afternoon for deep work, 2-5pm."*

→ AI creates a CalDAV event → appears in your iOS Calendar within seconds.

---

## Roadmap

- [ ] Contact import UI (`/contacts/import`) — vCard + LinkedIn CSV
- [ ] Daily `pg_dump` backup cron to NAS
- [ ] Proactive agent — scheduled checks for cold contacts, expiring warranties
- [ ] Streamable HTTP transport for MCP (remote Claude iOS support)
- [ ] Paperless-ngx integration
- [ ] Contact relationship graph view

---

## Philosophy

> *"The best AI assistant is one that knows you — and one that you own."*

OpenBrain is inspired by the idea that personal AI tools should be:

1. **Local-first** — your data lives on your hardware, not someone's cloud
2. **Open** — no lock-in, swap the model, fork the code, change the schema
3. **Integrated** — AI and human interfaces share a single source of truth
4. **Durable** — notes you write today should be readable in 20 years (Markdown + PostgreSQL)

This is not a product. It's a personal infrastructure project — designed to be understood, modified, and extended by its owner.

---

## License

MIT — do what you want with it.

---

<div align="center">

Built with ☕ and the conviction that your memories belong to you.

</div>
]]>
