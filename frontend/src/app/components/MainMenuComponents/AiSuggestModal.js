import React, { useState } from "react";

function parseAIMeal(text) {
  // Znajdź OSTATNIĄ linię zaczynającą się od "Nazwa:"
  const allIndexes = [];
  let idx = text.toLowerCase().indexOf("nazwa:");
  while (idx !== -1) {
    allIndexes.push(idx);
    idx = text.toLowerCase().indexOf("nazwa:", idx + 1);
  }
  const lastIdx = allIndexes.length ? allIndexes[allIndexes.length - 1] : -1;
  let shortText = lastIdx !== -1 ? text.slice(lastIdx) : text;
  // Tylko pierwsze 5 linii (Nazwa, B, W, T, Porcja)
  shortText = shortText.split('\n').slice(0, 5).join('\n');

  const lines = shortText.split('\n').map(l => l.trim()).filter(Boolean);
  let meal = { name: "", protein: "", carbs: "", fats: "", portion_grams: 100 };
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].toLowerCase().startsWith("nazwa")) meal.name = lines[i].split(":")[1]?.trim() || "";
    if (lines[i].toLowerCase().startsWith("b:")) meal.protein = Number(lines[i].split(":")[1]?.replace("g","").trim()) || "";
    if (lines[i].toLowerCase().startsWith("w:")) meal.carbs = Number(lines[i].split(":")[1]?.replace("g","").trim()) || "";
    if (lines[i].toLowerCase().startsWith("t:")) meal.fats = Number(lines[i].split(":")[1]?.replace("g","").trim()) || "";
    if (lines[i].toLowerCase().startsWith("porcja")) meal.portion_grams = Number(lines[i].split(":")[1]?.replace("g","").trim()) || 100;
  }
  meal.calories = Math.round(
    (Number(meal.protein) * 4 + Number(meal.carbs) * 4 + Number(meal.fats) * 9)
  );
  return meal;
}

export default function AiSuggestModal({ dietPlan, mealType, hasVitamins, onSelect, onClose, currentMacros }) {
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState(null);
  const [parsedMeal, setParsedMeal] = useState(null);


const left = dietPlan ? {
    calories: Math.max(0, dietPlan.calories_goal - (currentMacros?.calories || 0)),
    protein: Math.max(0, dietPlan.protein_min - (currentMacros?.protein || 0)),
    carbs: Math.max(0, dietPlan.carbs_min - (currentMacros?.carbs || 0)),
    fats: Math.max(0, dietPlan.fats_min - (currentMacros?.fats || 0)),
  } : {};



  const getSuggestion = async () => {
    setLoading(true);
    setSuggestion(null);
    setParsedMeal(null);

    const apiKey = "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";
    const prompt = `Podaj tylko jeden pomysł na posiłek na ${mealType} w formacie:
Nazwa: ...
B: ...g
W: ...g
T: ...g
Porcja: ...g
Bez przepisów, bez komentarzy, bez instrukcji, tylko dane. Odpowiedź bardzo krótka, po polsku. Makroskładniki podaj dla całej porcji. Uwzglednij zapotrzebowanie do końca dnia które wynosi ${JSON.stringify(left)} `;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b:free",
        messages: [
          { role: "user", content: prompt }
        ]
      })
    });

    const data = await response.json();
    let answer = data.choices?.[0]?.message?.content || "";
    // Utnij odpowiedź od OSTATNIEGO "Nazwa:" i tylko 5 linii
    const allIndexes = [];
    let idx = answer.toLowerCase().indexOf("nazwa:");
    while (idx !== -1) {
      allIndexes.push(idx);
      idx = answer.toLowerCase().indexOf("nazwa:", idx + 1);
    }
    const lastIdx = allIndexes.length ? allIndexes[allIndexes.length - 1] : -1;
    if (lastIdx !== -1) {
      answer = answer.slice(lastIdx).split('\n').slice(0, 5).join('\n');
    }
    setSuggestion(answer);

    // Parsowanie
    const meal = parseAIMeal(answer);
    setParsedMeal(meal);

    setLoading(false);
  };

  return (
    <div className="modal is-active">
      <div className="modal-background" onClick={onClose}></div>
      <div className="modal-card" style={{maxWidth:500}}>
        <header className="modal-card-head">
          <p className="modal-card-title">AI - Propozycja posiłku</p>
          <button className="delete" aria-label="close" onClick={onClose}></button>
        </header>
        <section className="modal-card-body">
          <button className="button is-link" onClick={getSuggestion} disabled={loading}>
            {loading ? "Czekaj..." : "Wygeneruj nowy posiłek"}
          </button>
          {suggestion && (
            <div className="mt-3">
              <b>Oto przygotowana propozycja</b>
              <pre style={{whiteSpace:"pre-wrap", fontSize: "1.1em", marginTop: 8, marginBottom: 8}}>{suggestion}</pre>
              <div>Wybierz posiłek do swojej diety bądź wygeneruj ponownie</div>
              {parsedMeal?.name && (
                <button className="button is-success mt-2" onClick={() => {
                  onSelect(parsedMeal);
                  onClose();
                }}>Dodaj do dnia</button>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}