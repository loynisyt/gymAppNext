import React from "react";

export default function DeleteModal({ open, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="modal is-active">
      <div className="modal-background" onClick={onCancel}></div>
      <div className="modal-card">
        <header className="modal-card-head">
          <p className="modal-card-title">Potwierdź usunięcie</p>
          <button className="delete" aria-label="close" onClick={onCancel}></button>
        </header>
        <section className="modal-card-body">
          <p>Czy na pewno chcesz usunąć swój plan diety? Tej operacji nie można cofnąć.</p>
        </section>
        <footer className="modal-card-foot">
          <button className="button is-danger" onClick={onConfirm}>Usuń</button>
          <button className="button" onClick={onCancel}>Anuluj</button>
        </footer>
      </div>
    </div>
  );
}