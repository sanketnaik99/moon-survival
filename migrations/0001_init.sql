CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  closed_at INTEGER
);

CREATE TABLE teams (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES sessions(id),
  name TEXT NOT NULL,
  position INTEGER NOT NULL,
  team_order TEXT,
  team_score INTEGER,
  locked_by TEXT,
  locked_at INTEGER
);

CREATE TABLE participants (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES sessions(id),
  team_id TEXT NOT NULL REFERENCES teams(id),
  name TEXT NOT NULL,
  my_order TEXT,
  my_score INTEGER,
  my_locked_at INTEGER,
  joined_at INTEGER NOT NULL
);

CREATE INDEX idx_teams_session ON teams(session_id);
CREATE INDEX idx_participants_session ON participants(session_id);
CREATE INDEX idx_participants_team ON participants(team_id);
