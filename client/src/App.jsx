import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';
import React, { useEffect, useState, useContext } from 'react';
import { Container } from 'react-bootstrap/';
import { Route, Routes, Navigate } from 'react-router-dom';
import API from "./API.js";
import FeedbackContext from './contexts/FeedbackContext.js';
import { PhaseProvider, usePhase } from './contexts/PhaseContext.jsx';

import { LoginForm } from './components/Auth.jsx';
import { NotFoundLayout } from './components/PageLayout.jsx';
import Header from "./components/Header.jsx";
import Phase0Page from './components/Phase0Page';
import Phase1Page from './components/Phase1Page.jsx';
import Phase2Page from './components/Phase2Page.jsx';
import Phase3Page from './components/Phase3Page.jsx';
import AddEditProposalForm from './components/AddEditProposalForm.jsx';
import MyPreferences from './components/MyPreferences.jsx';
import NotApprovedProposalsPage from './components/NotApprovedProposalsPage.jsx';
import NotLoggedPage from './components/NotLoggedPage.jsx';

/**
 * Componente che gestisce l'applicazione principale
 */
function App() {
  
  const [user, setUser] = useState(null); //Stato per gesire l'utente
  const [loggedIn, setLoggedIn] = useState(false); //Stato per indicare se l'utente è loggato
  const { setFeedback, setFeedbackFromError } = useContext(FeedbackContext); //Stato per i messaggi di feedback
  const { fase, setFase, budget, setBudget } = usePhase(); //Stati ottenuti dal contesto PhaseContext per gestire fase corrente e budget

  /**
   * UseEffect per caricare le informazioni dell'utente all'avvio dell'applicazione
   * Viene eseguito ogni volta che loggedIn cambia
   * Se l'utente è loggato ottengo le informazioni dall'apposita API
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
   * Funzione che gestisce il login dell'utente
   * @param {*} credentials 
   */
  const handleLogin = async (credentials) => {
    try {
      const user = await API.logIn(credentials);
      setUser(user);
      setLoggedIn(true);
      setFeedback(`Welcome, ${user.name}`);

      // Dopo il login, ottengo la fase e il budget attraverso API e aggiorno lo stato
      const budgetSociale = await API.getBudgetAndFase();
      setFase(budgetSociale.current_fase); //Imposto la fase corrente
      setBudget(budgetSociale.amount); //Imposto il budget corrente

    } catch (error) {
      setLoggedIn(false);
      setFeedbackFromError(error);
      throw error;
    }
  };

  /**
   * Funzione che gestisce il logout dell'utente
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
        <div className="min-vh-100 d-flex flex-column">
          <Header logout={handleLogout} user={user} loggedIn={loggedIn} />
          <Container fluid className="flex-grow-1 d-flex flex-column">
            <Routes>
              {/* Se è loggato naviga verso first page altimenti LoginForm */}
              <Route path="/login" element={loggedIn ? <Navigate replace to="/" /> : <LoginForm login={handleLogin} />} />
              <Route path="/setbudget" element={<Phase0Page user={user} />} />
              <Route path="/myproposals" element={<Phase1Page user={user} />} />
              <Route path="/addproposal" element={<AddEditProposalForm user={user} mode="add" />} />
              <Route path="/editproposal/:proposalId" element={<AddEditProposalForm user={user} mode="edit" />} />
              <Route path="/allproposals" element={<Phase2Page user={user}/>} />
              <Route path="/mypreferences" element={<MyPreferences user={user} />} />
              <Route path="/approvedproposals" element={<Phase3Page user={user} />} />
              <Route path="/notapprovedproposals" element={<NotApprovedProposalsPage user={user} />} />
              <Route path="/notlogged" element={<NotLoggedPage />} />
              <Route path="*" element={<NotFoundLayout user={user}/>} />
              <Route
                path="/"
                element={//Controllo se l'utente è loggato, naviga alla pagina in base alla fase
                  loggedIn ? (
                    fase === 1 ? <Navigate replace to="/myproposals" /> :
                    fase === 2 ? <Navigate replace to="/allproposals" /> :
                    fase === 3 ? <Navigate replace to="/approvedproposals" /> :
                    <Navigate replace to="/setbudget" /> //fase 0
                  ) : (
                    fase === 3 ? <Navigate replace to="/approvedproposals" /> :
                    <Navigate replace to="/notlogged" /> //Se non è loggato, naviga alla "NotLoggedPage"
                  )
                }
              />
            </Routes>
          </Container>
        </div>
    </FeedbackContext.Provider>
  );
}

export default App;