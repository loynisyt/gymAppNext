const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../authMiddleware');
const dietService = require('../services/dietService');



router.delete('/' ,authMiddleware.verifyToken , async (req,res)=>{

  const userId=req.user.id;

  try{
    const userResult = await pool.query('SELECT diet_id FROM users WHERE id = $1', [userId]);
    const dietId = userResult.rows[0]?.diet_id;

    if (!dietId) {
      return res.status(404).json({ message: 'No diet plan found' });
    }
    
const deleteResult = await pool.query('DELETE FROM diet WHERE id = $1 RETURNING id', [dietId]);

    if (deleteResult.rowCount === 0) {
      return res.status(404).json({ message: 'No diet plan found' });
    }
    res.json({ message: 'Diet plan deleted' });

  }catch(err){
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }

})

// Get user's diet plan
router.get('/', authMiddleware.verifyToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const userResult = await pool.query('SELECT diet_id FROM users WHERE id = $1', [userId]);
    const dietId = userResult.rows[0]?.diet_id;
    if (!dietId) {
      return res.status(404).json({ message: 'No diet plan found' });
    }
    const dietResult = await pool.query('SELECT * FROM diet WHERE id = $1', [dietId]);
    res.json(dietResult.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create or update diet plan (manual)
router.post('/', authMiddleware.verifyToken, async (req, res) => {
  const userId = req.user.id;
  const {
    calories_goal,
    protein_min,
    protein_max,
    carbs_min,
    carbs_max,
    fats_min,
    fats_max,
    vitamin_a_min,
    vitamin_a_max,
    vitamin_c_min,
    vitamin_c_max,
    calcium_min,
    calcium_max,
    magnesium_min,
    magnesium_max,
    fiber_min,
    fiber_max,
    salt_min,
    salt_max,
  } = req.body;

  try {
    // Check if user already has a diet plan
    const userResult = await pool.query('SELECT diet_id FROM users WHERE id = $1', [userId]);
    const dietId = userResult.rows[0]?.diet_id;

    if (dietId) {
      // Update existing diet plan
      await pool.query(
        `UPDATE diet SET calories_goal=$1, protein_min=$2, protein_max=$3, carbs_min=$4, carbs_max=$5, fats_min=$6, fats_max=$7,
         vitamin_a_min=$8, vitamin_a_max=$9, vitamin_c_min=$10, vitamin_c_max=$11, calcium_min=$12, calcium_max=$13, magnesium_min=$14, magnesium_max=$15,
         fiber_min=$16, fiber_max=$17, salt_min=$18, salt_max=$19, updated_at=NOW() WHERE id=$20`,
        [calories_goal, protein_min, protein_max, carbs_min, carbs_max, fats_min, fats_max, 
         vitamin_a_min, vitamin_a_max, vitamin_c_min, vitamin_c_max, calcium_min, calcium_max, magnesium_min, magnesium_max,
         fiber_min, fiber_max, salt_min, salt_max, dietId]
      );
      res.json({ message: 'Diet plan updated' });
    } else {
      // Create new diet plan
      const insertResult = await pool.query(
        `INSERT INTO diet (calories_goal, protein_min, protein_max, carbs_min, carbs_max, fats_min, fats_max,
          vitamin_a_min, vitamin_a_max, vitamin_c_min, vitamin_c_max, calcium_min, calcium_max, magnesium_min, magnesium_max,
          fiber_min, fiber_max, salt_min, salt_max) VALUES
          ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19) RETURNING id`,
        [calories_goal, protein_min, protein_max, carbs_min, carbs_max, fats_min, fats_max,
         vitamin_a_min, vitamin_a_max, vitamin_c_min, vitamin_c_max, calcium_min, calcium_max, magnesium_min, magnesium_max,
         fiber_min, fiber_max, salt_min, salt_max]
      );
      const newDietId = insertResult.rows[0].id;
      // Update user with new diet_id
      await pool.query('UPDATE users SET diet_id=$1 WHERE id=$2', [newDietId, userId]);
      res.json({ message: 'Diet plan created' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create diet plan automatically from questionnaire data
router.post('/auto', authMiddleware.verifyToken, async (req, res) => {
  const userId = req.user.id;
  const userData = req.body; // Expecting weight, height, age, sex, activityLevel, goal, rate, etc.

  try {
    const dietPlan = await dietService.generateDietPlan(userData);

    // Check if user already has a diet plan
    const userResult = await pool.query('SELECT diet_id FROM users WHERE id = $1', [userId]);
    const dietId = userResult.rows[0]?.diet_id;

    if (dietId) {
      // Update existing diet plan
      await pool.query(
        `UPDATE diet SET calories_goal=$1, protein_min=$2, protein_max=$3, carbs_min=$4, carbs_max=$5, fats_min=$6, fats_max=$7, 
         vitamin_a_min=$8, vitamin_a_max=$9, vitamin_c_min=$10, vitamin_c_max=$11, calcium_min=$12, calcium_max=$13, magnesium_min=$14, magnesium_max=$15,
         fiber_min=$16, fiber_max=$17, salt_min=$18, salt_max=$19, updated_at=NOW() WHERE id=$20`,
        [dietPlan.calories_goal, dietPlan.protein_min, dietPlan.protein_max, dietPlan.carbs_min, dietPlan.carbs_max, dietPlan.fats_min, dietPlan.fats_max,
         dietPlan.vitamin_a_min, dietPlan.vitamin_a_max, dietPlan.vitamin_c_min, dietPlan.vitamin_c_max,
         dietPlan.calcium_min, dietPlan.calcium_max, dietPlan.magnesium_min, dietPlan.magnesium_max, dietPlan.fiber_min, dietPlan.fiber_max,
         dietPlan.salt_min, dietPlan.salt_max, dietId]
      );
      res.json({ message: 'Diet plan updated automatically' });
    } else {
      // Create new diet plan
      const insertResult = await pool.query(
        `INSERT INTO diet (calories_goal, protein_min, protein_max, carbs_min, carbs_max, fats_min, fats_max,
          vitamin_a_min, vitamin_a_max, vitamin_c_min, vitamin_c_max, calcium_min, calcium_max, magnesium_min, magnesium_max,
          fiber_min, fiber_max, salt_min, salt_max) VALUES
          ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19) RETURNING id`,
        [dietPlan.calories_goal, dietPlan.protein_min, dietPlan.protein_max, dietPlan.carbs_min, dietPlan.carbs_max, dietPlan.fats_min, dietPlan.fats_max,
         dietPlan.vitamin_a_min, dietPlan.vitamin_a_max, dietPlan.vitamin_c_min, dietPlan.vitamin_c_max,
         dietPlan.calcium_min, dietPlan.calcium_max, dietPlan.magnesium_min, dietPlan.magnesium_max, dietPlan.fiber_min, dietPlan.fiber_max,
         dietPlan.salt_min, dietPlan.salt_max]
      );
      const newDietId = insertResult.rows[0].id;
      // Update user with new diet_id
      await pool.query('UPDATE users SET diet_id=$1 WHERE id=$2', [newDietId, userId]);
      res.json({ message: 'Diet plan created automatically' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});



// Pobierz dane dnia (posiłki, aktywności) dla danego dnia
router.get('/day/:date', authMiddleware.verifyToken, async (req, res) => {
  const userId = req.user.id;
  const { date } = req.params;
  try {
    let day = await pool.query('SELECT * FROM days WHERE user_id = $1 AND date = $2', [userId, date]);
    if (day.rows.length === 0) {
      const newDay = await pool.query(
        'INSERT INTO days (user_id, date) VALUES ($1, $2) RETURNING *',
        [userId, date]
      );
      day = { rows: [newDay.rows[0]] };
    }
    const dayId = day.rows[0].id;
    const meals = await pool.query('SELECT * FROM meals WHERE day_id = $1', [dayId]);
    const activities = await pool.query('SELECT * FROM activities WHERE day_id = $1', [dayId]);
    res.json({
      day: day.rows[0],
      meals: meals.rows,
      activities: activities.rows
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ...istniejący kod...

// Dodaj posiłek
router.post('/day/:date/meal', authMiddleware.verifyToken, async (req, res) => {
  const userId = req.user.id;
  const { date } = req.params;
  const {
    meal_type, name, calories, protein, carbs, fats, portion_grams,
    vitamin_a, vitamin_c, calcium, magnesium, fiber, salt
  } = req.body;
  try {
    let day = await pool.query('SELECT * FROM days WHERE user_id = $1 AND date = $2', [userId, date]);
    if (day.rows.length === 0) {
      const newDay = await pool.query(
        'INSERT INTO days (user_id, date) VALUES ($1, $2) RETURNING *',
        [userId, date]
      );
      day = { rows: [newDay.rows[0]] };
    }
    const dayId = day.rows[0].id;
    const meal = await pool.query(
      `INSERT INTO meals (day_id, meal_type, name, calories, protein, carbs, fats, portion_grams,
        vitamin_a, vitamin_c, calcium, magnesium, fiber, salt)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`,
      [
        dayId, meal_type, name, calories, protein, carbs, fats, portion_grams || 100,
        vitamin_a, vitamin_c, calcium, magnesium, fiber, salt
      ]
    );
    res.json(meal.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Edytuj posiłek
router.put('/day/:date/meal/:mealId', authMiddleware.verifyToken, async (req, res) => {
  const userId = req.user.id;
  const { date, mealId } = req.params;
  const {
    name, calories, protein, carbs, fats, portion_grams,
  } = req.body;
  try {
    const day = await pool.query('SELECT * FROM days WHERE user_id = $1 AND date = $2', [userId, date]);
    if (day.rows.length === 0) return res.status(404).json({ message: "Day not found" });
    const updated = await pool.query(
      `UPDATE meals SET name=$1, calories=$2, protein=$3, carbs=$4, fats=$5, portion_grams=$6
        WHERE id=$7 AND day_id=$8 RETURNING *`,
      [
        name, calories, protein, carbs, fats, portion_grams || 100,
        mealId, day.rows[0].id
      ]
    );
    res.json(updated.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});


// Usuń posiłek
router.delete('/day/:date/meal/:mealId', authMiddleware.verifyToken, async (req, res) => {
  const userId = req.user.id;
  const { date, mealId } = req.params;
  try {
    const day = await pool.query('SELECT * FROM days WHERE user_id = $1 AND date = $2', [userId, date]);
    if (day.rows.length === 0) return res.status(404).json({ message: "Day not found" });
    await pool.query('DELETE FROM meals WHERE id = $1 AND day_id = $2', [mealId, day.rows[0].id]);
    res.json({ success: true });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});


// Dodaj aktywność
router.post('/day/:date/activity', authMiddleware.verifyToken, async (req, res) => {
  const userId = req.user.id;
  const { date } = req.params;
  const { name, calories, duration } = req.body;
  try {
    let day = await pool.query('SELECT * FROM days WHERE user_id = $1 AND date = $2', [userId, date]);
    if (day.rows.length === 0) {
      const newDay = await pool.query(
        'INSERT INTO days (user_id, date) VALUES ($1, $2) RETURNING *',
        [userId, date]
      );
      day = { rows: [newDay.rows[0]] };
    }
    const dayId = day.rows[0].id;
    const activity = await pool.query(
      `INSERT INTO activities (day_id, name, calories, duration)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [dayId, name, calories, duration || null]
    );
    res.json(activity.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Edytuj aktywność
router.put('/day/:date/activity/:activityId', authMiddleware.verifyToken, async (req, res) => {
  const userId = req.user.id;
  const { date, activityId } = req.params;
  const { name, calories, duration } = req.body;
  try {
    const day = await pool.query('SELECT * FROM days WHERE user_id = $1 AND date = $2', [userId, date]);
    if (day.rows.length === 0) return res.status(404).json({ message: "Day not found" });
    const updated = await pool.query(
      `UPDATE activities SET name=$1, calories=$2, duration=$3 WHERE id=$4 AND day_id=$5 RETURNING *`,
      [name, calories, duration, activityId, day.rows[0].id]
    );
    res.json(updated.rows[0]);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// Usuń aktywność
router.delete('/day/:date/activity/:activityId', authMiddleware.verifyToken, async (req, res) => {
  const userId = req.user.id;
  const { date, activityId } = req.params;
  try {
    const day = await pool.query('SELECT * FROM days WHERE user_id = $1 AND date = $2', [userId, date]);
    if (day.rows.length === 0) return res.status(404).json({ message: "Day not found" });
    await pool.query('DELETE FROM activities WHERE id = $1 AND day_id = $2', [activityId, day.rows[0].id]);
    res.json({ success: true });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});



module.exports = router;
