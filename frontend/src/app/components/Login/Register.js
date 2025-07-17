"use client";
import { useState } from "react";
import axios from "axios";

export default function Register({ onRegister }) {
  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    email: "",
    sex: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (form.password !== form.confirmPassword) {
      setError("Hasła się nie zgadzają");
      return;
    }
    if (form.password.length < 6) {
      setError("Hasło musi mieć co najmniej 6 znaków");
      return;
    }
    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", {
        username: form.username,
        password: form.password,
        email: form.email,
        sex: form.sex,
      });
      setMessage("Rejestracja udana! Sprawdź maila, by aktywować konto.");
      setError("");
      if (onRegister) onRegister(form.username, res.data.maskedEmail);
    } catch (err) {
      if (err.response) {
        if (err.response.status === 400) {
          if (err.response.data.message === "Username already exists") {
            setError("Taki użytkownik już istnieje.");
          } else if (err.response.data.message === "Email already exists") {
            setError("Ten email jest już używany.");
          } else {
            setError(err.response.data.message || "Błąd rejestracji.");
          }
        } else {
          setError("Błąd serwera. Spróbuj ponownie później.");
        }
      } else {
        setError("Brak połączenia z serwerem.");
      }
    }
  };

  return (
    <div className="box" style={{ maxWidth: 350, margin: "2rem auto" }}>
      <form onSubmit={handleSubmit}>
        <h2 className="title is-4 has-text-centered">Rejestracja</h2>
        <div className="field">
          <label className="label">Nazwa użytkownika</label>
          <div className="control">
            <input className="input" type="text" name="username" value={form.username} onChange={handleChange} required />
          </div>
        </div>
        <div className="field">
          <label className="label">Email</label>
          <div className="control">
            <input className="input" type="email" name="email" value={form.email} onChange={handleChange} required />
          </div>
        </div>
        <div className="field">
          <label className="label">Hasło</label>
          <div className="control">
            <input className="input" type="password" name="password" value={form.password} onChange={handleChange} required />
          </div>
        </div>
        <div className="field">
          <label className="label">Powtórz hasło</label>
          <div className="control">
            <input className="input" type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required />
          </div>
        </div>
        <div className="field">
          <label className="label">Płeć</label>
          <div className="control">
            <div className="select is-fullwidth">
              <select name="sex" value={form.sex} onChange={handleChange} required>
                <option value="">Wybierz płeć</option>
                <option value="m">Mężczyzna</option>
                <option value="f">Kobieta</option>
              </select>
            </div>
          </div>
        </div>
        <button className="button is-danger is-fullwidth" type="submit">Zarejestruj się</button>
        {message && <p className="has-text-success has-text-centered mt-2">{message}</p>}
        {error && <p className="has-text-danger has-text-centered mt-2">{error}</p>}
      </form>
    </div>
  );
}