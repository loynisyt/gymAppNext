-- Tabela dni użytkownika
CREATE TABLE IF NOT EXISTS days (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, date)
);

-- Tabela posiłków w danym dniu
CREATE TABLE IF NOT EXISTS meals (
  id SERIAL PRIMARY KEY,
  day_id INT NOT NULL REFERENCES days(id) ON DELETE CASCADE,
  meal_type VARCHAR(32) NOT NULL, -- np. 'Śniadanie'
  name VARCHAR(128) NOT NULL,
  calories INT NOT NULL,
  protein INT NOT NULL,
  carbs INT NOT NULL,
  fats INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela aktywności w danym dniu
CREATE TABLE IF NOT EXISTS activities (
  id SERIAL PRIMARY KEY,
  day_id INT NOT NULL REFERENCES days(id) ON DELETE CASCADE,
  name VARCHAR(128) NOT NULL,
  calories INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);