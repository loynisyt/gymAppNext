import { useState, useEffect } from "react";
import TrainerCard from "./TrainerCard";
import TrainerProfileModal from "./TrainerProfileModal";

export default function TrainerList() {
  const [trainers, setTrainers] = useState([]);
  const [selectedTrainer, setSelectedTrainer] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/offers/trainers")
      .then(res => res.json())
      .then(setTrainers);
  }, []);

  return (
    <div>
      <h2 className="title is-3">Trenerzy</h2>
      <div className="columns is-multiline">
        {trainers.map(trainer => (
          <div className="column is-one-third" key={trainer.id}>
            <TrainerCard
              trainer={trainer}
              onShowProfile={() => setSelectedTrainer(trainer)}
            />
          </div>
        ))}
      </div>
      {selectedTrainer && (
        <TrainerProfileModal
          trainerId={selectedTrainer.id}
          onClose={() => setSelectedTrainer(null)}
        />
      )}
    </div>
  );
}