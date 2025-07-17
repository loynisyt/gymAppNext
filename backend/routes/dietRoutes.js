const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../authMiddleware');
const dietService = require('../services/dietService');

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
    remaining_calories,
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
        `UPDATE diet SET calories_goal=$1, protein_min=$2, protein_max=$3, carbs_min=$4, carbs_max=$5, fats_min=$6, fats_max=$7, remaining_calories=$8,
         vitamin_a_min=$9, vitamin_a_max=$10, vitamin_c_min=$11, vitamin_c_max=$12, calcium_min=$13, calcium_max=$14, magnesium_min=$15, magnesium_max=$16,
         fiber_min=$17, fiber_max=$18, salt_min=$19, salt_max=$20, updated_at=NOW() WHERE id=$21`,
        [calories_goal, protein_min, protein_max, carbs_min, carbs_max, fats_min, fats_max, remaining_calories,
         vitamin_a_min, vitamin_a_max, vitamin_c_min, vitamin_c_max, calcium_min, calcium_max, magnesium_min, magnesium_max,
         fiber_min, fiber_max, salt_min, salt_max, dietId]
      );
      res.json({ message: 'Diet plan updated' });
    } else {
      // Create new diet plan
      const insertResult = await pool.query(
        `INSERT INTO diet (calories_goal, protein_min, protein_max, carbs_min, carbs_max, fats_min, fats_max, remaining_calories,
          vitamin_a_min, vitamin_a_max, vitamin_c_min, vitamin_c_max, calcium_min, calcium_max, magnesium_min, magnesium_max,
          fiber_min, fiber_max, salt_min, salt_max) VALUES
          ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20) RETURNING id`,
        [calories_goal, protein_min, protein_max, carbs_min, carbs_max, fats_min, fats_max, remaining_calories,
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
        `UPDATE diet SET calories_goal=$1, protein_min=$2, protein_max=$3, carbs_min=$4, carbs_max=$5, fats_min=$6, fats_max=$7, remaining_calories=$8,
         vitamin_a_min=$9, vitamin_a_max=$10, vitamin_c_min=$11, vitamin_c_max=$12, calcium_min=$13, calcium_max=$14, magnesium_min=$15, magnesium_max=$16,
         fiber_min=$17, fiber_max=$18, salt_min=$19, salt_max=$20, updated_at=NOW() WHERE id=$21`,
        [dietPlan.calories_goal, dietPlan.protein_min, dietPlan.protein_max, dietPlan.carbs_min, dietPlan.carbs_max, dietPlan.fats_min, dietPlan.fats_max,
         dietPlan.remaining_calories, dietPlan.vitamin_a_min, dietPlan.vitamin_a_max, dietPlan.vitamin_c_min, dietPlan.vitamin_c_max,
         dietPlan.calcium_min, dietPlan.calcium_max, dietPlan.magnesium_min, dietPlan.magnesium_max, dietPlan.fiber_min, dietPlan.fiber_max,
         dietPlan.salt_min, dietPlan.salt_max, dietId]
      );
      res.json({ message: 'Diet plan updated automatically' });
    } else {
      // Create new diet plan
      const insertResult = await pool.query(
        `INSERT INTO diet (calories_goal, protein_min, protein_max, carbs_min, carbs_max, fats_min, fats_max, remaining_calories,
          vitamin_a_min, vitamin_a_max, vitamin_c_min, vitamin_c_max, calcium_min, calcium_max, magnesium_min, magnesium_max,
          fiber_min, fiber_max, salt_min, salt_max) VALUES
          ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20) RETURNING id`,
        [dietPlan.calories_goal, dietPlan.protein_min, dietPlan.protein_max, dietPlan.carbs_min, dietPlan.carbs_max, dietPlan.fats_min, dietPlan.fats_max,
         dietPlan.remaining_calories, dietPlan.vitamin_a_min, dietPlan.vitamin_a_max, dietPlan.vitamin_c_min, dietPlan.vitamin_c_max,
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

module.exports = router;
