import React, { useState } from "react";

export default function CreateActivityModal({ onAdd, onClose, defaultDuration = 60 }) {
  const [form, setForm] = useState({
    name: "",
    calories_per_hour: "",
    duration: defaultDuration,
    calories: ""
  });

  // Przelicz kalorie automatycznie przy zmianie czasu lub kcal/h
  const handleChange = e => {
    const { name, value } = e.target;
    let newForm = { ...form, [name]: value };
    if ((name === "calories_per_hour" || name === "duration") && newForm.calories_per_hour && newForm.duration) {
      newForm.calories = Math.round(Number(newForm.calories_per_hour) * Number(newForm.duration) / 60);
    }
    setForm(newForm);
  };

  return (
    <div className="modal is-active">
      <div className="modal-background" onClick={onClose}></div>
      <div className="modal-card" style={{maxWidth:400}}>
        <header className="modal-card-head">
          <p className="modal-card-title">Dodaj aktywność ręcznie</p>
          <button className="delete" aria-label="close" onClick={onClose}></button>
        </header>
        <section className="modal-card-body">
          <label className="label">Nazwa aktywności</label>
          <input className="input" value={form.name} name="name" onChange={handleChange} placeholder="np. Pływanie" />
          <label className="label mt-2">Kalorie na godzinę</label>
          <input className="input" type="number" value={form.calories_per_hour} name="calories_per_hour" onChange={handleChange} placeholder="np. 500" />
          <label className="label mt-2">Czas trwania (min)</label>
          <input className="input" type="number" value={form.duration} name="duration" onChange={handleChange} placeholder="np. 30" />
          <div className="mt-2">
            <b>Spalone kalorie:</b> {form.calories || 0} kcal
          </div>
        </section>
        <footer className="modal-card-foot">
          <button className="button is-success" onClick={() => {
            onAdd({
              name: form.name,
              calories: form.calories,
              duration: form.duration,
              calories_per_hour: form.calories_per_hour
            });
            onClose();
          }} disabled={!form.name || !form.calories_per_hour || !form.duration}>Dodaj</button>
          <button className="button" onClick={onClose}>Anuluj</button>
        </footer>
      </div>
    </div>
  );
}