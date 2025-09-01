import React from "react";
export default function DaySwitcher({ currentDate, setCurrentDate }) {
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "center", justifyContent: "center" }}>
      <button className="button is-small" onClick={() => setCurrentDate(prev => {
        const d = new Date(prev);
        d.setDate(d.getDate() - 1);
        return d.toISOString().slice(0,10);
      })}>←</button>
      <span style={{ fontWeight: 600 }}>{currentDate}</span>
      <button className="button is-small" onClick={() => setCurrentDate(prev => {
        const d = new Date(prev);
        d.setDate(d.getDate() + 1);
        return d.toISOString().slice(0,10);
      })}>→</button>
    </div>
  );
}