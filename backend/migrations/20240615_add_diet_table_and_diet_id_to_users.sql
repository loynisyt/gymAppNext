-- Create diet table
CREATE TABLE IF NOT EXISTS diet (
  id SERIAL PRIMARY KEY,
  calories_goal INTEGER NOT NULL,
  protein_min INTEGER NOT NULL,
  protein_max INTEGER NOT NULL,
  carbs_min INTEGER NOT NULL,
  carbs_max INTEGER NOT NULL,
  fats_min INTEGER NOT NULL,
  fats_max INTEGER NOT NULL,
  remaining_calories INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add diet_id column to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS diet_id INTEGER REFERENCES diet(id) ON DELETE SET NULL;
