-- ============================================================
-- schema.sql — Relational / SQL Representation for Task 1
-- (For documentation & multi-database acceptance criteria)
-- ============================================================

CREATE TABLE IF NOT EXISTS habits (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    frequency VARCHAR(20) DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekly')),
    color VARCHAR(20) DEFAULT '#6366f1',
    icon VARCHAR(10) DEFAULT '🎯',
    category VARCHAR(50) DEFAULT 'Other' CHECK (category IN ('Health', 'Study', 'Hobby', 'Work', 'Other')),
    streak INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS checkins (
    id VARCHAR(36) PRIMARY KEY,
    habit_id VARCHAR(36) NOT NULL,
    date DATE NOT NULL,
    note VARCHAR(255) DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_habit FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
    CONSTRAINT unique_habit_date UNIQUE (habit_id, date)
);

CREATE INDEX idx_checkins_date ON checkins(date);
CREATE INDEX idx_checkins_habit ON checkins(habit_id);
