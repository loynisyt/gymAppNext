import React from "react";

export default function MacroProgressBar({ label, value, min, max, unit }) {
  let percent = Math.min(100, (value / (max || min)) * 100);
  let color = "#23d160"; // green
  if (value > max) color = "#ed103c"; // red if over
  else if (value < min) color = "#ffdd57"; // yellow if under

  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span>{label}</span>
        <span>
          <b style={{ color }}>{value}</b> / {min}{max ? `-${max}` : ""} {unit}
        </span>
      </div>
      <div style={{
        background: "#eee",
        borderRadius: 8,
        height: 16,
        overflow: "hidden",
        marginTop: 2
      }}>
        <div
          style={{
            width: `${percent}%`,
            background: color,
            height: "100%",
            transition: "width 0.3s"
          }}
        />
      </div>
    </div>
  );
}