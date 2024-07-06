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
import Phase2Page from './components/Phase2Page.jsx';
import AddEditProposalForm from './components/AddEditProposalForm.jsx';
import MyPreferences from './components/MyPreferences.jsx';


function App() {
  
  const [user, setUser] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const { setFeedback, setFeedbackFromError } = useContext(FeedbackContext);
  const { fase, setFase, budget, setBudget } = usePhase(); // Ottengo fase e funzione per ottenere budget e fase dal contesto PhaseContext

  //Stato usato per forzare un refresh del budgetSociale
  const [shouldRefresh, setShouldRefresh] = useState(true);


  /**
   * Effetto per caricare le informazioni dell'utente all'avvio dell'applicazione
   */
  useEffect(() => {
    if (loggedIn) {
      API.getUserInfo()
        .then(user => {
          setUser(user);
        })
        .catch(e => {
          setFeedbackFromError(e);
          setLoggedIn(false);
          setUser(null);
        });
    }
  }, [setFeedbackFromError]);


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

      // Dopo il login, ottieni la fase e il budget dal server e aggiorna lo stato
      const budgetSociale = await API.getBudgetAndFase();
      setFase(budgetSociale.current_fase); // Imposta la fase nel contesto
      setBudget(budgetSociale.amount); // Imposta il budget nel contesto

    } catch (error) {
      setFeedbackFromError(error);
    }
  };

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
              <Route path="/myproposals" element={<Phase1Page user={user} />} />
              <Route path="/addproposal" element={<AddEditProposalForm user={user} mode="add" />} />
              <Route path="/editproposal/:proposalId" element={<AddEditProposalForm user={user} mode="edit" />} />
              <Route path="/allproposals" element={<Phase2Page user={user}/>} />
              <Route path="/mypreferences" element={<MyPreferences user={user} />} />
              <Route path="*" element={<NotFoundLayout user={user}/>} />
              <Route path="/" element={
                loggedIn ? (
                  fase === 1 ? (
                    <Navigate replace to="/myproposals" />
                  ) : fase === 2 ? (
                    <Navigate replace to ="/allproposals" />
                  ) : (
                    <Phase0Page user={user} />
                  )
                ) : (
                  <Navigate replace to="/login" />
                )
              } />
            </Routes>
            {/*<div>
              Current Phase: {fase}
              <br />
              Current Budget: {budget}
            </div>
            */}
          </Container>
        </div>
      </PhaseProvider>
    </FeedbackContext.Provider>
  );
}

export default App;