# Kwark

A lightweight chat application built with SvelteKit, featuring both localStorage and database persistence options.

## Features

- 💬 Real-time chat interface
- 💾 **Dual storage options**: localStorage (browser) or SQLite database (server)
- 🔐 **Auth-ready**: Database schema prepared for user authentication
- 🔄 **Flexible**: Easy to switch between SQLite, PostgreSQL, MySQL
- 📱 Responsive design
- ⚡ Fast and lightweight

## Storage Options

### localStorage (Default)

- Browser-based storage
- Zero setup required
- Perfect for demos and prototypes
- See [PERSISTENCE.md](PERSISTENCE.md)

### Database (SQLite)

- Server-side persistence
- Multi-device support
- Ready for user authentication
- See [DATABASE.md](DATABASE.md) and [QUICKSTART_DB.md](QUICKSTART_DB.md)

## Quick Start

## Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

## Database Setup (Optional)

To use database persistence instead of localStorage:

```bash
# Database is auto-initialized on first run
pnpm dev

# View database in browser GUI
pnpm db:studio
```

See [QUICKSTART_DB.md](QUICKSTART_DB.md) for detailed instructions.

## Development

```bash
pnpm dev
```

## Building

```bash
pnpm build
pnpm preview
```

## Documentation

- **[PERSISTENCE.md](PERSISTENCE.md)** - localStorage implementation
- **[DATABASE.md](DATABASE.md)** - Database architecture and API
- **[QUICKSTART_DB.md](QUICKSTART_DB.md)** - Get started with database in 3 steps
- **[MIGRATION.md](MIGRATION.md)** - Migrate from localStorage to database
- **[STORAGE_COMPARISON.md](STORAGE_COMPARISON.md)** - Compare storage options
- **[SETUP.md](SETUP.md)** - Project setup guide

## Tech Stack

- **Framework**: SvelteKit 2
- **Language**: TypeScript
- **Styling**: TailwindCSS 4
- **Database**: SQLite (via better-sqlite3)
- **ORM**: Drizzle ORM
- **Adapter**: Node adapter (for production)
