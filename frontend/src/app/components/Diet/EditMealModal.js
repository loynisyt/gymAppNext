import React, { useState } from "react";
export default function EditMealModal({ meal, onSave, onClose }) {
  const initialForm = {
    name: meal.name || "",
    calories: meal.calories ?? "",
    protein: meal.protein ?? "",
    carbs: meal.carbs ?? "",
    fats: meal.fats ?? "",
    portion_grams: meal.portion_grams ?? 100,
    vitamin_a: meal.vitamin_a ?? "",
    vitamin_c: meal.vitamin_c ?? "",
    calcium: meal.calcium ?? "",
    magnesium: meal.magnesium ?? "",
    fiber: meal.fiber ?? "",
    salt: meal.salt ?? ""
  };

  const [form, setForm] = useState(initialForm);

  // Przelicz makro na 100g do podglądu
  const ratio = form.portion_grams ? (100 / form.portion_grams) : 1;

  // Proporcjonalne przeliczanie makro przy zmianie porcji
  const handlePortionChange = e => {
    const newPortion = Number(e.target.value);
    if (!newPortion || newPortion <= 0) {
      setForm(f => ({ ...f, portion_grams: "" }));
      return;
    }
    const oldPortion = form.portion_grams || 100;
    const scale = newPortion / oldPortion;
    setForm(f => ({
      ...f,
      portion_grams: newPortion,
      calories: Math.round(f.calories * scale * 10) / 10,
      protein: Math.round(f.protein * scale * 10) / 10,
      carbs: Math.round(f.carbs * scale * 10) / 10,
      fats: Math.round(f.fats * scale * 10) / 10,
      vitamin_a: f.vitamin_a ? Math.round(f.vitamin_a * scale * 10) / 10 : "",
      vitamin_c: f.vitamin_c ? Math.round(f.vitamin_c * scale * 10) / 10 : "",
      calcium: f.calcium ? Math.round(f.calcium * scale * 10) / 10 : "",
      magnesium: f.magnesium ? Math.round(f.magnesium * scale * 10) / 10 : "",
      fiber: f.fiber ? Math.round(f.fiber * scale * 10) / 10 : "",
      salt: f.salt ? Math.round(f.salt * scale * 10) / 10 : ""
    }));
  };

  return (
    <div className="modal is-active">
      <div className="modal-background" onClick={onClose}></div>
      <div className="modal-card">
        <header className="modal-card-head">
          <p className="modal-card-title">Edytuj posiłek</p>
          <button className="delete" aria-label="close" onClick={onClose}></button>
        </header>
        <section className="modal-card-body">
          <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Nazwa" />
          <p>Kalorie (cała porcja)</p>
          <input className="input mt-2" type="number" value={form.calories} onChange={e => setForm(f => ({ ...f, calories: e.target.value }))} placeholder="Kalorie" />
          <p>Białko (cała porcja)</p>
          <input className="input mt-2" type="number" value={form.protein} onChange={e => setForm(f => ({ ...f, protein: e.target.value }))} placeholder="Białko" />
          <p>Węglowodany (cała porcja)</p>
          <input className="input mt-2" type="number" value={form.carbs} onChange={e => setForm(f => ({ ...f, carbs: e.target.value }))} placeholder="Węglowodany" />
          <p>Tłuszcze (cała porcja)</p>
          <input className="input mt-2" type="number" value={form.fats} onChange={e => setForm(f => ({ ...f, fats: e.target.value }))} placeholder="Tłuszcze" />
          <p>Porcja (g)</p>
          <input className="input mt-2" type="number" value={form.portion_grams} onChange={handlePortionChange} placeholder="Porcja (g)" />
          <div style={{fontSize:12, color:"#888", marginTop:8}}>
            <b>Przeliczenie na 100g:</b> {form.portion_grams ? Math.round(form.calories * (100 / form.portion_grams)) : 0} kcal, B: {form.portion_grams ? Math.round(form.protein * (100 / form.portion_grams) * 10)/10 : 0}g, W: {form.portion_grams ? Math.round(form.carbs * (100 / form.portion_grams) * 10)/10 : 0}g, T: {form.portion_grams ? Math.round(form.fats * (100 / form.portion_grams) * 10)/10 : 0}g
          </div>
        </section>
        <footer className="modal-card-foot">
          <button className="button is-success" onClick={() => onSave(form)}>Zapisz</button>
          <button className="button" onClick={onClose}>Anuluj</button>
        </footer>
      </div>
    </div>
  );
}