import React, { useState } from "react";

export default function EditUserModal({ user, onClose, onSave }) {
  const [form, setForm] = useState({
    first_name: user.first_name || "",
    last_name: user.last_name || "",
    email: user.email || "",
    phone: user.phone || "",
    role: user.role || "user",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...user, ...form });
  };

  return (
    <div className="modal is-active">
      <div className="modal-background" onClick={onClose}></div>
      <div className="modal-card" style={{ maxWidth: 400 }}>
        <header className="modal-card-head">
          <p className="modal-card-title">Edytuj użytkownika</p>
          <button className="delete" aria-label="close" onClick={onClose}></button>
        </header>
        <section className="modal-card-body">
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label className="label">Imię</label>
              <div className="control">
                <input
                  className="input"
                  type="text"
                  name="first_name"
                  value={form.first_name}
                  onChange={handleChange}
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
                  value={form.last_name}
                  onChange={handleChange}
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
                  value={form.email}
                  onChange={handleChange}
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
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="field">
              <label className="label">Rola</label>
              <div className="control">
                <div className="select">
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                  >
                    <option value="user">User</option>
                    <option value="trainer">Trainer</option>
                    <option value="ward">Ward</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
            </div>
            <button className="button is-success" type="submit">
              Zapisz zmiany
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}