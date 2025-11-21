# Chat Persistence Feature

## Overview

NanoChat now includes full chat persistence using browser localStorage. All conversations are automatically saved and restored when you return to the app.

## Features

### Chat Management

- **Auto-save**: All messages are automatically saved to localStorage as you chat
- **Multiple conversations**: Create and manage multiple chat sessions
- **Chat history**: View all your previous conversations in the sidebar
- **Smart titles**: Chat titles are automatically generated from the first user message
- **Delete chats**: Remove individual conversations with a confirmation prompt

### Sidebar

- **New Chat button**: Start a fresh conversation at any time
- **Chat list**: Browse all your saved conversations
- **Timestamps**: See when each chat was last updated (Today, Yesterday, X days ago)
- **Active indicator**: The current chat is highlighted
- **Delete button**: Appears on hover for each chat

### Data Storage

- All data is stored locally in your browser using localStorage
- Storage key: `nanochat_conversations`
- Each chat includes:
  - Unique ID
  - Title (auto-generated from first message)
  - Full message history
  - Creation and update timestamps

## Usage

1. **Start a new chat**: Click the "New Chat" button in the sidebar
2. **Switch between chats**: Click any chat in the sidebar to load it
3. **Delete a chat**: Hover over a chat and click the trash icon
4. **Continue a conversation**: Your current chat is automatically saved after each message

## Technical Details

### Files Added

- `src/lib/stores/chatStore.svelte.ts` - Svelte 5 runes-based store for chat state management
- `src/lib/components/ChatSidebar.svelte` - Sidebar component for chat navigation

### Files Modified

- `src/routes/+page.svelte` - Integrated chat store and sidebar
- `src/app.d.ts` - Updated environment variable types

### Store API

The `chatStore` provides the following methods:

- `createNewChat()` - Create a new empty chat
- `selectChat(chatId)` - Switch to a specific chat
- `updateCurrentChat(messages)` - Save messages to current chat
- `deleteChat(chatId)` - Remove a chat
- `clearAllChats()` - Delete all conversations

## Browser Compatibility

Works in all modern browsers that support localStorage (all major browsers since 2010).
