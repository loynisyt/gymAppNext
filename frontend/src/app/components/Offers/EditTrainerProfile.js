import { useState, useEffect, useRef } from "react";
import axios from "axios";
import MarkdownEditor from "../editors/MarkdownEditor";

export default function EditTrainerProfile() {
  const [profile, setProfile] = useState({
    short_description: "",
    full_description: "",
    training_types: [],
    career: "",
    about: "",
    pricing: "",
    transformations: [],
  });
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [transPhotos, setTransPhotos] = useState([]);
  const fileInputRef = useRef();

  useEffect(() => {
    axios.get("http://localhost:5000/api/offers/trainers/me", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    }).then(res => setProfile(res.data));
  }, []);

  const handleChange = e => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleTypesChange = e => {
    setProfile({ ...profile, training_types: e.target.value.split(",").map(t => t.trim()) });
  };

  // Markdown fields
  const handleMarkdownChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  // Dodawanie zdjęć przemian
  const handleTransPhotoChange = (e) => {
    setTransPhotos(Array.from(e.target.files));
  };

  const handleTransPhotoUpload = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");
    if (transPhotos.length === 0) return;
    const formData = new FormData();
    transPhotos.forEach((file) => formData.append("photos", file));
    try {
      const res = await axios.post(
        "http://localhost:5000/api/offers/trainer/transformations",
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setProfile((prev) => ({
        ...prev,
        transformations: [...(prev.transformations || []), ...res.data.photos],
      }));
      setTransPhotos([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setMsg("Zdjęcia przemian dodane!");
    } catch {
      setError("Błąd dodawania zdjęć przemian.");
    }
  };

  // Usuwanie zdjęcia przemiany
  const handleDeleteTransformation = async (photo) => {
    setMsg("");
    setError("");
    try {
      await axios.delete("http://localhost:5000/api/offers/trainer/transformations", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        data: { photo }
      });
      setProfile((prev) => ({
        ...prev,
        transformations: prev.transformations.filter((p) => p !== photo),
      }));
      setMsg("Zdjęcie przemiany usunięte!");
    } catch {
      setError("Błąd usuwania zdjęcia przemiany.");
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMsg("");
    setError("");
    try {
      await axios.put("http://localhost:5000/api/offers/trainer/profile", profile, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setMsg("Profil zapisany!");
    } catch {
      setError("Błąd zapisu profilu.");
    }
  };

  return (
    <div className="box" style={{maxWidth:600, margin:"2rem auto"}}>
      <h2 className="title is-4">Edytuj profil trenera</h2>
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label className="label">Krótki opis</label>
          <input className="input" name="short_description" value={profile.short_description} onChange={handleChange} />
        </div>
        <MarkdownEditor
          label="Pełny opis"
          value={profile.full_description}
          onChange={val => handleMarkdownChange("full_description", val)}
        />
        <div className="field">
          <label className="label">Rodzaje treningów (oddziel przecinkami)</label>
          <input className="input" value={profile.training_types.join(", ")} onChange={handleTypesChange} />
        </div>
        <MarkdownEditor
          label="Kariera zawodowa"
          value={profile.career}
          onChange={val => handleMarkdownChange("career", val)}
        />
        <MarkdownEditor
          label="O sobie"
          value={profile.about}
          onChange={val => handleMarkdownChange("about", val)}
        />
        <MarkdownEditor
          label="Cennik"
          value={profile.pricing}
          onChange={val => handleMarkdownChange("pricing", val)}
        />
        <div className="file is-small is-info is-centered ">
            
            <button className="button is-info is-medium mr-2">
                Wybierz zdjecie
          <input
            className="file-input"
            type="file"
            multiple
            accept="image/*"
            onChange={handleTransPhotoChange}
            ref={fileInputRef}
          />
        </button>
          <button className="button is-info is-medium ml-2" onClick={handleTransPhotoUpload} disabled={transPhotos.length === 0}>
            Dodaj zdjęcia
          </button>

          <div className="mt-2">
            {profile.transformations?.map(photo => (
              <span key={photo} style={{ position: "relative", display: "inline-block", margin: "5px" }}>
                <img src={photo} alt="przemiana" style={{ width: 80, borderRadius: 8 }} />
                <button
                  className="delete is-small"
                  style={{ position: "absolute", top: 0, right: 0 }}
                  type="button"
                  onClick={() => handleDeleteTransformation(photo)}
                ></button>
              </span>
            ))}
          </div>
        </div>
        <button className="button is-danger is-fullwidth" type="submit">Zapisz profil</button>
        {msg && <p className="has-text-success mt-2">{msg}</p>}
        {error && <p className="has-text-danger mt-2">{error}</p>}
      </form>
    </div>
  );
}