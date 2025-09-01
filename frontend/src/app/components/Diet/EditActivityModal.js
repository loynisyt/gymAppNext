import React, { useState } from "react";
export default function EditActivityModal({ activity, onSave, onClose }) {
  const [form, setForm] = useState(activity);
  return (
    <div className="modal is-active">
      <div className="modal-background" onClick={onClose}></div>
      <div className="modal-card">
        <header className="modal-card-head">
          <p className="modal-card-title">Edytuj aktywność</p>
          <button className="delete" aria-label="close" onClick={onClose}></button>
        </header>
        <section className="modal-card-body">
          <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <input className="input mt-2" type="number" value={form.calories} onChange={e => setForm(f => ({ ...f, calories: e.target.value }))} placeholder="Kalorie" />
          <input className="input mt-2" type="number" value={form.duration || ""} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} placeholder="Czas trwania (min)" />
        </section>
        <footer className="modal-card-foot">
          <button className="button is-success" onClick={() => onSave(form)}>Zapisz</button>
          <button className="button" onClick={onClose}>Anuluj</button>
        </footer>
      </div>
    </div>
  );
}