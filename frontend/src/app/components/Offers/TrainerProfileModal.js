import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
const MDPreview = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

export default function TrainerProfileModal({ trainerId, onClose }) {
  const [trainer, setTrainer] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5000/api/offers/trainers/${trainerId}`)
      .then(res => res.json())
      .then(setTrainer);
  }, [trainerId]);

  if (!trainer) return null;

  return (
    <div className="modal is-active">
      <div className="modal-background" onClick={onClose}></div>
      <div className="modal-card" style={{maxWidth:600}}>
        <header className="modal-card-head">
          <p className="modal-card-title">{trainer.first_name} {trainer.last_name}</p>
          <button className="delete" aria-label="close" onClick={onClose}></button>
        </header>
        <section className="modal-card-body">
          <img src={trainer.profile_photo || "/male_user.webp"} alt="avatar" style={{width:120, borderRadius:"50%"}} />
          <h4 className="title is-5">Rodzaj treningów</h4>
          <ul>
            {trainer.training_types?.map(type => <li key={type}>{type}</li>)}
          </ul>
          <h4 className="title is-5">Pełny opis</h4>
          <MDPreview
            value={trainer.full_description || ""}
            preview="preview"
            hideToolbar={true}
          />
          <h4 className="title is-5">Kariera zawodowa</h4>
          <MDPreview
            value={trainer.career || ""}
            preview="preview"
            hideToolbar={true}
          />
          <h4 className="title is-5">O sobie</h4>
          <MDPreview
            value={trainer.about || ""}
            preview="preview"
            hideToolbar={true}
          />
          <h4 className="title is-5">Cennik</h4>
          <MDPreview
            value={trainer.pricing || ""}
            preview="preview"
            hideToolbar={true}
          />
          <h4 className="title is-5">Przemiany</h4>
          <div>
            {trainer.transformations?.map(photo => (
              <img key={photo} src={photo} alt="przemiana" style={{width:80, margin:"5px"}} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}