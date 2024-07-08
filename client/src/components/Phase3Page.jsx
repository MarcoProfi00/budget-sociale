import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../App.css';

import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Container, Row, Col, Button, Card, Table, Alert, OverlayTrigger, Tooltip, Dropdown  } from 'react-bootstrap';
import { PhaseProvider, usePhase } from '../contexts/PhaseContext.jsx';
import API from '../API';

const Phase3Page = ({ user }) => {
    
    const { fase, setFase, budget, setBudget, avanzareFase } = usePhase();
    const [approvedProposals, setApprovedProposals] = useState([]); //Stato per ottenere le proposte approvate
    const [alertMessage, setAlertMessage] = useState(null); // Stato per gestire i messaggi di alert
    const navigate = useNavigate();

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
    }, [setFase, setBudget]);

    /**
     * Effect per recuperare le proposte approvate
     */
    useEffect(() => {
        const fetchApprovedProposals = async () => {
            try{
                const approvedProposals = await API.getApprovedProposals();
                setApprovedProposals(approvedProposals);
            } catch (error) {
                //console.error("Error fetching approved proposal", error)
                setAlertMessage("Errore nel recupero delle proposte approvate")
            }
        };

        fetchApprovedProposals();
    }, [])

    /**
     * Ricomincia da 0 eliminando budget e proposte
     * Viene richiamato quando premo il pulstante apposito
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
                {/* Card bootstrap per il budget e la fase */}
                    <Card className="card bg-light mb-3" style={{ maxWidth: '100rem', marginTop: '1rem' }}>
                        <Card.Header className="text-black">Fase: 3</Card.Header>
                        <Card.Body className="text-black">
                        <Card.Text> Qui puoi visualizzare l'elenco delle proposte approvate <br></br>
                        Budget: {budget}</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row>
                <Col as='h2'> Proposte Approvate <i class="bi bi-journal-check"></i></Col>
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

            {/* Se l'utente loggato è un admin renderizza il bottone Passa alla fase 3 */}
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