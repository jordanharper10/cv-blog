PRAGMA journal_mode=WAL;
PRAGMA foreign_keys=ON;

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL, -- bcrypt hash
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS profile (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  name TEXT,
  title TEXT,
  location TEXT,
  photo_url TEXT, -- headshot
  socials_json TEXT, -- JSON object for socials
  certs_json TEXT -- JSON object for each certification
);

CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  summary TEXT, -- quick description
  tags TEXT,
  url TEXT, -- link to hosted site
  repo_url TEXT, -- git url
  cover_url TEXT, -- logo/image to display
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL, -- identifier for API
  excerpt TEXT, -- short summary
  body_md TEXT NOT NULL, -- markdown for blog text
  cover_url TEXT, -- logo/image to display
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS timeline (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  label TEXT NOT NULL, -- short summary
  description TEXT, -- long text description
  icon TEXT
);

CREATE TABLE IF NOT EXISTS contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  label TEXT NOT NULL,
  value TEXT NOT NULL, -- address/number/handle/etc
  url TEXT, -- optional link
  sort INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);
