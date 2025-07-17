"use client";
import { useState, useEffect } from "react";
import logo from "../../../../public/logo.ico";
import lightModeIcon from "../../../../public/sun.svg";
import darkModeIcon from "../../../../public/moon.svg";
import "./Navbar.css"; // Assuming you have a CSS file for styling

export default function Navbar({ loggedIn, onLogout, role, activePanel, setActivePanel }) {
  const [mode, setMode] = useState("light");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedMode = localStorage.getItem("mode") || "light";
      setMode(savedMode);
      document.body.className = savedMode;
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.body.className = mode;
      localStorage.setItem("mode", mode);
    }
  }, [mode]);

  function toggleMode() {
    setMode((prev) => (prev === "light" ? "dark" : "light"));
  }

  function toggleMenu() {
    setMenuOpen((prev) => !prev);
  }

  return (
    <nav className={`navbar is-danger`} role="navigation" aria-label="main navigation">
      <div className="navbar-brand">
        <a className="is-main-icon" href="/">
          <img src={logo.src} alt="Logo" style={{ height: 80 }} />
        </a>
        <button
          className="button is-info ml-5"
          onClick={toggleMode}
          aria-label="Toggle dark mode"
        >
          {mode === "light" ? (
            <img src={darkModeIcon.src} alt="Tryb ciemny" />
          ) : (
            <img src={lightModeIcon.src} alt="Tryb jasny" />
          )}
        </button>
        <button
          className={`burger-menu-button${menuOpen ? " open" : ""}`}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span className="burger-bar"></span>
          <span className="burger-bar"></span>
          <span className="burger-bar"></span>
        </button>
      </div>
      <div className={`navbar-end${menuOpen ? " open" : ""}`}>
        {loggedIn && (
          <button
            className={`button is-white${activePanel === "profile" ? " is-info" : ""}`}
            onClick={() => setActivePanel("profile")}
          >
            Profil
          </button>
        )}
        {loggedIn && (
          <button
            className={`button is-white${activePanel === "offers" ? " is-info" : ""}`}
            onClick={() => setActivePanel("offers")}
          >
            Nasza oferta
          </button>
        )}
        {loggedIn && (
          <button
            className={`button is-white${activePanel === "diet" ? " is-info" : ""}`}
            onClick={() => setActivePanel("diet")}
          >
            Dieta
          </button>
        )}
        {loggedIn && role === "admin" && (
          <button
            className={`button is-white${activePanel === "admin" ? " is-info" : ""}`}
            onClick={() => setActivePanel("admin")}
          >
            Panel Admina
          </button>
        )}
        {loggedIn && role === "trener" && (
          <button
            className={`button is-white${activePanel === "trener" ? " is-info" : ""}`}
            onClick={() => setActivePanel("trener")}
          >
            Panel Trenera
          </button>
        )}
        {loggedIn ? (
          <button className="button is-light" onClick={onLogout}>
            Wyloguj
          </button>
        ) : null}
      </div>      
    </nav>
  );
}
