import React, { useState } from "react";
import axios from "axios";

const SPOONACULAR_KEY = "9920c5f066d54c54a4a6a2598e7db81c"; // <-- wstaw swój klucz jeśli chcesz fallback

export default function FoodSearchModal({ onSelect, onClose }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const parseMacros = (prod, portion = 100) => {
  // wartości per 100g
  const protein = Number(prod.nutriments?.proteins) || 0;
  const carbs = Number(prod.nutriments?.carbohydrates) || 0;
  const fats = Number(prod.nutriments?.fat) || 0;
  const vitamin_a = Number(prod.nutriments?.vitamin_a) || 0;
  const vitamin_c = Number(prod.nutriments?.vitamin_c) || 0;
  const calcium = Number(prod.nutriments?.calcium) || 0;
  const magnesium = Number(prod.nutriments?.magnesium) || 0;
  const fiber = Number(prod.nutriments?.fiber) || 0;
  const salt = Number(prod.nutriments?.salt) || 0;

  // przelicz na porcję
  const ratio = portion / 100;
  return {
    calories: Math.round((protein * 4 + carbs * 4 + fats * 9) * ratio),
    protein: Math.round(protein * ratio * 10) / 10,
    carbs: Math.round(carbs * ratio * 10) / 10,
    fats: Math.round(fats * ratio * 10) / 10,
    vitamin_a: Math.round(vitamin_a * ratio * 10) / 10,
    vitamin_c: Math.round(vitamin_c * ratio * 10) / 10,
    calcium: Math.round(calcium * ratio * 10) / 10,
    magnesium: Math.round(magnesium * ratio * 10) / 10,
    fiber: Math.round(fiber * ratio * 10) / 10,
    salt: Math.round(salt * ratio * 10) / 10,
    portion_grams: portion
  };
};


  const search = async () => {
    setLoading(true);
    setResults([]);
    // 1. Szukaj w Open Food Facts
    const res = await axios.get(
      `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=20`
    );
    let prods = res.data.products || [];
    // 2. Fallback do Spoonacular jeśli nie ma makro
    if (prods.length === 0 && SPOONACULAR_KEY) {
      const spoon = await axios.get(
        `https://api.spoonacular.com/food/products/search?query=${encodeURIComponent(query)}&apiKey=${SPOONACULAR_KEY}`
      );
      prods = (spoon.data.products || []).map(p => ({
        product_name: p.title,
        nutriments: {
          energy_kcal: p.nutrition?.nutrients?.find(n => n.name === "Calories")?.amount || 0,
          proteins: p.nutrition?.nutrients?.find(n => n.name === "Protein")?.amount || 0,
          carbohydrates: p.nutrition?.nutrients?.find(n => n.name === "Carbohydrates")?.amount || 0,
          fat: p.nutrition?.nutrients?.find(n => n.name === "Fat")?.amount || 0,
          gramms: p.nutrition?.nutrients?.find(n => n.name === "weightPerServing")?.amount || 100
        }
      }));
    }
    setResults(prods);
    setLoading(false);
  };

  return (
    <div className="modal is-active">
      <div className="modal-background" onClick={onClose}></div>
      <div className="modal-card" style={{width:400}}>
        <header className="modal-card-head">
          <p className="modal-card-title">Wyszukaj produkt</p>
          <button className="delete" aria-label="close" onClick={onClose}></button>
        </header>
        <section className="modal-card-body">
          <input
            className="input"
            placeholder="np. Danio, Chleb, Coca-Cola"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && search()}
          />
          <button className="button is-link mt-2" onClick={search} disabled={loading}>
            Szukaj
          </button>
          <ul style={{marginTop:16, maxHeight:300, overflowY:"auto"}}>
            {results.map((prod, i) => {
              const macros = parseMacros(prod);
              return (
    <li key={prod.id || prod.code || i} style={{marginBottom:8, cursor:"pointer"}} onClick={() => {
  const macros = parseMacros(prod);
  onSelect({
  name: prod.product_name,
  ...parseMacros(prod, 100) // lub inna porcja jeśli użytkownik wybierze
});
  onClose();
}}>
  <b>{prod.product_name}</b>{" "}
  {macros.calories_per_100g ? `${macros.calories_per_100g} kcal/100g` : "?"}
  {macros.protein_per_100g ? `, B: ${macros.protein_per_100g}g` : ""}
  {macros.carbs_per_100g ? `, W: ${macros.carbs_per_100g}g` : ""}
  {macros.fats_per_100g ? `, T: ${macros.fats_per_100g}g` : ""}
  {macros.gramms ? `, Porcja: ${macros.gramms}g` : ""}
</li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}