import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';
import { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap/';
import { Route, Routes, Navigate } from 'react-router-dom';
import { LoginForm } from './components/Auth.jsx';
import { NotFoundLayout } from './components/PageLayout.jsx';
import API from "./API.js";
import FeedbackContext from './contexts/FeedbackContext.js';
import { PhaseProvider, usePhase } from './contexts/PhaseContext.jsx';
import Phase0Page from './components/Phase0Page';
import Header from "./components/Header.jsx";

function App() {
  const [user, setUser] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [feedback, setFeedback] = useState('');

  const setFeedbackFromError = (err) => {
    let message = '';
    if (err.message) message = err.message;
    else message = "Unknown Error";
    setFeedback(message);
  };

  useEffect(() => {
    API.getUserInfo()
      .then(user => {
        setLoggedIn(true);
        setUser(user);
      }).catch(e => {
        setFeedbackFromError(e);
        setLoggedIn(false);
        setUser(null);
      });
  }, []);

  const handleLogin = async (credentials) => {
    const user = await API.logIn(credentials);
    setUser(user);
    setLoggedIn(true);
    setFeedback("Welcome, " + user.name);
  };

  const handleLogout = async () => {
    await API.logOut();
    setLoggedIn(false);
    setUser(null);
  };

  return (
    <FeedbackContext.Provider value={{ setFeedback, setFeedbackFromError }}>
      <PhaseProvider>
        <div className="min-vh-100 d-flex flex-column">
          <Header logout={handleLogout} user={user} loggedIn={loggedIn} />
          <Container fluid className="flex-grow-1 d-flex flex-column">
            <Routes>
              <Route path="/login" element={loggedIn ? <Navigate replace to="/" /> : <LoginForm login={handleLogin} />} />
              <Route path="/" element={loggedIn ? <Phase0Page user={user} /> : <Navigate replace to="/login" />} />
              <Route path="*" element={<NotFoundLayout />} />
            </Routes>
          </Container>
        </div>
      </PhaseProvider>
    </FeedbackContext.Provider>
  );
}

export default App;
