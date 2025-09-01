import React, { useState } from 'react';
import axios from 'axios';

const EXERCISE_API = "https://wger.de/api/v2/exerciseinfo/?language=2"; // API 

export default function ActivityPanel({ activities, onEdit, onDelete, onAdd, fetchDay }) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [duration, setDuration] = useState(60); 

  const handleSearch = async () => {
    // sample api :  https://api.api-ninjas.com/v1/caloriesburned?activity=swimming
    const res = await axios.get(`${EXERCISE_API}&limit=10&search=${encodeURIComponent(search)}`);
    setResults(res.data.results || []);
  };

  const handleAddFromApi = async (activity) => {
    const caloriesPerHour = activity.calories_per_hour || 500; 
    const cal = Math.round((caloriesPerHour * duration) / 60);
    await onAdd({
      name: activity.name || activity.exercise_base?.name || "Aktywność",
      calories: cal,
      duration
    });
    setResults([]);
    setSearch("");
    setDuration(60);
    if (fetchDay) fetchDay();
  };

  return (
    <div className='container'>
      <h2 className="title is-4">Aktywności</h2>
      <div className=''>
        <input className="input"  value={search} onChange={e => setSearch(e.target.value)} placeholder="np. pływanie" />
       <input className="input"  type="number" value={duration} onChange={e => setDuration(Number(e.target.value))} placeholder="min" />
        <button className="button is-link ml-2 mt-4" onClick={handleSearch}>Szukaj aktywności</button>
      </div>
      <ul>
        {results.map((a, i) => (
          <li key={i} style={{marginBottom:8}}>
            <b>{a.name || a.exercise_base?.name}</b>
            <button className="button is-small is-success ml-2" onClick={() => handleAddFromApi(a)}>
              Dodaj ({duration} min)
            </button>
          </li>
        ))}
      </ul>
      <ul>
        {activities.map((activity, index) => (
          <li key={index}>
            <b>{activity.name}</b> {activity.calories} kcal, {activity.duration ? `czas: ${activity.duration} min` : ""}
            <button className="button is-small is-info ml-2" onClick={() => onEdit(activity)}>Edytuj</button>
            <button className="button is-small is-danger ml-2" onClick={() => onDelete(activity.id)}>Usuń</button>
          </li>
        ))}
      </ul>
      <button className="button is-link mt-3" onClick={() => onAdd({ name: "", calories: 0, duration: "" })}>Dodaj ręcznie</button>
    </div>
  );
}