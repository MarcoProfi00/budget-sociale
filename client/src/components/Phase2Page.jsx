import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../App.css';

import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Container, Row, Col, Button, Card, Table, Alert, OverlayTrigger, Tooltip, Dropdown  } from 'react-bootstrap';
import { PhaseProvider, usePhase } from '../contexts/PhaseContext.jsx';
import API from '../API';

const Phase2Page = ({ user }) => {

    const { fase, setFase, budget, setBudget, avanzareFase } = usePhase();
    const [proposals, setProposals] = useState([]); //Stato per ottenere le proposte
    const [alertMessage, setAlertMessage] = useState(null); // Stato per gestire i messaggi di alert
    const [alertVariant, setAlertVariant] = useState('success'); //Stato per gestire il colore dell'alert
    const navigate = useNavigate();
    const { proposalId } = useParams();

  const setFeedbackFromError = (error) => {
      setFeedback(error.message);
  };

  /**
   * UseEffect per recuperare fase e budget attuale
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const budgetSociale = await API.getBudgetAndFase();
        setFase(budgetSociale.current_fase); // Imposto la fase nel contesto
        setBudget(budgetSociale.amount); // Imposto il budget nel contesto
      } catch (error) {
        //console.error('Error fetching budget and fase:', error);
        setAlertMessage('Errore nel recupero del budget e della fase');
      }
    };
  
    fetchData(); // Chiamo la funzione all'avvio del componente
  }, []);



  /**
   * Funzione chiamata quando premo "Passa alla fase 3"
   * Chiama avanzareFase() per impostare la fase da 2 a 3
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
        //console.error('Error fetching proposals:', error);
        setAlertMessage('Errore nel recupero delle proposte');
      }
    };

    fetchProposals(user);
  }, [user])

  /**
   * Funzione per votare una proposta in base al suo id
   * @param {*} proposalId id della proposta da votare
   * @param {*} score puntaggio assegnato alla proposta (da 1 a 3)
   */
  const handleVoteProposal = async(proposalId, score) => {
    try {

      score = parseInt(score);

      await API.voteProposal(user.id, proposalId, score);
      setAlertVariant('success');
      setAlertMessage("Proposta votata correttamente");
      setTimeout(() => {
        setAlertMessage(null);
      }, 3000);
    } catch(error) {
      //console.error("Errore nel registrare il voto:", error);
      setAlertVariant('danger');
      if (error.response && error.response.data && error.response.data.message) {
        setAlertMessage(`Errore nel registrare il voto: ${error.response.data.message}`);
      } else {
        setAlertMessage("Puoi esprimere un solo voto per ogni proposta");
      }
      setTimeout(() => {
        setAlertMessage(null);
      }, 3000);
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
          {/* Card bootstrap per il budget e la fase */}
          <Card className="card bg-light mb-3" style={{ maxWidth: '100rem', marginTop: '1rem' }}>
            <Card.Header className="text-black">Fase: 2</Card.Header>
            <Card.Body className="text-black">
              <Card.Title>Preferenze Proposte</Card.Title>
              <Card.Text> Esprimi la tua preferenza per le proposte. <br></br>
              Puoi esprimere un puntaggio da 1 a 3 per ogni preferenza.</Card.Text>
            </Card.Body>
          </Card>
        </Col>
    </Row>

    <Row>
        <Col as='h2'> All Proposals </Col>
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
          My Preferences
        </Link>
      </Col>
    </Row>

    {/* Se l'utente loggato è un admin renderizza il bottone Passa alla fase 3 */}
    {user && user.role === 'Admin' && (
        <Button onClick={handlePassaFase3} variant="primary" className="float-end mt-3">
          Passa alla fase 3
        </Button>
    )}

    </Container>
  );
};

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
                                  <Dropdown.Toggle variant="primary" id="dropdown-basic">
                                      Vota
                                  </Dropdown.Toggle>
                                  <Dropdown.Menu>
                                    <Dropdown.Item eventKey="1">1</Dropdown.Item>
                                    <Dropdown.Item eventKey="2">2</Dropdown.Item>
                                    <Dropdown.Item eventKey="3">3</Dropdown.Item>
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