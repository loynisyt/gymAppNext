import React, { useState } from "react";
import axios from "axios";

export default function ManualDietForm({ withVitamins, onDietCreated, onCancel }) {
  const [formData, setFormData] = useState({
    calories_goal: '',
    protein_min: '',
    protein_max: '',
    carbs_min: '',
    carbs_max: '',
    fats_min: '',
    fats_max: '',
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
  const token = localStorage.getItem("token");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    try {
      const cleanedData = {};
      Object.entries(formData).forEach(([key, value]) => {
        cleanedData[key] = value === '' ? null : value;
      });
      await axios.post('http://localhost:5000/api/diet/', cleanedData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Diet plan saved successfully');
      if (onDietCreated) onDietCreated();
    } catch (err) {
      alert('Failed to save diet plan');
    }
  };

  return (
    <form onSubmit={handleManualSubmit}>
      <h3 className="title is-4">{withVitamins ? 'Manual Diet Plan with Vitamins' : 'Manual Diet Plan without Vitamins'}</h3>
      <div className="columns is-multiline is-variable is-4" style={{ border: '1px solid #ccc', padding: '1rem' }}>
        <div className="column is-half" style={{ borderRight: '1px solid #ccc' }}>
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
        </div>
        {withVitamins && (
          <div className="column is-half" style={{ paddingLeft: '1rem' }}>
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
        )}
      </div>
      <div className="buttons" style={{ marginTop: '1rem' }}>
        <button className="button is-danger" type="submit">Save Diet Plan</button>
        <button className="button" type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}