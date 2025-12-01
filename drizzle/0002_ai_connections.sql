CREATE TABLE IF NOT EXISTS ai_connections (
	id TEXT PRIMARY KEY,
	name TEXT NOT NULL,
	base_url TEXT NOT NULL,
	api_key TEXT NOT NULL,
	default_model TEXT,
	is_default INTEGER NOT NULL DEFAULT 0,
	created_at INTEGER NOT NULL,
	updated_at INTEGER NOT NULL
);
