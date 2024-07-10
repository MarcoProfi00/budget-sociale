import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../App.css';

import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Container, Row, Col, Button, Card, Table, Alert, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { usePhase } from '../contexts/PhaseContext.jsx';
import API from '../API';

/**
 * Componente che gestisce la pagina della fase 1
 * In base all'user (prop) controllo se l'utente è admin o member
 */
const Phase1Page = ({ user }) => {

  const { setFase, budget, setBudget, avanzareFase } = usePhase(); //Stati e funzionio per fase e budget presi dal context
  const [proposals, setProposals] = useState([]); //Stato per ottenere le proprie proposte inizializzato ad array vuoto
  const [alertMessage, setAlertMessage] = useState(null); // Stato per gestire i messaggi di alert inizializzato a null
  const navigate = useNavigate(); //Hook per navigare tra le pagine

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
            console.error('Error fetching budget and fase:', error);
            setAlertMessage('Errore nel recupero del budget e della fase');
        }
    };
    
        fetchData(); // Chiamo la funzione all'avvio del componente
    }, [setFase, setBudget]);
    

  /**
   * UseEffect per gestire il recupero delle proposte dato l'user
   * Se l'utente esiste (user) chiamo l'API per ottenere le sue proposte e le imposto,
   * altrimenti imposto lo stato a array vuoto
   */
  useEffect(() => {
    const fetchProposals = async () => {
      try {
        if (user) {
          const proposals = await API.getMyProposals(user.id);
          setProposals(proposals);
        } else {
          setProposals([]);
        }
      } catch (error) {
        console.error('Errore nel recupero delle proposte:', error);
      }
    };

    fetchProposals(user); //La richiamo se l'utente cambia
  }, [user]);

  /**
   * Funzione chiamata quando premo  il pulstante per passare alla fase 2"
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
      //Aggiorno la lista delle proposte dopo l'eliminazione di una proposta
      setProposals(proposals.filter((proposal) => proposal.id !== proposalId));
      
      setAlertMessage("Proposta eliminata correttamente")
      setTimeout(() => {
        setAlertMessage(null);
      }, 3000)
    } catch (error) {
      console.log("Errore nell'eliminazione della proposta:", error);
      setAlertMessage('Errore nell\'eliminazione della proposta');
    }
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
        <Col as='h2'> Le mie proposte <i className="bi bi-journal-text" ></i></Col>
      </Row>
        
      <Row>
        <Col lg={10} className="mx-auto">
          {/* Tabella Proposals */}
          <MyProposalsTable proposals={proposals} handleDeleteProposal={handleDeleteProposal}> </MyProposalsTable>
        </Col>
      </Row>

      <Row>
        <Col className="text-end mt-3">
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
          >{/* Bottone che naviga alla pagina di add/delete */}
            <span className="d-inline-block">
              {/* Se le proposte sono 3 il bottono risulta disabilitato con un messaggio di informazione */}
              <Link to="/addproposal" className={`btn btn-success ${proposals.length >= 3 ? 'disabled' : ''}`} aria-disabled={proposals.length >= 3}>
                 Nuova Proposta <i className="bi bi-plus-lg" style={{ fontSize: '0.75rem' }}></i>
              </Link>
            </span>
          </OverlayTrigger>
        </Col>
      </Row>
      
      <Row className="justify-content-end mt-3">
        <Col xs="auto">
          {/* Se l'utente loggato è un admin renderizza il bottone per passare alla fase 2 */}
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