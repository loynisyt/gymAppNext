import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MacroProgressBar from "../MainMenuComponents/MacroProgressBar";
import FoodSearchModal from "../MainMenuComponents/FoodSearchModal";
import AiSuggestModal from "../MainMenuComponents/AiSuggestModal";
import DaySwitcher from "../MainMenuComponents/DaySwitcher";
import EditActivityModal from "./EditActivityModal";
import EditMealModal from "./EditMealModal";
import DietPlanMissing from "./DietPlanMissing";
import EditDietModal from "./EditDietModal";
import DeleteModal from "./DeleteModal";
import ActivityPanel from './Activity/ActivityPanel';

const MEAL_TYPES = [
  "Śniadanie",
  "Drugie śniadanie",
  "Obiad",
  "Lunch",
  "Kolacja",
  "Przekąski"
];
const defaultMeals = () => MEAL_TYPES.map(() => []);

const DietPanel = () => {
  const [dietPlan, setDietPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFoodModal, setShowFoodModal] = useState({ open: false, idx: null });
  const [showAiModal, setShowAiModal] = useState({ open: false, idx: null });
  const [editDietModal, setEditDietModal] = useState(false);
  const [tab, setTab] = useState("meals");
  const todayStr = new Date().toISOString().slice(0,10);
  const [currentDate, setCurrentDate] = useState(todayStr);
  const [meals, setMeals] = useState(defaultMeals());
  const [activities, setActivities] = useState([]);
  const [editMealModal, setEditMealModal] = useState({ open: false, meal: null, idx: null });
  const [editActivityModal, setEditActivityModal] = useState({ open: false, activity: null });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [subtractActivity, setSubtractActivity] = useState(true);

  const token = localStorage.getItem("token");

  // --- Rozpoznawanie czy plan diety ma mikroelementy ---
  const hasVitamins = !!(
    dietPlan?.vitamin_a_min || dietPlan?.vitamin_c_min || dietPlan?.calcium_min ||
    dietPlan?.magnesium_min || dietPlan?.fiber_min || dietPlan?.salt_min
  );

  // --- FETCH DAY ---
  const fetchDay = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/diet/day/${currentDate}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const mealsArr = defaultMeals();
      res.data.meals.forEach(m => {
        const idx = MEAL_TYPES.indexOf(m.meal_type);
        if (idx !== -1) mealsArr[idx].push(m);
      });
      setMeals(mealsArr);
      setActivities(res.data.activities);
    } catch {
      setMeals(defaultMeals());
      setActivities([]);
    }
  };
  useEffect(() => {
    if (dietPlan) fetchDay();
    // eslint-disable-next-line
  }, [currentDate, dietPlan, token]);

  // --- CRUD MEALS ---
  const handleAddMeal = async (idx, meal) => {
    await axios.post(`http://localhost:5000/api/diet/day/${currentDate}/meal`, {
      meal_type: MEAL_TYPES[idx],
      ...meal
    }, { headers: { Authorization: `Bearer ${token}` } });
    await fetchDay();
  };
  const handleDeleteMeal = async (mealId) => {
    await axios.delete(`http://localhost:5000/api/diet/day/${currentDate}/meal/${mealId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    await fetchDay();
  };
  const handleEditMeal = async (mealId, meal, oldPortion) => {
    // Jeśli zmieniono porcję, przelicz makro proporcjonalnie
    let newMeal = { ...meal };
    if (oldPortion && meal.portion_grams && Number(meal.portion_grams) !== Number(oldPortion)) {
      const ratio = meal.portion_grams / oldPortion;
      ["calories", "protein", "carbs", "fats", "vitamin_a", "vitamin_c", "calcium", "magnesium", "fiber", "salt"].forEach(key => {
        if (meal[key] !== undefined && meal[key] !== null && meal[key] !== "") {
          newMeal[key] = Math.round(Number(meal[key]) * ratio * 10) / 10;
        }
      });
    }
    await axios.put(`http://localhost:5000/api/diet/day/${currentDate}/meal/${mealId}`, newMeal, {
      headers: { Authorization: `Bearer ${token}` }
    });
    await fetchDay();
  };

  // --- CRUD ACTIVITIES ---
  const handleAddActivity = async (activity) => {
    await axios.post(`http://localhost:5000/api/diet/day/${currentDate}/activity`, activity, {
      headers: { Authorization: `Bearer ${token}` }
    });
    await fetchDay();
  };
  const handleDeleteActivity = async (activityId) => {
    await axios.delete(`http://localhost:5000/api/diet/day/${currentDate}/activity/${activityId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    await fetchDay();
  };
  const handleEditActivity = async (activityId, activity) => {
    await axios.put(`http://localhost:5000/api/diet/day/${currentDate}/activity/${activityId}`, activity, {
      headers: { Authorization: `Bearer ${token}` }
    });
    await fetchDay();
  };

  const handleDeleteDiet = async () => {
    await axios.delete(`http://localhost:5000/api/diet/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setDietPlan(null);
  };

  // --- FETCH DIET PLAN ---
  useEffect(() => {
    async function fetchDiet() {
      try {
        const res = await axios.get('http://localhost:5000/api/diet/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDietPlan(res.data);
        setLoading(false);
      } catch (err) {
        setDietPlan(null);
        setLoading(false);
      }
    }
    fetchDiet();
  }, [token]);

  // --- SUM MACROS ---
  const macros = {
    calories: 0, protein: 0, carbs: 0, fats: 0,
    vitamin_a: 0, vitamin_c: 0, calcium: 0, magnesium: 0, fiber: 0, salt: 0
  };
  meals.flat().forEach(m => {
    macros.calories += Number(m.calories) || 0;
    macros.protein += Number(m.protein) || 0;
    macros.carbs += Number(m.carbs) || 0;
    macros.fats += Number(m.fats) || 0;
    if (hasVitamins) {
      macros.vitamin_a += Number(m.vitamin_a) || 0;
      macros.vitamin_c += Number(m.vitamin_c) || 0;
      macros.calcium += Number(m.calcium) || 0;
      macros.magnesium += Number(m.magnesium) || 0;
      macros.fiber += Number(m.fiber) || 0;
      macros.salt += Number(m.salt) || 0;
    }
  });
  const totalBurned = activities.reduce((sum, a) => sum + (a.calories || 0), 0);

  // --- RENDER ---
  if (loading) return <div>Loading diet plan...</div>;
  if (!dietPlan) return <DietPlanMissing onDietCreated={setDietPlan} />;

  return (
    <div className="box" style={{ maxWidth: 1500, margin: "2rem auto" }}>
      <div className="tabs is-toggle is-fullwidth mb-4">
        <ul>
          <li className={tab === "meals" ? "is-active" : ""}>
            <a onClick={() => setTab("meals")}>Posiłki</a>
          </li>
          <li className={tab === "activity" ? "is-active" : ""}>
            <a onClick={() => setTab("activity")}>Aktywność</a>
          </li>
        </ul>
      </div>
      <div style={{display:"flex", justifyContent:"flex-end", marginBottom:16}}>
        <div style={{display:"flex", justifyContent:"flex-end", marginBottom:16, gap:8}}>
          <button className="button is-info" onClick={() => setEditDietModal(true)}>
            Edytuj plan diety
          </button>
          <button className="button is-danger" onClick={() => setShowDeleteModal(true)}>
            Usuń dietę
          </button>
        </div>
      </div>
      {tab === "meals" && (
        <>
          <h2 className="title is-4 has-text-centered">Twój plan diety</h2>
          <DaySwitcher currentDate={currentDate} setCurrentDate={setCurrentDate} />
          <div style={{marginBottom: 16}}>
            <button
              className={`button ${subtractActivity ? "is-success" : ""}`}
              onClick={() => setSubtractActivity(v => !v)}
            >
              {subtractActivity ? "Uwzględnij aktywność" : "Nie uwzględniaj aktywności"}
            </button>
            {subtractActivity && (
              <h5 className="is-size-5 has-text-grey mt-4 mb-4 "> Spalone kalorie: {totalBurned} kcal</h5>
            )}
          </div>
          <div className="columns is-multiline">
            <div className="column is-half">
              <MacroProgressBar
                label="Kalorie"
                value={macros.calories - (subtractActivity ? totalBurned : 0)}
                min={dietPlan.calories_goal}
                max={dietPlan.calories_goal}
                unit="kcal"
              />
              <MacroProgressBar label="Białko" value={macros.protein} min={dietPlan.protein_min} max={dietPlan.protein_max} unit="g" />
              <MacroProgressBar label="Węglowodany" value={macros.carbs} min={dietPlan.carbs_min} max={dietPlan.carbs_max} unit="g" />
              <MacroProgressBar label="Tłuszcze" value={macros.fats} min={dietPlan.fats_min} max={dietPlan.fats_max} unit="g" />
            </div>
            {hasVitamins && (
              <div className="column is-half">
                <MacroProgressBar label="Witamina A" value={macros.vitamin_a} min={dietPlan.vitamin_a_min} max={dietPlan.vitamin_a_max} unit="µg" />
                <MacroProgressBar label="Witamina C" value={macros.vitamin_c} min={dietPlan.vitamin_c_min} max={dietPlan.vitamin_c_max} unit="mg" />
                <MacroProgressBar label="Wapń" value={macros.calcium} min={dietPlan.calcium_min} max={dietPlan.calcium_max} unit="mg" />
                <MacroProgressBar label="Magnez" value={macros.magnesium} min={dietPlan.magnesium_min} max={dietPlan.magnesium_max} unit="mg" />
                <MacroProgressBar label="Błonnik" value={macros.fiber} min={dietPlan.fiber_min} max={dietPlan.fiber_max} unit="g" />
                <MacroProgressBar label="Sól" value={macros.salt} min={dietPlan.salt_min} max={dietPlan.salt_max} unit="mg" />
              </div>
            )}
          </div>
          <div className="columns is-multiline">
            {MEAL_TYPES.map((mealType, idx) => (
              <div key={mealType} className="column is-one-third">
                <div className="box" style={{ minHeight: 180 }}>
                  <h4 className="title is-6">{mealType}</h4>
                  <ul>
                    {meals[idx].map((meal, i) => (
                      <li key={meal.id || i}>
                        <b>{meal.name}</b> {meal.calories} kcal, B: {meal.protein}g, W: {meal.carbs}g, T: {meal.fats}g, Porcja: {meal.portion_grams}g
                        {hasVitamins && (
                          <> | A: {meal.vitamin_a}mg, C: {meal.vitamin_c}mg, Ca: {meal.calcium}mg, Mg: {meal.magnesium}mg, Bł: {meal.fiber}g, Sól: {meal.salt}mg</>
                        )}
                        <button className="button is-small is-danger ml-2" onClick={() => handleDeleteMeal(meal.id)}>Usuń</button>
                        <button className="button is-small is-info ml-2" onClick={() => setEditMealModal({ open: true, meal, idx })}>Edytuj</button>
                      </li>
                    ))}
                  </ul>
                  <div>
                    <b>Suma:</b> {meals[idx].reduce((sum, m) => sum + (m.calories || 0), 0)} kcal, 
                    B: {meals[idx].reduce((sum, m) => sum + (m.protein || 0), 0)}g, 
                    W: {meals[idx].reduce((sum, m) => sum + (m.carbs || 0), 0)}g, 
                    T: {meals[idx].reduce((sum, m) => sum + (m.fats || 0), 0)}g
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    <button className="button is-small is-link" onClick={() => setShowFoodModal({ open: true, idx })}>
                      Dodaj posiłek
                    </button>
                    <button className="button is-small is-warning" onClick={() => setShowAiModal({ open: true, idx })}>
                      AI posiłek
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {showFoodModal.open && (
            <FoodSearchModal
              onSelect={meal => handleAddMeal(showFoodModal.idx, meal)}
              onClose={() => setShowFoodModal({ open: false, idx: null })}
            />
          )}
          {showAiModal.open && (
            <AiSuggestModal
              dietPlan={dietPlan}
              mealType={MEAL_TYPES[showAiModal.idx]}
              hasVitamins={hasVitamins}
              onSelect={meal => handleAddMeal(showAiModal.idx, meal)}
              onClose={() => setShowAiModal({ open: false, idx: null })}
              currentMacros={macros}
            />
          )}
          {editMealModal.open && (
            <EditMealModal
              meal={editMealModal.meal}
              hasVitamins={hasVitamins}
              onSave={meal => {
                handleEditMeal(editMealModal.meal.id, meal, editMealModal.meal.portion_grams);
                setEditMealModal({ open: false, meal: null, idx: null });
              }}
              onClose={() => setEditMealModal({ open: false, meal: null, idx: null })}
            />
          )}
          {editDietModal && (
            <EditDietModal
              dietPlan={dietPlan}
              onSave={() => {
                setEditDietModal(false);
                axios.get('http://localhost:5000/api/diet/', {
                  headers: { Authorization: `Bearer ${token}` }
                }).then(res => setDietPlan(res.data));
              }}
              onClose={() => setEditDietModal(false)}
            />
          )}
          {showDeleteModal && (
            <DeleteModal
              open={showDeleteModal}
              onConfirm={() => {
                handleDeleteDiet();
                setShowDeleteModal(false);
              }}
              onCancel={() => setShowDeleteModal(false)}
            />
          )}
        </>
      )}
      {tab === "activity" && (
        <>
          <ActivityPanel
            activities={activities}
            onEdit={activity => setEditActivityModal({ open: true, activity })}
            onDelete={handleDeleteActivity}
            onAdd={handleAddActivity}
            fetchDay={fetchDay}
          />
          {editActivityModal.open && (
            <EditActivityModal
              activity={editActivityModal.activity}
              onSave={activity => {
                handleEditActivity(editActivityModal.activity.id, activity);
                setEditActivityModal({ open: false, activity: null });
              }}
              onClose={() => setEditActivityModal({ open: false, activity: null })}
            />
          )}
        </>
      )}
    </div>
  );
};

export default DietPanel;