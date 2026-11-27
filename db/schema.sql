-- CarryShare database schema. Idempotent: safe to run on every deploy.
-- Applied by the "Postgres" workflow (deploy action).

CREATE TABLE IF NOT EXISTS accounts (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email         text NOT NULL,
  password_hash text NOT NULL,
  first_name    text NOT NULL,
  last_name     text NOT NULL,
  home_city     text NOT NULL DEFAULT '',
  home_country  text NOT NULL DEFAULT '',
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Emails are unique regardless of case.
CREATE UNIQUE INDEX IF NOT EXISTS accounts_email_lower_idx ON accounts (lower(email));

-- One row per logged-in browser. The cookie holds a random token; only its
-- SHA-256 hash is stored, so a leaked table can't be used to log in.
CREATE TABLE IF NOT EXISTS sessions (
  token_hash  text PRIMARY KEY,
  account_id  uuid NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
  expires_at  timestamptz NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS sessions_account_idx ON sessions (account_id);
CREATE INDEX IF NOT EXISTS sessions_expires_idx ON sessions (expires_at);
