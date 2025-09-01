-- Remove remaining_calories column from diet table
ALTER TABLE diet DROP COLUMN IF EXISTS remaining_calories;

-- Create days table to store daily intake data
CREATE TABLE days (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  calories INT NOT NULL,
  protein INT NOT NULL,
  carbs INT NOT NULL,
  fats INT NOT NULL,
  vitamin_a INT NOT NULL,
  vitamin_c INT NOT NULL,
  calcium INT NOT NULL,
  magnesium INT NOT NULL,
  fiber INT NOT NULL,
  salt INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, date)
);
