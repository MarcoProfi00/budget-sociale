import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';

import React, { useEffect, useState, useContext } from 'react';

import { Container } from 'react-bootstrap/';
import { Route, Routes, Navigate } from 'react-router-dom';
import { LoginForm } from './components/Auth.jsx';
import { NotFoundLayout } from './components/PageLayout.jsx';

import API from "./API.js";

import FeedbackContext from './contexts/FeedbackContext.js';
import { PhaseProvider, usePhase } from './contexts/PhaseContext.jsx';


import Header from "./components/Header.jsx";
import Phase0Page from './components/Phase0Page';
import Phase1Page from './components/Phase1Page.jsx';


function App() {
  
  const [user, setUser] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const { setFeedback, setFeedbackFromError } = useContext(FeedbackContext);
  const { fase, setFase } = usePhase(null); // Ottengo fase e funzione per ottenere budget e fase dal contesto PhaseContext

  /**
   * Effetto per caricare le informazioni dell'utente all'avvio dell'applicazione
   */
  useEffect(() => {
    API.getUserInfo()
        .then(user => {
            setLoggedIn(true);
            setUser(user);  // qui hai le informazioni dell'utente, se già autenticato
        }).catch(e => {
            if(loggedIn)    // stampa l'errore solo se lo stato è incoerente (cioè, l'app è stata configurata per essere autenticata)
                setFeedbackFromError(e);
            setLoggedIn(false); setUser(null);
        }); 
}, []);

  /**
   * Funzione che gestisce il login dell'user
   * @param {*} credentials 
   */
  const handleLogin = async (credentials) => {
    try {
      const user = await API.logIn(credentials);
      setUser(user);
      setLoggedIn(true);
      setFeedback(`Welcome, ${user.name}`);
    } catch (error) {
      setFeedbackFromError(error);
    }
  };

  /**
   * Effetto per ottenere la fase corrente dopo il login
   */
  useEffect(() => {
    const fetchFase = async () => {
      try {
        const budgetAndFase = await API.getBudgetAndFase();
        // Supponendo che budgetAndFase contenga un campo 'fase'
        const faseAttuale = budgetAndFase.fase;
        setFase(faseAttuale);
      } catch (error) {
        console.error('Errore durante il recupero della fase:', error);
        // Gestisci l'errore se necessario
      }
    };

    if (loggedIn) {
      fetchFase();
    }
  }, []);


  /**
   * Funzione che gestisce il logout dell'user
   */
  const handleLogout = async () => {
    try {
      await API.logOut();
      setLoggedIn(false);
      setUser(null);
    } catch (error) {
      setFeedbackFromError(error);
    }
  };


  return (
    <FeedbackContext.Provider value={{ setFeedback, setFeedbackFromError }}>
      <PhaseProvider>
        <div className="min-vh-100 d-flex flex-column">
          <Header logout={handleLogout} user={user} loggedIn={loggedIn} />
          <Container fluid className="flex-grow-1 d-flex flex-column">
            <Routes>
              <Route path="/login" element={loggedIn ? <Navigate replace to="/" /> : <LoginForm login={handleLogin} />} />
              <Route path="*" element={<NotFoundLayout />} />
              <Route path="/" element={
                loggedIn ? (
                  fase === 1 ? (
                    <Phase1Page user={user} />
                  ) : (
                    <Phase0Page user={user} />
                  )
                ) : (
                  <Navigate replace to="/login" />
                )
              } />
            </Routes>
          </Container>
        </div>
      </PhaseProvider>
    </FeedbackContext.Provider>
  );
}

export default App;