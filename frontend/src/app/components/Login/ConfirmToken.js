import { useState } from "react";
import axios from "axios";

export default function ConfirmToken({ username, maskedEmail }) {
  const [token, setToken] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/auth/verify-reset-token", {
        username,
        token
      });
      setMsg("Konto aktywowane!");
      setError("");
    } catch (err) {
      setError("Nieprawidłowy lub wygasły token.");
      setMsg("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="box" style={{ maxWidth: 350, margin: "2rem auto" }}>
      <h2 className="title is-5">Potwierdź kod aktywacyjny</h2>
      <p className="mb-2">Kod został wysłany na adres: <b>{maskedEmail}</b></p>
      <input
        className="input"
        type="text"
        placeholder="Kod z maila"
        value={token}
        onChange={e => setToken(e.target.value)}
        required
      />
      <button className="button is-danger is-fullwidth" type="submit">Potwierdź</button>
      {msg && <p className="has-text-success">{msg}</p>}
      {error && <p className="has-text-danger">{error}</p>}
    </form>
  );
}