"use client";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import Login from "./components/Login/LoginForm";
import Register from "./components/Login/Register";
import ConfirmToken from "./components/Login/ConfirmToken";
import Navbar from "./components/Navbar/Navbar";
import AdminPanel from "./components/Admin/AdminPanel";
import WardPanel from "./components/WardPanel/WardPanel";
import HomePage from "./components/Home/Home";
import "bulma/css/bulma.min.css";
import Profile from "./components/Profile/Profile";
import TrainerList from "./components/Offers/TrainerList";
import EditTrainerProfile from "./components/Offers/EditTrainerProfile";
import DietPanel from "./components/Diet/DietPanel";

import "./App.css"; // Import global styles

export default function Home() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [pendingActivation, setPendingActivation] = useState(false);
  const [registeredUser, setRegisteredUser] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [view, setView] = useState("login"); // "login" or "register"
  const [role, setRole] = useState(null);
  const [activePanel, setActivePanel] = useState(null);

  useEffect(() => {
    setLoggedIn(!!localStorage.getItem("token"));
    setRole(localStorage.getItem("role"));
    setActivePanel(null); // reset panelu po wylogowaniu/logowaniu
  }, [loggedIn]);

  const handleRegister = (username, maskedEmail) => {
    setRegisteredUser(username);
    setMaskedEmail(maskedEmail);
    setPendingActivation(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setLoggedIn(false);
    setRole(null);
    setActivePanel(null);
  };

  // Render panel na podstawie wyboru
let mainContent = null;
if (loggedIn && activePanel === "profile") {
  mainContent = <Profile setActivePanel={setActivePanel} />;
} else if (loggedIn && activePanel === "editTrainer" && role === "trainer") {
  mainContent = <EditTrainerProfile setActivePanel={setActivePanel} />;
} else if (loggedIn && activePanel === "offers") {
  mainContent = <TrainerList />;
} else if (loggedIn && activePanel === "admin" && role === "admin") {
  mainContent = <AdminPanel />;
} else if (loggedIn && activePanel === "trener" && role === "trener") {
  mainContent = <WardPanel />;
  
}
else if (loggedIn && activePanel === "diet") {
  mainContent = <DietPanel />;
}


else if (loggedIn) {
  mainContent = <HomePage />;
}



  return (
    <div>
      <Navbar
        loggedIn={loggedIn}
        onLogout={handleLogout}
        role={role}
        activePanel={activePanel}
        setActivePanel={setActivePanel}
      />
      {!loggedIn ? (
        <div className="section">
          <div className="container" style={{ maxWidth: 400 }}>
            {!pendingActivation ? (
              <>
                {view === "login" ? (
                  <>
                    <Login onLogin={() => setLoggedIn(true)} />
                    <div className="has-text-centered mt-3">
                      <button
                        className="button is-text"
                        onClick={() => setView("register")}
                      >
                        Nie masz konta? Zarejestruj się
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <Register onRegister={handleRegister} />
                    <div className="has-text-centered mt-3">
                      <button
                        className="button is-text"
                        onClick={() => setView("login")}
                      >
                        Masz już konto? Zaloguj się
                      </button>
                    </div>
                  </>
                )}
              </>
            ) : (
              <ConfirmToken username={registeredUser} maskedEmail={maskedEmail} />
            )}
          </div>
        </div>
      ) : (
        <div className="container has-text-centered" style={{ marginTop: "2rem" }}>
          {mainContent}
        </div>
      )}
    </div>
  );
}