import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import { Container, Col, Navbar, Form, Button, Alert, Row} from 'react-bootstrap';
import { usePhase } from '../contexts/PhaseContext';
import FeedbackContext from '../contexts/FeedbackContext';
import API from '../API';

const Phase0Page = ({ user }) => {
  const { fase, setFase, avanzareFase } = usePhase();
  const { setFeedback } = useContext(FeedbackContext);
  const [budget, setBudget] = useState('');
  const [showAlert, setShowAlert] = useState(false);

  const handleBudgetChange = (e) => {
    setBudget(e.target.value);
  };

  const handleBudgetSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.setBudget(budget); // Implementa questa API per collegarla al DAO del budget
      setFeedback('Budget impostato con successo');
      setShowAlert(false);
    } catch (error) {
      setFeedback('Errore impostando il budget');
      setShowAlert(true);
    }
  };

  //Stato usato per gestire i messaggi di errore
  const [errors, setErrors] = useState([]);

  return (
    <Container fluid className="gap-3 align-items-center">
      {user.role === 'Admin' ? (
        <div>
          <Row>
            <Col>
              <h1>Fase {fase}</h1>
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
                className={errors.budget ? 'wrong-field' : ''}
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
              <Button onClick={avanzareFase} className="mt-3">
                Passa alla fase 1
              </Button>
            </Col>
          </Row>
        </div>
      ) : (
        <Row>
          <Col>
            <h3>La fase di definizione delle proposte è ancora chiusa.</h3>
            <h4>Riprovare più tardi!</h4>
          </Col>
        </Row>
      )}
      <Alert variant="danger" show={showAlert}>
        Errore nell'impostare il budget
      </Alert>
    </Container>
  );
};

export default Phase0Page;