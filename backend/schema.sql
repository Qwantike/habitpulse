CREATE DATABASE IF NOT EXISTS habitpulse_db;

\c habitpulse_db;

-- ENUMS
CREATE TYPE habit_type AS ENUM ('boolean', 'numeric');
CREATE TYPE period_type AS ENUM ('daily', 'weekly');

-- USERS
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- HABITS
CREATE TABLE habits (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type habit_type NOT NULL,
    period period_type NOT NULL,
    goal INT,
    unit VARCHAR(50),
    color VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- HABIT LOGS
CREATE TABLE habit_logs (
    id SERIAL PRIMARY KEY,
    habit_id INT NOT NULL,
    date DATE NOT NULL,
    value FLOAT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_habit
        FOREIGN KEY (habit_id)
        REFERENCES habits(id)
        ON DELETE CASCADE,
    CONSTRAINT unique_habit_date UNIQUE (habit_id, date)
);

-- INDEXES
CREATE INDEX idx_habits_user_id ON habits(user_id);
CREATE INDEX idx_habit_logs_habit_id ON habit_logs(habit_id);
CREATE INDEX idx_habit_logs_date ON habit_logs(date);

GRANT ALL PRIVILEGES ON SEQUENCE users_id_seq TO habitpulse_user;
GRANT ALL PRIVILEGES ON SEQUENCE habits_id_seq TO habitpulse_user;
GRANT ALL PRIVILEGES ON SEQUENCE habit_logs_id_seq TO habitpulse_user;

ALTER SEQUENCE users_id_seq OWNER TO habitpulse_user;
ALTER SEQUENCE habits_id_seq OWNER TO habitpulse_user;
ALTER SEQUENCE habit_logs_id_seq OWNER TO habitpulse_user;
