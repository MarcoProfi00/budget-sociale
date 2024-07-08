import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../App.css';

import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Container, Row, Col, Button, Card, Table, Alert, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { PhaseProvider, usePhase } from '../contexts/PhaseContext.jsx';
import API from '../API';

const Phase1Page = ({ user }) => {

  const { fase, setFase, budget, setBudget, avanzareFase } = usePhase();
  const [proposals, setProposals] = useState([]); //Stato per ottenere le proposte
  const [alertMessage, setAlertMessage] = useState(null); // Stato per gestire i messaggi di alert
  const navigate = useNavigate();
  const { proposalId } = useParams();


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
   * Effetto per gestire il recupero delle proposte dell'utente dato il suo id
   */
  useEffect(() => {
    const fetchProposals = async () => {
      try {
        if (user) {
          const proposals = await API.getMyProposals(user.id);
          setProposals(proposals);
        } else {
          setProposals([]); // Pulisco le proposte se l'utente non è autenticato
        }
      } catch (error) {
        //console.error('Error fetching proposals:', error);
        //setAlertMessage('Errore nel recupero delle proposte');
      }
    };

    fetchProposals(user); //aggiorno le proposte se l'utente cambia
  }, [user]);

  /**
   * Funzione chiamata quando premo "Passa alla fase 2"
   * Chiama avanzareFase() per impostare la fase da 0 a 1
   * Naviga alla Phase2Page
   */
  const handlePassaFase2 = async () => {
    try {
      await avanzareFase();
      navigate('/allproposals');
    } catch (error) {
      setFeedbackFromError(error);
      setShowAlert(true);
    }
  };

  /**
   * Funzione per gestire l'eliminazione di una proposta
   * @param {*} proposalId id della proposta da eliminare
   */
  const handleDeleteProposal = async(proposalId) => {
    try {
      await API.deleteProposal(user.id, proposalId);
      //Setto la lista delle proposte dopo l'eliminazione di una proposta
      setProposals(proposals.filter((proposal) => proposal.id !== proposalId));
      
      setAlertMessage("Proposta eliminata correttamente")
      setTimeout(() => {
        setAlertMessage(null);
      }, 3000)
    } catch (error) {
      //console.log("Errore nell'eliminazione della proposta:", error);
      setAlertMessage('Errore nell\'eliminazione della proposta');
    }
  }

  /**
   * Funzione per filtrare la proposta basata sull'ID
  */ 
  const getProposalById = (id) => {
    return proposals.find(proposal => proposal.id === id);
  };

  /**
   * Resetta lo stato dell'alert
   */
  const handleCloseAlert = () => {
    setAlertMessage(null);
  }

  return (
    <Container fluid className="gap-3 align-items-center">
      {/* Alert */}
      {alertMessage && (
        <Alert variant="success" onClose={() => setAlertMessage(null)} dismissible>
          {alertMessage}
        </Alert>
      )}

      <Row>
        <Col>
          {/* Card bootstrap per il budget e la fase */}
          <Card className="card bg-light mb-3" style={{ maxWidth: '100rem', marginTop: '1rem' }}>
            <Card.Header className="text-black">Fase: 1</Card.Header>
            <Card.Body className="text-black">
              <Card.Title>Budget disponibile: {budget}</Card.Title>
              <Card.Text> Definizione delle proposte </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col as='h2'> Le mie proposte <i class="bi bi-journal-text" ></i></Col>
      </Row>
        
      <Row>
        <Col lg={10} className="mx-auto">
          {/* Tabella Proposals */}
          <MyProposalsTable proposals={proposals} handleDeleteProposal={handleDeleteProposal}>
          </MyProposalsTable>
        </Col>
      </Row>

      <Row>
        <Col className="text-end mt-3">
          {/* Bottone che naviga alla pagina di add/delete */}
          <OverlayTrigger
            placement="top"
            overlay={
              proposals.length >= 3 ? (
                <Tooltip id="tooltip-disabled">
                  Non puoi aggiungere più di 3 proposte.
                </Tooltip>
              ) : (
                <></>
              )
            }
          >
            <span className="d-inline-block">
              <Link to="/addproposal" className={`btn btn-success ${proposals.length >= 3 ? 'disabled' : ''}`} aria-disabled={proposals.length >= 3}>
                 Nuova Proposta <i className="bi bi-plus-lg" style={{ fontSize: '0.75rem' }}></i>
              </Link>
            </span>
          </OverlayTrigger>
        </Col>
      </Row>
      
      <Row className="justify-content-end mt-3">
        <Col xs="auto">
          {/* Se l'utente loggato è un admin renderizza il bottone Passa alla fase 2 */}
          {user && user.role === 'Admin' && (
            <Button onClick={handlePassaFase2} className="mt-3" variant="success">
              Fase 2 <i className="bi bi-arrow-right-circle fs-6"></i>
            </Button>
          )}
        </Col>
      </Row>

    </Container>
  );
};

function MyProposalsTable({ proposals, handleDeleteProposal }) {
  return (
    <Table>
      <thead>
        <tr>
          <th>Descrizione</th>
          <th>Costo</th>
          <th>Azioni</th>
        </tr>
      </thead>
      <tbody>
        {proposals.length > 0 ? (
          proposals.map((proposal) => (
            <tr key={proposal.id}>
              <td>{proposal.description}</td>
              <td>{proposal.cost}</td>
              <td>
                <Button 
                  variant="danger" 
                  size="sm" 
                  className="me-2" 
                  onClick={() => handleDeleteProposal(proposal.id)}
                >
                  <i className="bi bi-trash" style={{ fontSize: '0.75rem' }}></i>
                </Button>
                <Link to={`/editproposal/${proposal.id}`} className="btn btn-warning btn-sm">
                  <i className="bi bi-pencil" style={{ fontSize: '0.75rem' }}></i>
                </Link>
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

export default Phase1Page;