import React, { useState } from "react";
import ManualDietForm from "./ManualDietForm";
import AutoDietQuestions from "./AutoDietQuestions";

export default function DietPlanMissing({ onDietCreated }) {
  const [mode, setMode] = useState(null);

  if (mode === "manual_no_vitamins") {
    return <ManualDietForm withVitamins={false} onDietCreated={onDietCreated} onCancel={() => setMode(null)} />;
  }
  if (mode === "manual_with_vitamins") {
    return <ManualDietForm withVitamins={true} onDietCreated={onDietCreated} onCancel={() => setMode(null)} />;
  }
  if (mode === "auto") {
    return <AutoDietQuestions onComplete={onDietCreated} />;
  }

  return (
    <div className="box" style={{ maxWidth: 400, margin: '2rem auto', padding: '1rem', border: '1px solid #ccc' }}>
      <h2 className="title is-4 has-text-centered">Brak planu diety</h2>
      <p className="has-text-centered">Nie posiadasz jeszcze planu diety. Czy chcesz stworzyć nowy?</p>
      <div className="buttons is-centered" style={{ marginTop: '1rem' }}>
        <button className="button is-primary" onClick={() => setMode('manual_no_vitamins')}>
          Stwórz manualnie (bez witamin)
        </button>
        <button className="button is-warning" onClick={() => setMode('manual_with_vitamins')}>
          Stwórz manualnie (z witaminami)
        </button>
        <button className="button is-link" onClick={() => setMode('auto')}>
          Stwórz automatycznie (zalecane)
        </button>
      </div>
    </div>
  );
}