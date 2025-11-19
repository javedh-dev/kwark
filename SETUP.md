# NanoChat Setup Guide

## Environment Configuration

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your API credentials:
   ```env
   OPENAI_API_KEY=your-api-key-here
   OPENAI_BASE_URL=https://api.openai.com/v1
   ```

## Supported LLM Providers

The backend works with any OpenAI-compatible API. Just change the `OPENAI_BASE_URL`:

### OpenAI
```env
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_API_KEY=sk-...
```

### Groq
```env
OPENAI_BASE_URL=https://api.groq.com/openai/v1
OPENAI_API_KEY=gsk_...
```

### Ollama (Local)
```env
OPENAI_BASE_URL=http://localhost:11434/v1
OPENAI_API_KEY=ollama
```

### Azure OpenAI
```env
OPENAI_BASE_URL=https://YOUR-RESOURCE.openai.azure.com/openai/deployments/YOUR-DEPLOYMENT
OPENAI_API_KEY=your-azure-key
```

## Running the App

```bash
pnpm install
pnpm dev
```

The app will be available at `http://localhost:5173`

## How It Works

1. **Frontend** (`src/routes/+page.svelte`): Sends messages to the API endpoint and streams the response
2. **Backend** (`src/routes/api/chat/+server.ts`): Proxies requests to the LLM API and streams responses back
3. **Streaming**: Uses Server-Sent Events (SSE) to stream tokens as they're generated

## Customization

To change the model, edit `src/routes/api/chat/+server.ts`:

```typescript
body: JSON.stringify({
  model: 'gpt-4o-mini', // Change this to your preferred model
  messages,
  stream: true
})
```
