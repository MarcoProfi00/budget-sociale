import React, { useState, useContext } from 'react';

import { Container, Col, Card, Form, Button, Alert, Row} from 'react-bootstrap';
import { usePhase } from '../contexts/PhaseContext';
import { useNavigate } from 'react-router-dom';

import FeedbackContext from '../contexts/FeedbackContext';
import API from '../API';

const Phase0Page = ({ user }) => {
  const navigate = useNavigate(); // Ottieni la funzione di navigazione
  const { fase, avanzareFase } = usePhase();
  const { setFeedback, setFeedbackFromError  } = useContext(FeedbackContext);
  const [budget, setBudget] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alreadySetBudgetAlert, setAlreadySetBudgetAlert] = useState(false) //stato per il budget gia impostato
  const [successAlert, setSuccessAlert] = useState(false); //stato per il budget impostato correttamente

  const handleBudgetChange = (e) => {
    setBudget(e.target.value);
  };

  const handleBudgetSubmit = async (e) => {
    e.preventDefault();

    if (budget === '') {
      setFeedbackFromError(new Error('È necessario inserire un budget.'));
      setShowAlert(true);
      return;
    }

    try {
      if (alreadySetBudgetAlert) {
        // Mostra l'alert che è possibile inserire solo un budget
        setFeedbackFromError(new Error('È possibile inserire solo un budget.'));
        setShowAlert(true);
      } else {
        await API.initApp(budget);
        setFeedback('Budget impostato con successo');
        setSuccessAlert(true); // Mostra l'alert di successo
        setTimeout(() => {
          setSuccessAlert(false); // Nasconde l'alert di successo dopo 3 secondi
        }, 3000);
        setAlreadySetBudgetAlert(true); // Imposta il flag per indicare che il budget è stato impostato
        setShowAlert(false);
      }
    } catch (error) {
      setFeedbackFromError(error);
      setShowAlert(true);
    }
  };

  /**
   * Funzione chiamata quando premo "Passa alla fase 1"
   * Chiama avanzareFase() per impostare la fase da 0 a 1
   * Naviga alla Phase1Page
   */
  const handlePassaFase1 = async () => {
    try {
      await avanzareFase();
      navigate('/myproposals'); // Naviga alla Phase1Page dopo aver avanzato la fase
    } catch (error) {
      setFeedbackFromError(error);
      setShowAlert(true);
    }
  };


  const handleAlreadySetBudgetAlertClose = () => {
    setAlreadySetBudgetAlert(false);
  };

  //Stato usato per gestire i messaggi di errore
  const [errors, setErrors] = useState([]);

  return (
    <Container fluid className="gap-3 align-items-center">
      {user.role === 'Admin' ? (
        <div>
          <Row>
            <Col>
              <h1>Fase 0</h1>
            </Col>
          </Row>
          <Form
            className="block-example border border-primary rounded mt-4 mb-0 px-5 py-4 form-padding"
            onSubmit={handleBudgetSubmit}
          >
            <Form.Group className="mb-3">
              <Form.Label>
                <h3>Inserisci il budget</h3>
              </Form.Label>
              <Form.Control
                type="number"
                min={0}
                placeholder="Enter budget"
                value={budget}
                onChange={handleBudgetChange}
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              Imposta Budget
            </Button>
          </Form>
          <Row className="justify-content-end mt-3">
            <Col xs="auto">
              <Button onClick={handlePassaFase1} className="mt-3">
                Passa alla fase 1
              </Button>
            </Col>
          </Row>
        </div>
      ) : (
        <Row>
        <Col>
          {/* Card bootstrap per il budget e la fase */}
          <Card className="card bg-light mb-3" style={{ maxWidth: '100rem', marginTop: '1rem' }}>
            <Card.Header className="text-black">Fase: 0</Card.Header>
            <Card.Body className="text-black">
              <Card.Title>La fase di definizione delle proposte è ancora chiusa</Card.Title>
              <Card.Text> Riprovare più tardi </Card.Text>
            </Card.Body>
          </Card>
          </Col>
      </Row>
      )}
       <Alert variant="success" show={successAlert} onClose={() => setSuccessAlert(false)} dismissible>
        Budget impostato con successo
      </Alert>
      <Alert variant="danger" show={showAlert} onClose={() => setShowAlert(false)} dismissible>
        {alreadySetBudgetAlert ? "È possibile inserire un solo budget." : "Errore nell'impostare il budget."}
      </Alert>
    </Container>
  );
};

export default Phase0Page;