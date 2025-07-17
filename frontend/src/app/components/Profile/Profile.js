"use client";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function Profile({ setActivePanel }) {
  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    profile_photo: "",
    two_factor_method: "",
    sex: "",
    role: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [photo, setPhoto] = useState(null);
  const [photoUrl, setPhotoUrl] = useState("");
  const [twoFA, setTwoFA] = useState("");
  const fileInputRef = useRef();
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/users/me", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setProfile(res.data);
        setPhotoUrl(res.data.profile_photo ? `http://localhost:5000${res.data.profile_photo}` : "");
        setTwoFA(res.data.two_factor_method || "");
      } catch (err) {
        setError("Nie udało się pobrać danych profilu");
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    setPhoto(e.target.files[0]);
  };

  const handlePhotoUpload = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    if (!photo) return;
    const formData = new FormData();
    formData.append("photo", photo);
    try {
      const res = await axios.post(
        "http://localhost:5000/api/users/profile/photo",
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setPhotoUrl(`http://localhost:5000${res.data.photo}`);
      setMessage("Zdjęcie zaktualizowane!");
      setPhoto(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setError("Błąd podczas uploadu zdjęcia");
    }
  };

  const handlePhotoDelete = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      await axios.delete("http://localhost:5000/api/users/profile/photo", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setPhotoUrl("");
      setMessage("Zdjęcie usunięte!");
    } catch (err) {
      setError("Błąd podczas usuwania zdjęcia");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      await axios.put(
        "http://localhost:5000/api/users/profile/update",
        {
          first_name: profile.first_name,
          last_name: profile.last_name,
          email: profile.email,
          phone: profile.phone,
          sex: profile.sex,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setMessage("Profil zaktualizowany!");
    } catch (err) {
      setError("Błąd podczas zapisu profilu");
    }
  };

  const handle2FAChange = async (e) => {
    const method = e.target.value;
    setTwoFA(method);
    try {
      await axios.put(
        "http://localhost:5000/api/users/2fa",
        { method },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setMessage("Metoda 2FA zaktualizowana!");
    } catch (err) {
      setError("Błąd podczas zmiany metody 2FA");
    }
  };

  // Choose avatar: custom photo, else by sex
  let avatarSrc = "/male_user.webp";
  if (photoUrl) {
    avatarSrc = photoUrl;
  } else if (
    profile.sex &&
    (profile.sex.toLowerCase() === "f" ||
      profile.sex.toLowerCase() === "female" ||
      profile.sex.toLowerCase() === "kobieta" ||
      profile.sex.toLowerCase() === "w")
  ) {
    avatarSrc = "/female_user.webp";
  }

  return (
    <div className="box" style={{ maxWidth: 420, margin: "2rem auto" }}>
      <h2 className="title is-4 has-text-centered">Twój profil</h2>
      <div className="has-text-centered mb-2">
        <span className="tag is-info is-medium">
          Ranga: {profile.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : "Brak"}
        </span>
      </div>
      {profile.role === "trainer" && (
        <div className="has-text-centered mb-4">
          <button
            className="button is-danger is-fullwidth"
            onClick={() => setActivePanel("editTrainer")}
          >
            Edytuj profil trenera
          </button>
        </div>
      )}
      <div className="has-text-centered mb-4">
        <div style={{ display: "inline-block", position: "relative" }}>
          <img
            src={avatarSrc}
            alt="Zdjęcie profilowe"
            style={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              objectFit: "cover",
              border: "2px solid #ed103c",
              background: "#fff",
            }}
          />
        </div>
        <form onSubmit={handlePhotoUpload} style={{ marginTop: "1rem" }}>
          <div className="file is-small is-info is-centered">
            <label className="file-label ">
              <input
                className="file-input"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                ref={fileInputRef}
              />
              <span className="file-cta">
                <span className="file-label">Wybierz zdjęcie</span>
              </span>
            </label>
            <button
              className="button is-info is-small ml-2"
              type="submit"
              disabled={!photo}
            >
              Zmień zdjęcie
            </button>
          </div>
        </form>
        {photoUrl && (
          <button
            className="button is-danger is-small ml-2"
            style={{ marginTop: "0.5rem" }}
            onClick={handlePhotoDelete}
          >
            Usuń zdjęcie
          </button>
        )}
      </div>
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label className="label">Imię</label>
          <div className="control">
            <input
              className="input"
              type="text"
              name="first_name"
              value={profile.first_name || ""}
              onChange={handleChange}
              autoComplete="given-name"
            />
          </div>
        </div>
        <div className="field">
          <label className="label">Nazwisko</label>
          <div className="control">
            <input
              className="input"
              type="text"
              name="last_name"
              value={profile.last_name || ""}
              onChange={handleChange}
              autoComplete="family-name"
            />
          </div>
        </div>
        <div className="field">
          <label className="label">Email</label>
          <div className="control">
            <input
              className="input"
              type="email"
              name="email"
              value={profile.email || ""}
              onChange={handleChange}
              autoComplete="email"
            />
          </div>
        </div>
        <div className="field">
          <label className="label">Telefon</label>
          <div className="control">
            <input
              className="input"
              type="text"
              name="phone"
              value={profile.phone || ""}
              onChange={handleChange}
              autoComplete="tel"
            />
          </div>
        </div>
        <div className="field">
          <label className="label">Płeć</label>
          <div className="control">
            <div className="select is-fullwidth">
              <select name="sex" value={profile.sex || ""} onChange={handleChange} required>
                <option value="">Wybierz płeć</option>
                <option value="m">Mężczyzna</option>
                <option value="f">Kobieta</option>
              </select>
            </div>
          </div>
        </div>
        <div className="field">
          <label className="label">Weryfikacja dwuskładnikowa (2FA)</label>
          <div className="control">
            <div className="select is-fullwidth">
              <select value={twoFA} onChange={handle2FAChange}>
                <option value="">Brak</option>
                <option value="email">Email</option>
                <option value="sms" disabled>SMS (niedostępny)</option>
              </select>
            </div>
          </div>
        </div>
        <button className="button is-danger is-fullwidth" type="submit">
          Zapisz zmiany
        </button>
        {message && <p className="has-text-success has-text-centered mt-2">{message}</p>}
        {error && <p className="has-text-danger has-text-centered mt-2">{error}</p>}
      </form>
    </div>
  );
}