import React, { useState } from 'react';
import axios from 'axios';
import CreateActivityModal from './CreateActivityModal';
import AcitivityFindingModal from './AcitivityFindingModal'; // Dodaj import

const EXERCISE_API = "https://api.api-ninjas.com/v1/caloriesburned"; // API-Ninjas, returns kcal/h

export default function ActivityPanel({ activities, onEdit, onDelete, onAdd, fetchDay }) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [duration, setDuration] = useState(60);
  const [showManual, setShowManual] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showFindModal, setShowFindModal] = useState(false); // Dodaj stan modala

  const handleSearch = async () => {
    setLoading(true);
    setResults([]);
    try {
      const res = await axios.get(`${EXERCISE_API}?activity=${encodeURIComponent(search)}`, {
        headers: { "X-Api-Key": "YOUR_API_KEY" } // <-- podmień na swój klucz
      });
      setResults(res.data || []);
    } catch (err) {
      setResults([]);
    }
    setLoading(false);
  };

  const handleAddFromApi = async (activity) => {
    let caloriesPerHour = activity.calories_per_hour || (activity.calories_per_minute ? activity.calories_per_minute * 60 : 500);
    const cal = Math.round((caloriesPerHour * duration) / 60);
    await onAdd({
      name: activity.name || activity.activity || "Aktywność",
      calories: cal,
      duration,
      calories_per_hour: caloriesPerHour
    });
    setResults([]);
    setSearch("");
    setDuration(60);
    if (fetchDay) fetchDay();
  };

  return (
    <div className='container'>
      <h2 className="title is-4">Aktywności</h2>
      <div>
        <button className="button is-link mb-4" onClick={() => setShowFindModal(true)}>
          Szukaj aktywności
        </button>
        <button className="button is-warning ml-2 mb-4" onClick={() => setShowManual(true)}>
          Dodaj ręcznie
        </button>
      </div>
      <ul>
        {activities.map((activity, index) => (
          <li key={index} className='mt-3'>
            <b>{activity.name}</b> {activity.calories} kcal, {activity.duration ? `czas: ${activity.duration} min` : ""}
            <button className="button is-small is-info ml-2" onClick={() => onEdit(activity)}>Edytuj</button>
            <button className="button is-small is-danger ml-2" onClick={() => onDelete(activity.id)}>Usuń</button>
          </li>
        ))}
      </ul>
      {showManual && (
        <CreateActivityModal
          onAdd={activity => {
            onAdd(activity);
            setShowManual(false);
            if (fetchDay) fetchDay();
          }}
          onClose={() => setShowManual(false)}
          defaultDuration={duration}
        />
      )}
      {showFindModal && (
        <AcitivityFindingModal
          onAdd={activity => {
            onAdd(activity);
            setShowFindModal(false);
            if (fetchDay) fetchDay();
          }}
          onClose={() => setShowFindModal(false)}
        />
      )}
    </div>
  );
}