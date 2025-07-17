const axios = require('axios');

/**
 * Calculate Basal Metabolic Rate (BMR) using Mifflin-St Jeor Equation
 * @param {Object} userData - User data including weight (kg), height (cm), age, sex ('male' or 'female')
 * @returns {number} BMR calories
 */
function calculateBMR({ weight, height, age, sex }) {
  if (sex === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
}

/**
 * Calculate Total Daily Energy Expenditure (TDEE) based on activity level
 * @param {number} bmr - Basal Metabolic Rate
 * @param {string} activityLevel - One of ['sedentary', 'light', 'moderate', 'active', 'very_active']
 * @returns {number} TDEE calories
 */
function calculateTDEE(bmr, activityLevel) {
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };
  return bmr * (activityMultipliers[activityLevel] || 1.2);
}

/**
 * Calculate calorie goal based on user's goal to lose or gain weight
 * @param {number} tdee - Total Daily Energy Expenditure
 * @param {string} goal - One of ['lose', 'maintain', 'gain']
 * @param {number} rate - Rate of weight change in kg per week (e.g., 0.5)
 * @returns {number} calorie goal
 */
function calculateCalorieGoal(tdee, goal, rate) {
  // 1 kg fat ~ 7700 calories
  const calorieChangePerDay = (7700 * rate) / 7;
  if (goal === 'lose') {
    return Math.max(tdee - calorieChangePerDay, 1200); // minimum calories
  } else if (goal === 'gain') {
    return tdee + calorieChangePerDay;
  } else {
    return tdee;
  }
}

/**
 * Generate diet plan based on user data and activity
 * @param {Object} userData - Includes weight, height, age, sex, activityLevel, goal, rate
 * @returns {Object} diet plan with calories_goal, protein_min/max, carbs_min/max, fats_min/max, remaining_calories
 */
async function generateDietPlan(userData) {
  const { weight, height, age, sex, activityLevel, goal, rate } = userData;

  const bmr = calculateBMR({ weight, height, age, sex });
  const tdee = calculateTDEE(bmr, activityLevel);
  const calories_goal = calculateCalorieGoal(tdee, goal, rate);

  // Macronutrient distribution (example percentages)
  const proteinPercent = 0.3; // 30% of calories
  const carbsPercent = 0.4;   // 40% of calories
  const fatsPercent = 0.3;    // 30% of calories

  // Calculate grams (1g protein = 4 cal, 1g carbs = 4 cal, 1g fat = 9 cal)
  const proteinCalories = calories_goal * proteinPercent;
  const carbsCalories = calories_goal * carbsPercent;
  const fatsCalories = calories_goal * fatsPercent;

  const protein_min = Math.floor(proteinCalories / 4 * 0.9);
  const protein_max = Math.ceil(proteinCalories / 4 * 1.1);
  const carbs_min = Math.floor(carbsCalories / 4 * 0.9);
  const carbs_max = Math.ceil(carbsCalories / 4 * 1.1);
  const fats_min = Math.floor(fatsCalories / 9 * 0.9);
  const fats_max = Math.ceil(fatsCalories / 9 * 1.1);

  // Initially, remaining calories equals calories_goal
  const remaining_calories = calories_goal;

  // Optionally, integrate with Polish food API to add calories info (stub)
  // Example API call (replace with real API)
  // const foodApiResponse = await axios.get('https://api.polishfood.example.com/nutrition');

  return {
    calories_goal: Math.round(calories_goal),
    protein_min,
    protein_max,
    carbs_min,
    carbs_max,
    fats_min,
    fats_max,
    remaining_calories,
  };
}

module.exports = {
  generateDietPlan,
};
