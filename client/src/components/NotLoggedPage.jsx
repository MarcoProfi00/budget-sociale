import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../App.css';

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Container, Row, Col, Card } from 'react-bootstrap';
import { usePhase } from '../contexts/PhaseContext';

/**
 * Componente che gestisce la pagina dell'utente non loggato
 */
const NotLoggedPage = () => {
  const { fase } = usePhase(); //Stato dal PhaseContext
  const navigate = useNavigate(); //hook per navigare tra le pagine

  //UseEffect per gestire il reindirizzamento basato sulla fase
  useEffect(() => {
    if (fase === 3) {
      navigate('/approvedproposals');
    }
  }, [fase, navigate]);

  return (
    <Container fluid className="gap-3 align-items-center">

      <Row>
        <Col>
          {/* Card bootstrap */}
          <Card className="card text-dark mb-3" style={{ maxWidth: '100rem', marginTop: '1rem', backgroundColor: '#c8fcc2' }}>
            <Card.Header className="text-dark">Info</Card.Header>
            <Card.Body className="text-dark">
              <Card.Title>La fase di definizione delle proposte è in corso </Card.Title>
              <Card.Text>Accedi per partecipare</Card.Text>
            </Card.Body> 
          </Card>
        </Col>
      </Row>

      <Row>
        <Col className="icon-container">
          <i className="bi bi-journal-text rotate-icon" style={{ fontSize: '6rem', color: '#006400' }}></i>
        </Col>
      </Row>
    </Container>
  );
};

export default NotLoggedPage;