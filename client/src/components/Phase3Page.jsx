import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../App.css';

import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Container, Row, Col, Button, Card, Table, Alert, OverlayTrigger, Tooltip, Dropdown  } from 'react-bootstrap';
import { PhaseProvider, usePhase } from '../contexts/PhaseContext.jsx';
import API from '../API';

/**
 * Componente che gestisce la pagina della fase 3 con l'approvazione delle preferenze
 * Prop in input: user
 */
const Phase3Page = ({ user }) => {
    
    const { budget, getBudgetAndFase } = usePhase(); //Stati per gestire fase e budget
    const [approvedProposals, setApprovedProposals] = useState([]); //Stato per gestire le proposte approvate, inizialmente array vuoto
    const [alertMessage, setAlertMessage] = useState(null); // Stato per gestire i messaggi di alert, inizialmente null
    const navigate = useNavigate(); //Hook per gestire la navigazione

    const setFeedbackFromError = (error) => {
        setFeedback(error.message);
    };

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
     * UseEffect per recuperare le proposte approvate
     * Chiama l'API per recuperare le proposte approvate
     */
    useEffect(() => {
        const fetchApprovedProposals = async () => {
            try{
                const approvedProposals = await API.getApprovedProposals();
                setApprovedProposals(approvedProposals);
            } catch (error) {
                console.error("Error fetching approved proposal", error)
            }
        };

        fetchApprovedProposals();
    }, [])

    /**
     * Funzione chiamata quando premo il tasto per resettare l'applicazione
     * Ricomincia da 0 eliminando budget, proposte e votazioni
     * Navigo a Phase0Page (/setBudget) per ricominciare il processo
     */
    const handleRestartProcess = async () => {
        try{
            await API.restartProcess(user.id)
            setAlertMessage("Il processo di definizione proposte è stato riavviato");
            setTimeout(() => {
                navigate('/setbudget');
            });
        } catch (error) {
            setFeedbackFromError(error);
            setShowAlert(true);
        }
    }


    return (
        <Container fluid className="gap-3 align-items-center">

            <Row>
                <Col>
                    {user && <h1>Benvenuto/a {user.name}</h1>}
                </Col>
            </Row>

            <Row>
                <Col>
                    {/* Card bootstrap per il budget e la fase */}
                    <Card className="card bg-light-green mb-3" style={{ maxWidth: '100rem', marginTop: '1rem' }}>
                        <Card.Header className="text-black">Fase: 3</Card.Header>
                        <Card.Body className="text-black">
                        <Card.Text> <strong>Qui puoi visualizzare l'elenco delle proposte approvate </strong> <br></br>
                        Budget: {budget}</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row>
                <Col as='h2'> Proposte Approvate <i className="bi bi-journal-check"></i></Col>
            </Row>

            
            <Row>
                <Col lg={10} className="mx-auto">
                    {/* Tabella Proposals approvate*/}
                    <ApprovedProposalsTable approvedProposals={approvedProposals} > </ApprovedProposalsTable>
                </Col>
            </Row>

            {/* Bottone per le proposte non approvate */}
            {user ? (
            <Link to="/notapprovedproposals">
                <Button variant="danger">Not Approved Proposals</Button>
            </Link>
            ) : (
                <OverlayTrigger
                    overlay={<Tooltip id="tooltip-disabled">Accedi per visualizzare le proposte non approvate</Tooltip>}
                >
                    <span className="d-inline-block">
                        <Button variant="danger" disabled style={{ pointerEvents: 'none' }}>
                            Not Approved Proposals
                        </Button>
                    </span>
                </OverlayTrigger>
            )}

            {/* Se l'utente loggato è un admin renderizza il bottone per resettare il processo */}
            {user && user.role === 'Admin' && (
                <Button onClick={handleRestartProcess} variant="warning" className="float-end mt-3">
                    Riavvia il processo
                    <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>Attenzione riavviando il processo tutte le proposte e le preferenze verranno eliminate</Tooltip>}
                    >
                        <i className="bi bi-exclamation-circle" style={{ fontSize: '17px', marginLeft: '5px' }}></i>
                    </OverlayTrigger>
                </Button>
            )}        
        </Container>
    )
}

/**
 * Componente per visualizzare le proposte Approvate
 * Props in input: approvedProposals
 */
function ApprovedProposalsTable({ approvedProposals }){
    return(
        <Table className="table">
            <thead className="table-header">
                <tr className="table-success">
                    <th className="table-cell">Description</th>
                    <th className="table-cell">Author</th>
                    <th className="table-cell">Cost</th>
                    <th className="table-cell">Total Score
                        <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Il punteggio totale di ogni proposta è calcolato in base alla somma delle preferenze espresse per quella proposta</Tooltip>}
                        >
                            <i className="bi bi-info-circle" style={{ fontSize: '17px', marginLeft: '5px' }}></i>
                        </OverlayTrigger>
                    </th> 
                </tr>
            </thead>
            <tbody className="table-body">
                {approvedProposals.length > 0 ? (
                    approvedProposals.map((approvedProposal) => (
                        <tr key={approvedProposal.id}>
                            <td>{approvedProposal.description}</td>
                            <td>{approvedProposal.member_name}</td>
                            <td>{approvedProposal.cost}</td>
                            <td>{approvedProposal.total_score}</td>
                        </tr>
                    ))
                ) : (
                <tr>
                    <td colSpan="3" className="text-center">Nessuna proposta trovata</td>
                  </tr> 
                )}
            </tbody>
        </Table>
    )
}

export default Phase3Page;