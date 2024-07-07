import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../App.css';

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Container, Row, Col, Card } from 'react-bootstrap';
import { usePhase } from '../contexts/PhaseContext'; // Importa il contesto di fase

const NotLoggedPage = () => {
  const { fase } = usePhase();
  const navigate = useNavigate();

  // Effetto per gestire il reindirizzamento basato sulla fase
  useEffect(() => {
    if (fase === 3) {
      navigate('/approvedproposals');
    }
  }, [fase, navigate]);

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  return (
    <Container fluid className="gap-3 align-items-center">

      <Row>
        <Col>
          {/* Card bootstrap */}
          <Card className="card text-white bg-primary mb-3" style={{ maxWidth: '100rem', marginTop: '1rem' }}>
            <Card.Header className="text-white">Info</Card.Header>
            <Card.Body className="text-white">
              <Card.Title>La fase di definizione delle proposte è in corso</Card.Title>
              <Card.Text>Accedi per partecipare</Card.Text>
            </Card.Body> 
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          {/* Card bootstrap */}
          <Card className="card text-white bg-info mb-3" style={{ maxWidth: '100rem', marginTop: '1rem' }}>
            <Card.Body className="text-black">
              <Card.Title>Operazioni consentite:</Card.Title>
              <Card.Text >In questo sito è possibile:<br></br>
              Creare (max 3), modificare, eliminare delle proposte<br></br>
              Esprimere, eliminare una preferenza da 1 a 3 per qualsiasi proposta eccetto la propria<br></br>
              Visualizzare le proposte approvate e quelle non approvate
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
    </Container>
  );
};

export default NotLoggedPage;