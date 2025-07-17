const express = require('express');
const router = express.Router();
const authMiddleware = require('../authMiddleware');

// Stub route for AI food calorie detection
router.post('/detect-calories', authMiddleware.verifyToken, async (req, res) => {
  // For now, just return a stub response
  // In future, integrate AI model or external service to detect calories from food data
  const { foodName } = req.body;
  if (!foodName) {
    return res.status(400).json({ message: 'foodName is required' });
  }

  // Stub: return dummy calorie value
  const calories = 100; // Placeholder value

  res.json({ foodName, calories, message: 'AI calorie detection stub response' });
});

module.exports = router;
