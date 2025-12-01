# AI Connections Management

This feature allows you to manage multiple OpenAI-compatible API connections from the admin settings.

## Features

- **Multiple Connections**: Create and manage multiple AI API connections
- **Default Connection**: Set a default connection that will be used automatically
- **Per-Chat Selection**: Choose which connection to use for each chat session
- **Secure Storage**: API keys are stored securely in the database
- **OpenAI Compatible**: Works with any OpenAI-compatible API (OpenAI, Azure OpenAI, local LLMs, etc.)
- **No .env Required**: All configuration is managed through the UI

## First Time Setup

When you first start the application, you'll need to configure at least one AI connection:

1. Navigate to **Settings** → **AI Connections**
2. Click **Add Connection**
3. Fill in your connection details
4. Check "Set as default connection"
5. Click **Save Connection**

## Migrating from .env Configuration

If you previously used `.env` file for LLM configuration, you can migrate it:

```bash
npx tsx scripts/migrate-env-to-connection.ts
```

This will create an AI connection from your existing `LLM_BASE_URL`, `LLM_API_KEY`, and `LLM_MODEL` settings.

## Usage

### Adding a Connection

1. Navigate to **Settings** → **AI Connections**
2. Click **Add Connection**
3. Fill in the connection details:
   - **Name**: A friendly name for the connection (e.g., "OpenAI", "Local LLM")
   - **Base URL**: The API endpoint (e.g., `https://api.openai.com/v1`)
   - **API Key**: Your API key for authentication
   - **Default Model** (optional): The default model to use with this connection
   - **Set as default**: Check this to make it the default connection
4. Click **Save Connection**

### Using a Connection

#### Default Behavior
- If you have a default connection set, it will be used automatically
- Otherwise, the system falls back to the `.env` configuration

#### Per-Chat Selection
1. Open the **LLM Settings** panel in a chat (gear icon)
2. Select your desired connection from the **AI Connection** dropdown
3. Click **Apply**

The selected connection will be used for all messages in that chat session.

### Managing Connections

- **Set as Default**: Click "Set Default" on any connection to make it the default
- **Delete**: Click the trash icon to remove a connection
- **Edit**: Currently, you need to delete and recreate to edit (update feature coming soon)

## Database Schema

The feature adds a new `ai_connections` table:

```sql
CREATE TABLE ai_connections (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  base_url TEXT NOT NULL,
  api_key TEXT NOT NULL,
  default_model TEXT,
  is_default INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
```

## API Endpoints

- `GET /api/ai-connections` - List all connections (API keys are masked)
- `POST /api/ai-connections` - Create a new connection
- `GET /api/ai-connections/[id]` - Get a specific connection
- `PATCH /api/ai-connections/[id]` - Update a connection
- `DELETE /api/ai-connections/[id]` - Delete a connection

## Connection Priority

The system uses the following priority for selecting connections:

1. If a `connectionId` is specified in the chat settings, use that connection
2. Otherwise, use the default connection from the database
3. If no connection is configured, show an error message

## Security Notes

- API keys are stored in the database (consider encrypting them in production)
- Only authenticated users can access connection management
- API keys are masked in list views (only last 4 characters shown)
