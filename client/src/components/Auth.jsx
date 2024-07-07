import { useState, useEffect } from 'react';
import { Alert, Button, Col, Form, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import PropTypes from "prop-types";

/**
 * Componente che gestisce il form di login con validazione dei campi username e password
 * e gestione degli errori tramite un messaffio di avviso (Alert) 
 */
function LoginForm(props) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    
    const [show, setShow] = useState(false); // Stato per mostrare/nascondere l'Alert di errore
    const [errorMessage, setErrorMessage] = useState(''); // Messaggio di errore da mostrare

    const navigate = useNavigate(); // Hook per navigare alle diverse pagine

    const handleSubmit = (event) => {
      event.preventDefault();
      const credentials = { username, password };

      props.login(credentials)
        .then (() => navigate("/")) // Naviga alla home dopo il login riuscito
        .catch( (err) => {
          if(err.message === "Unauthorized") 
            setErrorMessage("Invalid username and/or password"); //mesaggio da mostrare se il login non va a buon fine
          else
            setErrorMessage(err.message);
          setShow(true); // Mostra l'Alert di errore
        });
  };


  return (
    <Row className="mt-3 vh-100 justify-content-md-center">
      <Col md={4}>
        <h1 className="pb-3">Login</h1>
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
              placeholder="Enter the password."
              onChange={(ev) => setPassword(ev.target.value)}
              required
              minLength={2}
            />
          </Form.Group>
          <Button className="mt-3" type="submit">Login</Button>
        </Form>
      </Col>
    </Row>
  );
}

LoginForm.propTypes = {
    login: PropTypes.func,
}

function LogoutButton({ logout }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout(); // Assicurati che la funzione logout gestisca correttamente la disconnessione
      navigate('/'); // Naviga alla pagina di login dopo il logout
    } catch (error) {
      console.error('Errore durante il logout:', error);
      // Gestisci eventuali errori qui
    }
  };

  return (
    <Button variant="outline-light" onClick={handleLogout}>
      Logout
    </Button>
  );
}

LogoutButton.propTypes = {
    logout: PropTypes.func
}

function LoginButton() {
    const navigate = useNavigate();
    return (
      <Button variant="outline-light" onClick={()=> navigate('/login')}>Login</Button>
    )
}

export { LoginForm, LogoutButton, LoginButton };