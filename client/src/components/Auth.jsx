import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../App.css';

import { useState } from 'react';
import { Alert, Button, Col, Form, Row, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import PropTypes from "prop-types";

/**
 * Componente che gestisce il form di login con validazione dei campi username e password
 * e gestione degli errori tramite un messaffio di avviso (Alert) 
 */
function LoginForm(props) {
  //Stati pee username e pwd dell'utente inizializzati con una stringa vuota
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const [show, setShow] = useState(false); // Stato per mostrare/nascondere l'Alert di errore
  const [errorMessage, setErrorMessage] = useState(''); // Messaggio di errore da mostrare

  const navigate = useNavigate(); // Hook per navigare tra le pagine

  /**
   * Funzione chiamata quando invio i dati (username e pwd)
   */
  const handleSubmit = (event) => {
    event.preventDefault();
    const credentials = { username, password }; //props

    props.login(credentials)
      .then(() => {
        navigate("/"); // Naviga alla home dopo il login riuscito
      })
      .catch((err) => {
        if (err.message === "Unauthorized") {
          setErrorMessage("Credenziali errate, riprovare"); // Messaggio da mostrare se il login non va a buon fine
        } else {
          setErrorMessage(err.message);
        }
        setShow(true); // Mostra l'Alert di errore
      });
  };

  return (
    <Row className="mt-3 vh-100 justify-content-md-center">
      <Col md={4}>
        <Card className="p-4">
          <Card.Header className="text-center">
            <i className="bi bi-person-circle fs-1 mb-3"></i> {/* Icona di utente */}
            <h1>Login</h1>
          </Card.Header>
          <Card.Body>
            <Form onSubmit={handleSubmit}>
              <Alert
                dismissible
                show={show}
                onClose={() => setShow(false)}
                variant="danger"
              >
                {errorMessage}
              </Alert>
              <Form.Group className="mb-3" controlId="username">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={username}
                  placeholder="Example: nome.cognome@example.it"
                  onChange={(ev) => setUsername(ev.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="password">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  value={password}
                  placeholder="Enter the password"
                  onChange={(ev) => setPassword(ev.target.value)}
                  required
                  minLength={2}
                />
              </Form.Group>
              <Button className="mt-3 btn-success" type="submit">Login</Button>
            </Form>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}

LoginForm.propTypes = {
    login: PropTypes.func.isRequired,
};

function LogoutButton({ logout }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout(); // Assicurati che la funzione logout gestisca correttamente la disconnessione
      navigate('/');
    } catch (error) {
      console.error('Errore durante il logout:', error);
    }
  };

  return (
    <Button variant="outline-light" onClick={handleLogout}>
      Logout
    </Button>
  );
}

LogoutButton.propTypes = {
    logout: PropTypes.func.isRequired,
};

function LoginButton() {
    const navigate = useNavigate();
    return (
      <Button variant="outline-light" onClick={() => navigate('/login')}>Login</Button>
    );
}

export { LoginForm, LogoutButton, LoginButton };