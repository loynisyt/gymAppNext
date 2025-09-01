const express = require('express');
const router = express.Router();
const authMiddleware = require('../authMiddleware');

router.post('/detect-calories', authMiddleware.verifyToken, async (req, res) => {
  const { foodName } = req.body;
  if (!foodName) {
    return res.status(400).json({ message: 'foodName is required' });
  }

  const calories = 100; // Placeholder value

  res.json({ foodName, calories, message: 'AI calorie detection stub response' });
});

module.exports = router;
