import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../App.css';

import React, { useState, useContext } from 'react';
import { Container, Col, Card, Form, Button, Alert, Row } from 'react-bootstrap';
import { usePhase } from '../contexts/PhaseContext';
import { useNavigate } from 'react-router-dom';
import FeedbackContext from '../contexts/FeedbackContext';
import API from '../API';

const Phase0Page = ({ user }) => {
  const navigate = useNavigate();
  const { fase, avanzareFase } = usePhase();
  const { setFeedback, setFeedbackFromError } = useContext(FeedbackContext);
  const [budget, setBudget] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alreadySetBudgetAlert, setAlreadySetBudgetAlert] = useState(false);
  const [successAlert, setSuccessAlert] = useState(false);

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
        setFeedbackFromError(new Error('È possibile inserire solo un budget.'));
        setShowAlert(true);
      } else {
        await API.initApp(budget);
        setFeedback('Budget impostato con successo');
        setSuccessAlert(true);
        setTimeout(() => {
          setSuccessAlert(false);
        }, 3000);
        setAlreadySetBudgetAlert(true);
        setShowAlert(false);
      }
    } catch (error) {
      setFeedbackFromError(error);
      setShowAlert(true);
    }
  };

  const handlePassaFase1 = async () => {
    try {
      await avanzareFase();
      navigate('/myproposals');
    } catch (error) {
      setFeedbackFromError(error);
      setShowAlert(true);
    }
  };

  const handleAlreadySetBudgetAlertClose = () => {
    setAlreadySetBudgetAlert(false);
  };

  return (
    <Container fluid className="gap-3 align-items-center">
      {user && user.role === 'Admin' ? (
        <div>
          <Row>
            <Col>
              <h1>Fase 0</h1>
            </Col>
          </Row>
          <Form
            className="block-example border border-success rounded mt-4 mb-0 px-5 py-4 form-padding"
            onSubmit={handleBudgetSubmit}
          >
            <Form.Group className="mb-3">
              <Form.Label>
                <h3><i className="bi bi-piggy-bank text-success" style={{ fontSize: '3rem' }}></i> Inserisci il budget </h3> 
              </Form.Label>
              <Form.Control
                type="number"
                min={0}
                placeholder="Enter budget"
                value={budget}
                onChange={handleBudgetChange}
              />
            </Form.Group>
            <Button variant="success" type="submit">
              Imposta Budget
            </Button>
          </Form>
          <Row className="justify-content-end mt-3">
            <Col xs="auto">
            <Button onClick={handlePassaFase1} className="mt-3" variant="success">
              Fase 1 <i className="bi bi-arrow-right-circle fs-6"></i>
            </Button>
            </Col>
          </Row>
        </div>
      ) : (
        <Row>
          <Col>
            <Card className="card bg-light mb-3" style={{ maxWidth: '100rem', marginTop: '1rem' }}>
              <Card.Header className="text-black">Fase: 0</Card.Header>
              <Card.Body className="text-black">
                <Card.Title>La fase di definizione delle proposte è ancora chiusa</Card.Title>
                <Card.Text>Riprova più tardi</Card.Text>
              </Card.Body>
            </Card>
            <div className="text-center">
              <i className="bi bi-hourglass-split" style={{ fontSize: '8rem', color: '#003d04' }}></i>
            </div>

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