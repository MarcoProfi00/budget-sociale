import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../App.css';

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Card, Table, Alert, OverlayTrigger, Tooltip, Dropdown  } from 'react-bootstrap';
import { usePhase } from '../contexts/PhaseContext.jsx';
import API from '../API';


/**
 * Componente che gestisce la pagina di votazione delle proposte
 * @prop {user} prop In base all'user (prop) controllo se l'utente è admin o member
 */
const Phase2Page = ({ user }) => {

  const { fase, avanzareFase, getBudgetAndFase } = usePhase(); //Stati dal context per gestire budget e fase
  const [proposals, setProposals] = useState([]); //Stato per ottenere le proposte, inizialmente array vuoto
  const [alertMessage, setAlertMessage] = useState(null); // Stato per gestire i messaggi di alert, inizialmente null
  const [alertVariant, setAlertVariant] = useState('success'); //Stato per gestire il colore dell'alert, inizialmente success
  const navigate = useNavigate(); //hook per navigare tra le pagine

  const setFeedbackFromError = (error) => {
      setFeedback(error.message);
  };


  /**
   * Funzione chiamata quando premo il pulsante per passare alla fase 3
   * Chiama avanzareFase() del context per impostare la fase da 2 a 3
   * Chiama l'API per approvare le proposte
   * Naviga alla Phase3Page
   */
  const handlePassaFase3 = async () => {
    try {
      await avanzareFase();
      await API.approveProposals(user.id) 
      navigate('/approvedproposals');
    } catch (error) {
      setFeedbackFromError(error);
      setShowAlert(true);
    }
  };

  /**
   * Effetto per gestire il recupero di tutte le proposte presenti nel db
   */
  useEffect(() => {
    const fetchProposals = async () => {
      try {
        if(user) {
          const proposals = await API.getAllProposals()
          setProposals(proposals);
        } else {
          setProposals([]) //Pulisco le proposte se l'utente non è autenticato
        }
      } catch (error) {
        console.error('Errore nel recupero delle proposte:', error);
      }
    };

    fetchProposals(user); //Chiamo la funzione all'avvio del componente
  }, [user])
  
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
   * Funzione per votare una proposta in base al suo id
   * Controlla se la fase è diversa da 2, in caso affermativo mostra un alert di errore
   * @param {*} proposalId id della proposta da votare
   * @param {*} score puntaggio assegnato alla proposta (da 1 a 3)
   */
  const handleVoteProposal = async(proposalId, score) => {
    if (fase !== 2) {
      setAlertMessage("Fase errata! Non puoi votare la proposta");
      setAlertVariant('danger');
      setTimeout(() => {
        setAlertMessage(null);
      }, 2000);
      return;
    }
    
    try {
      score = parseInt(score);
      await API.voteProposal(user.id, proposalId, score);
      setAlertVariant('success');
      setAlertMessage("Proposta votata correttamente");
      setTimeout(() => {
        setAlertMessage(null);
      }, 3000);
    } catch(error) {
      console.error("Errore nel registrare il voto:", error);
      setAlertMessage("Puoi esprimere un solo voto per ogni proposta");
      setAlertVariant('danger');
      setTimeout(() => {
        setAlertMessage(null);
      }, 3000);
      console.log(error)
    }
  }


  return (
    <Container fluid className="gap-3 align-items-center">
      {/* Alert */}
      {alertMessage && (
        <Alert variant={alertVariant} onClose={() => setAlertMessage(null)} dismissible>
          {alertMessage}
        </Alert>
      )}

    <Row>
      <Col>
        {user && <h1>Benvenuto/a {user.name}</h1>}
        <h5 style={{ color: 'darkgreen' }}>Esprimi la tua preferenza per le proposte</h5>
      </Col>
    </Row>

      <Row>
        <Col>
          {/* Card bootstrap per il budget e la fase */}
          <Card className="card bg-light mb-3" style={{ maxWidth: '100rem', marginTop: '1rem' }}>
            <Card.Header className="text-black">Fase: 2</Card.Header>
            <Card.Body className="text-black">
              <Card.Title>Preferenze Proposte</Card.Title>
              <Card.Text><strong>Attenzione: Puoi esprimere un punteggio da 1 a 3 per ogni preferenza</strong></Card.Text>
            </Card.Body>
          </Card>
        </Col>
    </Row>

    <Row>
        <Col as='h2'> Proposte disponibili <i className="bi bi-journal-text"></i></Col>
    </Row>

    
    <Row>
      <Col lg={10} className="mx-auto">
        {/* Tabella Proposals */}
        <AllProposalsTable proposals={proposals} user={user} handleVoteProposal={handleVoteProposal}> </AllProposalsTable>
      </Col>
    </Row>

    <Row>
      <Col className="text-start mt-3">
        <Link to="/mypreferences" className="btn btn-warning">
          Le mie preferenze <i className="bi bi-bookmark-check fs-6"></i>
        </Link>
      </Col>
    </Row>

    <Row className="justify-content-end mt-3">
        <Col xs="auto">
          {/* Se l'utente loggato è un admin renderizza il bottone per passare alla fase 3 */}
          {user && user.role === 'Admin' && (
            <Button onClick={handlePassaFase3} className="mt-3" variant="success">
              Fase 3 <i className="bi bi-arrow-right-circle fs-6"></i>
            </Button>
          )}
        </Col>
      </Row>

    </Container>
  );
};

/**
 * Componente che gestisce la tabella che contiene tutte le proposte
 * @prop {proposals, user, handleVoteProposal} props
 * proposals: array di tutte le proposte presenti nel db
 * user: utente loggato
 * handleVoteProposal: funzione per votare una proposta 
 */
function AllProposalsTable({ proposals, user, handleVoteProposal }) {
  return (
      <Table>
          <thead>
              <tr>
                  <th>Descrizione</th>
                  <th>Costo</th>
                  <th>Vota</th>
              </tr>
          </thead>
          <tbody>
            {proposals.length > 0 ? (
                proposals.map((proposal) => (
                  <tr
                      key={proposal.id}
                      style={proposal.userId === user.id ? { backgroundColor: 'lightgray', color: 'red' } : {}}
                  >
                      <td>{proposal.description}</td>
                      <td>{proposal.cost}</td>
                      <td>
                          {proposal.userId === user.id ? (
                              <>
                                  N/A{' '}
                                  <OverlayTrigger
                                      placement="top"
                                      overlay={<Tooltip>Non puoi votare la tua proposta</Tooltip>}
                                  >
                                      <i className="bi bi-info-circle"></i>
                                  </OverlayTrigger>
                              </>
                          ) : (
                              <Dropdown onSelect={(eventKey) => handleVoteProposal(proposal.id, parseInt(eventKey))}>
                                  <Dropdown.Toggle variant="success" id="dropdown-basic">
                                      Vota
                                  </Dropdown.Toggle>
                                  
                                  <Dropdown.Menu>
                                    <Dropdown.Item eventKey="1">
                                      <span style={{ fontSize: '1.2rem' }}>
                                        1 <i className="bi bi-emoji-frown" style={{ color: 'red', fontSize: '1.2rem' }}></i>
                                      </span>
                                    </Dropdown.Item>
                                    <Dropdown.Item eventKey="2">
                                      <span style={{ fontSize: '1.2rem' }}>
                                        2 <i className="bi bi-emoji-neutral" style={{ color: 'orange', fontSize: '1.2rem' }}></i>
                                      </span>
                                    </Dropdown.Item>
                                    <Dropdown.Item eventKey="3">
                                      <span style={{ fontSize: '1.2rem' }}>
                                        3 <i className="bi bi-emoji-smile" style={{ color: 'green', fontSize: '1.2rem' }}></i>
                                      </span>
                                    </Dropdown.Item>
                                  </Dropdown.Menu>
                              </Dropdown>
                          )}
                      </td>
                  </tr>
                ))
            ) : (
            <tr>
                <td colSpan="3" className="text-center">Nessuna proposta trovata</td>
            </tr>
            )}
          </tbody>
      </Table>
  );
}

export default Phase2Page;