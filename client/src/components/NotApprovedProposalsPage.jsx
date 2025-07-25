import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../App.css';

import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Container, Row, Col, Button, Card, Table, Alert, OverlayTrigger, Tooltip, Dropdown  } from 'react-bootstrap';
import { BiArrowBack } from 'react-icons/bi';
import API from '../API';

/**
 * Componente che descrive la tabella delle proposte non approvate
 * @prop {user} prop In base all'user (prop) controllo se l'utente è loggato o meno
 */
const NotApprovedProposalsPage = ({ user }) => {

    const navigate = useNavigate(); //Hook per navigare tra le pagine
    const [notApprovedProposals, setNotApprovedProposals] = useState([]); //Stato per ottenere le proposte non approvate
    const [alertMessage, setAlertMessage] = useState(null); // Stato per gestire i messaggi di alert

    /**
     * UseEffect per ottenere le proposte non approvate 
     * Chiama l'API getNotApprovedProposals
     */
    useEffect(() => {
        const fetchNotApprovedProposals = async () => {
            try{
                if(user) {
                    const notApprovedProposals = await API.getNotApprovedProposals();
                    setNotApprovedProposals(notApprovedProposals);
                } else {
                    setNotApprovedProposals([]) //Pulisco le proposte se l'utente non è autenticato
                }    
            } catch(error) {
                console.error('Error fetching not approved proposals:', error);
            }
        };

        fetchNotApprovedProposals(user);
    }, [user])

    return (
        <Container fluid className="gap-3 align-items-center">
            {/* Alert */}
            {alertMessage && (
                <Alert variant="success" onClose={() => setAlertMessage(null)} dismissible>
                {alertMessage}
                </Alert>
            )}

            {/* Pulsante per tornare indietro */}
            <Button
                variant="link"
                onClick={() => navigate(-1)} //naviga alla pagina precedente
                className="d-inline-flex align-items-center mb-3"
                style={{ fontSize: '1.20rem', padding: '0.1rem', color: 'black' }}
            >
                <BiArrowBack size={16} style={{ marginRight: '5px' }} /> Back
            </Button>

            <Row>
                <Col>
                    {/* Card bootstrap */}
                    <Card className="card bg-light-red mb-3" style={{ maxWidth: '100rem', marginTop: '1rem' }}>
                        <Card.Header className="text-black">Fase: 3</Card.Header>
                        <Card.Body className="text-black">
                        <Card.Text> <strong>Qui puoi trovare l'elenco delle proposte non approvate </strong></Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row>
                <Col as='h2'> Proposte non approvate <i className="bi bi-journal-x"></i></Col>
            </Row>

            <Row>
                <Col lg={10} className="mx-auto">
                    {/* Tabella Proposals approvate*/}
                    <NotApprovedProposalsTable notApprovedProposals={notApprovedProposals} > </NotApprovedProposalsTable>
                </Col>
            </Row>
        </Container>
    )
}

/**
 * Componente che descrive la tabella delle proposte non approvate
 * @prop { notApprovedProposals } prop array delle proposte approvate
 */
function NotApprovedProposalsTable({ notApprovedProposals }){
    return(
        <Table className="table">
            <thead className="table-header">
                <tr className="table-danger">
                    <th className="table-cell">Description</th>
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
                {notApprovedProposals.length > 0 ? (
                    notApprovedProposals.map((notApprovedProposal) => (
                        <tr key={notApprovedProposal.id}>
                            <td>{notApprovedProposal.description}</td>
                            <td>{notApprovedProposal.cost}</td>
                            <td>{notApprovedProposal.total_score}</td>
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

export default NotApprovedProposalsPage;