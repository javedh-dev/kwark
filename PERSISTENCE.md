# Chat Persistence Feature

## Overview

NanoChat includes full chat persistence using a local SQLite database. All conversations are automatically saved to the database and restored when you return to the app.

## Features

### Chat Management

- **Auto-save**: All messages are automatically saved to the database as you chat
- **Multiple conversations**: Create and manage multiple chat sessions
- **Chat history**: View all your previous conversations in the sidebar
- **Smart titles**: Chat titles are automatically generated from the first user message
- **Delete chats**: Remove individual conversations with a confirmation prompt

### Sidebar

- **New Chat button**: Start a fresh conversation at any time
- **Chat list**: Browse all your saved conversations
- **Timestamps**: See when each chat was last updated
- **Active indicator**: The current chat is highlighted
- **Delete button**: Appears on hover for each chat

### Data Storage

- All data is stored in a local SQLite database
- Database file: `data/nanochat.db`
- ORM: Drizzle ORM
- Driver: better-sqlite3

### Database Schema

The database consists of the following tables:

- `users`: Stores user information (id, email, username, etc.)
- `chats`: Stores chat sessions (id, user_id, title, timestamps)
- `messages`: Stores messages for each chat (id, chat_id, role, content, timestamp)

## Usage

1. **Start a new chat**: Click the "New Chat" button in the sidebar
2. **Switch between chats**: Click any chat in the sidebar to load it
3. **Delete a chat**: Hover over a chat and click the trash icon
4. **Continue a conversation**: Your current chat is automatically saved after each message

## Technical Details

### Files Added/Modified

- `src/lib/db/schema.ts` - Drizzle schema definitions
- `src/lib/db/sqlite.ts` - SQLite adapter implementation
- `src/lib/stores/chatStore.svelte.ts` - Svelte 5 runes-based store for chat state management interacting with the API
- `src/routes/api/chats/...` - API endpoints for chat management

### Store API

The `chatStore` provides the following methods:

- `loadChats()` - Fetch all chats from the API
- `createNewChat()` - Create a new empty chat via API
- `selectChat(chatId)` - Switch to a specific chat
- `updateCurrentChat(messages)` - Save messages to current chat via API
- `deleteChat(chatId)` - Remove a chat via API

### API Endpoints

- `GET /api/chats` - Get all chats
- `POST /api/chats` - Create a new chat
- `GET /api/chats/:id` - Get a specific chat
- `PATCH /api/chats/:id` - Update a chat
- `DELETE /api/chats/:id` - Delete a chat
- `GET /api/chats/:id/messages` - Get messages for a chat
- `POST /api/chats/:id/messages` - Add a message to a chat
