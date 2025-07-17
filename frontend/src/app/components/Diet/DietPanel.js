import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AutoDietQuestions from './AutoDietQuestions';

const DietPanel = ({ user }) => {
  const [dietPlan, setDietPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [manualMode, setManualMode] = useState(false);
  const [autoMode, setAutoMode] = useState(false);
  const [formData, setFormData] = useState({
    calories_goal: '',
    protein_min: '',
    protein_max: '',
    carbs_min: '',
    carbs_max: '',
    fats_min: '',
    fats_max: '',
    remaining_calories: '',
    vitamin_a_min: '',
    vitamin_a_max: '',
    vitamin_c_min: '',
    vitamin_c_max: '',
    calcium_min: '',
    calcium_max: '',
    magnesium_min: '',
    magnesium_max: '',
    fiber_min: '',
    fiber_max: '',
    salt_min: '',
    salt_max: '',
  });

  useEffect(() => {
    async function fetchDiet() {
      try {
        const res = await axios.get('/api/diet');
        setDietPlan(res.data);
        setLoading(false);
      } catch (err) {
        setDietPlan(null);
        setLoading(false);
      }
    }
    fetchDiet();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/diet', formData);
      alert('Diet plan saved successfully');
      setManualMode(false);
      // Refresh diet plan
      const res = await axios.get('/api/diet');
      setDietPlan(res.data);
    } catch (err) {
      alert('Failed to save diet plan');
    }
  };

  const handleAutoComplete = () => {
    setAutoMode(false);
    // Refresh diet plan after auto creation
    axios.get('/api/diet')
      .then(res => setDietPlan(res.data))
      .catch(() => setDietPlan(null));
  };

  if (loading) return <div>Loading diet plan...</div>;

  if (!dietPlan) {
    if (manualMode) {
      return (
        <form onSubmit={handleManualSubmit}>
          <h3 className="title is-4">Manual Diet Plan</h3>
          <div className="columns is-multiline is-variable is-4" style={{border: '1px solid #ccc', padding: '1rem'}}>
            <div className="column is-half" style={{borderRight: '1px solid #ccc'}}>
              <label className="label">Calories Goal <span className="has-text-danger">*</span>:
                <input className="input is-danger" type="number" name="calories_goal" value={formData.calories_goal} onChange={handleInputChange} required />
              </label>
              <label className="label">Protein Min <span className="has-text-danger">*</span>:
                <input className="input is-danger" type="number" name="protein_min" value={formData.protein_min} onChange={handleInputChange} required />
              </label>
              <label className="label">Protein Max <span className="has-text-danger">*</span>:
                <input className="input is-danger" type="number" name="protein_max" value={formData.protein_max} onChange={handleInputChange} required />
              </label>
              <label className="label">Carbs Min <span className="has-text-danger">*</span>:
                <input className="input is-danger" type="number" name="carbs_min" value={formData.carbs_min} onChange={handleInputChange} required />
              </label>
              <label className="label">Carbs Max <span className="has-text-danger">*</span>:
                <input className="input is-danger" type="number" name="carbs_max" value={formData.carbs_max} onChange={handleInputChange} required />
              </label>
              <label className="label">Fats Min <span className="has-text-danger">*</span>:
                <input className="input is-danger" type="number" name="fats_min" value={formData.fats_min} onChange={handleInputChange} required />
              </label>
              <label className="label">Fats Max <span className="has-text-danger">*</span>:
                <input className="input is-danger" type="number" name="fats_max" value={formData.fats_max} onChange={handleInputChange} required />
              </label>
              <label className="label">Remaining Calories <span className="has-text-danger">*</span>:
                <input className="input is-danger" type="number" name="remaining_calories" value={formData.calories_goal} readOnly />
              </label>
            </div>
            <div className="column is-half" style={{paddingLeft: '1rem'}}>
              <label className="label">Vitamin A Min:
                <input className="input" type="number" name="vitamin_a_min" value={formData.vitamin_a_min} onChange={handleInputChange} />
              </label>
              <label className="label">Vitamin A Max:
                <input className="input" type="number" name="vitamin_a_max" value={formData.vitamin_a_max} onChange={handleInputChange} />
              </label>
              <label className="label">Vitamin C Min:
                <input className="input" type="number" name="vitamin_c_min" value={formData.vitamin_c_min} onChange={handleInputChange} />
              </label>
              <label className="label">Vitamin C Max:
                <input className="input" type="number" name="vitamin_c_max" value={formData.vitamin_c_max} onChange={handleInputChange} />
              </label>
              <label className="label">Calcium Min:
                <input className="input" type="number" name="calcium_min" value={formData.calcium_min} onChange={handleInputChange} />
              </label>
              <label className="label">Calcium Max:
                <input className="input" type="number" name="calcium_max" value={formData.calcium_max} onChange={handleInputChange} />
              </label>
              <label className="label">Magnesium Min:
                <input className="input" type="number" name="magnesium_min" value={formData.magnesium_min} onChange={handleInputChange} />
              </label>
              <label className="label">Magnesium Max:
                <input className="input" type="number" name="magnesium_max" value={formData.magnesium_max} onChange={handleInputChange} />
              </label>
              <label className="label">Fiber Min:
                <input className="input" type="number" name="fiber_min" value={formData.fiber_min} onChange={handleInputChange} />
              </label>
              <label className="label">Fiber Max:
                <input className="input" type="number" name="fiber_max" value={formData.fiber_max} onChange={handleInputChange} />
              </label>
              <label className="label">Salt Min:
                <input className="input" type="number" name="salt_min" value={formData.salt_min} onChange={handleInputChange} />
              </label>
              <label className="label">Salt Max:
                <input className="input" type="number" name="salt_max" value={formData.salt_max} onChange={handleInputChange} />
              </label>
            </div>
          </div>
          <div className="buttons" style={{marginTop: '1rem'}}>
            <button className="button is-danger" type="submit">Save Diet Plan</button>
            <button className="button" type="button" onClick={() => setManualMode(false)}>Cancel</button>
          </div>
        </form>
      );
    }
    if (autoMode) {
      return <AutoDietQuestions onComplete={handleAutoComplete} />;
    }
    return (
      <div>
        <h2>Brak planu diety</h2>
        <div className="buttons">
          <button className="button is-primary" onClick={() => setManualMode(true)}>
            Stwórz manualnie
          </button>
          <button className="button is-link" onClick={() => setAutoMode(true)}>
            Stwórz automatycznie (zalecane)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2>Your Diet Plan</h2>
      <p>Calories Goal: {dietPlan.calories_goal}</p>
      <p>Protein: {dietPlan.protein_min}g - {dietPlan.protein_max}g</p>
      <p>Carbs: {dietPlan.carbs_min}g - {dietPlan.carbs_max}g</p>
      <p>Fats: {dietPlan.fats_min}g - {dietPlan.fats_max}g</p>
      <p>Remaining Calories: {dietPlan.remaining_calories}</p>
      {/* Vitamins and minerals */}
      <p>Vitamin A: {dietPlan.vitamin_a_min} - {dietPlan.vitamin_a_max} mg</p>
      <p>Vitamin C: {dietPlan.vitamin_c_min} - {dietPlan.vitamin_c_max} mg</p>
      <p>Calcium: {dietPlan.calcium_min} - {dietPlan.calcium_max} mg</p>
      <p>Magnesium: {dietPlan.magnesium_min} - {dietPlan.magnesium_max} mg</p>
      <p>Fiber: {dietPlan.fiber_min} - {dietPlan.fiber_max} g</p>
      <p>Salt: {dietPlan.salt_min} - {dietPlan.salt_max} mg</p>
      <button onClick={() => setManualMode(true)}>Edit Diet Plan</button>
    </div>
  );
};

export default DietPanel;
