import React, { useState } from "react";
import axios from "axios";
import CreateActivityModal from "./CreateActivityModal";

const EXERCISE_API = "https://api.api-ninjas.com/v1/caloriesburned?"; // Example API

export default function AcitivityFindingModal({ onAdd, onClose }) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [duration, setDuration] = useState(60);
  const [loading, setLoading] = useState(false);
  const [showManual, setShowManual] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    setResults([]);
    try {
      // API https://api-ninjas.com/api/caloriesburned
      const res = await axios.get(`${EXERCISE_API}?activity=${encodeURIComponent(search)}`, {
        headers: { "X-Api-Key": "jfIqcrSR1cKFNErPoS1+4w==ToZaGPdAUkJnIpXZ" } // <-- replace with your key
      });
      setResults(res.data || []);
    } catch (err) {
      setResults([]);
    }
    setLoading(false);
  };

  const handleAddFromApi = (activity) => {
    // API returns calories_per_hour, but sometimes only calories_per_minute
    let caloriesPerHour = activity.calories_per_hour || (activity.calories_per_minute ? activity.calories_per_minute * 60 : 500);
    const cal = Math.round((caloriesPerHour * duration) / 60);
    onAdd({
      name: activity.name || activity.activity || "Aktywność",
      calories: cal,
      duration,
      calories_per_hour: caloriesPerHour
    });
    onClose();
  };

  return (
    <div className="modal is-active">
      <div className="modal-background" onClick={onClose}></div>
      <div className="modal-card" style={{maxWidth:500}}>
        <header className="modal-card-head">
          <p className="modal-card-title">Znajdź aktywność</p>
          <button className="delete" aria-label="close" onClick={onClose}></button>
        </header>
        <section className="modal-card-body">
          <input className="input" value={search} onChange={e => setSearch(e.target.value)} placeholder="np. pływanie, bieganie" />
          <input className="input mt-2" type="number" value={duration} onChange={e => setDuration(Number(e.target.value))} placeholder="Czas trwania (min)" />
          <button className="button is-link mt-2" onClick={handleSearch} disabled={loading}>Szukaj</button>
          <button className="button is-warning mt-2 ml-2" onClick={() => setShowManual(true)}>Dodaj ręcznie</button>
          <ul style={{marginTop:16, maxHeight:250, overflowY:"auto"}}>
            {results.map((a, i) => (
              <li key={i} style={{marginBottom:8}}>
                <b>{a.name || a.activity}</b> | {a.calories_per_hour ? `${a.calories_per_hour} kcal/h` : ""} 
                <button className="button is-small is-success ml-2" onClick={() => handleAddFromApi(a)}>
                  Dodaj ({duration} min)
                </button>
              </li>
            ))}
          </ul>
        </section>
        {showManual && (
          <CreateActivityModal
            onAdd={activity => {
              onAdd(activity);
              setShowManual(false);
              onClose();
            }}
            onClose={() => setShowManual(false)}
            defaultDuration={duration}
          />
        )}
      </div>
    </div>
  );
}