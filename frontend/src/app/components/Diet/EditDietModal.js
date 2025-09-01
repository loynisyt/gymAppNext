import React, { useState } from "react";
import axios from "axios";

export default function EditDietModal({ dietPlan, onSave, onClose }) {
  const [form, setForm] = useState({
    calories_goal: dietPlan.calories_goal || "",
    protein_min: dietPlan.protein_min || "",
    protein_max: dietPlan.protein_max || "",
    carbs_min: dietPlan.carbs_min || "",
    carbs_max: dietPlan.carbs_max || "",
    fats_min: dietPlan.fats_min || "",
    fats_max: dietPlan.fats_max || "",
    vitamin_a_min: dietPlan.vitamin_a_min || "",
    vitamin_a_max: dietPlan.vitamin_a_max || "",
    vitamin_c_min: dietPlan.vitamin_c_min || "",
    vitamin_c_max: dietPlan.vitamin_c_max || "",
    calcium_min: dietPlan.calcium_min || "",
    calcium_max: dietPlan.calcium_max || "",
    magnesium_min: dietPlan.magnesium_min || "",
    magnesium_max: dietPlan.magnesium_max || "",
    fiber_min: dietPlan.fiber_min || "",
    fiber_max: dietPlan.fiber_max || "",
    salt_min: dietPlan.salt_min || "",
    salt_max: dietPlan.salt_max || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await axios.post("http://localhost:5000/api/diet/", form, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setLoading(false);
      if (onSave) onSave();
    } catch (err) {
      setLoading(false);
      setError("Błąd zapisu planu diety");
    }
  };

  return (
    <div className="modal is-active">
      <div className="modal-background" onClick={onClose}></div>
      <div className="modal-card" style={{maxWidth:600}}>
        <header className="modal-card-head">
          <p className="modal-card-title">Edytuj plan diety</p>
          <button className="delete" aria-label="close" onClick={onClose}></button>
        </header>
        <form onSubmit={handleSubmit}>
          <section className="modal-card-body">
            <div className="columns">
              <div className="column">
                <label className="label">Kalorie</label>
                <input className="input" name="calories_goal" type="number" value={form.calories_goal} onChange={handleChange} />
                <label className="label">Białko min</label>
                <input className="input" name="protein_min" type="number" value={form.protein_min} onChange={handleChange} />
                <label className="label">Białko max</label>
                <input className="input" name="protein_max" type="number" value={form.protein_max} onChange={handleChange} />
                <label className="label">Węglowodany min</label>
                <input className="input" name="carbs_min" type="number" value={form.carbs_min} onChange={handleChange} />
                <label className="label">Węglowodany max</label>
                <input className="input" name="carbs_max" type="number" value={form.carbs_max} onChange={handleChange} />
                <label className="label">Tłuszcze min</label>
                <input className="input" name="fats_min" type="number" value={form.fats_min} onChange={handleChange} />
                <label className="label">Tłuszcze max</label>
                <input className="input" name="fats_max" type="number" value={form.fats_max} onChange={handleChange} />
              </div>
              <div className="column">
                <label className="label">Witamina A min</label>
                <input className="input" name="vitamin_a_min" type="number" value={form.vitamin_a_min} onChange={handleChange} />
                <label className="label">Witamina A max</label>
                <input className="input" name="vitamin_a_max" type="number" value={form.vitamin_a_max} onChange={handleChange} />
                <label className="label">Witamina C min</label>
                <input className="input" name="vitamin_c_min" type="number" value={form.vitamin_c_min} onChange={handleChange} />
                <label className="label">Witamina C max</label>
                <input className="input" name="vitamin_c_max" type="number" value={form.vitamin_c_max} onChange={handleChange} />
                <label className="label">Wapń min</label>
                <input className="input" name="calcium_min" type="number" value={form.calcium_min} onChange={handleChange} />
                <label className="label">Wapń max</label>
                <input className="input" name="calcium_max" type="number" value={form.calcium_max} onChange={handleChange} />
                <label className="label">Magnez min</label>
                <input className="input" name="magnesium_min" type="number" value={form.magnesium_min} onChange={handleChange} />
                <label className="label">Magnez max</label>
                <input className="input" name="magnesium_max" type="number" value={form.magnesium_max} onChange={handleChange} />
                <label className="label">Błonnik min</label>
                <input className="input" name="fiber_min" type="number" value={form.fiber_min} onChange={handleChange} />
                <label className="label">Błonnik max</label>
                <input className="input" name="fiber_max" type="number" value={form.fiber_max} onChange={handleChange} />
                <label className="label">Sól min</label>
                <input className="input" name="salt_min" type="number" value={form.salt_min} onChange={handleChange} />
                <label className="label">Sól max</label>
                <input className="input" name="salt_max" type="number" value={form.salt_max} onChange={handleChange} />
              </div>
            </div>
            {error && <div className="has-text-danger">{error}</div>}
          </section>
          <footer className="modal-card-foot">
            <button className="button is-success" type="submit" disabled={loading}>Zapisz</button>
            <button className="button" type="button" onClick={onClose}>Anuluj</button>
          </footer>
        </form>
      </div>
    </div>
  );
}