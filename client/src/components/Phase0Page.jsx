import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../App.css';

import React, { useState, useContext, useEffect } from 'react';
import { Container, Col, Card, Form, Button, Alert, Row, InputGroup } from 'react-bootstrap';
import { usePhase } from '../contexts/PhaseContext';
import { useNavigate } from 'react-router-dom';
import FeedbackContext from '../contexts/FeedbackContext';
import API from '../API';

/**
 * Componente che gestisce la pagina della fase 0
 * @prop {user} prop In base a user gestico il caso in cui l'utente sia admin o member
 */
const Phase0Page = ({ user }) => {
  const navigate = useNavigate(); //hook per navigare tra le pagine
  const { avanzareFase, getBudgetAndFase } = usePhase(); //Funzioni prese dal context per gestire la fase
  const { setFeedback, setFeedbackFromError } = useContext(FeedbackContext); //Stato per i feedback presi dal context
  const [budget, setBudget] = useState(''); //Stato per il budget inizializzato a stringa vuota
  const [showBudgetAlert, setShowBudgetAlert] = useState(false);
  
  //Stati per gli alert (messaggi di errore)
  const [showAlert, setShowAlert] = useState(false);
  const [alreadySetBudgetAlert, setAlreadySetBudgetAlert] = useState(false);
  const [successAlert, setSuccessAlert] = useState(false);
  const [alertVariant, setAlertVariant] = useState('danger'); // Stato per l'alert inizialmente rosso
  const [alertMessage, setAlertMessage] = useState(null); //Stato per il messaggio inizialmente null

  /**
   * UseEffect per recuperare fase e budget attuale
   * Richiama la funzione getBudgetAndFase dal context
   */
  useEffect(() => {
    const fetchData = async () => {
    try {
        await getBudgetAndFase()
    } catch (error) {
        console.error('Error fetching budget and fase:', error);
        setAlertMessage('Errore nel recupero del budget e della fase');
        setAlertVariant('danger');
      }
    };

    fetchData(); // Chiamo la funzione all'avvio del componente
  }, [getBudgetAndFase]);

  /**
   * Setto lo stato del budget ogni volta che cambia l'input
   */
  const handleBudgetChange = (e) => {
    setBudget(e.target.value);
  };

  /**
   * Funzione per impostare il budget quando premo il pulsante
   */
  const handleBudgetSubmit = async (e) => {
    e.preventDefault(); //permette la submission

    if (budget === '') {
      setFeedbackFromError(new Error('È necessario inserire un budget'));
      setShowAlert(true);
      return;
    }

    if (budget <= 0) {
      setAlertMessage('Il budget deve essere superiore a 0');
      setAlertVariant('danger');
      setShowAlert(true);
      return;
    }

    try {
      //Controllo se è stato gia inserito un budget (non posso impostarlo due volte)
      if (alreadySetBudgetAlert) {
        setFeedbackFromError(new Error('È possibile inserire solo un budget'));
        setShowAlert(true);
      } else {
        await API.initApp(budget); //chiamo API per inizializzare l'applicazione
        setFeedback('Budget impostato con successo');
        setSuccessAlert(true);
        setTimeout(() => {
          setSuccessAlert(false);
        }, 2000);
        setAlreadySetBudgetAlert(true); //setto AlreadySetBudgetAlert a true quando imposto un budget
        setShowAlert(false);
      }
    } catch (error) {
      setFeedbackFromError(error);
      setShowAlert(true);
    }
  };

  /**
   * Funzione per passare alla fase successiva (pulsante fase1)
   * Chiamo la funzione per avanzare di fase dal context
   * Navigo verso la Phase1Page
   */
  const handlePassaFase1 = async () => {
    if(!budget) {
      setShowBudgetAlert(true);
      setTimeout(() => {
        setShowBudgetAlert(false);
      }, 2000);
      return;
    }

    try {
      await avanzareFase();
      navigate('/myproposals');
    } catch (error) {
      setFeedbackFromError(error);
      setShowAlert(true);
    }
  };


  return (
    <Container fluid className="gap-3 align-items-center">

      {/* Alert per avviso budget non impostato */}
      <Alert variant="danger" show={showBudgetAlert} onClose={() => setShowBudgetAlert(false)} dismissible>
        È necessario impostare un budget prima di procedere alla fase successiva.
      </Alert>
      
      {/* Controllo se l'user esiste ed è un admin */}
      {user && user.role === 'Admin' ? (
        <div>
          <Row>
            <Col>
              <h1>Benvenuto/a {user.name}</h1>
              <h5 style={{ color: 'darkgreen' }}>Imposta un budget per iniziare il processo di definizione delle proposte</h5>
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
              
              <InputGroup>
                <InputGroup.Text>€</InputGroup.Text>
                <Form.Control
                  type="number"
                  placeholder="Enter budget"
                  value={budget}
                  onChange={handleBudgetChange}
                />
              </InputGroup>

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
      ) : ( //Se l'user non è Admin
        
        <Row>
          <Col>
          <Row>
            <Col>
              <h1>Benvenuto/a {user.name}</h1>
            </Col>
          </Row>
            <Card className="card bg-light mb-3" style={{ maxWidth: '100rem', marginTop: '1rem' }}>
              <Card.Header className="text-black">Fase: 0</Card.Header>
              <Card.Body className="text-black">
                <Card.Title>La fase di definizione delle proposte è ancora chiusa</Card.Title>
                <Card.Text>Riprova più tardi</Card.Text>
              </Card.Body>
            </Card>

            <div className="text-center">
              <i className="bi bi-hourglass-split hourglass-icon" style={{ fontSize: '6rem', color: '#003d04' }}></i>
            </div>
          </Col>
        </Row>
      )}

      <Alert variant="success" show={successAlert} onClose={() => setSuccessAlert(false)} dismissible>
        Budget impostato con successo
      </Alert>
      
      <Alert variant="danger" show={showAlert} onClose={() => setShowAlert(false)} dismissible>
        {alreadySetBudgetAlert ? "È possibile inserire un solo budget." : alertMessage || "Errore nell'impostare il budget."}
      </Alert>
    </Container>
  );
};

export default Phase0Page;