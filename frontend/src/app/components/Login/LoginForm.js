"use client";
import { useState } from "react";
import axios from "axios";

export default function LoginForm({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        username,
        password,
      });
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        if(res.data.role){
        localStorage.setItem("role", res.data.role);
      }
      onLogin();
      }
      
    } catch {
      setError("Nieprawidłowe dane logowania");
    }
  };

  return (
    <div className="box" style={{ maxWidth: 350, margin: "2rem auto" }}>
      <form onSubmit={handleSubmit}>
        <h2 className="title is-4 has-text-centered">Logowanie</h2>
        <div className="field">
          <label className="label">Nazwa użytkownika</label>
          <div className="control">
            <input className="input" type="text" value={username} onChange={e => setUsername(e.target.value)} required />
          </div>
        </div>
        <div className="field">
          <label className="label">Hasło</label>
          <div className="control">
            <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
        </div>
        <button className="button is-danger is-fullwidth" type="submit">Zaloguj się</button>
        {error && <p className="has-text-danger has-text-centered mt-2">{error}</p>}
      </form>
    </div>
  );
}