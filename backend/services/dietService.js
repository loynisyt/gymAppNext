async function generateDietPlan({ age, weight, height, sex, activityLevel, goal, rate }) {
  // PAL (Physical Activity Level) mapping
  const PAL_MAP = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9
  };
  const pal = PAL_MAP[activityLevel] || 1.2;

  // Obliczenie BMR (podstawowa przemiana materii)
  let bmr;
  if (sex === "female" || sex === "f") {
    bmr = 655 + (9.6 * weight) + (1.8 * height) - (4.7 * age);
  } else {
    bmr = 66 + (13.7 * weight) + (5 * height) - (6.8 * age);
  }
  
  // CPM = BMR * PAL (całkowita przemiana materii)
  let calories_goal = Math.round(bmr * pal);

  // Dostosowanie kalorii do celu (utrata/utrzymanie/przyrost masy)
  const weekly_calorie_adjustment = Math.round((rate || 0.5) * 7700 / 7);
  if (goal === "lose") calories_goal -= weekly_calorie_adjustment;
  if (goal === "gain") calories_goal += weekly_calorie_adjustment;

  // Makroskładniki
  const protein_min = Math.round(weight * 1.6);
  const protein_max = Math.round(weight * 2.2);
  const protein_kcal = ((protein_min + protein_max) / 2) * 4;
  
  const fats_min = Math.round(weight * 0.8);
  const fats_max = Math.round(weight * 1.2);
  const fats_kcal = ((fats_min + fats_max) / 2) * 9;
  
  const remaining_calories = calories_goal - protein_kcal - fats_kcal;
  const carbs_avg = Math.max(0, Math.round(remaining_calories / 4));
  const carbs_min = Math.round(carbs_avg * 0.8);
  const carbs_max = Math.round(carbs_avg * 1.2);

  // Mikroskładniki - obliczenia na podstawie wieku, płci i zapotrzebowania
  const calculateVitaminA = () => {
    if (sex === "female" || sex === "f") return { min: 700, max: 900 };
    return { min: 900, max: 1100 };
  };

  const calculateVitaminC = () => {
    if (age > 18) return { min: 75, max: 90 };
    return { min: 65, max: 75 };
  };

  const calculateCalcium = () => {
    if (age >= 19 && age <= 50) return { min: 1000, max: 1200 };
    if (age > 50) return { min: 1200, max: 1500 };
    return { min: 1300, max: 1500 };
  };

  const calculateMagnesium = () => {
    if (sex === "female" || sex === "f") {
      if (age >= 19 && age <= 30) return { min: 310, max: 350 };
      if (age > 30) return { min: 320, max: 360 };
    } else {
      if (age >= 19 && age <= 30) return { min: 400, max: 450 };
      if (age > 30) return { min: 420, max: 470 };
    }
    return { min: 300, max: 400 };
  };

  const calculateFiber = () => {
    // 14g błonnika na 1000 kcal
    const fiber_per_1000kcal = 14;
    const fiber_base = Math.round((calories_goal / 1000) * fiber_per_1000kcal);
    return {
      min: Math.round(fiber_base * 0.8),
      max: Math.round(fiber_base * 1.2)
    };
  };

  const calculateSalt = () => {
    // Zalecenia WHO: mniej niż 5g soli dziennie (2000mg sodu)
    const salt_max = 5000;
    const salt_min = 2500;
    return {
      min: salt_min,
      max: salt_max
    };
  };

  const calculateIron = () => {
    if (sex === "female" || sex === "f") {
      if (age >= 19 && age <= 50) return { min: 18, max: 22 };
      return { min: 8, max: 12 };
    }
    return { min: 8, max: 12 };
  };

  const calculateZinc = () => {
    if (sex === "female" || sex === "f") return { min: 8, max: 12 };
    return { min: 11, max: 15 };
  };

  const vitaminA = calculateVitaminA();
  const vitaminC = calculateVitaminC();
  const calcium = calculateCalcium();
  const magnesium = calculateMagnesium();
  const fiber = calculateFiber();
  const salt = calculateSalt();
  const iron = calculateIron();
  const zinc = calculateZinc();

  return {
    // Podstawowe informacje
    bmr: Math.round(bmr),
    tdee: Math.round(bmr * pal),
    calories_goal,
    weekly_adjustment: weekly_calorie_adjustment,
    
    // Makroskładniki (g)
    protein_min,
    protein_max,
    carbs_min,
    carbs_max,
    fats_min,
    fats_max,
    
    // Mikroskładniki (mg/mcg)
    vitamin_a_min: vitaminA.min,
    vitamin_a_max: vitaminA.max,
    vitamin_c_min: vitaminC.min,
    vitamin_c_max: vitaminC.max,
    calcium_min: calcium.min,
    calcium_max: calcium.max,
    magnesium_min: magnesium.min,
    magnesium_max: magnesium.max,
    iron_min: iron.min,
    iron_max: iron.max,
    zinc_min: zinc.min,
    zinc_max: zinc.max,
    fiber_min: fiber.min,
    fiber_max: fiber.max,
    salt_min: salt.min,
    salt_max: salt.max,
    
    // Procentowy rozkład makroskładników
    protein_percentage: Math.round((protein_kcal / calories_goal) * 100),
    fats_percentage: Math.round((fats_kcal / calories_goal) * 100),
    carbs_percentage: Math.round((remaining_calories / calories_goal) * 100)
  };
}

module.exports = { generateDietPlan };