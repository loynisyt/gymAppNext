import { useState } from "react";
import axios from "axios";

export default function TrainerCard({ trainer, onShowProfile }) {
  const [msg, setMsg] = useState("");
  const [mailMsg, setMailMsg] = useState("");
  const [mailError, setMailError] = useState("");
  const [showMailForm, setShowMailForm] = useState(false);
  const [mailSubject, setMailSubject] = useState("");
  const [mailBody, setMailBody] = useState("");

  const handleAssign = async () => {
    try {
      await axios.post("http://localhost:5000/api/offers/assign-trainer", {
        trainer_id: trainer.id
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setMsg("Zapisano do trenera!");
    } catch {
      setMsg("Błąd zapisu do trenera.");
    }
  };

  const handleSendMail = async (e) => {
    e.preventDefault();
    setMailMsg("");
    setMailError("");
    try {
      await axios.post("http://localhost:5000/api/offers/trainer/contact", {
        trainer_email: trainer.email,
        subject: mailSubject,
        message: mailBody
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setMailMsg("Wiadomość wysłana!");
      setShowMailForm(false);
      setMailSubject("");
      setMailBody("");
    } catch {
      setMailError("Błąd wysyłania maila.");
    }
  };

  return (
    <div className="box">
      <img src={trainer.profile_photo || "/male_user.webp"} alt="avatar" style={{width:80, borderRadius:"50%"}} />
      <h4 className="title is-5">{trainer.first_name} {trainer.last_name}</h4>
      <p>{trainer.short_description}</p>
      <button className="button is-info is-small" onClick={onShowProfile}>Zobacz więcej</button>
      <button className="button is-success is-small ml-2" onClick={handleAssign}>Zapisz się</button>
      <button className="button is-warning is-small ml-2" onClick={() => setShowMailForm(!showMailForm)}>Wyślij maila</button>
      {msg && <p className="has-text-success mt-2">{msg}</p>}
      {showMailForm && (
        <form onSubmit={handleSendMail} className="mt-2">
          <input className="input mb-1" type="text" placeholder="Temat" value={mailSubject} onChange={e => setMailSubject(e.target.value)} required />
          <textarea className="textarea mb-1" placeholder="Treść" value={mailBody} onChange={e => setMailBody(e.target.value)} required />
          <button className="button is-info is-small" type="submit">Wyślij</button>
          <button className="button is-light is-small ml-2" type="button" onClick={() => setShowMailForm(false)}>Anuluj</button>
          {mailMsg && <p className="has-text-success mt-1">{mailMsg}</p>}
          {mailError && <p className="has-text-danger mt-1">{mailError}</p>}
        </form>
      )}
    </div>
  );
}