import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import './App.css'

import { useEffect, useState } from 'react'
import { Container, Toast, ToastBody } from 'react-bootstrap/';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { LoginForm } from './components/Auth.jsx';
import { NotFoundLayout } from './components/PageLayout.jsx';
import API from "./API.js";
import FeedbackContext from './contexts/FeedbackContext.js';
import { PhaseProvider, usePhase } from './contexts/PhaseContext.jsx';
import Phase0Page from './components/Phase0Page';
import AdminPanel from './components/AdminPanel';


import Header from "./components/Header.jsx";


function App() {

    //Ottiene e gestisce lo stato della fase
    const { fase, setFase } = usePhase();
    
    //Contiene le info cell'utente attualmente loggato
    const [user, setUser] = useState(null);
    
    //Indica lo stato di autenticazione dell'utente
    const [loggedIn, setLoggedIn] = useState(false);

    //Stato usato per memorizzare il messaggio di feedback da mostrare nel messaggio pop-up
    const [feedback, setFeedback] = useState('');


    const setFeedbackFromError = (err) => {
        let message = '';
        if (err.message) message = err.message;
        else message = "Unknown Error";
        setFeedback(message);
    };


    /**
     * Verifica se l'utente è gia autenticato
     * Chiamato solo la prima volta che il componente viene montato
     */
    useEffect(() => {
        API.getUserInfo()
            .then(user => {
                setLoggedIn(true);
                setUser(user); //info utente, se è gia autenticato
                setUserRole(user.role); // Assumendo che il ruolo sia restituito dall'API
            }).catch(e => {
                if(loggedIn)
                    setFeedbackFromError(e);
                setLoggedIn(false);
                setUser(null);
            });
    },  []);  

    /**
     * Gestisce il processo di login
     * Richiede username e password dentro l'oggetto credentials
     */
    const handleLogin = async (credentials) => {
        const user = await API.logIn(credentials);
        setUser(user);
        setLoggedIn(true);
        setFeedback("Welcome, "+user.name);
    };

    /**
     * Gestisce il processo di logout
     */
    const handleLogout = async () => {
        await API.logOut();
        setLoggedIn(false); 
        setUser(null);
    };

    return (
        <FeedbackContext.Provider value={{setFeedback, setFeedbackFromError}}>
            <PhaseProvider>
                <div className="min-vh-100 d-flex flex-column">
                    <Header logout={handleLogout} user={user} loggedIn={loggedIn} />

                    <Container fluid className="flex-grow-1 d-flex flex-column">
                        <Routes>
                        {/* Route per il login */}
                        <Route path="/login" element={loggedIn ? <Navigate replace to="/" /> : <LoginForm login={handleLogin} />} />
                        
                        {/* Route per la fase 0 */}
                        <Route path="/" element={loggedIn ? <Phase0Page user={user} fase={fase} /> : <Navigate replace to="/login" />} />
                        
                        {/* Route per l'admin panel */}
                        <Route path="/admin" element={loggedIn && user?.role === 'admin' ? <AdminPanel /> : <Navigate replace to="/login" />} />
                        
                        {/* Route per pagina non trovata */}
                        <Route path="*" element={<NotFoundLayout/>}/>

                                    
                        </Routes>
                    </Container>
                </div>
            </PhaseProvider>
        </FeedbackContext.Provider>
    )
}

export default App
